import * as fs from "node:fs";
import * as path from "node:path";

export const OUTPUT_DIR = ".canyon_output";

type CoverageFile = {
  path?: string;
  s?: Record<string, number>;
};

export type CaseAnalysis = {
  caseId: string;
  files: Record<string, Record<string, number>>;
};

export function extractRelatedStatementHits(
  coverage: Record<string, CoverageFile>,
  cwd = process.cwd(),
): Record<string, Record<string, number>> {
  const files: Record<string, Record<string, number>> = {};
  for (const [key, entry] of Object.entries(coverage)) {
    const s = entry.s;
    if (!s || !Object.values(s).some((count) => Number(count) > 0)) continue;
    const abs = entry.path ?? key;
    const rel = path.relative(cwd, abs).split(path.sep).join("/");
    files[rel] = s;
  }
  return files;
}

export function writeCaseAnalysis(
  destDir: string,
  caseId: string,
  coverage: Record<string, CoverageFile>,
) {
  const analysis: CaseAnalysis = {
    caseId,
    files: extractRelatedStatementHits(coverage),
  };
  fs.writeFileSync(path.join(destDir, "analysis.json"), `${JSON.stringify(analysis, null, 2)}\n`);
  return analysis;
}

export function writeTiaMap(outputDir = OUTPUT_DIR) {
  const cases: Record<string, string[]> = {};
  const files: Record<string, string[]> = {};

  if (!fs.existsSync(outputDir)) return { cases, files };

  for (const name of fs.readdirSync(outputDir)) {
    if (name.startsWith(".")) continue;
    const analysisPath = path.join(outputDir, name, "analysis.json");
    if (!fs.existsSync(analysisPath)) continue;
    const analysis = JSON.parse(fs.readFileSync(analysisPath, "utf8")) as CaseAnalysis;
    const related = Object.keys(analysis.files).sort();
    cases[analysis.caseId] = related;
    for (const file of related) {
      files[file] ??= [];
      if (!files[file].includes(analysis.caseId)) files[file].push(analysis.caseId);
    }
  }

  for (const caseIds of Object.values(files)) caseIds.sort();

  const tia = { cases, files };
  fs.writeFileSync(path.join(outputDir, "tia.json"), `${JSON.stringify(tia, null, 2)}\n`);
  return tia;
}
