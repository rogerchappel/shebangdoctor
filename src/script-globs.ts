export const SCRIPT_DIRECTORIES = new Set([
  "bin",
  "script",
  "scripts",
  "tool",
  "tools",
  ".github/scripts"
]);

export const SCRIPT_EXTENSIONS = new Set([
  ".bash",
  ".bats",
  ".ksh",
  ".pl",
  ".ps1",
  ".py",
  ".rb",
  ".sh",
  ".zsh"
]);

export const JAVASCRIPT_EXTENSIONS = new Set([".cjs", ".js", ".mjs"]);

export const TEXT_SCRIPT_FILENAMES = new Set([
  "configure",
  "postinstall",
  "preinstall"
]);
