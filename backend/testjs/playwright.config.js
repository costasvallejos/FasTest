import { defineConfig } from "@playwright/test"

export default defineConfig({
  use: {
    viewport: { width: 1200, height: 1000 },
    // headless: false,
    // launchOptions: {
    //   slowMo: 100, // 👈 slows every action by 250 ms
    // },
  },
})
