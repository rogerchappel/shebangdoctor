# shebangdoctor

Tiny CLI for catching script footguns before CI does.

ShebangDoctor audits scripts for the boring failures that waste real time: missing shebangs, missing executable bits, CRLF line endings, and interpreter paths that only work on one machine.

## Install

```sh
npm install --save-dev github:rogerchappel/shebangdoctor
```

ShebangDoctor is distributed from GitHub rather than the npm registry. The Git
dependency builds the CLI during installation.

During development in this repo:

```sh
npm install
npm run build
node dist/src/cli.js .
```

## Use

Scan the current repo:

```sh
./node_modules/.bin/shebangdoctor .
```

Pass multiple files or directories to scan them together. Overlapping inputs are
deduplicated by canonical path, so each discovered file is reported or fixed at
most once:

```sh
./node_modules/.bin/shebangdoctor scripts scripts/release
```

Print JSON for CI or agent workflows:

```sh
./node_modules/.bin/shebangdoctor --json .
```

Normalize CRLF line endings in detected scripts:

```sh
./node_modules/.bin/shebangdoctor --fix .
```

Normalize CRLF and add executable bits to shebang scripts:

```sh
./node_modules/.bin/shebangdoctor --fix --executable .
```

Run the repository fixture demo:

```sh
bash demo/run-script-audit.sh
```

See [Clean Script Footguns Before CI](docs/tutorials/clean-script-footguns.md) for a complete walkthrough.

## What It Checks

- Script-like files without shebangs, including extensionless files nested anywhere under conventional `bin`, `script(s)`, `tool(s)`, or `.github/scripts` directories.
- Shebang scripts that are not executable.
- CRLF line endings in scripts.
- Absolute interpreter paths that are likely non-portable.
- `/usr/bin/env` shebangs missing an interpreter argument. With split-string
  mode, `-S` must be followed by an interpreter (for example,
  `#!/usr/bin/env -S node --no-warnings`); `#!/usr/bin/env -S` is invalid.

## Safety

Default mode is read-only. `--fix` only normalizes CRLF. Chmod changes require both `--fix` and `--executable`; they add the user, group, and other execute bits (`0111`) while preserving all existing permission bits.

ShebangDoctor does not rewrite shebangs in V1. It reports portability warnings so a human can choose the right interpreter.

## Exit Codes

- `0`: the reported state is clean. In fix mode, all detected issues were resolved.
- `1`: issues remain. This includes read-only findings, manual-only findings in
  fix mode, and files that were only partially fixed.
- `2`: usage or runtime error.

Human and JSON output describe the post-fix state: applied changes appear in
`Fixes applied`/`fixes`, unresolved findings remain in `Remaining issues`/`issues`,
and JSON `ok` is `true` exactly when the exit code is `0`.

## Verify

```sh
npm test
npm run check
npm run build
npm run smoke
npm run package:smoke
npm run documented-install:smoke
npm run release:check
bash scripts/validate.sh
```

`npm run release:check` runs the compiled test suite, TypeScript check, smoke
fixture, package inspection, and a clean consumer install that exercises the
documented CLI entry point.

## Release Archive Contents

The GitHub release archive includes the compiled CLI, README, docs, license,
changelog, contributing guide, and security policy. Run `npm run package:smoke`
to inspect the exact tarball attached to a release.

## Docs

- [Product requirements](docs/PRD.md)
- [Task plan](docs/TASKS.md)
- [Orchestration notes](docs/ORCHESTRATION.md)
- [Safety guide](docs/SAFETY.md)
- [Examples](docs/EXAMPLES.md)

## License

MIT
