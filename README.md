# Repository Inspector

This is a small TypeScript developer tool that inspects changes in a Git
repository, runs optional validation commands, and produces a Markdown report.
It can be used from a command line or exposed to AI clients through MCP.

## Your task

Investigate the repository and improve it as you judge best. The starter works
for a narrow happy path, but production use may expose correctness, safety,
reliability, contract, output, documentation, or testing weaknesses.

You are not expected to finish everything. We care about how you investigate,
prioritize, implement, verify, and explain a meaningful scope.

## Product decision

This tool may be used directly by developers and by AI coding agents. Decide
whether its production interface should be **CLI-first**, **MCP-first**, or
**hybrid**. Implement improvements consistent with your decision.

There is no preferred label. Explain:

- The primary user and execution environment you assumed.
- The trust boundary and allowed capabilities.
- Reliability, discoverability, latency/context, and output-size tradeoffs.
- How the interfaces you continue to advertise stay behaviorally consistent.
- What evidence would change your decision.

## Time and rules

- Maximum **90 focused minutes** within 48 hours of receiving the invitation.
- Use AI coding tools freely. Verify their work and document at least one
  suggestion you corrected or rejected.
- Work in your own repository created from this template.
- Commit as you work and complete `SUBMISSION.md` in your final commit.
- Completion is not required. Accurate scope and verification matter more than
  a large diff.

## Setup

```bash
npm install
npm run typecheck
npm test
```

## CLI

```bash
npm run inspector -- review --repo ./path/to/repo --format markdown
npm run inspector -- review --repo ./path/to/repo --validate "npm test"
```

The report is written to `review-report.md`.

## MCP

Start the stdio server with:

```bash
npm run mcp-server
```

It exposes a `review_repository` tool. Inspect the implementation to determine
its current input contract and whether it is suitable for the production model
you propose.

## Project layout

```text
src/core.ts         shared review orchestration
src/cli.ts          command-line adapter
src/mcp-server.ts   MCP adapter
src/git.ts          Git inspection
src/validation.ts   validation execution
src/report.ts       Markdown report generation
test/               public starter tests
```

When finished, submit via **Security → Report a vulnerability** on the [original assessment repository](https://github.com/JavadManashti/ai-repo-inspector/security/advisories/new) — see `SECURITY.md` for exactly what to include. Do not reply by email;
that submission channel is not monitored.

## Implementation scope and supported use

This iteration is **CLI-first** for developers and coding agents inspecting
trusted local Git repositories. MCP remains a thin adapter to the same core.
Both adapters now preserve the caller's repository selection; integration tests
invoke the CLI and the real stdio MCP tool from a different Git repository.

Quote CLI paths containing spaces:

```bash
npm run inspector -- review --repo "./my project" --format markdown
```

The MCP tool accepts `repo_path` (required string), `baseRef` (optional string),
and `validationCommands` (optional array of strings). Example arguments:

```json
{"repo_path": "/work/my project", "baseRef": "main"}
```

Paths are resolved on the machine running the inspector, relative to its working
directory when not absolute. CLI writes `review-report.md` in its working
directory; MCP returns the same Markdown as text content. Git inspection compares
committed changes using `baseRef...HEAD` (default `main`); it does not include
uncommitted or untracked files. An empty report on `main` can be expected.

Validation commands run through a shell with the inspector process's permissions.
Only authorized callers and trusted repository commands are supported: this tool
is not a sandbox, has no repository allowlist, and has no explicit command timeout.
Do not expose this MCP server to untrusted callers. JSON output is not implemented,
even though the existing argument/type accepts it. Validation failure reporting,
output bounds, and robust Git filename/rename handling remain deferred.

Verification requires Git on PATH and Node.js >=20. Run:

```bash
npm run typecheck
npm run build
npm test
```

Vitest is restricted to `test/**/*.test.ts`, so building before testing does not
rerun compiled copies from `dist`. The adapter tests use temporary repositories
and shut down the MCP subprocesses after each call sequence.
