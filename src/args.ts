import path from "node:path";
import type { ScanOptions } from "./types.js";

export interface ParsedArgs extends ScanOptions {
  help: boolean;
  version: boolean;
}

export function parseArgs(argv: string[], root = process.cwd()): ParsedArgs {
  const paths: string[] = [];
  let fix = false;
  let executable = false;
  let json = false;
  let help = false;
  let version = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    switch (arg) {
      case "--fix":
        fix = true;
        break;
      case "--executable":
        executable = true;
        break;
      case "--json":
        json = true;
        break;
      case "--help":
      case "-h":
        help = true;
        break;
      case "--version":
      case "-v":
        version = true;
        break;
      case "--":
        paths.push(...argv.slice(index + 1));
        index = argv.length;
        break;
      default:
        if (arg?.startsWith("-")) {
          throw new Error(`Unknown option: ${arg}`);
        }
        if (arg) {
          paths.push(arg);
        }
    }
  }

  return {
    paths: paths.length > 0 ? paths : ["."],
    fix,
    executable,
    json,
    help,
    version,
    root: path.resolve(root)
  };
}

export function helpText(): string {
  return `ShebangDoctor audits script shebang, mode, CRLF, and interpreter portability issues.

Usage:
  shebangdoctor [options] [path ...]

Options:
  --json          Print a machine-readable report.
  --fix           Normalize CRLF line endings in detected scripts.
  --executable    With --fix, chmod shebang scripts that are missing executable bits.
  -h, --help      Show help.
  -v, --version   Show version.

Exit codes:
  0  No issues, or fixes completed.
  1  Issues were found in read-only mode.
  2  CLI usage or runtime error.
`;
}
