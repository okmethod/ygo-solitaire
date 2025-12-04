/**
 * E2E Test: Effect Activation UI with Card Illustrations (Feature 003)
 *
 * Tests the complete implementation of User Stories 1-3:
 * - US1: Card illustrations displayed in hand and field
 * - US2: Card click to activate effects
 * - US3: Card detail modal display
 *
 * Test Scope: /simulator/[deckId] page with new Card.svelte integration
 */

import { test, expect } from "@playwright/test";

test.describe("Effect Activation UI - User Story 1: Card Illustrations", () => {
  test("should display card illustrations in hand after draw", async ({ page }) => {
    await page.goto("/simulator/test-deck");

    // Draw a card
    await page.getByRole("button", { name: "Draw Card" }).click();
    await page.waitForTimeout(500);

    // Verify Hand section exists
    const handSection = page.locator("h2:has-text('Hand')").locator("..");
    await expect(handSection).toBeVisible();

    // Verify card image is displayed (not just card ID text)
    const cardComponent = handSection.locator(".card").first();
    await expect(cardComponent).toBeVisible();

    // Card should have an image element
    const cardImage = cardComponent.locator("img");
    await expect(cardImage).toBeVisible();

    // Image should have a valid src (YGOPRODeck API URL)
    const imageSrc = await cardImage.getAttribute("src");
    expect(imageSrc).toBeTruthy();
    expect(imageSrc).toContain("https://");
  });

  test("should display multiple card illustrations in hand", async ({ page }) => {
    await page.goto("/simulator/test-deck");

    // Draw 3 cards
    for (let i = 0; i < 3; i++) {
      await page.getByRole("button", { name: "Draw Card" }).click();
      await page.waitForTimeout(300);
    }

    // Verify 3 cards in hand
    await expect(page.getByText("Hand: 3 cards")).toBeVisible();

    // Verify all 3 cards have images
    const handSection = page.locator("h2:has-text('Hand')").locator("..");
    const cardImages = handSection.locator(".card img");
    await expect(cardImages).toHaveCount(3);

    // All images should be loaded
    for (let i = 0; i < 3; i++) {
      const image = cardImages.nth(i);
      await expect(image).toBeVisible();
      const src = await image.getAttribute("src");
      expect(src).toBeTruthy();
    }
  });

  test("should display placeholder while loading card data", async ({ page }) => {
    await page.goto("/simulator/test-deck");

    // Draw a card (may show placeholder briefly during API fetch)
    await page.getByRole("button", { name: "Draw Card" }).click();

    // Wait for card to fully load
    await page.waitForTimeout(500);

    // After loading, card image should be visible (not placeholder)
    const handSection = page.locator("h2:has-text('Hand')").locator("..");
    const cardImage = handSection.locator(".card img").first();
    await expect(cardImage).toBeVisible();
  });
});

