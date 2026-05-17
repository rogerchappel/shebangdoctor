export type Severity = "error" | "warning";

export type IssueCode =
  | "missing-shebang"
  | "not-executable"
  | "crlf-line-endings"
  | "non-portable-interpreter"
  | "env-shebang-without-argument";

export interface ScanOptions {
  paths: string[];
  fix: boolean;
  executable: boolean;
  json: boolean;
  root: string;
}

export interface CandidateScript {
  path: string;
  relativePath: string;
  mode: number;
  executable: boolean;
  firstLine: string;
  hasShebang: boolean;
  hasCrlf: boolean;
  extension: string;
}

export interface Issue {
  code: IssueCode;
  severity: Severity;
  path: string;
  message: string;
  fixable: boolean;
}

export interface FixAction {
  path: string;
  action: "normalize-crlf" | "chmod-executable";
  before: string;
  after: string;
}

export interface ScanReport {
  ok: boolean;
  scanned: number;
  issues: Issue[];
  fixes: FixAction[];
}
