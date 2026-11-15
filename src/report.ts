import type { ChangedFile, ValidationResult } from "./types.js";

type ReportInput = {
  repositoryPath: string;
  changedFiles: ChangedFile[];
  validationResults: ValidationResult[];
};

export function markdownReport(input: ReportInput): string {
  const lines = [`# Review Report: ${input.repositoryPath}`, "", "## Changed files"];
  for (const file of input.changedFiles) {
    lines.push(`- ${file.path} (${file.status})`);
  }
  lines.push("", "## Validation output");
  if (input.validationResults.length === 0) {
    lines.push("_No validation commands were run._");
  }
  for (const result of input.validationResults) {
    const label = result.status === "passed" ? "PASSED" : "FAILED";
    lines.push(`### ${result.command} — ${label}`, "```", result.output, "```");
  }
  return lines.join("\n");
}