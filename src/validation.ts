import { exec } from "node:child_process";
import type { ValidationResult } from "./types.js";

/**
 * Reports callback errors (including non-zero exits and process-start failures)
 * as failed results so subsequent validations can run. Synchronous argument
 * errors still reject the promise. stdout precedes stderr; interleaving is lost.
 */
export function runValidation(command: string, cwd: string): Promise<ValidationResult> {
  return new Promise((resolve) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      const output = [stdout, stderr].filter((part) => part && part.length > 0).join("\n");
      if (error) {
        const reason = typeof error.code === "number" ? `exit code ${error.code}` : error.message;
        resolve({ command, status: "failed", output: `${output}${output ? "\n" : ""}(${reason})` });
        return;
      }
      resolve({ command, status: "passed", output });
    });
  });
}

export async function runValidations(commands: string[], cwd: string): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  for (const command of commands) {
    results.push(await runValidation(command, cwd));
  }
  return results;
}
