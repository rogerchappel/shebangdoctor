# Orchestration Notes

ShebangDoctor is designed for local maintainers, CI jobs, and agentic coding runs that need a deterministic script-health gate.

## Recommended Flow

1. Run `shebangdoctor .` before tests or packaging.
2. Inspect issues in the text report.
3. Use `shebangdoctor --fix .` to normalize CRLF only.
4. Use `shebangdoctor --fix --executable .` when chmod changes are intended.
5. Commit fixes separately from feature work when possible.

## Agent Safety Contract

- Default scans are read-only.
- `--fix` only changes local files selected by candidate detection.
- `--executable` is separate because chmod changes can affect packaging and review.
- Shebang rewrites are not automatic in V1; portability warnings require human intent.
- JSON output is stable enough for CI parsing, but fields may expand before 1.0.

## CI Pattern

```sh
npm exec -- shebangdoctor --json .
```

For repositories that want automatic line-ending cleanup in a controlled job:

```sh
npm exec -- shebangdoctor --fix .
git diff --exit-code
```

That second command intentionally fails when fixes were made, so the patch can be reviewed.
