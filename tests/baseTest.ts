import * as fs from "node:fs";
import * as path from "node:path";
import { test as baseTest, type TestInfo } from "@playwright/test";
import { createCoverageContextFixture } from "@canyonjs/playwright";
import { OUTPUT_DIR, writeCaseAnalysis } from "./analyzeCoverage";

export function caseId(id: string) {
  return {
    annotation: { type: "caseId" as const, description: id },
    tag: `@${id}`,
  };
}

function requireCaseId(testInfo: TestInfo) {
  const id = testInfo.annotations.find((item) => item.type === "caseId")?.description;
  if (!id) {
    throw new Error(
      `Test "${testInfo.titlePath.join(" > ")}" is missing a caseId. Use caseId("auth-001") as the second argument.`,
    );
  }
  return id;
}

async function persistCaseCoverage(testInfo: TestInfo, tmpDir: string) {
  const id = requireCaseId(testInfo);
  const destDir = path.join(OUTPUT_DIR, id);
  await fs.promises.mkdir(destDir, { recursive: true });

  const files = await fs.promises.readdir(tmpDir).catch(() => []);
  const coverageFiles = files
    .filter((file) => file.startsWith("coverage-") && file.endsWith(".json"))
    .sort();
  const coverageFile = path.join(destDir, "coverage-final.json");
  if (coverageFiles.length > 0) {
    await fs.promises.copyFile(
      path.join(tmpDir, coverageFiles[coverageFiles.length - 1]),
      coverageFile,
    );
    const coverage = JSON.parse(await fs.promises.readFile(coverageFile, "utf8")) as Record<
      string,
      { path?: string; s?: Record<string, number> }
    >;
    writeCaseAnalysis(destDir, id, coverage);
  }

  await fs.promises.writeFile(
    path.join(destDir, "meta.json"),
    `${JSON.stringify(
      {
        caseId: id,
        title: testInfo.title,
        titlePath: testInfo.titlePath,
        file: path.relative(process.cwd(), testInfo.file),
        project: testInfo.project.name,
        status: testInfo.status,
        coverageFile,
        analysisFile: path.join(destDir, "analysis.json"),
      },
      null,
      2,
    )}\n`,
  );
}

export const test = baseTest.extend({
  context: async ({ context }, use, testInfo) => {
    const tmpDir = path.join(OUTPUT_DIR, ".tmp", testInfo.testId);
    const collect = createCoverageContextFixture({ outputDir: tmpDir });
    await collect({ context }, async () => {
      await use(context);
    });
    await persistCaseCoverage(testInfo, tmpDir);
  },
});

export const expect = test.expect;
