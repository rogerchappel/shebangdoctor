import assert from "node:assert/strict";
import test from "node:test";
import { detectIssues } from "../src/issues.js";
import type { CandidateScript } from "../src/types.js";

const baseCandidate: CandidateScript = {
  path: "/tmp/example.sh",
  relativePath: "bin/example.sh",
  mode: 0o100644,
  executable: false,
  firstLine: "#!/usr/bin/env sh",
  hasShebang: true,
  hasCrlf: false,
  extension: ".sh"
};

test("flags shebang scripts without executable bits", () => {
  const issues = detectIssues(baseCandidate);
  assert.equal(issues.some((issue) => issue.code === "not-executable"), true);
});

test("flags CRLF endings as fixable", () => {
  const issues = detectIssues({ ...baseCandidate, hasCrlf: true });
  const issue = issues.find((item) => item.code === "crlf-line-endings");
  assert.equal(issue?.fixable, true);
  assert.equal(issue?.severity, "error");
});

test("flags script-like files without shebangs", () => {
  const issues = detectIssues({ ...baseCandidate, firstLine: "echo hi", hasShebang: false });
  assert.equal(issues.some((issue) => issue.code === "missing-shebang"), true);
});
