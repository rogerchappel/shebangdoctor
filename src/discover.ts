import fs from "node:fs/promises";
import path from "node:path";
import { isHiddenOrDependencyPath, relativePath } from "./path-utils.js";

export async function discoverFiles(root: string, inputs: string[]): Promise<string[]> {
  const discovered = new Set<string>();

  for (const input of inputs) {
    const absolute = path.resolve(root, input);
    await collectPath(root, absolute, discovered, true);
  }

  return [...discovered].sort();
}

async function collectPath(
  root: string,
  current: string,
  discovered: Set<string>,
  explicitInput = false
): Promise<void> {
  const rel = relativePath(root, current);
  if (isHiddenOrDependencyPath(rel)) {
    return;
  }

  try {
    const stat = await fs.stat(current);
    if (stat.isDirectory()) {
      const entries = await fs.readdir(current);
      await Promise.all(entries.map((entry) => collectPath(root, path.join(current, entry), discovered)));
      return;
    }

    if (stat.isFile()) {
      discovered.add(current);
    }
  } catch (error: unknown) {
    if (!explicitInput && isSkippableEntryError(error)) {
      return;
    }
    throw error;
  }
}

function isSkippableEntryError(error: unknown): error is NodeJS.ErrnoException {
  if (!(error instanceof Error) || !("code" in error)) {
    return false;
  }

  return new Set(["EACCES", "ENOENT", "ENOTDIR", "ELOOP", "EPERM"]).has(
    String((error as NodeJS.ErrnoException).code)
  );
}
