# playwright-tia-demo

pnpm workspace 演示项目：Vite + React 前端、Hono API，以及基于 Istanbul 覆盖率的 Playwright **测试影响分析（TIA）**。

指导思想：**宁可多跑，不能漏跑。** 图里有的文件按映射筛 case；新源码还不在图里、或改了测试脚手架，就全跑。新增业务文件应补新 case，不能指望旧用例「顺便」覆盖。

## 仓库结构

```
web/                  Vite + React（被测应用）
api/                  Hono（脚手架保留，e2e 暂未打到）
tests/                Playwright 用例（根目录，不放进 web）
playwright.config.ts
scripts/select-tia-cases.mjs
.github/workflows/
```

`web` 和 `api` 都是脚手架生成的。lint 分两套配置（React vs Node）；format 用仓库根目录一份 `.oxfmtrc.json`，风格统一。

Playwright 测的是整站怎么跑起来，配置放在仓库根目录，不放进 `web/`。

## 应用

前端是一个最小可测的 SPA：

| 路由 | 说明 |
| --- | --- |
| `/login` | 登录 |
| `/` | 媒体列表，增删改 |
| `/player/:id` | 播放页 |
| `/settings` | 语言（英 / 中 / 日）、主题（跟随系统 / 明亮 / 暗色）、退出 |

演示账号：`test@test.com` / `1234561233456`。

```bash
pnpm --filter web dev
pnpm --filter api dev
```

## 质量门禁

每个包都有 `format`、`lint`、`typecheck`。改完对应包后跑：

```bash
pnpm --filter web format
pnpm --filter web lint
pnpm --filter web typecheck
```

根目录可以一次跑两边：

```bash
pnpm format
pnpm lint
pnpm typecheck
```

- **oxlint**：`web/.oxlintrc.json`（react / typescript / oxc），`api/.oxlintrc.json`（node / typescript / oxc）
- **oxfmt**：根目录 `.oxfmtrc.json`
- **typecheck**：web 用 `tsc -b`，api 用 `tsc --noEmit`（避免检查时写出 `dist`）

CI：`.github/workflows/lint.yml`（push `main` / PR）。

## E2E

测的是 **build 之后的生产包**，不是 `vite dev`。`playwright.config.ts` 里会：

1. `pnpm --filter web build`
2. `vite preview` 托管 `dist`（`127.0.0.1:4173`，`--strictPort`）
3. 再跑用例

第一次需要浏览器：

```bash
pnpm exec playwright install chromium
pnpm test
```

用例从 `tests/baseTest.ts` 导出 `test` / `expect` / `caseId`，不要直接从 `@playwright/test` 引。每个用例必须绑固定 `caseId`：

```ts
test("标题", caseId("auth-001"), async ({ page }) => { ... });
```

当前 case：

| caseId | 覆盖 |
| --- | --- |
| `auth-001` | 未登录跳转登录页 |
| `auth-002` | 错误密码拒绝 |
| `auth-003` | 演示账号登录 |
| `media-001` | 媒体 CRUD + 进入播放页 |
| `settings-001` | 主题、语言、退出 |

## 覆盖率与 TIA 图

e2e 使用 `vite-plugin-istanbul` 打桩（`forceBuildInstrument: true`），`@canyonjs/playwright` 在每个 case 结束时把 `window.__coverage__` 写出来。

每个 case 一份目录：

```
.canyon_output/<caseId>/coverage-final.json
.canyon_output/<caseId>/analysis.json
.canyon_output/<caseId>/meta.json
.canyon_output/tia.json
```

`analysis.json` 只保留 Istanbul `s`（statement）里 **至少有一个值 > 0** 的文件，表示这个文件路径和该 case 有关联。模块被 import 就会给顶层语句打点，所以枢纽文件（`App.tsx`、`auth.tsx` 等）会关联到很多 case——这符合「少过滤」。

`tia.json` 两份映射：

- `cases`：caseId → 关联文件
- `files`：源文件 → 该跑哪些 case

图的范围是 **被 Istanbul 执行过语句的 `web/src` TS/TSX**。`index.css` 不会进图。某个 case 没渲染到的页面，会出现在 `coverage-final.json` 里但 `s` 全 0，不会进该 case 的 analysis；只要别的 case 打到了，总图里仍有这个文件。

**新增 `web/src` 业务文件**：现有 case 通常打不到，应补新 case，再跑一轮让它进 `tia.json`。不要用「全量跑旧用例」当成覆盖缺口的补丁。

## CI 里的 TIA

`.github/workflows/playwright.yml`：

1. **push `main`**：全量 e2e，成功后上传 artifact `tia-map`（`.canyon_output/tia.json`）。PR 的子集结果不会回写基线。
2. **pull_request**：下载 main 上最近一次成功的 `tia-map`，对 `origin/<base>...HEAD` 做 diff，用 `scripts/select-tia-cases.mjs` 决定跑哪些 case。

| 情况 | 行为 |
| --- | --- |
| 没有基线 / 改了 Playwright 配置或测试脚手架 | 全跑 |
| 改了图里的 `web/src` TS/TSX | 只跑映射 case |
| 新 TS/TSX 还不在图里 | 全跑（旧 case 可能已经 import 到它） |
| 新增了 `caseId` | 这条一定跑 |
| 只改 README 等无关文件 | 跳过 e2e |

本地预览会选谁：

```bash
TIA_BASELINE=.canyon_output/tia.json TIA_BASE_REF=origin/main pnpm tia:select
```

第一次合进 main 会先全量跑并上传产物，之后的 PR 才开始按图筛选。
