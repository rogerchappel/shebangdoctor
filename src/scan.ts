import { discoverFiles } from "./discover.js";
import { readCandidate } from "./file-info.js";
import { applyFixes } from "./fix.js";
import { detectIssues } from "./issues.js";
import type { ScanOptions, ScanReport } from "./types.js";

export async function scan(options: ScanOptions): Promise<ScanReport> {
  const files = await discoverFiles(options.root, options.paths);
  const issues = [];
  const fixes = [];
  let scanned = 0;

  for (const file of files) {
    const candidate = await readCandidate(options.root, file);
    if (!candidate) {
      continue;
    }

    scanned += 1;
    const candidateIssues = detectIssues(candidate);
    issues.push(...candidateIssues);

    if (options.fix) {
      fixes.push(...await applyFixes(candidate, candidateIssues, options.executable));
    }
  }

  return {
    ok: issues.length === 0,
    scanned,
    issues,
    fixes
  };
}
