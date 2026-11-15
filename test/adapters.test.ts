import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const project = dirname(dirname(fileURLToPath(import.meta.url)));
const tsx = join(project, "node_modules/tsx/dist/cli.mjs");
let root: string;
let target: string;
let other: string;

function fixture(name: string, filename: string): string {
  const path = join(root, name);
  mkdirSync(path);
  const git = (...args: string[]) => execFileSync("git", args, { cwd: path, stdio: "pipe" });
  git("init", "-b", "main");
  git("config", "user.name", "Test Fixture");
  git("config", "user.email", "fixture@example.invalid");
  git("-c", "commit.gpgsign=false", "commit", "--allow-empty", "-m", "baseline");
  git("checkout", "-b", "changes");
  writeFileSync(join(path, filename), "fixture\n");
  git("add", "--", filename);
  git("-c", "commit.gpgsign=false", "commit", "-m", "add fixture");
  return path;
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "inspector-adapters-"));
  target = fixture("requested repo", "requested-only.txt");
  other = fixture("server-repo", "wrong-repository.txt");
});

afterEach(() => rmSync(root, { recursive: true, force: true }));

function runCli(path: string) {
  return spawnSync(process.execPath, [tsx, join(project, "src/cli.ts"),
    "review", "--repo", path, "--format", "markdown"], {
    cwd: other, encoding: "utf8", timeout: 10_000,
  });
}

async function withClient(run: (client: Client) => Promise<void>) {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [tsx, join(project, "src/mcp-server.ts")],
    cwd: other,
    stderr: "pipe",
  });
  const client = new Client({ name: "adapter-test", version: "1.0.0" });
  try {
    await client.connect(transport);
    await run(client);
  } finally {
    await client.close();
    await transport.close();
  }
}

function expectRequestedReport(report: string) {
  expect(report).toContain(`# Review Report: ${target}`);
  expect(report).toContain("requested-only.txt (added)");
  expect(report).not.toContain("wrong-repository.txt");
}

describe("repository selection through public adapters", () => {
  it("CLI preserves spaces and inspects the requested repository", () => {
    const result = runCli(target);
    expect(result.status, result.stderr).toBe(0);
    expectRequestedReport(readFileSync(join(other, "review-report.md"), "utf8"));
  });

  it("MCP uses its declared repo_path and agrees with the CLI", async () => {
    await withClient(async (client) => {
      const listing = await client.listTools();
      expect(listing.tools.find(tool => tool.name === "review_repository")
        ?.inputSchema.required).toContain("repo_path");
      const result = await client.callTool({
        name: "review_repository", arguments: { repo_path: target },
      });
      expect(result.isError).not.toBe(true);
      const content = result.content as Array<{ type: string; text?: string }>;
      const report = content.filter(item => item.type === "text").map(item => item.text).join("\n");
      expectRequestedReport(report);
      expect(runCli(target).status).toBe(0);
      expect(report).toBe(readFileSync(join(other, "review-report.md"), "utf8"));
    });
  }, 15_000);

  it("MCP reports an invalid requested path instead of inspecting its cwd", async () => {
    await withClient(async (client) => {
      const result = await client.callTool({
        name: "review_repository", arguments: { repo_path: join(root, "missing") },
      });
      expect(result.isError).toBe(true);
      expect(JSON.stringify(result.content)).not.toContain("wrong-repository.txt");
    });
  }, 15_000);
});
