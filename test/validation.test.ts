import { describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runValidations } from "../src/validation.js";

describe("runValidations", () => {
  it("reports a process-start failure as a failed result", async () => {
    const root = mkdtempSync(join(tmpdir(), "validation-cwd-"));
    try {
      const results = await runValidations(["echo unused"], join(root, "missing"));
      expect(results[0]?.status).toBe("failed");
      expect(results[0]?.output).toContain("ENOENT");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("reports a failing command instead of throwing, and keeps going", async () => {
    const results = await runValidations(["exit 3", "echo after"], process.cwd());

    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({ command: "exit 3", status: "failed" });
    expect(results[0]?.output).toContain("exit code 3");
    expect(results[1]).toMatchObject({ command: "echo after", status: "passed" });
    expect(results[1]?.output).toContain("after");
  });

  it("keeps both stdout and stderr", async () => {
    const [result] = await runValidations([`"${process.execPath}" -e "console.log('out'); console.error('err')"`], process.cwd());

    expect(result?.status).toBe("passed");
    expect(result?.output).toContain("out");
    expect(result?.output).toContain("err");
  });
});
