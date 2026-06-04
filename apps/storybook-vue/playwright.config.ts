import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./tests",
  timeout: 45_000,
  fullyParallel: true,
  workers: 4,
  retries: 0,
  use: {
    baseURL: "http://localhost:6006",
    headless: true,
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
})
