import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
  test: {
    globals: true,
    include: ["test/**/*.spec.ts"],
    environment: "node",
    environmentMatchGlobs: [["test/nuxt/**/*.spec.ts", "nuxt"]],
    hookTimeout: 600_000,
  },
});
