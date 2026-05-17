import assert from "node:assert/strict";
import test from "node:test";
import { formatJson, formatText } from "../src/format.js";
import type { ScanReport } from "../src/types.js";

const report: ScanReport = {
  ok: false,
  scanned: 1,
  issues: [
    {
      code: "not-executable",
      severity: "error",
      path: "bin/run",
      message: "Shebang script is not executable.",
      fixable: true
    }
  ],
  fixes: []
};

test("formats human reports with issue details", () => {
  const text = formatText(report);
  assert.match(text, /ShebangDoctor scanned 1 script candidate/);
  assert.match(text, /bin\/run: not-executable/);
  assert.match(text, /Run with --fix/);
});

test("formats stable JSON reports", () => {
  const json = JSON.parse(formatJson(report)) as ScanReport;
  assert.equal(json.issues[0]?.code, "not-executable");
});
