# ShebangDoctor Video Brief

## Angle

Show a tiny CI failure class that is easy to miss in review: scripts that look fine in the editor but fail because of shebang, chmod, CRLF, or interpreter portability issues.

## 60-second flow

1. Run `node dist/src/cli.js --json test/fixtures/problem` and show stable issue codes.
2. Run `node dist/src/cli.js test/fixtures/healthy` to show the clean path.
3. Copy the problem fixture to `/tmp` and run `--fix --executable` to demonstrate explicit cleanup.
4. Close on the safety model: default mode is read-only; chmod requires the extra `--executable` flag.

## Claims to avoid

- Do not claim it proves scripts are secure.
- Do not claim it rewrites non-portable shebangs.
- Do not claim it replaces shellcheck or platform testing.
