import { describe, expect, it } from "vitest";
import { markdownReport } from "../src/report.js";

describe("markdownReport", () => {
  it("lists changed files and validation output", () => {
    const report = markdownReport({
      repositoryPath: "/work/sample",
      changedFiles: [{ path: "src/index.ts", status: "modified" }],
      validationResults: [{ command: "npm test", status: "passed", output: "ok" }],
    });

    expect(report).toContain("src/index.ts (modified)");
    expect(report).toContain("npm test");
    expect(report).toContain("ok");
  });

  it("labels each validation result with its status", () => {
    const report = markdownReport({
      repositoryPath: "/work/sample",
      changedFiles: [],
      validationResults: [
        { command: "npm test", status: "passed", output: "ok" },
        { command: "npm run lint", status: "failed", output: "2 errors" },
      ],
    });

    expect(report).toContain("### npm test — PASSED");
    expect(report).toContain("### npm run lint — FAILED");
  });

  it("says so when no validation commands were run", () => {
    const report = markdownReport({ repositoryPath: "/work/sample", changedFiles: [], validationResults: [] });
    expect(report).toContain("No validation commands were run");
  });
});