# Submission

## What did you investigate first, and why?

The investigation started with the README, shared orchestration, public adapter
contracts, and starter tests. Correct repository selection was the first priority:
a report about the wrong repository is misleading even if it looks successful.
The starter report test passed but did not exercise CLI or MCP entry points.

Work began in an earlier template copy and was transferred to this repository
(starter 554b844) after confirming identical starter trees. This was continued
assessment work, not a reset of the focused-work allowance.

## What did you choose to implement or fix?

- Preserve CLI repository arguments containing spaces.
- Map MCP's declared repo_path correctly and remove the handler's any annotation.
- Exercise both real adapters against distinct temporary Git repositories, compare
  their reports, and check invalid paths and optional MCP inputs.
- Integrate Claude-proposed validation/report improvements: retain failed checks
  as results, continue later checks, preserve stdout and stderr, show PASSED/FAILED
  labels, and state explicitly when no validations ran.
- Restrict Vitest discovery to source tests so builds do not duplicate tests.
- Document behavior, trust assumptions, deferred limitations, and the original
  repository's private submission URL.

## What did you intentionally not do?

No broad refactor or new public interface. Claude's proposed MCP extraction and
snake_case optional inputs were not adopted: renaming baseRef and
validationCommands would break existing callers without a migration plan.
Timeouts, command authorization, output bounds, JSON serialization, comprehensive
argument parsing, robust Git filename/rename handling, and package-bin repair
remain deferred. The declared bin path differs from dist/src/cli.js; verification
covers the documented npm/tsx entry points rather than an installed binary.

## Interface decision

- Decision: CLI-first, with a thin supported MCP adapter.
- Primary user and execution environment: developers and coding agents reviewing
  trusted local repositories, with Node.js >=20 and Git available.
- Trust boundary and allowed capabilities: authorized callers can select paths
  accessible to the process and explicitly request shell commands. No sandbox,
  repository allowlist, or command authorization layer is implemented. MCP input
  validation does not make arbitrary shell execution safe.
- Reliability, discoverability, latency/context, and output tradeoffs: CLI is
  reproducible and scriptable; MCP exposes a discoverable schema. Shared logic
  reduces drift. Git blocks synchronously and validations run serially; MCP
  startup adds overhead. Reports are Markdown without application-level size
  bounds, which can consume an AI client's context. stdout and stderr are both
  preserved but concatenation loses original interleaving.
- How supported interfaces remain consistent: both use reviewRepository and the
  same default main...HEAD comparison. CLI writes Markdown; MCP returns it as text.
  Integration tests compare reports and check failed validations through both
  adapters. CLI success means report generation, not all checks passing; a normal
  MCP response may likewise contain FAILED checks. Git errors still fail review.
- Evidence that would change this decision: measured demand for agent-only use,
  structured bounded output, persistent-server latency benefits, or enforceable
  capability restrictions could justify an MCP-first investment.

## How did you use an AI coding agent?

ChatGPT/Codex assisted with planning, investigation, test implementation, fixes,
verification, and this submission draft. Claude-generated files were then supplied
for comparison. Codex reviewed all seven attachments, incorporated validation and
report improvements plus tests, and rejected the incompatible MCP input rename.
No claim is made that Claude executed tests: the observed verification was run by
Codex in the execution environment. The candidate must review the final diff and
this explanation before submitting.

## Where did you check, correct, or reject an AI suggestion? (required)

The AI-assisted comparison identified three concrete corrections:

1. Claude changed optional MCP inputs from baseRef/validationCommands to
   base_ref/validation_commands. The existing public contract was retained instead;
   an actual MCP client test now exercises the original optional field names.
2. Claude's validation comment said process-start failures were left to the caller,
   but its callback converted those errors to failed results too. The comment was
   corrected and a missing-working-directory test verifies the actual behavior.
3. Codex's initial integration tests also ran as compiled copies after a build.
   An explicit source-test include corrected this rather than merely deleting dist.

Candidate review to complete: [Describe which of these you personally checked,
what evidence you read, and whether you agree. Do not claim to have executed a
command yourself if you only reviewed its recorded output.]

## Commands used to verify the result, with outcomes

Execution environment: Linux, Node.js v24.22.1, npm 11.9.0.

- npm install initially failed because the default cache was unavailable.
  Retrying with --cache /workspace/work/npm-cache --no-audit --no-fund succeeded.
- npm ci --cache /workspace/work/npm-cache --no-audit --no-fund succeeded after
  transferring the work to this copy. Dependencies and lockfile were unchanged.
- The three original adapter regressions failed on the starter, then passed after
  the repository-selection fixes. MCP had returned the wrong repository's files.
- npm test -- test/validation.test.ts test/report.test.ts: four Claude-proposed
  checks failed on the merged PR #1 version before implementation; the original
  report test passed. Failures covered nonzero exits, stderr loss, missing status
  labels, and missing no-validation text.
- npm run typecheck && npm run build && npm test && git diff --check:
  passed; 3 test files and 11 tests passed. Tests cover actual CLI/MCP calls,
  continuation after failed commands, both output streams, and launch errors.

No macOS/Windows execution or complete production-readiness claim is made.

## A blocker you hit and how you approached it

The execution environment's default npm cache was unavailable. A workspace-local
cache solved installation without changing dependencies. Build-generated test
copies then exposed a test-discovery issue, resolved with explicit source globs.
The GitHub plugin exposed no repository tools, so authenticated gh access was used.

## Known limitations and the next three things you would do

1. Define execution safety and reliability: command authority, timeouts, process
   cleanup, bounded output, and whether failed validations should change CLI status.
2. Tighten public contracts: reject unsupported formats/options, improve errors,
   repair the compiled bin path, and safely delimit Markdown containing backticks.
3. Define and robustly parse Git changes: missing refs, renames, unusual filenames,
   and whether to include uncommitted/untracked changes (currently excluded).

## Approximate focused-work time

- Start: [YOUR ACTUAL START, including assessment-specific planning]
- Finish: [YOUR ACTUAL FINISH after final review]
- Total focused minutes: [YOUR HONEST TOTAL; maximum 90]
- Breaks, if applicable: [LIST OR WRITE NONE]

Creating a new template copy did not restart the allowance. Candidate timing must
be filled in rather than inferred from commit timestamps or agent runtime.
