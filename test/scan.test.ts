import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { scan } from "../src/scan.js";

const fixturesRoot = path.resolve("test/fixtures");

test("reports a healthy fixture tree as clean", async () => {
  const report = await scan({
    root: fixturesRoot,
    paths: ["healthy"],
    fix: false,
    executable: false,
    json: false
  });

  assert.equal(report.ok, true);
  assert.equal(report.scanned, 1);
  assert.deepEqual(report.issues, []);
});

test("reports missing shebang, chmod, env, and portability problems", async () => {
  const report = await scan({
    root: fixturesRoot,
    paths: ["problem"],
    fix: false,
    executable: false,
    json: false
  });

  const codes = report.issues.map((issue) => issue.code).sort();
  assert.equal(report.ok, false);
  assert.equal(report.scanned, 4);
  assert.deepEqual(codes, [
    "env-shebang-without-argument",
    "missing-shebang",
    "non-portable-interpreter",
    "non-portable-interpreter",
    "not-executable"
  ]);
});

test("fix mode normalizes CRLF and can chmod shebang scripts", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "shebangdoctor-"));
  await fs.mkdir(path.join(root, "bin"), { recursive: true });
  const script = path.join(root, "bin", "crlf.sh");
  await fs.writeFile(script, "#!/usr/bin/env sh\r\nprintf 'hello'\r\n", "utf8");
  await fs.chmod(script, 0o644);

  const report = await scan({
    root,
    paths: ["bin"],
    fix: true,
    executable: true,
    json: false
  });

  const content = await fs.readFile(script, "utf8");
  const stat = await fs.stat(script);

  assert.equal(report.fixes.length, 2);
  assert.equal(report.ok, true);
  assert.deepEqual(report.issues, []);
  assert.equal(content.includes("\r\n"), false);
  assert.equal((stat.mode & 0o111) !== 0, true);
});

test("fix mode retains manual and partially fixed issues", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "shebangdoctor-"));
  const manual = path.join(root, "manual.sh");
  const partial = path.join(root, "partial.sh");
  await fs.writeFile(manual, "printf 'no shebang'\n", "utf8");
  await fs.writeFile(partial, "#!/usr/local/bin/bash\r\nprintf 'hello'\r\n", "utf8");

  const report = await scan({
    root,
    paths: ["."],
    fix: true,
    executable: false,
    json: false
  });

  assert.equal(report.ok, false);
  assert.deepEqual(
    report.issues.map((issue) => issue.code).sort(),
    ["missing-shebang", "non-portable-interpreter", "not-executable"]
  );
  assert.deepEqual(report.fixes.map((fix) => fix.action), ["normalize-crlf"]);
});

test("read-only mode reports fixable issues without changing files", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "shebangdoctor-"));
  const script = path.join(root, "readonly.sh");
  const original = "#!/usr/bin/env sh\r\nprintf 'hello'\r\n";
  await fs.writeFile(script, original, "utf8");
  await fs.chmod(script, 0o644);

  const report = await scan({
    root,
    paths: ["."],
    fix: false,
    executable: true,
    json: false
  });

  assert.equal(report.ok, false);
  assert.deepEqual(
    report.issues.map((issue) => issue.code).sort(),
    ["crlf-line-endings", "not-executable"]
  );
  assert.deepEqual(report.fixes, []);
  assert.equal(await fs.readFile(script, "utf8"), original);
});
