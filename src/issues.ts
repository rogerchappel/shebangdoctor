import type { CandidateScript, Issue } from "./types.js";
import { analyzeShebang } from "./interpreters.js";

export function detectIssues(candidate: CandidateScript): Issue[] {
  const issues: Issue[] = [];

  if (!candidate.hasShebang) {
    issues.push({
      code: "missing-shebang",
      severity: "warning",
      path: candidate.relativePath,
      message: "Script-like file has no shebang.",
      fixable: false
    });
  }

  if (candidate.hasShebang && !candidate.executable) {
    issues.push({
      code: "not-executable",
      severity: "error",
      path: candidate.relativePath,
      message: "Shebang script is not executable.",
      fixable: true
    });
  }

  if (candidate.hasCrlf) {
    issues.push({
      code: "crlf-line-endings",
      severity: "error",
      path: candidate.relativePath,
      message: "Script contains CRLF line endings.",
      fixable: true
    });
  }

  const shebang = analyzeShebang(candidate.firstLine);
  if (shebang && !shebang.portable) {
    issues.push({
      code: "non-portable-interpreter",
      severity: "warning",
      path: candidate.relativePath,
      message: `Shebang interpreter "${shebang.interpreter || "(empty)"}" is likely non-portable.`,
      fixable: false
    });
  }

  if (shebang?.usesEnv && !shebang.envHasArgument) {
    issues.push({
      code: "env-shebang-without-argument",
      severity: "error",
      path: candidate.relativePath,
      message: "Shebang uses /usr/bin/env without an interpreter argument.",
      fixable: false
    });
  }

  return issues;
}
