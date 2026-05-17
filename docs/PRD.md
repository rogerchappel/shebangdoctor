# ShebangDoctor PRD

Status: in-progress

## Summary

ShebangDoctor is a local-first CLI that audits executable scripts for shebang, mode, and line-ending problems before agents or CI try to run them. It is a small wrench for a common build failure: the script looked fine in a diff, then failed with "permission denied", "bad interpreter", or a Windows CRLF surprise.

## Problem

Developer and agent-generated repos often accumulate scripts with mismatched executable bits, missing shebangs, stale interpreter paths, or CRLF endings. These issues are easy to miss in review and expensive when they break automation.

## Users

- Maintainers preparing OSS repos for local contributors.
- Agentic coding workflows that create shell, Node, Python, or Ruby scripts.
- CI owners who want deterministic script health checks.

## V1

- Scan one or more directories for executable-looking scripts.
- Detect missing shebangs, non-executable scripts under script paths, CRLF line endings, env shebang compatibility, and interpreter paths that are likely non-portable.
- Output human text and JSON.
- Support --fix for safe changes: normalize CRLF and apply executable mode only when configured.
- Provide fixture-backed tests and a real CLI smoke.

## Non-goals

- Full shell parsing.
- Dependency installation.
- Mutating files without explicit --fix.

## Safety

Default mode is read-only. Fixes must be explicit, local, and printed before/after in a report.

## Attribution

Inspired by recurring OSS CI failures around script mode and shebang drift, reframed as a tiny deterministic local utility rather than a general lint suite.