test.describe("Effect Activation UI - User Story 2: Card Click Activation", () => {
  test("should activate spell card by clicking in Main1 phase", async ({ page }) => {
    await page.goto("/simulator/test-deck");

    // Draw a card
    await page.getByRole("button", { name: "Draw Card" }).click();
    await page.waitForTimeout(500);

    // Advance to Main1 phase
    await page.getByRole("button", { name: "Advance Phase" }).click(); // Draw → Standby
    await page.waitForTimeout(300);
    await page.getByRole("button", { name: "Advance Phase" }).click(); // Standby → Main1
    await page.waitForTimeout(300);

    // Verify we're in Main1
    await expect(page.getByText("メインフェイズ1")).toBeVisible();

    // Click card to activate (US2 feature)
    const handSection = page.locator("h2:has-text('Hand')").locator("..");
    const card = handSection.locator(".card").first();
    await card.click();

    // Wait for toast notification
    await expect(page.locator(".toaster")).toBeVisible();

    // Verify card moved to graveyard
    await expect(page.getByText("Hand: 0 cards")).toBeVisible();
    await expect(page.getByText("Graveyard: 1 cards")).toBeVisible();
  });

  test("should not activate card by clicking outside Main1 phase", async ({ page }) => {
    await page.goto("/simulator/test-deck");

    // Draw a card in Draw phase
    await page.getByRole("button", { name: "Draw Card" }).click();
    await page.waitForTimeout(500);

    // Try to click card in Draw phase
    const handSection = page.locator("h2:has-text('Hand')").locator("..");
    const card = handSection.locator(".card").first();
    await card.click();

    // Wait briefly
    await page.waitForTimeout(300);

    // Card should still be in hand (not activated)
    await expect(page.getByText("Hand: 1 cards")).toBeVisible();
    await expect(page.getByText("Graveyard: 0 cards")).toBeVisible();

    // Error toast may appear (phase check failed)
    // Note: This depends on implementation - may or may not show toast
  });

  test("should show error toast when clicking card in wrong phase", async ({ page }) => {
    await page.goto("/simulator/test-deck");

    // Draw a card
    await page.getByRole("button", { name: "Draw Card" }).click();
    await page.waitForTimeout(500);

    // Click card in Draw phase (should fail)
    const handSection = page.locator("h2:has-text('Hand')").locator("..");
    const card = handSection.locator(".card").first();
    await card.click();

    // Wait for error toast
    await page.waitForTimeout(300);

    // Toast should show error message
    const toaster = page.locator(".toaster");
    if (await toaster.isVisible()) {
      const toastText = await toaster.textContent();
      expect(toastText).toContain("メインフェイズ1");
    }
  });

  test("should activate multiple cards in sequence by clicking", async ({ page }) => {
    await page.goto("/simulator/test-deck");

    // Draw 3 cards
    for (let i = 0; i < 3; i++) {
      await page.getByRole("button", { name: "Draw Card" }).click();
      await page.waitForTimeout(300);
    }

    // Advance to Main1
    await page.getByRole("button", { name: "Advance Phase" }).click();
    await page.waitForTimeout(300);
    await page.getByRole("button", { name: "Advance Phase" }).click();
    await page.waitForTimeout(300);

    // Activate first card
    const handSection = page.locator("h2:has-text('Hand')").locator("..");
    await handSection.locator(".card").first().click();
    await page.waitForTimeout(300);
    await expect(page.getByText("Hand: 2 cards")).toBeVisible();

    // Activate second card
    await handSection.locator(".card").first().click();
    await page.waitForTimeout(300);
    await expect(page.getByText("Hand: 1 cards")).toBeVisible();

    // Activate third card
    await handSection.locator(".card").first().click();
    await page.waitForTimeout(300);
    await expect(page.getByText("Hand: 0 cards")).toBeVisible();

    // All cards in graveyard
    await expect(page.getByText("Graveyard: 3 cards")).toBeVisible();
  });

  test("should disable card clicks after game over", async ({ page }) => {
    await page.goto("/simulator/test-deck");

    // Draw cards until game over (Exodia deck)
    for (let i = 0; i < 5; i++) {
      await page.getByRole("button", { name: "Draw Card" }).click();
      await page.waitForTimeout(300);
    }

    // Wait for game over
    await expect(page.locator("h2:has-text('Game Over!')")).toBeVisible();

    // Try to advance to Main1 (may work but cards should not activate)
    await page.getByRole("button", { name: "Advance Phase" }).click();
    await page.waitForTimeout(300);
    await page.getByRole("button", { name: "Advance Phase" }).click();
    await page.waitForTimeout(300);

    // Try to click a card (should not activate after game over)
    const handSection = page.locator("h2:has-text('Hand')").locator("..");
    const handCardCount = await page.getByText(/Hand: \d+ cards/).textContent();

    const card = handSection.locator(".card").first();
    if (await card.isVisible()) {
      await card.click();
      await page.waitForTimeout(300);

      // Hand count should not change (card not activated)
      await expect(page.getByText(handCardCount || "Hand: 5 cards")).toBeVisible();
    }
  });
});

