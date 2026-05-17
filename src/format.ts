import type { ScanReport } from "./types.js";

export function formatJson(report: ScanReport): string {
  return JSON.stringify(report, null, 2);
}

export function formatText(report: ScanReport): string {
  const lines: string[] = [];
  lines.push(`ShebangDoctor scanned ${report.scanned} script candidate${report.scanned === 1 ? "" : "s"}.`);

  if (report.issues.length === 0) {
    lines.push("No shebang, mode, CRLF, or portability issues found.");
  } else {
    lines.push("");
    lines.push("Issues:");
    for (const issue of report.issues) {
      const fixable = issue.fixable ? "fixable" : "manual";
      lines.push(`- [${issue.severity}] ${issue.path}: ${issue.code} (${fixable})`);
      lines.push(`  ${issue.message}`);
    }
  }

  if (report.fixes.length > 0) {
    lines.push("");
    lines.push("Fixes applied:");
    for (const fix of report.fixes) {
      lines.push(`- ${fix.path}: ${fix.action} ${fix.before} -> ${fix.after}`);
    }
  }

  if (report.issues.length > 0 && report.fixes.length === 0) {
    lines.push("");
    lines.push("Run with --fix to normalize CRLF. Add --executable to chmod shebang scripts.");
  }

  return lines.join("\n");
}
