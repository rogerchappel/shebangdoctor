# Security Policy

ShebangDoctor is a local CLI that reads files and, only with explicit flags, edits script line endings or executable bits.

## Supported Versions

No stable public release exists yet. Until 1.0, security fixes land on `main` and the latest npm release when publishing begins.

## Reporting a Vulnerability

Please do not report suspected vulnerabilities in public issues, pull requests, or discussions.

Use GitHub private vulnerability reporting when it is enabled for the repository. If it is not enabled, open a public issue asking for a private reporting path without including exploit details, secrets, personal data, or sensitive technical details.

## Scope

In scope:

- Unsafe file mutation behavior in `--fix` or `--executable`.
- Path traversal, symlink, or candidate discovery behavior that edits files outside the requested scan area.
- Insecure CI or release configuration maintained by this project.
- Dependency vulnerabilities in shipped runtime code.

Out of scope:

- General support requests.
- Findings in downstream repositories scanned by ShebangDoctor.
- Reports that require installing untrusted third-party scripts outside this project.

## Safe Reproduction

Use throwaway fixture directories where possible. Do not send private repositories, credentials, or production scripts unless maintainers explicitly provide a secure path and ask for them.

## Disclosure

Coordinate disclosure with maintainers before publishing vulnerability details.
