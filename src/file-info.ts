import fs from "node:fs/promises";
import path from "node:path";
import type { CandidateScript } from "./types.js";
import { isScriptLikePath, relativePath } from "./path-utils.js";

export async function readCandidate(root: string, filePath: string): Promise<CandidateScript | null> {
  const stat = await fs.stat(filePath);
  if (!stat.isFile()) {
    return null;
  }

  const rel = relativePath(root, filePath);
  const buffer = await fs.readFile(filePath);
  const contentStart = buffer.subarray(0, Math.min(buffer.length, 4096)).toString("utf8");
  const firstLineEnd = contentStart.search(/\r?\n/);
  const firstLine = firstLineEnd === -1 ? contentStart : contentStart.slice(0, firstLineEnd);
  const hasShebang = firstLine.startsWith("#!");
  const executable = (stat.mode & 0o111) !== 0;

  if (!hasShebang && !executable && !isScriptLikePath(rel)) {
    return null;
  }

  return {
    path: filePath,
    relativePath: rel,
    mode: stat.mode,
    executable,
    firstLine,
    hasShebang,
    hasCrlf: buffer.includes("\r\n"),
    extension: path.extname(filePath)
  };
}
