# ShebangDoctor Video Brief

## Angle

Show a tiny CI failure class that is easy to miss in review: scripts that look fine in the editor but fail because of shebang, chmod, CRLF, or interpreter portability issues.

## 60-second flow

1. Run `bash demo/run-script-audit.sh`.
2. Open the printed `problem-report.json` path and show stable issue codes such as `not-executable` and `non-portable-interpreter`.
3. Open the printed `fix-report.txt` path to show controlled cleanup.
4. Run `node dist/src/cli.js test/fixtures/healthy` to show the clean path.
5. Close on the safety model: default mode is read-only; chmod requires the extra `--executable` flag.

## Grounded Demo Assets

- Demo wrapper: `demo/run-script-audit.sh`
- Problem fixture: `test/fixtures/problem`
- Healthy fixture: `test/fixtures/healthy`
- Tutorial: `docs/tutorials/clean-script-footguns.md`

## Claims to avoid

- Do not claim it proves scripts are secure.
- Do not claim it rewrites non-portable shebangs.
- Do not claim it replaces shellcheck or platform testing.
