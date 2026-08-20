import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

function resolveBaseline(start) {
  if (fs.existsSync(start)) return start;
  const dir = path.dirname(start);
  if (!fs.existsSync(dir)) return start;
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    for (const name of fs.readdirSync(current)) {
      const full = path.join(current, name);
      if (name === "tia.json" && fs.statSync(full).isFile()) return full;
      if (fs.statSync(full).isDirectory()) stack.push(full);
    }
  }
  return start;
}

const baselinePath = resolveBaseline(process.env.TIA_BASELINE ?? ".tia-baseline/tia.json");
const baseRef = process.env.TIA_BASE_REF ?? "origin/main";
const testsDir = "tests";

function listChangedFiles() {
  const output = execSync(`git diff --name-status ${baseRef}...HEAD`, { encoding: "utf8" }).trim();
  if (!output) return [];
  const files = new Set();
  for (const line of output.split("\n")) {
    const [status, ...rest] = line.split("\t");
    if (status.startsWith("R") && rest.length >= 2) {
      files.add(rest[0]);
      files.add(rest[1]);
    } else if (rest[0]) {
      files.add(rest[0]);
    }
  }
  return [...files];
}

function collectCaseIdsFromTests() {
  const ids = new Set();
  const pattern = /caseId\("([^"]+)"\)/g;
  for (const name of fs.readdirSync(testsDir)) {
    if (!name.endsWith(".spec.ts")) continue;
    const source = fs.readFileSync(path.join(testsDir, name), "utf8");
    for (const match of source.matchAll(pattern)) ids.add(match[1]);
  }
  return ids;
}

function caseIdsInFile(file) {
  const ids = new Set();
  if (!fs.existsSync(file)) return ids;
  const source = fs.readFileSync(file, "utf8");
  for (const match of source.matchAll(/caseId\("([^"]+)"\)/g)) ids.add(match[1]);
  return ids;
}

function isIgnored(file) {
  return (
    file === "README.md" ||
    file.endsWith(".md") ||
    file === ".editorconfig" ||
    file === ".gitignore" ||
    file === ".oxfmtrc.json" ||
    file.startsWith(".cursor/")
  );
}

function isInfra(file) {
  return (
    file === "playwright.config.ts" ||
    file === "package.json" ||
    file === "pnpm-lock.yaml" ||
    file === "pnpm-workspace.yaml" ||
    file.startsWith("scripts/") ||
    file.startsWith(".github/") ||
    file.startsWith("web/vite.config") ||
    file.startsWith("web/tsconfig") ||
    file === "web/package.json" ||
    file === "web/index.html" ||
    (file.startsWith("tests/") && !file.endsWith(".spec.ts"))
  );
}

function isWebSource(file) {
  return file.startsWith("web/src/") && /\.(ts|tsx)$/.test(file);
}

function isSpec(file) {
  return file.startsWith("tests/") && file.endsWith(".spec.ts");
}

function writeOutput(result) {
  fs.writeFileSync("tia-selected.json", `${JSON.stringify(result, null, 2)}\n`);
  const grep = result.caseIds.map((id) => `@${id}`).join("|");
  console.log(JSON.stringify(result, null, 2));
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(
      process.env.GITHUB_OUTPUT,
      `mode=${result.mode}\ngrep=${grep}\nreason<<EOF\n${result.reason}\nEOF\n`,
    );
  }
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `## TIA selection\n\n- mode: \`${result.mode}\`\n- reason: ${result.reason}\n- cases: ${
        result.caseIds.join(", ") || "(none)"
      }\n- files:\n${result.changedFiles.map((file) => `  - \`${file}\``).join("\n") || "  - (none)"}\n`,
    );
  }
}

const changedFiles = listChangedFiles();
const relevant = changedFiles.filter((file) => !isIgnored(file));

if (!fs.existsSync(baselinePath)) {
  writeOutput({
    mode: "all",
    reason: "No TIA baseline artifact from main",
    caseIds: [],
    changedFiles,
  });
  process.exit(0);
}

if (relevant.some(isInfra)) {
  writeOutput({
    mode: "all",
    reason: "Infrastructure or harness files changed",
    caseIds: [],
    changedFiles,
  });
  process.exit(0);
}

const tia = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
const fileMap = tia.files ?? {};
const baselineCases = new Set(Object.keys(tia.cases ?? {}));
const currentCases = collectCaseIdsFromTests();
const selected = new Set();

for (const id of currentCases) {
  if (!baselineCases.has(id)) selected.add(id);
}

for (const file of relevant) {
  if (isSpec(file)) {
    for (const id of caseIdsInFile(file)) selected.add(id);
    continue;
  }
  if (isWebSource(file)) {
    const cases = fileMap[file];
    if (!cases) {
      writeOutput({
        mode: "all",
        reason: `Source file not in TIA map: ${file}`,
        caseIds: [],
        changedFiles,
      });
      process.exit(0);
    }
    for (const id of cases) selected.add(id);
    continue;
  }
  writeOutput({
    mode: "all",
    reason: `Unmapped changed file: ${file}`,
    caseIds: [],
    changedFiles,
  });
  process.exit(0);
}

const caseIds = [...selected].sort();
writeOutput({
  mode: caseIds.length > 0 ? "filter" : "skip",
  reason: caseIds.length > 0 ? "Mapped changed files to caseIds" : "No impacted e2e cases",
  caseIds,
  changedFiles,
});
