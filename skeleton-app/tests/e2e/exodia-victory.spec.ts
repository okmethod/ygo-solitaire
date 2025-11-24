/**
 * E2E Test: Exodia Victory Condition
 *
 * Tests the complete flow of achieving Exodia victory through the UI:
 * 1. Initialize game with Exodia deck
 * 2. Draw cards through UI
 * 3. Verify victory detection when all 5 pieces are in hand
 */

import { test, expect } from "@playwright/test";

test.describe("Exodia Victory Flow", () => {
  test("should detect victory when drawing all 5 Exodia pieces", async ({ page }) => {
    // Navigate to simulator with a test deck ID
    await page.goto("/simulator-v2/test-deck");

    // Wait for page to load
    await expect(page.locator("h1")).toContainText("New Architecture Simulator");

    // Verify initial state
    await expect(page.getByText("Turn:")).toBeVisible();
    await expect(page.getByText("Phase:")).toBeVisible();

    // Check initial Exodia piece count
    const exodiaPieceText = page.locator("text=/Exodia Pieces:/");
    await expect(exodiaPieceText).toBeVisible();
    await expect(page.locator("text=/0 \\/ 5/")).toBeVisible();

    // Draw 5 cards (assuming Exodia pieces are in deck)
    for (let i = 1; i <= 5; i++) {
      // Click Draw Card button
      await page.getByRole("button", { name: "Draw Card" }).click();

      // Wait for toast notification
      await expect(page.locator(".toaster")).toBeVisible();

      // Verify hand count increases
      const handCountText = `Hand: ${i} cards`;
      await expect(page.getByText(handCountText)).toBeVisible();
    }

    // Verify Exodia piece count is 5/5
    await expect(page.locator("text=/5 \\/ 5/")).toBeVisible();

    // Verify game over state
    await expect(page.locator("h2:has-text('Game Over!')")).toBeVisible();

    // Verify victory message
    await expect(page.locator("text=/Winner: You/")).toBeVisible();
    await expect(page.locator("text=/Reason: exodia/")).toBeVisible();

    // Verify action buttons are disabled
    await expect(page.getByRole("button", { name: "Draw Card" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Advance Phase" })).toBeDisabled();
  });

  test("should show Exodia piece count progression", async ({ page }) => {
    await page.goto("/simulator-v2/test-deck");

    // Draw cards one by one and check progression
    for (let i = 1; i <= 3; i++) {
      await page.getByRole("button", { name: "Draw Card" }).click();
      await page.waitForTimeout(500); // Wait for state update

      // Check that Exodia piece count is displayed
      const exodiaCount = page.locator('span:has-text("/ 5")');
      await expect(exodiaCount).toBeVisible();
    }

    // Verify we haven't won yet (less than 5 pieces)
    await expect(page.locator("h2:has-text('Game Over!')")).not.toBeVisible();
  });

  test("should display game result with message", async ({ page }) => {
    await page.goto("/simulator-v2/test-deck");

    // Draw all 5 Exodia pieces
    for (let i = 0; i < 5; i++) {
      await page.getByRole("button", { name: "Draw Card" }).click();
      await page.waitForTimeout(300);
    }

    // Wait for game over
    await expect(page.locator("h2:has-text('Game Over!')")).toBeVisible();

    // Check for victory message details
    const resultCard = page.locator(".card.bg-success-500\\/10");
    await expect(resultCard).toBeVisible();

    // Verify winner is player
    await expect(resultCard.locator("text=/Winner: You/")).toBeVisible();

    // Verify reason is Exodia
    await expect(resultCard.locator("text=/Reason: exodia/")).toBeVisible();
  });
});
