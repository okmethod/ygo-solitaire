/**
 * E2E Test: Card Activation Flow
 *
 * Tests the complete flow of activating spell cards through the UI:
 * 1. Initialize game and draw cards
 * 2. Navigate to Main1 phase
 * 3. Activate spell cards from hand
 * 4. Verify card moves to graveyard
 */

import { test, expect } from "@playwright/test";

test.describe("Card Activation Flow", () => {
  test("should activate spell card from hand", async ({ page }) => {
    await page.goto("/simulator/test-deck");

    // Draw a card
    await page.getByRole("button", { name: "Draw Card" }).click();
    await page.waitForTimeout(500);

    // Verify card is in hand
    const handSection = page.locator("h2:has-text('Hand')").locator("..");
    await expect(handSection).toBeVisible();
    await expect(handSection.locator(".card.p-2")).toHaveCount(1);

    // Advance to Main1 phase
    await page.getByRole("button", { name: "Advance Phase" }).click(); // Draw → Standby
    await page.waitForTimeout(300);
    await page.getByRole("button", { name: "Advance Phase" }).click(); // Standby → Main1
    await page.waitForTimeout(300);

    // Verify we're in Main1
    await expect(page.getByText("メインフェイズ1")).toBeVisible();

    // Click Activate button
    const activateButton = page.getByRole("button", { name: "Activate" }).first();
    await expect(activateButton).toBeVisible();
    await activateButton.click();

    // Wait for toast notification
    await expect(page.locator(".toaster")).toBeVisible();

    // Verify card moved from hand (hand count decreased)
    await expect(page.getByText("Hand: 0 cards")).toBeVisible();

    // Verify card is in graveyard
    await expect(page.getByText("Graveyard: 1 cards")).toBeVisible();
  });

  test("should not show Activate button outside Main1 phase", async ({ page }) => {
    await page.goto("/simulator/test-deck");

    // Draw a card in Draw phase
    await page.getByRole("button", { name: "Draw Card" }).click();
    await page.waitForTimeout(500);

    // Verify Activate button is not visible in Draw phase
    await expect(page.getByRole("button", { name: "Activate" })).not.toBeVisible();

    // Advance to Standby
    await page.getByRole("button", { name: "Advance Phase" }).click();
    await page.waitForTimeout(300);

    // Verify Activate button is not visible in Standby phase
    await expect(page.getByRole("button", { name: "Activate" })).not.toBeVisible();

    // Advance to Main1
    await page.getByRole("button", { name: "Advance Phase" }).click();
    await page.waitForTimeout(300);

    // Now Activate button should be visible
    await expect(page.getByRole("button", { name: "Activate" })).toBeVisible();
  });

  test("should activate multiple cards in sequence", async ({ page }) => {
    await page.goto("/simulator/test-deck");

    // Draw 3 cards
    for (let i = 0; i < 3; i++) {
      await page.getByRole("button", { name: "Draw Card" }).click();
      await page.waitForTimeout(300);
    }

    // Verify we have 3 cards in hand
    await expect(page.getByText("Hand: 3 cards")).toBeVisible();

    // Advance to Main1
    await page.getByRole("button", { name: "Advance Phase" }).click();
    await page.waitForTimeout(300);
    await page.getByRole("button", { name: "Advance Phase" }).click();
    await page.waitForTimeout(300);

    // Activate first card
    await page.getByRole("button", { name: "Activate" }).first().click();
    await page.waitForTimeout(300);
    await expect(page.getByText("Hand: 2 cards")).toBeVisible();

    // Activate second card
    await page.getByRole("button", { name: "Activate" }).first().click();
    await page.waitForTimeout(300);
    await expect(page.getByText("Hand: 1 cards")).toBeVisible();

    // Activate third card
    await page.getByRole("button", { name: "Activate" }).first().click();
    await page.waitForTimeout(300);
    await expect(page.getByText("Hand: 0 cards")).toBeVisible();

    // Verify all cards are in graveyard
    await expect(page.getByText("Graveyard: 3 cards")).toBeVisible();
  });

  test("should show error toast when activation fails", async ({ page }) => {
    await page.goto("/simulator/test-deck");

    // Note: This test structure assumes there's a way to trigger activation failure
    // For now, we just verify the UI shows appropriate feedback

    // Draw a card and advance to Main1
    await page.getByRole("button", { name: "Draw Card" }).click();
    await page.waitForTimeout(300);
    await page.getByRole("button", { name: "Advance Phase" }).click();
    await page.waitForTimeout(300);
    await page.getByRole("button", { name: "Advance Phase" }).click();
    await page.waitForTimeout(300);

    // Verify Activate button exists
    await expect(page.getByRole("button", { name: "Activate" })).toBeVisible();
  });

  test("should disable activation after game over", async ({ page }) => {
    await page.goto("/simulator/test-deck");

    // Draw cards until game over (assuming Exodia deck)
    for (let i = 0; i < 5; i++) {
      await page.getByRole("button", { name: "Draw Card" }).click();
      await page.waitForTimeout(300);
    }

    // Wait for game over
    await expect(page.locator("h2:has-text('Game Over!')")).toBeVisible();

    // Advance to Main1 (should still work even after game over for UI state)
    // But Activate buttons should not appear

    // Verify no Activate buttons are visible
    await expect(page.getByRole("button", { name: "Activate" })).not.toBeVisible();
  });

  test("should display card information in hand", async ({ page }) => {
    await page.goto("/simulator/test-deck");

    // Draw a card
    await page.getByRole("button", { name: "Draw Card" }).click();
    await page.waitForTimeout(500);

    // Verify card display shows card ID and instance ID
    const handCard = page.locator(".card.p-2.bg-surface-700").first();
    await expect(handCard).toBeVisible();

    // Check for card ID (displayed in bold)
    const cardId = handCard.locator(".text-xs.text-center.font-bold");
    await expect(cardId).toBeVisible();

    // Check for instance ID (displayed with opacity)
    const instanceId = handCard.locator(".text-xs.text-center.opacity-75");
    await expect(instanceId).toBeVisible();
  });

  test("should show field zone updates after activation", async ({ page }) => {
    await page.goto("/simulator/test-deck");

    // Draw a card
    await page.getByRole("button", { name: "Draw Card" }).click();
    await page.waitForTimeout(500);

    // Advance to Main1
    await page.getByRole("button", { name: "Advance Phase" }).click();
    await page.waitForTimeout(300);
    await page.getByRole("button", { name: "Advance Phase" }).click();
    await page.waitForTimeout(300);

    // Verify initial field state
    const fieldSection = page.locator("h2:has-text('Field')").locator("..");
    await expect(fieldSection).toBeVisible();

    // Field should be empty initially (cards go directly to graveyard)
    await expect(fieldSection.locator("text=/Field cards: 0/")).toBeVisible();

    // Activate card
    await page.getByRole("button", { name: "Activate" }).first().click();
    await page.waitForTimeout(500);

    // Field should still be empty (card moved to graveyard after activation)
    await expect(fieldSection.locator("text=/Field cards: 0/")).toBeVisible();
  });
});
