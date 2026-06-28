# ShebangDoctor Social Hooks

## Short Hooks

- Some CI failures are just file metadata: missing shebangs, non-executable scripts, CRLF line endings, or non-portable interpreter paths.
- `shebangdoctor` scans scripts locally and reports stable issue codes that are easy to use in CI annotations or agent handoffs.
- Fix mode is explicit: CRLF cleanup needs `--fix`, and chmod changes need both `--fix` and `--executable`.

## Demo CTA

```sh
npm run build
bash demo/run-script-audit.sh
```

The demo verifies the problem fixture exits with issues, the healthy fixture passes, and controlled fix mode reports applied fixes.

## Launch Note Draft

`shebangdoctor` is a small local CLI for catching script footguns before CI does. It focuses on portability and review friction: missing shebangs, executable bits, CRLF line endings, and interpreter paths that only work on one machine.

Default scans are read-only. Fix mode can normalize CRLF line endings, and executable-bit changes require the extra `--executable` flag so file-mode changes are deliberate.

## Guardrails

- Say "script portability checks" rather than "script security audit."
- Do not imply it rewrites shebangs; V1 reports portability warnings.
- Do not claim it replaces shellcheck or platform-specific test runs.
