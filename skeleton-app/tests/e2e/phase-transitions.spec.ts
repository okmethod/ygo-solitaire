/**
 * E2E Test: Phase Transition Flow
 *
 * Tests the complete flow of game phase transitions through the UI:
 * 1. Initialize game
 * 2. Navigate through phases: Draw → Standby → Main1 → End
 * 3. Verify UI updates correctly at each phase
 */

import { test, expect } from "@playwright/test";

test.describe("Phase Transition Flow", () => {
  test("should navigate through all phases correctly", async ({ page }) => {
    await page.goto("/simulator/test-deck");

    // Wait for page to load
    await expect(page.locator("h1")).toContainText("New Architecture Simulator");

    // Verify initial phase is Draw
    await expect(page.getByText("Phase:")).toBeVisible();
    await expect(page.getByText("ドローフェイズ")).toBeVisible();

    // Advance to Standby phase
    await page.getByRole("button", { name: "Advance Phase" }).click();
    await expect(page.locator(".toaster")).toBeVisible();
    await expect(page.getByText("スタンバイフェイズ")).toBeVisible();

    // Advance to Main1 phase
    await page.getByRole("button", { name: "Advance Phase" }).click();
    await expect(page.getByText("メインフェイズ1")).toBeVisible();

    // Advance to End phase
    await page.getByRole("button", { name: "Advance Phase" }).click();
    await expect(page.getByText("エンドフェイズ")).toBeVisible();

    // Verify we stay in End phase (循環)
    await page.getByRole("button", { name: "Advance Phase" }).click();
    await expect(page.getByText("エンドフェイズ")).toBeVisible();
  });

  test("should enable card activation only in Main1 phase", async ({ page }) => {
    await page.goto("/simulator/test-deck");

    // Draw a card first
    await page.getByRole("button", { name: "Draw Card" }).click();
    await page.waitForTimeout(500);

    // Verify Activate button doesn't exist in Draw phase
    const activateButtonInDraw = page.getByRole("button", { name: "Activate" });
    await expect(activateButtonInDraw).not.toBeVisible();

    // Advance to Standby
    await page.getByRole("button", { name: "Advance Phase" }).click();
    await page.waitForTimeout(500);

    // Verify Activate button doesn't exist in Standby phase
    await expect(activateButtonInDraw).not.toBeVisible();

    // Advance to Main1
    await page.getByRole("button", { name: "Advance Phase" }).click();
    await page.waitForTimeout(500);
    await expect(page.getByText("メインフェイズ1")).toBeVisible();

    // Now Activate button should be visible
    await expect(activateButtonInDraw).toBeVisible();

    // Advance to End
    await page.getByRole("button", { name: "Advance Phase" }).click();
    await page.waitForTimeout(500);

    // Verify Activate button doesn't exist in End phase
    await expect(activateButtonInDraw).not.toBeVisible();
  });

  test("should show toast notifications for phase transitions", async ({ page }) => {
    await page.goto("/simulator/test-deck");

    // Advance phase and check for toast
    await page.getByRole("button", { name: "Advance Phase" }).click();

    // Wait for toast notification
    const toaster = page.locator(".toaster");
    await expect(toaster).toBeVisible();

    // Check toast contains phase message
    await expect(toaster).toContainText(/フェイズ/);
  });

  test("should update turn number display", async ({ page }) => {
    await page.goto("/simulator/test-deck");

    // Verify initial turn is 1
    const turnDisplay = page.locator("text=/Turn:/").locator("..");
    await expect(turnDisplay).toContainText("1");

    // Advance through phases
    for (let i = 0; i < 4; i++) {
      await page.getByRole("button", { name: "Advance Phase" }).click();
      await page.waitForTimeout(300);
    }

    // Turn should still be 1 (we don't increment turn in MVP)
    await expect(turnDisplay).toContainText("1");
  });

  test("should disable phase advance when deck is empty in Draw phase", async ({ page }) => {
    await page.goto("/simulator/test-deck");

    // Note: This test assumes the test deck has limited cards
    // We can't easily test this without knowing exact deck size
    // This is a placeholder test structure

    // Verify Advance Phase button is enabled initially
    const advanceButton = page.getByRole("button", { name: "Advance Phase" });
    await expect(advanceButton).toBeEnabled();
  });

  test("should maintain phase state across actions", async ({ page }) => {
    await page.goto("/simulator/test-deck");

    // Draw a card
    await page.getByRole("button", { name: "Draw Card" }).click();
    await page.waitForTimeout(300);

    // Phase should still be Draw
    await expect(page.getByText("ドローフェイズ")).toBeVisible();

    // Advance to Main1
    await page.getByRole("button", { name: "Advance Phase" }).click();
    await page.waitForTimeout(300);
    await page.getByRole("button", { name: "Advance Phase" }).click();
    await page.waitForTimeout(300);

    // Draw another card (if possible)
    await page.getByRole("button", { name: "Draw Card" }).click();
    await page.waitForTimeout(300);

    // Phase should still be Main1 (drawing doesn't change phase)
    await expect(page.getByText("メインフェイズ1")).toBeVisible();
  });
});
