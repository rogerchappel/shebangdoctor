import assert from "node:assert/strict";
import test from "node:test";
import { parseArgs } from "../src/args.js";

test("defaults to scanning the current directory", () => {
  const parsed = parseArgs([], "/repo");
  assert.deepEqual(parsed.paths, ["."]);
  assert.equal(parsed.root, "/repo");
  assert.equal(parsed.fix, false);
});

test("parses fix, executable, json, and paths", () => {
  const parsed = parseArgs(["--fix", "--executable", "--json", "scripts", "bin"], "/repo");
  assert.deepEqual(parsed.paths, ["scripts", "bin"]);
  assert.equal(parsed.fix, true);
  assert.equal(parsed.executable, true);
  assert.equal(parsed.json, true);
});

test("rejects unknown options", () => {
  assert.throws(() => parseArgs(["--wat"], "/repo"), /Unknown option/);
});
