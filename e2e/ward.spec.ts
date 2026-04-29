import { test, expect } from "@playwright/test";

test.describe("Screen 4: My Ward", () => {
  test.use({ storageState: "e2e/fixtures/auth.json" });

  test("navigate from Home to Ward and verify sections", async ({ page }) => {
    // Start at home
    await page.goto("/home");

    // Click on My Ward in Quick Actions
    await page.click("text=My Ward");

    // Ensure we are on /ward
    await expect(page).toHaveURL(/.*\/ward/);

    // Verify Constituency Header
    await expect(page.getByRole("heading", { name: "My Ward" })).toBeVisible();
    await expect(page.locator("header")).toContainText("New Delhi PC-01");

    // Verify Election Type Toggle exists and Lok Sabha is selected
    const lokSabhaToggle = page.getByRole("radio", { name: "Lok Sabha" });
    await expect(lokSabhaToggle).toHaveAttribute("aria-pressed", "true");

    // Verify Chart View Toggle
    await expect(
      page.getByRole("radio", { name: "Vote Share %" }),
    ).toBeVisible();
    await expect(page.getByRole("radio", { name: "Seats Won" })).toBeVisible();

    // Verify Chart Source Badge
    await expect(
      page.getByText(/Source: Lok Dhaba, Trivedi Centre/i),
    ).toBeVisible();

    // Verify Candidates
    await expect(
      page.getByRole("heading", { name: "Candidates" }),
    ).toBeVisible();
    // If MSW/Emulator has candidates, we should see AI badge
    // Because Playwright E2E hits the real emulator if VITE_USE_EMULATORS=true,
    // or the prod backend. We'll just verify the heading for now.

    // Toggle Election Type
    const vidhanSabhaToggle = page.getByRole("radio", { name: "Vidhan Sabha" });
    await vidhanSabhaToggle.click();
    await expect(vidhanSabhaToggle).toHaveAttribute("aria-pressed", "true");
    await expect(lokSabhaToggle).toHaveAttribute("aria-pressed", "false");
  });
});
