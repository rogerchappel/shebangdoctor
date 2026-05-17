# Examples

## Local Audit

```sh
shebangdoctor scripts bin
```

## CI JSON Report

```sh
shebangdoctor --json . > shebangdoctor-report.json
```

## Controlled CRLF Cleanup

```sh
shebangdoctor --fix .
git diff --check
git diff
```

## Chmod Script Entrypoints

```sh
shebangdoctor --fix --executable scripts bin
git diff --summary
```

## Agent Workflow

```sh
npm test
shebangdoctor --json .
shebangdoctor --fix .
git diff --exit-code
```

The last command fails if line endings were changed, forcing the patch into review.
