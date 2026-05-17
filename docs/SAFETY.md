# Safety Guide

ShebangDoctor is intentionally conservative.

## Read-Only By Default

```sh
shebangdoctor .
```

This scans files and exits non-zero when issues are found. It does not edit files.

## Fix Levels

```sh
shebangdoctor --fix .
```

This normalizes CRLF line endings in detected script files.

```sh
shebangdoctor --fix --executable .
```

This also applies executable bits to shebang scripts that are missing them.

## Manual Decisions

Interpreter portability warnings are not auto-fixed. A path like `#!/usr/local/bin/bash` might need `#!/usr/bin/env bash`, but that decision depends on your target systems and policy.

Review generated diffs before committing fixes:

```sh
git diff -- scripts bin tools
```
