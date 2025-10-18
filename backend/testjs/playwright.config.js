import { defineConfig } from "@playwright/test"

export default defineConfig({
  use: {
    headless: false,
    launchOptions: {
      slowMo: 100, // 👈 slows every action by 250 ms
    },
  },
})
