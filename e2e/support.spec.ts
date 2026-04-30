import { test, expect } from "@playwright/test";

test.describe("Support & Emergency E2E Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Mock Support Agent Cloud Function
    await page.route("**/supportAgent", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ text: "I can help you with that. Would you like to create a ticket?" }),
      });
    });

    // Mock Firestore data if needed via page.route or by seeding emulator
    // For E2E, we assume the emulator is running and seeded with necessary data (like police stations)
  });

  test("Ticket creation journey (chat -> describe -> confirm -> raise)", async ({ page }) => {
    await page.goto("/support");

    // 1. Help Chat Tab
    await expect(page.getByText("Help Chat")).toBeVisible();
    
    const chatInput = page.getByPlaceholder("Type your issue here...");
    await chatInput.fill("I have a problem with my voter ID");
    await page.keyboard.press("Enter");

    // Wait for AI response
    await expect(page.getByText("I can help you with that")).toBeVisible();

    // 2. Open Ticket Drawer (assuming there's a button or triggered by AI)
    // For this test, we'll use the 'New Ticket' button in the My Tickets tab
    await page.getByText("My Tickets").click();
    await page.getByRole("button", { name: "+ New Ticket" }).click();

    // Step 1: Describe
    await page.getByLabel("What's the issue?").fill("Voter ID card is damaged");
    await page.getByRole("button", { name: "Next" }).click();

    // Step 2: Media (Skip/Next)
    await expect(page.getByText("Add Photo/Video")).toBeVisible();
    await page.getByRole("button", { name: "Next" }).click();

    // Step 3: Confirm
    await expect(page.getByText("Confirm Details")).toBeVisible();
    await page.getByRole("button", { name: "Raise Ticket" }).click();

    // Verify completion
    await expect(page.getByText("Voter ID card is damaged")).toBeVisible();
  });

  test("Emergency SOS flow (tap -> overlay -> station -> cancel)", async ({ page }) => {
    await page.goto("/home");

    // 1. Tap SOS Button
    const sosButton = page.locator("#sos-button");
    await expect(sosButton).toBeVisible();
    await sosButton.click();

    // 2. Verify Overlay
    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page.getByText("Alerting Authorities...")).toBeVisible();

    // 3. Wait for 'Alerted' state (mocked 2s timer)
    await expect(page.getByText("Police Alerted")).toBeVisible({ timeout: 5000 });
    
    // Check for station name and ETA
    await expect(page.getByText("Assistance arriving in")).toBeVisible();

    // 4. Cancel SOS
    await page.getByLabel("Cancel emergency alert").click();
    await expect(page.getByRole("alert")).not.toBeVisible();
    expect(page.url()).toContain("/home");
  });
});
