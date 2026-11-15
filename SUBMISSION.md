# Submission

Draft for candidate review before final submission. Candidate-specific timing
and the candidate's review of the AI correction below remain to be completed.

## What did you investigate first, and why?

Codex read the assessment brief, interface contracts, shared core, and tests at
initial commit e24c262 in the earlier template copy. The verified work was
then transferred to Araz05/airepo-inspector (starter commit 554b844), whose
starter tree was confirmed identical. This was a continuation of the same
assessment work, not a new time allowance. Repository selection was prioritized because inspecting
the wrong repository undermines every subsequent finding. The starter report
test passed but did not exercise either entry point.

## What did you choose to implement or fix?

- CLI now preserves the complete --repo argument, including spaces.
- MCP forwards its declared repo_path field instead of reading nonexistent
  repoPath. Removing the handler's any annotation restores schema-based typing.
- Three integration tests create two temporary Git repositories with different
  committed changes. They execute the CLI and actual stdio MCP calls, prove the
  requested repository is used, compare report contents across adapters, and
  verify an invalid MCP path yields an error rather than falling back to cwd.
- Vitest explicitly discovers source tests only, avoiding compiled duplicates.
- README documents scope, trust assumptions, and limitations. Submission links
  now point to the original assessment repository rather than this template copy.

## What did you intentionally not do?

No broad rewrite or additional interface features. Validation failure reporting,
command timeouts, output limits, JSON serialization, comprehensive CLI argument
validation, Git filename/rename parsing, and packaging remain out of scope.
The existing bin path also differs from tsc's dist/src/cli.js output; documented
npm/tsx entry points are the ones exercised here.

## Interface decision

- Decision: CLI-first, with a supported thin MCP adapter for the documented scope.
- Primary user and execution environment: developers and coding agents with
  command execution in a trusted local checkout; Node.js >=20 and Git available.
- Trust boundary and allowed capabilities: callers may select filesystem paths
  accessible to the process and explicitly request shell validation commands.
  This is trusted local execution, not a sandbox or permission boundary. MCP
  schema validation does not make arbitrary commands safe. Git subprocesses use
  argument arrays, while validation intentionally uses a shell.
- Reliability, discoverability, latency/context, and output tradeoffs: CLI is
  easy to reproduce and script; MCP exposes a discoverable schema. Shared logic
  limits drift, but synchronous Git blocks the server and validations are serial.
  MCP process startup adds overhead. Both currently emit Markdown without an
  application-level size bound; large reports cost client context. A CLI file
  avoids mandatory inline consumption but requires a client to read it.
- How supported interfaces remain consistent: both call reviewRepository, use
  the same base-reference default, and produce matching Markdown for identical
  supported requests. CLI saves a file; MCP returns text. An integration test
  compares their report contents. This does not claim full error/option parity.
- Evidence that would change this decision: measured demand for agent-only use,
  structured bounded results, persistent-server latency benefits, or a genuine
  capability-restriction requirement would justify investing in MCP-first use.

## How did you use an AI coding agent?

ChatGPT/Codex provided assessment planning. Codex then cloned the public copy,
inspected the source, wrote regression tests, implemented fixes, ran commands,
and drafted documentation. The candidate requested Claude Code as an independent
reviewer, but no Claude review has been performed or verified in this session.
This draft does not attribute agent execution or review to the candidate.

## Where did you check, correct, or reject an AI suggestion? (required)

Observed AI correction: Codex initially added integration tests without restricting
Vitest discovery. Running tests after a build also collected dist/test copies;
those tests incorrectly resolved dist/node_modules/tsx and failed. Codex corrected
this with an explicit test/**/*.test.ts include and reran typecheck, build, and
all tests successfully. Deleting dist alone would only hide the recurring issue.

Candidate action before submission: review this correction and record your own
assessment of it, or replace this paragraph with another genuine AI suggestion
you checked, corrected, or rejected. Do not claim a personal review not performed.

## Commands used to verify the result, with outcomes

Environment: Node.js v24.22.1, npm 11.9.0, Linux.

- npm install: initially failed because the default npm cache was unavailable.
- npm install --cache /workspace/work/npm-cache --no-audit --no-fund: succeeded.
  Incidental lockfile metadata changes were reverted; dependency versions were
  not changed. The cache path is specific to this execution workspace.
- npm ci --cache /workspace/work/npm-cache --no-audit --no-fund: used to
  reinstall the unchanged lockfile in the new repository before verification.
- npm run typecheck: passed before and after the production fixes.
- npm test -- test/report.test.ts: starter test passed before the fixes.
- npm run build: passed before and after the production fixes.
- npm test -- test/adapters.test.ts: all three new tests failed before fixes.
  CLI errored on the truncated path; MCP returned wrong-repository.txt from its
  working directory, including when the requested path did not exist.
- npm run typecheck && npm run build && npm test && git diff --check:
  passed after fixes and test discovery correction; 2 test files, 4 tests passed.

Tests exercise source entry points through tsx, not the installed package binary.
No claims of macOS/Windows execution, command sandboxing, or complete production
readiness are made.

## A blocker you hit and how you approached it

The default npm cache location was unavailable in the execution environment.
Using a workspace-local cache enabled installation without changing dependencies.
Build-generated duplicate test discovery was investigated and corrected as above.
The tagged GitHub plugin exposed no tools; authenticated gh access was available
and used instead for repository operations.

## Known limitations and the next three things you would do

1. Define validation execution policy: failure results, stdout/stderr preservation,
   timeout/process cleanup, bounded output, and explicit capability restrictions.
2. Tighten public contracts: CLI missing/unknown options, unsupported JSON format,
   actionable errors, output location, and built package entry point.
3. Define Git change semantics and parse robustly: missing refs, renames, unusual
   filenames, and whether working-tree/untracked changes should be included.

## Approximate focused-work time

- Start: candidate to record actual assessment start, including focused planning.
- Finish: candidate to record after review and final submission preparation.
- Agent implementation session: began approximately 2026-11-15 23:11 Asia/Baku.
- Total focused minutes: candidate to complete; the 90-minute allowance is not
  assumed to restart on cloning. The invitation deadline was not independently
  verified; the candidate reported approximately 12 hours remaining.
