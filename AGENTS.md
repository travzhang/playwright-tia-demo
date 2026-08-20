# Agent notes

After finishing a change that touches `web/` or `api/` source, run checks on **the package you edited**. Do not consider the task done while any of them fail.

```bash
pnpm --filter <web|api> format
pnpm --filter <web|api> lint
pnpm --filter <web|api> typecheck
```

If both packages changed, run the same three from the repo root:

```bash
pnpm format
pnpm lint
pnpm typecheck
```

Fix failures and re-run. Skip this loop for docs-only or workflow-only edits.

After web UI changes, also run `pnpm test` from the repo root. It builds `web`, serves `dist` with `vite preview`, then runs Playwright against that production bundle.
