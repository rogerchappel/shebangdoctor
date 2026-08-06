#!/usr/bin/env bash
set -euo pipefail

repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
smoke_root=$(mktemp -d "${TMPDIR:-/tmp}/shebangdoctor-install-smoke.XXXXXX")
trap 'rm -rf "$smoke_root"' EXIT

package_path=$(cd "$repo_root" && npm pack --silent --pack-destination "$smoke_root")
consumer="$smoke_root/consumer"
mkdir "$consumer"
cd "$consumer"
npm init --yes --silent >/dev/null
npm install --silent --save-dev "$smoke_root/$package_path"

cli=./node_modules/.bin/shebangdoctor
test -x "$cli"
"$cli" --help >/dev/null
version=$($cli --version)
expected_version=$(node -p "require('$repo_root/package.json').version")
test "$version" = "$expected_version"

printf 'documented install smoke passed (shebangdoctor %s)\n' "$version"
