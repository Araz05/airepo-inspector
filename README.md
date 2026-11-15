# Repository Inspector

A small TypeScript tool that inspects the committed changes in a Git repository,
optionally runs validation commands inside it, and produces a Markdown report.
It has two interfaces over one shared core: a command-line interface for
developers and a stdio MCP server for AI coding agents.

This repository is my submission for the AI-First Engineering Intern assessment.
The original brief is kept at the bottom of this file; my decisions and
reasoning are in [`SUBMISSION.md`](./SUBMISSION.md).

## Interface decision: hybrid

The tool is **hybrid**. Developers call the CLI; AI clients call the MCP tool.
Both are thin adapters over the same `reviewRepository` function in
`src/core.ts`, both default to comparing `main...HEAD`, and integration tests
invoke the real CLI and the real stdio MCP server against the same temporary
repository and compare their reports. The full reasoning, including the trust
boundary and the evidence that would change the decision, is in
`SUBMISSION.md`.

## Setup

Requires Node.js 20 or later and Git on `PATH`.

```bash
npm install
npm run typecheck
npm run build
npm test
```

Vitest is restricted to `test/**/*.test.ts`, so building before testing does not
re-run the compiled copies in `dist/`.

## CLI

```bash
npm run inspector -- review --repo ./path/to/repo
npm run inspector -- review --repo ./path/to/repo --base-ref develop
npm run inspector -- review --repo ./path/to/repo --validate "npm test" --validate "npm run lint"
npm run inspector -- review --repo "./my project"
```

| Option | Meaning |
| --- | --- |
| `--repo <path>` | Repository to inspect. Required. Paths with spaces are preserved; quote them. |
| `--base-ref <ref>` | Git ref to diff against. Default `main`. |
| `--validate <command>` | A command to run inside the repository. Repeat the flag for several commands. |
| `--format <markdown\|json>` | Accepted for compatibility. Only Markdown is produced; JSON is not implemented yet. |

The report is written to `review-report.md` in the directory you run the
command from. **Exit code 0 means the report was generated**, not that every
validation passed; read the `PASSED` / `FAILED` labels in the report.

## MCP

Start the stdio server with:

```bash
npm run mcp-server
```

It exposes one tool, `review_repository`:

| Field | Type | Meaning |
| --- | --- | --- |
| `repo_path` | string, required | Repository to inspect. The handler reads this exact field name. |
| `baseRef` | string, optional | Git ref to diff against. Default `main`. |
| `validationCommands` | string[], optional | Commands to run inside the repository. |

Example arguments:

```json
{ "repo_path": "/work/my project", "baseRef": "main", "validationCommands": ["npm test"] }
```

The tool returns the same Markdown report as the CLI, as text content. A
successful tool response can contain `FAILED` validation results. An invalid
`repo_path` is reported as an error instead of silently inspecting the server's
own working directory.

The optional field names are intentionally unchanged from the starter
(`baseRef`, `validationCommands`) so that existing callers keep working. See
`SUBMISSION.md` for why a rename to snake_case was considered and rejected.

## Behaviour

- **Changed files** come from `git diff --name-status <base>...HEAD`, so only
  committed changes are listed. Uncommitted and untracked files are excluded,
  and a report run on `main` itself is expected to be empty.
- **Validation commands** run sequentially inside the repository, through a
  shell, with the inspector process's permissions. A non-zero exit code is
  recorded as a `FAILED` result with its output, and later commands still run.
  Both stdout and stderr are kept, concatenated in that order.
- **Git inspection failures** (not a Git repository, missing base ref) still
  fail the whole review with Git's error message.

## Trust boundary

This tool is **not a sandbox**. Validation commands are arbitrary shell
commands. There is no repository allow-list, no command authorisation, no
timeout and no output size limit. Use it only on trusted repositories, and do
not expose the MCP server to untrusted callers. Making command execution safe
for untrusted input is the first item in the "next things" list in
`SUBMISSION.md`.

## Known limitations

- JSON output is accepted on the CLI but not produced.
- No timeout or output cap on validation commands; a hanging or chatty command
  blocks the review or floods an AI client's context.
- Git renames and copies (`R`, `C` status codes) are not parsed into separate
  old/new paths.
- Markdown fences in the report are not escaped; validation output containing
  ``` breaks the report layout.
- `package.json` declares `bin: ./dist/cli.js`, but the build emits
  `dist/src/cli.js`; use the documented `npm run` entry points.
- `npm audit` reports unresolved findings in dependencies.

## Project layout

```text
src/core.ts            shared review orchestration
src/cli.ts             command-line adapter
src/mcp-server.ts      MCP adapter (stdio)
src/git.ts             Git inspection
src/validation.ts      validation execution
src/report.ts          Markdown report generation
src/types.ts           shared types
test/adapters.test.ts  CLI and MCP integration tests on temporary repositories
test/validation.test.ts
test/report.test.ts
vitest.config.ts       restricts test discovery to test/
```

## Submitting

Submit via **Security → Report a vulnerability** on the
[original assessment repository](https://github.com/JavadManashti/ai-repo-inspector/security/advisories/new),
not on this copy. See `SECURITY.md` for the exact format.

---

## Original assessment brief

<details>
<summary>Expand</summary>

### Your task

Investigate the repository and improve it as you judge best. The starter works
for a narrow happy path, but production use may expose correctness, safety,
reliability, contract, output, documentation, or testing weaknesses.

You are not expected to finish everything. We care about how you investigate,
prioritize, implement, verify, and explain a meaningful scope.

### Product decision

This tool may be used directly by developers and by AI coding agents. Decide
whether its production interface should be **CLI-first**, **MCP-first**, or
**hybrid**. Implement improvements consistent with your decision.

There is no preferred label. Explain:

- The primary user and execution environment you assumed.
- The trust boundary and allowed capabilities.
- Reliability, discoverability, latency/context, and output-size tradeoffs.
- How the interfaces you continue to advertise stay behaviorally consistent.
- What evidence would change your decision.

### Time and rules

- Maximum **90 focused minutes** within 48 hours of receiving the invitation.
- Use AI coding tools freely. Verify their work and document at least one
  suggestion you corrected or rejected.
- Work in your own repository created from this template.
- Commit as you work and complete `SUBMISSION.md` in your final commit.
- Completion is not required. Accurate scope and verification matter more than
  a large diff.

</details>
