import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const cli = path.resolve("dist/src/cli.js");

test("fix mode exits 1 and reports unresolved manual issues", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "shebangdoctor-cli-"));
  await fs.writeFile(path.join(root, "manual.sh"), "printf 'no shebang'\n", "utf8");

  const result = runCli(["--fix", root]);

  assert.equal(result.status, 1);
  assert.match(result.stdout, /missing-shebang \(manual\)/);
  assert.doesNotMatch(result.stdout, /Fixes applied:/);
});

test("fix mode exits 1 when only part of a file can be fixed", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "shebangdoctor-cli-"));
  await fs.writeFile(path.join(root, "partial.sh"), "#!/usr/local/bin/bash\r\nprintf 'hello'\r\n", "utf8");

  const result = runCli(["--fix", root]);

  assert.equal(result.status, 1);
  assert.match(result.stdout, /Fixes applied:/);
  assert.match(result.stdout, /normalize-crlf/);
  assert.match(result.stdout, /non-portable-interpreter \(manual\)/);
});

test("fix mode exits 0 after successful CRLF and chmod fixes", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "shebangdoctor-cli-"));
  const script = path.join(root, "cleanable.sh");
  await fs.writeFile(script, "#!/usr/bin/env sh\r\nprintf 'hello'\r\n", "utf8");
  await fs.chmod(script, 0o644);

  const result = runCli(["--fix", "--executable", "--json", root]);
  const report = JSON.parse(result.stdout) as {
    ok: boolean;
    issues: unknown[];
    fixes: unknown[];
  };

  assert.equal(result.status, 0);
  assert.equal(report.ok, true);
  assert.deepEqual(report.issues, []);
  assert.equal(report.fixes.length, 2);
});

test("read-only mode exits 1 and does not apply fixes", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "shebangdoctor-cli-"));
  const script = path.join(root, "readonly.sh");
  const original = "#!/usr/bin/env sh\r\nprintf 'hello'\r\n";
  await fs.writeFile(script, original, "utf8");

  const result = runCli(["--json", root]);
  const report = JSON.parse(result.stdout) as {
    ok: boolean;
    issues: unknown[];
    fixes: unknown[];
  };

  assert.equal(result.status, 1);
  assert.equal(report.ok, false);
  assert.equal(report.issues.length, 2);
  assert.deepEqual(report.fixes, []);
  assert.equal(await fs.readFile(script, "utf8"), original);
});

function runCli(args: string[]) {
  return spawnSync(process.execPath, [cli, ...args], {
    encoding: "utf8"
  });
}
