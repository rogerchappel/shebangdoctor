# shebangdoctor

Tiny CLI for catching script footguns before CI does.

ShebangDoctor audits scripts for the boring failures that waste real time: missing shebangs, missing executable bits, CRLF line endings, and interpreter paths that only work on one machine.

## Install

```sh
npm install --save-dev shebangdoctor
```

During development in this repo:

```sh
npm install
npm run build
node dist/src/cli.js .
```

## Use

Scan the current repo:

```sh
npx shebangdoctor .
```

Print JSON for CI or agent workflows:

```sh
npx shebangdoctor --json .
```

Normalize CRLF line endings in detected scripts:

```sh
npx shebangdoctor --fix .
```

Normalize CRLF and add executable bits to shebang scripts:

```sh
npx shebangdoctor --fix --executable .
```

## What It Checks

- Script-like files without shebangs.
- Shebang scripts that are not executable.
- CRLF line endings in scripts.
- Absolute interpreter paths that are likely non-portable.
- `/usr/bin/env` shebangs missing an interpreter argument.

## Safety

Default mode is read-only. `--fix` only normalizes CRLF. Chmod changes require both `--fix` and `--executable`.

ShebangDoctor does not rewrite shebangs in V1. It reports portability warnings so a human can choose the right interpreter.

## Exit Codes

- `0`: no issues, or fixes completed.
- `1`: issues found in read-only mode.
- `2`: usage or runtime error.

## Verify

```sh
npm test
npm run check
npm run build
npm run smoke
npm run package:smoke
npm run release:check
bash scripts/validate.sh
```

`npm run release:check` runs the compiled test suite, TypeScript check, smoke
fixture, and npm pack dry-run used to verify release readiness.

## Package Contents

The npm package includes the compiled CLI, README, docs, license, changelog,
contributing guide, and security policy. Run `npm run package:smoke` to inspect
the exact tarball before publishing.

## Docs

- [Product requirements](docs/PRD.md)
- [Task plan](docs/TASKS.md)
- [Orchestration notes](docs/ORCHESTRATION.md)
- [Safety guide](docs/SAFETY.md)
- [Examples](docs/EXAMPLES.md)

## License

MIT
