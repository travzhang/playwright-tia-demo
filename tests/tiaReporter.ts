import type { Reporter } from "@playwright/test/reporter";
import { writeTiaMap } from "./analyzeCoverage";

export default class TiaReporter implements Reporter {
  onEnd() {
    writeTiaMap();
  }
}
