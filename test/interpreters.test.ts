import assert from "node:assert/strict";
import test from "node:test";
import { analyzeShebang } from "../src/interpreters.js";

test("recognizes env shebangs with portable interpreter names", () => {
  assert.equal(analyzeShebang("#!/usr/bin/env node")?.portable, true);
  assert.equal(analyzeShebang("#!/usr/bin/env python3")?.portable, true);
});

test("flags env shebangs without an interpreter argument", () => {
  for (const shebang of ["#!/usr/bin/env", "#!/usr/bin/env -S"]) {
    const analysis = analyzeShebang(shebang);
    assert.equal(analysis?.usesEnv, true, shebang);
    assert.equal(analysis?.envHasArgument, false, shebang);
    assert.equal(analysis?.portable, false, shebang);
  }
});

test("recognizes env -S shebangs followed by an interpreter", () => {
  const analysis = analyzeShebang("#!/usr/bin/env -S node --no-warnings");
  assert.equal(analysis?.usesEnv, true);
  assert.equal(analysis?.envHasArgument, true);
  assert.equal(analysis?.portable, true);
});

test("flags uncommon absolute interpreter paths", () => {
  const analysis = analyzeShebang("#!/usr/local/bin/bash");
  assert.equal(analysis?.portable, false);
});
