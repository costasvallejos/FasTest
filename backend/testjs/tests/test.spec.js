import { test, expect } from "@playwright/test"

test("Pressing the git button in the top right opens the GitHub page", async ({
  page,
}) => {
  // 1. Navigate to the uv documentation page at the installation section
  await page.goto("https://docs.astral.sh/uv/#installation")

  // 2. Wait for the site header (role=banner) to be visible
  const banner = page.getByRole("banner")
  await expect(banner).toBeVisible()

  // 3. Locate the top-right GitHub button in the header by its stable href
  const gitHubHeaderLink = banner
    .locator('a[href="https://github.com/astral-sh/uv"]')
    .first()
  await expect(gitHubHeaderLink).toBeVisible()
  await expect(gitHubHeaderLink).toHaveAttribute(
    "href",
    "https://github.com/astral-sh/uv"
  )

  // 4. Determine if the link opens in a new tab or the same tab
  const target = await gitHubHeaderLink.getAttribute("target")

  if (target === "_blank") {
    // Opens in a new tab/window: handle popup
    const [popup] = await Promise.all([
      page.waitForEvent("popup"),
      gitHubHeaderLink.click(),
    ])

    await popup.waitForLoadState("domcontentloaded")
    await expect(popup).toHaveURL(/github\.com\/astral-sh\/uv/)
    await expect(
      popup.getByRole("heading", { level: 1, name: "astral-sh/uv" })
    ).toBeVisible()
  } else {
    // Opens in the same tab: wait for navigation and verify
    await Promise.all([
      page.waitForURL(/github\.com\/astral-sh\/uv/),
      gitHubHeaderLink.click(),
    ])

    await expect(page).toHaveURL(/github\.com\/astral-sh\/uv/)
    await expect(
      page.getByRole("heading", { level: 1, name: "astral-sh/uv" })
    ).toBeVisible()
  }
})