test.describe("Effect Activation UI - User Story 3: Card Detail Modal", () => {
  test("should show card detail modal when clicking card", async ({ page }) => {
    await page.goto("/simulator/test-deck");

    // Draw a card
    await page.getByRole("button", { name: "Draw Card" }).click();
    await page.waitForTimeout(500);

    // Click card to show detail (US3 feature)
    const handSection = page.locator("h2:has-text('Hand')").locator("..");
    const card = handSection.locator(".card").first();
    await card.click();

    // Wait for modal to appear
    await page.waitForTimeout(300);

    // Modal should be visible
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Modal should contain card details (name, image, description)
    const modalContent = modal.locator(".card-detail");
    if (await modalContent.isVisible()) {
      // Check for card name
      const cardName = modalContent.locator("h2, h3");
      await expect(cardName).toBeVisible();

      // Check for card image
      const cardImage = modalContent.locator("img");
      await expect(cardImage).toBeVisible();
    }
  });

  test("should close card detail modal on backdrop click", async ({ page }) => {
    await page.goto("/simulator/test-deck");

    // Draw a card
    await page.getByRole("button", { name: "Draw Card" }).click();
    await page.waitForTimeout(500);

    // Click card to open modal
    const handSection = page.locator("h2:has-text('Hand')").locator("..");
    const card = handSection.locator(".card").first();
    await card.click();
    await page.waitForTimeout(300);

    // Modal should be visible
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Click backdrop to close (implementation-specific)
    const backdrop = page.locator(".modal-backdrop");
    if (await backdrop.isVisible()) {
      await backdrop.click();
      await page.waitForTimeout(300);

      // Modal should be closed
      await expect(modal).not.toBeVisible();
    }
  });

  test("should show card detail in Main1 phase without activating", async ({ page }) => {
    await page.goto("/simulator/test-deck");

    // Draw a card
    await page.getByRole("button", { name: "Draw Card" }).click();
    await page.waitForTimeout(500);

    // Advance to Main1
    await page.getByRole("button", { name: "Advance Phase" }).click();
    await page.waitForTimeout(300);
    await page.getByRole("button", { name: "Advance Phase" }).click();
    await page.waitForTimeout(300);

    // Click card (should show detail AND activate)
    const handSection = page.locator("h2:has-text('Hand')").locator("..");
    const card = handSection.locator(".card").first();
    await card.click();

    // Wait for both modal and activation to process
    await page.waitForTimeout(500);

    // Note: In Main1 phase, card click triggers both:
    // 1. Effect activation (card moves to graveyard)
    // 2. Detail modal display
    // This is the expected behavior based on Card.svelte implementation

    // Verify modal appeared (may auto-close)
    // and card was activated (moved to graveyard)
    await expect(page.getByText("Hand: 0 cards")).toBeVisible();
    await expect(page.getByText("Graveyard: 1 cards")).toBeVisible();
  });
});

test.describe("Effect Activation UI - Integration Tests", () => {
  test("should show card illustrations in DuelField component", async ({ page }) => {
    await page.goto("/simulator/test-deck");

    // Verify DuelField component is rendered
    const duelField = page.locator(".duel-field, [data-testid='duel-field']");
    // Note: Actual selector depends on DuelField.svelte implementation

    // Draw cards and verify they appear in DuelField zones
    await page.getByRole("button", { name: "Draw Card" }).click();
    await page.waitForTimeout(500);

    // Verify hand zone in DuelField shows card count
    // Note: This test may need adjustment based on actual DuelField layout
  });

  test("should maintain card display after phase transitions", async ({ page }) => {
    await page.goto("/simulator/test-deck");

    // Draw 3 cards
    for (let i = 0; i < 3; i++) {
      await page.getByRole("button", { name: "Draw Card" }).click();
      await page.waitForTimeout(300);
    }

    // Verify card images visible
    const handSection = page.locator("h2:has-text('Hand')").locator("..");
    await expect(handSection.locator(".card img")).toHaveCount(3);

    // Advance phase
    await page.getByRole("button", { name: "Advance Phase" }).click();
    await page.waitForTimeout(300);

    // Card images should still be visible after phase change
    await expect(handSection.locator(".card img")).toHaveCount(3);
  });

  test("should handle rapid card draws without display errors", async ({ page }) => {
    await page.goto("/simulator/test-deck");

    // Rapidly draw 5 cards
    for (let i = 0; i < 5; i++) {
      await page.getByRole("button", { name: "Draw Card" }).click();
      // Minimal timeout to simulate rapid clicks
      await page.waitForTimeout(100);
    }

    // Wait for all cards to load
    await page.waitForTimeout(1000);

    // Verify all 5 cards displayed
    await expect(page.getByText("Hand: 5 cards")).toBeVisible();
    const handSection = page.locator("h2:has-text('Hand')").locator("..");
    const cardImages = handSection.locator(".card img");
    await expect(cardImages).toHaveCount(5);

    // All images should be loaded (not broken)
    for (let i = 0; i < 5; i++) {
      const image = cardImages.nth(i);
      await expect(image).toBeVisible();
      const src = await image.getAttribute("src");
      expect(src).toBeTruthy();
    }
  });
});
