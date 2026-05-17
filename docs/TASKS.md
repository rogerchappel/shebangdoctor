# ShebangDoctor Tasks

## MVP Complete

- [x] Scan directories and explicit paths for script candidates.
- [x] Detect missing shebangs in script-like files.
- [x] Detect shebang scripts missing executable bits.
- [x] Detect CRLF line endings.
- [x] Warn on likely non-portable absolute interpreters.
- [x] Warn when `/usr/bin/env` has no interpreter argument.
- [x] Print human and JSON reports.
- [x] Keep default mode read-only.
- [x] Support `--fix` for CRLF normalization.
- [x] Require `--executable` before chmod fixes.
- [x] Cover detection and fixes with focused tests.
- [x] Run a real CLI smoke against fixtures.

## Next Useful Work

- [ ] Add a `--fail-on warning|error` threshold for stricter CI tuning.
- [ ] Add ignore patterns for generated script directories.
- [ ] Suggest replacement shebangs for common absolute interpreter paths.
- [ ] Publish example GitHub Actions snippets.
- [ ] Add package-manager specific install examples after first release.

## Not Planned For V1

- Full shell parsing.
- Installing missing interpreters.
- Mutating files without explicit flags.
- Rewriting shebangs automatically.
