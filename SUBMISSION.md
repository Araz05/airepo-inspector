# Submission

## What did you investigate first, and why?
I cloned the repo into my local so I can play on it. And I saw 15 vulnerabilities which I saw their available fixes, too via Commands such as `npm audit fix` and so on.
Then I tried to investigate to create same setup to have for agents: Identical environments for codex and claude code. Because it is crucial to have them identically to be able to compare them according to the metrics properly.

The investigation continued with the README, shared orchestration, public adapter
contracts, and starter tests. Correct repository selection was the first priority:
a report about the wrong repository is misleading even if it looks successful.
The starter report test passed but did not exercise CLI or MCP entry points.


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

- **Decision:** Hybrid, supporting both CLI and MCP through shared review logic.

- **Primary user and execution environment:** Developers using the CLI and AI clients using MCP to review trusted local repositories, with Node.js >=20 and Git available on the machine running the inspector.

- **Trust boundary and allowed capabilities:** Both interfaces operate with the inspector process's permissions. Authorized callers can select accessible repository paths and explicitly request shell commands. No sandbox, repository allowlist, or command authorization layer is implemented. MCP input validation does not make arbitrary shell execution safe.

- **Reliability, discoverability, latency/context, and output tradeoffs:** CLI supports direct execution and scripting; MCP provides a discoverable tool schema for AI clients. Shared logic reduces behavioral differences, but supporting both interfaces requires adapter-specific tests and documentation. Git operations block synchronously, and validations run sequentially. MCP adds process-startup overhead, although an established connection can serve repeated requests. Reports are Markdown without application-level size bounds, which can consume an AI client's context. Both stdout and stderr are retained, but concatenation loses their original interleaving.

- **How supported interfaces remain consistent:** Both call `reviewRepository` and default to comparing `main...HEAD`. CLI writes the Markdown report to a file; MCP returns it as text. Integration tests compare report contents and verify failed validations through both adapters. CLI success means report generation, not that every check passed; a successful MCP response can likewise contain `FAILED` checks. Git inspection errors fail the overall review. These checks establish consistency for the tested behavior, not complete parity across every option and error.

- **Evidence that would change this decision:** Usage concentrated in terminal workflows could justify prioritizing CLI. Predominantly AI-client usage, demand for structured and bounded tool responses, or measured benefits from persistent MCP connections could justify MCP-first. If maintaining both interfaces costs more than their demonstrated value, I would narrow the supported interface scope.

## How did you use an AI coding agent?

ChatGPT/Codex assisted with investigation, test implementation, fixes,
verification. Claude-generated files were supplied
for comparison. Codex reviewed all seven attachments, incorporated validation and
report improvements plus tests, and rejected the incompatible MCP input rename.


## Where did you check, correct, or reject an AI suggestion? (required)

I used Codex and Claude to compare approaches. Their suggestions were checked against the existing interface and actual test results, rather than accepted automatically. The comparison led to three corrections:

1. **Preserving the existing MCP interface.** Claude proposed renaming `baseRef` and `validationCommands` to `base_ref` and `validation_commands`. That would change the public interface and could break existing callers. The original names were retained, and an MCP integration test now checks that they still work.

2. **Making the explanation match the implementation.** Claude's comment said process-start failures would be passed back to the caller, but the implementation recorded callback-reported failures as failed validation results. Codex corrected the comment and added a test using a nonexistent working directory to verify that behavior.

3. **Correcting the test setup.** Codex's initial setup also discovered compiled tests in `dist` after a build, causing duplicate execution and path-resolution failures. Test discovery was restricted to `test/**/*.test.ts`, and the build-then-test sequence was rerun successfully.

These examples showed why comparing AI answers was useful, but also why agreement between models would not have been enough: the existing contract and executable tests provided the evidence.

## Commands used to verify the result, with outcomes

Codex ran the following checks in its Linux execution environment. These results describe that environment; they do not establish that the project was tested on every supported operating system.

- **Dependency installation:** The initial `npm install` failed because the environment's default npm cache was unavailable. Installation succeeded with a workspace-local cache:
  `npm install --cache /workspace/work/npm-cache --no-audit --no-fund`.
  A subsequent `npm ci` using the same cache also succeeded. Dependency versions and the committed lockfile were unchanged. The `--no-audit` option skipped the installation-time audit; it was not a security verification.

- **Repository-selection regressions:** All three new adapter tests failed against the starter implementation and passed after the fixes. They exposed the CLI's handling of paths containing spaces and MCP's use of the wrong repository.

- **Validation and report regressions:** Running `npm test -- test/validation.test.ts test/report.test.ts` before the second set of fixes produced four failures, while the original report test passed. The failures confirmed problems with nonzero command exits, missing stderr, missing status labels, and missing no-validation messaging.

- **Final verification:** `npm run typecheck && npm run build && npm test && git diff --check` passed. The test suite contained **11 passing tests across 3 files**, covering CLI and MCP calls, failed validations, continuation to later checks, preservation of both output streams, and process-start failures.

- **Separate dependency audit:** A later `npm audit` reported **15 findings: 6 moderate, 8 high, and 1 critical**. Excluding development dependencies reported 9 findings. These remain unresolved; passing the functional checks does not mean the dependencies are free of known vulnerabilities.
  
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

- Start: 23.30
- Finish: 00.42
- Total focused minutes: 72
