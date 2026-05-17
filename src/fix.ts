import fs from "node:fs/promises";
import type { CandidateScript, FixAction, Issue } from "./types.js";

export async function applyFixes(candidate: CandidateScript, issues: Issue[], executable: boolean): Promise<FixAction[]> {
  const actions: FixAction[] = [];

  if (issues.some((issue) => issue.code === "crlf-line-endings")) {
    const original = await fs.readFile(candidate.path, "utf8");
    const normalized = original.replace(/\r\n/g, "\n");
    if (normalized !== original) {
      await fs.writeFile(candidate.path, normalized, "utf8");
      actions.push({
        path: candidate.relativePath,
        action: "normalize-crlf",
        before: "CRLF",
        after: "LF"
      });
    }
  }

  if (executable && issues.some((issue) => issue.code === "not-executable")) {
    const before = candidate.mode & 0o777;
    const after = before | 0o755;
    if (after !== before) {
      await fs.chmod(candidate.path, after);
      actions.push({
        path: candidate.relativePath,
        action: "chmod-executable",
        before: formatMode(before),
        after: formatMode(after)
      });
    }
  }

  return actions;
}

function formatMode(mode: number): string {
  return `0${(mode & 0o777).toString(8)}`;
}
