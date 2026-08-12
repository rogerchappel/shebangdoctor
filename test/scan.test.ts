import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { isScriptLikePath } from "../src/path-utils.js";
import { scan } from "../src/scan.js";

const fixturesRoot = path.resolve("test/fixtures");

test("recognizes conventional script directories at any nesting depth", () => {
  for (const candidate of [
    "packages/app/bin/deploy",
    "packages/app/script/deploy",
    "packages/app/scripts/deploy",
    "packages/app/tool/deploy",
    "packages/app/tools/deploy",
    "packages/app/.github/scripts/deploy"
  ]) {
    assert.equal(isScriptLikePath(candidate), true, candidate);
  }

  assert.equal(isScriptLikePath("packages/app/notes/release"), false);
  assert.equal(isScriptLikePath("packages/app/scripts/README.txt"), false);
});

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

test("distinguishes portable env forms from arguments without -S", async () => {
  const report = await scan({
    root: fixturesRoot,
    paths: ["env-forms"],
    fix: false,
    executable: false,
    json: false
  });

  assert.equal(report.scanned, 3);
  assert.deepEqual(
    report.issues.map(({ code, path: issuePath }) => ({ code, path: issuePath })),
    [{ code: "non-portable-interpreter", path: "env-forms/bin/arguments-without-s" }]
  );
});

test("scans canonical files once across overlapping inputs", async () => {
  const report = await scan({
    root: fixturesRoot,
    paths: ["healthy", "healthy/bin", "problem", "problem/bin"],
    fix: false,
    executable: false,
    json: false
  });

  assert.equal(report.scanned, 5);
  assert.equal(report.issues.length, 5);
  assert.equal(new Set(report.issues.map((issue) => `${issue.path}:${issue.code}`)).size, 5);
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

test("scans extensionless files in nested script directories but ignores ordinary extensionless files", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "shebangdoctor-"));
  const nestedScript = path.join(root, "packages", "app", "scripts", "deploy");
  const ordinaryFile = path.join(root, "packages", "app", "notes", "release");
  await fs.mkdir(path.dirname(nestedScript), { recursive: true });
  await fs.mkdir(path.dirname(ordinaryFile), { recursive: true });
  await fs.writeFile(nestedScript, "echo deploy\n", "utf8");
  await fs.writeFile(ordinaryFile, "release notes\n", "utf8");

  const report = await scan({
    root,
    paths: ["."],
    fix: false,
    executable: false,
    json: false
  });

  assert.equal(report.scanned, 1);
  assert.deepEqual(report.issues.map(({ code, path: issuePath }) => ({ code, path: issuePath })), [
    { code: "missing-shebang", path: "packages/app/scripts/deploy" }
  ]);
});

test("fix mode normalizes CRLF and adds execute bits without changing other permissions", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "shebangdoctor-"));
  await fs.mkdir(path.join(root, "bin"), { recursive: true });
  const ordinary = path.join(root, "bin", "ordinary.sh");
  const privateScript = path.join(root, "bin", "private.sh");
  const special = path.join(root, "bin", "special.sh");
  await fs.writeFile(ordinary, "#!/usr/bin/env sh\r\nprintf 'hello'\r\n", "utf8");
  await fs.writeFile(privateScript, "#!/usr/bin/env sh\nprintf 'private'\n", "utf8");
  await fs.writeFile(special, "#!/usr/bin/env sh\nprintf 'special'\n", "utf8");
  await fs.chmod(ordinary, 0o644);
  await fs.chmod(privateScript, 0o600);
  await fs.chmod(special, 0o4600);

  const report = await scan({
    root,
    paths: ["bin"],
    fix: true,
    executable: true,
    json: false
  });

  const content = await fs.readFile(ordinary, "utf8");
  const ordinaryStat = await fs.stat(ordinary);
  const privateStat = await fs.stat(privateScript);
  const specialStat = await fs.stat(special);

  assert.equal(report.ok, true);
  assert.deepEqual(report.issues, []);
  assert.equal(content.includes("\r\n"), false);
  assert.equal(ordinaryStat.mode & 0o777, 0o755);
  assert.equal(privateStat.mode & 0o777, 0o711);
  assert.equal(specialStat.mode & 0o7777, 0o4711);
  assert.deepEqual(report.fixes, [
    {
      path: "bin/ordinary.sh",
      action: "normalize-crlf",
      before: "CRLF",
      after: "LF"
    },
    {
      path: "bin/ordinary.sh",
      action: "chmod-executable",
      before: "0644",
      after: "0755"
    },
    {
      path: "bin/private.sh",
      action: "chmod-executable",
      before: "0600",
      after: "0711"
    },
    {
      path: "bin/special.sh",
      action: "chmod-executable",
      before: "04600",
      after: "04711"
    }
  ]);
});

test("fix mode applies each change once across overlapping inputs", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "shebangdoctor-"));
  const script = path.join(root, "bin", "cleanable.sh");
  await fs.mkdir(path.dirname(script), { recursive: true });
  await fs.writeFile(script, "#!/usr/bin/env sh\r\nprintf 'hello'\r\n", "utf8");
  await fs.chmod(script, 0o644);

  const report = await scan({
    root,
    paths: [".", "bin", "bin/cleanable.sh"],
    fix: true,
    executable: true,
    json: false
  });

  assert.equal(report.scanned, 1);
  assert.equal(report.fixes.length, 2);
  assert.deepEqual(report.fixes.map((fix) => fix.action), ["normalize-crlf", "chmod-executable"]);
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
