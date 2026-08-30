import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const workflows = ["release.yml", "release-dry-run.yml"] as const;

async function workflow(name: (typeof workflows)[number]): Promise<string> {
  return readFile(`.github/workflows/${name}`, "utf8");
}

test("release workflows share a single explicit artifact contract", async () => {
  for (const name of workflows) {
    const source = await workflow(name);
    assert.equal((source.match(/npm pack --silent --pack-destination release-artifacts/g) ?? []).length, 1, name);
    assert.match(source, /id: pack[\s\S]*echo "artifact=\$artifact" >> "\$GITHUB_OUTPUT"/, name);
    assert.doesNotMatch(source, /gh release create[^\n]*\*\.tgz/, name);
  }
});

test("tag release attaches and dry run installs the captured artifact", async () => {
  const release = await workflow("release.yml");
  const dryRun = await workflow("release-dry-run.yml");
  const artifact = "${{ steps.pack.outputs.artifact }}";

  assert.match(release, new RegExp(`gh release create[^\\n]+"\\$\\{GITHUB_REF_NAME\\}"[^\\n]+"\\$\\{\\{ steps\\.pack\\.outputs\\.artifact \\}\\}"`));
  assert.match(dryRun, /npm install --prefix "\$consumer" --ignore-scripts "\$\{\{ steps\.pack\.outputs\.artifact \}\}"/);
  assert.equal(Array.from(release.matchAll(new RegExp(artifact.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"))).length, 1);
  assert.equal(Array.from(dryRun.matchAll(new RegExp(artifact.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"))).length, 1);
});
