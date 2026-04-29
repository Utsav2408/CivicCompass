import { test, expect } from "@playwright/test";

test.describe("HomePage E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication state or navigate to home (which redirects to login if unauth)
    // For this test, let's assume we can bypass or have a test user.
    // In a real scenario, we'd perform login steps here.
    await page.goto("/home");
  });

  test("renders key dashboard elements", async ({ page }) => {
    // Check TopBar
    await expect(page.locator("header")).toBeVisible();
    
    // Check ElectionStatusCard (if schedule is seeded in emulator)
    // We expect the countdown to be visible eventually
    // For now, let's just assert the container is there if data loads
    await expect(page.locator("main")).toBeVisible();
  });

  test("language switch works", async ({ page }) => {
    const langToggle = page.getByLabel("language toggle");
    await expect(langToggle).toBeVisible();

    // Switch to Hindi
    await langToggle.click();
    await expect(page.getByText("त्वरित विकल्प")).toBeVisible(); // "Quick Actions" in Hindi

    // Switch back to English
    await langToggle.click();
    await expect(page.getByText("Quick Actions")).toBeVisible();
  });

  test("quick actions navigation", async ({ page }) => {
    const actions = ["Election Process", "My Ward", "Find Polling Booth", "Report an Issue"];
    
    for (const action of actions) {
      const card = page.getByText(action);
      await expect(card).toBeVisible();
    }
    
    // Test one navigation
    await page.getByText("Find Polling Booth").click();
    await expect(page).toHaveURL(/\/map/);
  });
});
