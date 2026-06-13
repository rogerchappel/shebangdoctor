# Clean Script Footguns Before CI

ShebangDoctor catches common script portability issues before they land in CI: missing shebangs, missing executable bits, CRLF line endings, and interpreter paths that are likely to work only on one machine.

## Inspect the problem fixture

```sh
npm install
npm run build
node dist/src/cli.js --json test/fixtures/problem
```

The fixture intentionally exits `1` in read-only mode. The JSON report is useful for CI annotations or agent handoffs because issue codes such as `not-executable` and `non-portable-interpreter` are stable.

## Compare the healthy fixture

```sh
node dist/src/cli.js test/fixtures/healthy
```

The healthy fixture demonstrates the expected clean path.

## Try fix mode safely

```sh
tmp_dir="$(mktemp -d)"
cp -R test/fixtures/problem "$tmp_dir/problem"
node dist/src/cli.js --fix --executable "$tmp_dir/problem"
```

`--fix` normalizes CRLF line endings. Chmod changes require both `--fix` and `--executable`, so executable-bit changes are always explicit.

## Demo shortcut

```sh
bash demo/run-script-audit.sh
```

The script copies fixtures to a temporary directory, verifies the read-only failure, checks the healthy path, and then exercises controlled fix mode.
