const dummyTestScript = `


let completed_steps = []


function successful_step(description) {
    // Logs the successful completion of a test step.
    completed_steps.push(description)
}

import { test, expect } from '@playwright/test';

// E2E: Verify the Git button in the top-right header opens the GitHub repository page
test('Git button in header opens GitHub repository page', async ({ page }) => {
  // Navigate to the UV docs Installation section
  await page.goto('https://docs.astral.sh/uv/#installation');
  await expect(page).toHaveTitle(/uv/i);
  successful_step('Navigate to https://docs.astral.sh/uv/#installation');

  // Locate the GitHub button in the top-right header (scoped to the banner/header)
  const header = page.getByRole('banner');
  const gitButton = header.locator('a.md-source[data-md-component="source"]');
  await expect(gitButton).toBeVisible();
  successful_step('Verify the GitHub button in the top-right header is visible');

  // Verify the GitHub button points to the expected repository URL
  await expect(gitButton).toHaveAttribute('href', 'https://github.com/astral-sh/uv');
  successful_step('Verify the GitHub button href points to https://github.com/astral-sh/uv');

  // Click the GitHub button
  await gitButton.click();
  successful_step('Click the GitHub button in the top-right header');

  // Verify navigation to the GitHub repository page
  await expect(page).toHaveURL(/https:\/\/github\.com\/astral-sh\/uv\/?/);
  successful_step('Verify the page navigates to the GitHub repository URL on github.com/astral-sh/uv');

  // Verify the repository heading is visible on GitHub
  const repoHeading = page.getByRole('heading', { name: 'astral-sh/uv' });
  await expect(repoHeading).toBeVisible();
  successful_step("Verify the 'astral-sh/uv' repository heading is visible on the GitHub page");
});

`

const dummyTestPlan = [
  "Navigate to https://docs.astral.sh/uv/#installation",
  "Verify the GitHub button in the top-right header is visible",
  "Verify the GitHub button href points to https://github.com/astral-sh/uv",
  "Click the GitHub button in the top-right header",
  "Verify the page navigates to the GitHub repository URL on github.com/astral-sh/uv",
  "Verify the 'astral-sh/uv' repository heading is visible on the GitHub page",
]
const dummyTestGenerationResponse = {
  test_plan: dummyTestPlan,
  test_script: dummyTestScript,
  status: "success",
}

export const getDummyTestGenerationResponse = () => {
  return dummyTestGenerationResponse
}
