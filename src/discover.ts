import fs from "node:fs/promises";
import path from "node:path";
import { isHiddenOrDependencyPath, relativePath } from "./path-utils.js";

export async function discoverFiles(root: string, inputs: string[]): Promise<string[]> {
  const discovered: string[] = [];

  for (const input of inputs) {
    const absolute = path.resolve(root, input);
    await collectPath(root, absolute, discovered);
  }

  return discovered.sort();
}

async function collectPath(root: string, current: string, discovered: string[]): Promise<void> {
  const rel = relativePath(root, current);
  if (isHiddenOrDependencyPath(rel)) {
    return;
  }

  const stat = await fs.stat(current);
  if (stat.isDirectory()) {
    const entries = await fs.readdir(current);
    await Promise.all(entries.map((entry) => collectPath(root, path.join(current, entry), discovered)));
    return;
  }

  if (stat.isFile()) {
    discovered.push(current);
  }
}
