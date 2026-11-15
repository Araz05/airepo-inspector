import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // tsc also emits tests into dist; run only the source suite.
    include: ["test/**/*.test.ts"],
  },
});
