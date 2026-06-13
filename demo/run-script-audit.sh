#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

npm run build >/dev/null

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

cp -R test/fixtures/problem "$tmp_dir/problem"
cp -R test/fixtures/healthy "$tmp_dir/healthy"

set +e
node dist/src/cli.js --json "$tmp_dir/problem" > "$tmp_dir/problem-report.json"
status=$?
set -e

if [ "$status" -ne 1 ]; then
  printf 'expected problem fixture scan to exit 1, got %s\n' "$status" >&2
  exit 1
fi

grep -q '"not-executable"' "$tmp_dir/problem-report.json"
grep -q '"non-portable-interpreter"' "$tmp_dir/problem-report.json"

node dist/src/cli.js "$tmp_dir/healthy" > "$tmp_dir/healthy-report.txt"
grep -q 'No shebang' "$tmp_dir/healthy-report.txt"

node dist/src/cli.js --fix --executable "$tmp_dir/problem" > "$tmp_dir/fix-report.txt"
grep -q 'Fixes applied' "$tmp_dir/fix-report.txt"

printf 'problem report: %s/problem-report.json\n' "$tmp_dir"
printf 'fix report: %s/fix-report.txt\n' "$tmp_dir"
