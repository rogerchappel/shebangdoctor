import assert from "node:assert/strict";
import test from "node:test";
import { analyzeShebang } from "../src/interpreters.js";

test("recognizes env shebangs with portable interpreter names", () => {
  assert.equal(analyzeShebang("#!/usr/bin/env node")?.portable, true);
  assert.equal(analyzeShebang("#!/usr/bin/env python3")?.portable, true);
});

test("flags env shebangs without an interpreter argument", () => {
  const analysis = analyzeShebang("#!/usr/bin/env");
  assert.equal(analysis?.usesEnv, true);
  assert.equal(analysis?.envHasArgument, false);
  assert.equal(analysis?.portable, false);
});

test("flags uncommon absolute interpreter paths", () => {
  const analysis = analyzeShebang("#!/usr/local/bin/bash");
  assert.equal(analysis?.portable, false);
});
