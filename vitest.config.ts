import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
  test: {
    globals: true,
    include: ["test/**/*.spec.ts"],
    environment: "node",
    hookTimeout: 600_000,
  },
});
