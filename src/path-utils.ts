import path from "node:path";
import { SCRIPT_DIRECTORIES, SCRIPT_EXTENSIONS, TEXT_SCRIPT_FILENAMES } from "./script-globs.js";

export function toPosixPath(value: string): string {
  return value.split(path.sep).join("/");
}

export function relativePath(root: string, filePath: string): string {
  const relative = path.relative(root, filePath);
  return toPosixPath(relative || path.basename(filePath));
}

export function isHiddenOrDependencyPath(relative: string): boolean {
  const parts = relative.split("/");
  return parts.some((part) =>
    part === ".git" ||
    part === "node_modules" ||
    part === "dist" ||
    part === "coverage" ||
    part === ".turbo" ||
    part === ".next"
  );
}

export function isScriptLikePath(relative: string): boolean {
  const normalized = toPosixPath(relative);
  const extension = path.extname(normalized);
  const basename = path.basename(normalized);
  const parent = path.dirname(normalized);
  const firstDirectory = normalized.split("/")[0] ?? "";

  return SCRIPT_EXTENSIONS.has(extension) ||
    TEXT_SCRIPT_FILENAMES.has(basename) ||
    SCRIPT_DIRECTORIES.has(parent) ||
    SCRIPT_DIRECTORIES.has(firstDirectory);
}
