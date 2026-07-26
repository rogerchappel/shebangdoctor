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
problem_output="$(node dist/src/cli.js --json "$tmp_dir/problem" 2>&1)"
problem_status=$?
set -e

if [ "$problem_status" -ne 1 ]; then
  printf 'expected problem fixture scan to exit 1, got %s\n%s\n' "$problem_status" "$problem_output" >&2
  exit 1
fi

printf '%s\n' "$problem_output" | grep -q '"not-executable"'
printf '%s\n' "$problem_output" | grep -q '"non-portable-interpreter"'

healthy_output="$(node dist/src/cli.js "$tmp_dir/healthy")"
printf '%s\n' "$healthy_output" | grep -q 'No shebang'

set +e
fix_output="$(node dist/src/cli.js --fix --executable "$tmp_dir/problem")"
fix_status=$?
set -e

if [ "$fix_status" -ne 1 ]; then
  printf 'expected partially fixed fixture scan to exit 1, got %s\n%s\n' "$fix_status" "$fix_output" >&2
  exit 1
fi

printf '%s\n' "$fix_output" | grep -q 'Fixes applied'
printf '%s\n' "$fix_output" | grep -q 'Remaining issues'

test -x "$tmp_dir/problem/bin/not-executable.sh"

printf 'smoke passed\n'
