/**
 * Unit tests for cardSelectionStore (Svelte 5 Runes)
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { cardSelectionStore } from "$lib/stores/cardSelectionStore.svelte";
import { createCardInstances } from "$lib/__testUtils__/gameStateFactory";
import type { CardSelectionConfig } from "$lib/stores/cardSelectionStore.svelte";

describe("cardSelectionStore", () => {
  // Reset store before each test
  beforeEach(() => {
    cardSelectionStore.reset();
  });

  describe("initial state", () => {
    it("should not be active initially", () => {
      expect(cardSelectionStore.isActive).toBe(false);
    });

    it("should have null config initially", () => {
      expect(cardSelectionStore.config).toBeNull();
    });

    it("should have empty selection initially", () => {
      expect(cardSelectionStore.selectedInstanceIds).toEqual([]);
      expect(cardSelectionStore.selectedCount).toBe(0);
    });

    it("should not have valid selection initially", () => {
      expect(cardSelectionStore.isValidSelection).toBe(false);
    });
  });

  describe("startSelection", () => {
    it("should activate selection with config", () => {
      const availableCards = createCardInstances(["12345678", "87654321"], "hand");
      const onConfirm = vi.fn();

      const config: CardSelectionConfig = {
        availableCards,
        minCards: 1,
        maxCards: 2,
        title: "Select cards",
        message: "Choose 1-2 cards",
        onConfirm,
      };

      cardSelectionStore.startSelection(config);

      expect(cardSelectionStore.isActive).toBe(true);
      expect(cardSelectionStore.config).toEqual(config);
      expect(cardSelectionStore.selectedInstanceIds).toEqual([]);
    });
  });

  describe("toggleCard", () => {
    it("should select a card", () => {
      const cards = createCardInstances(["12345678", "87654321"], "hand");
      const config: CardSelectionConfig = {
        availableCards: cards,
        minCards: 1,
        maxCards: 2,
        title: "Select",
        message: "Choose",
        onConfirm: vi.fn(),
      };

      cardSelectionStore.startSelection(config);
      cardSelectionStore.toggleCard(cards[0].instanceId);

      expect(cardSelectionStore.isSelected(cards[0].instanceId)).toBe(true);
      expect(cardSelectionStore.selectedCount).toBe(1);
    });

    it("should deselect a previously selected card", () => {
      const cards = createCardInstances(["12345678"], "hand");
      const config: CardSelectionConfig = {
        availableCards: cards,
        minCards: 0,
        maxCards: 1,
        title: "Select",
        message: "Choose",
        onConfirm: vi.fn(),
      };

      cardSelectionStore.startSelection(config);
      cardSelectionStore.toggleCard(cards[0].instanceId);
      cardSelectionStore.toggleCard(cards[0].instanceId); // Toggle again

      expect(cardSelectionStore.isSelected(cards[0].instanceId)).toBe(false);
      expect(cardSelectionStore.selectedCount).toBe(0);
    });

    it("should not select more than maxCards", () => {
      const cards = createCardInstances(["12345678", "87654321", "11111111"], "hand");
      const config: CardSelectionConfig = {
        availableCards: cards,
        minCards: 1,
        maxCards: 2,
        title: "Select",
        message: "Choose max 2",
        onConfirm: vi.fn(),
      };

      cardSelectionStore.startSelection(config);
      cardSelectionStore.toggleCard(cards[0].instanceId);
      cardSelectionStore.toggleCard(cards[1].instanceId);
      cardSelectionStore.toggleCard(cards[2].instanceId); // Should be ignored

      expect(cardSelectionStore.selectedCount).toBe(2);
      expect(cardSelectionStore.isSelected(cards[2].instanceId)).toBe(false);
    });

    it("should ignore cards not in availableCards", () => {
      const availableCards = createCardInstances(["12345678"], "hand");
      const config: CardSelectionConfig = {
        availableCards,
        minCards: 1,
        maxCards: 1,
        title: "Select",
        message: "Choose",
        onConfirm: vi.fn(),
      };

      cardSelectionStore.startSelection(config);
      cardSelectionStore.toggleCard("non-existent-id");

      expect(cardSelectionStore.selectedCount).toBe(0);
    });

    it("should not toggle when selection is not active", () => {
      // Don't start selection
      cardSelectionStore.toggleCard("any-id");

      expect(cardSelectionStore.selectedCount).toBe(0);
    });
  });

  describe("isValidSelection", () => {
    it("should return true when selection meets min/max constraints", () => {
      const cards = createCardInstances(["12345678", "87654321"], "hand");
      const config: CardSelectionConfig = {
        availableCards: cards,
        minCards: 1,
        maxCards: 2,
        title: "Select",
        message: "Choose 1-2",
        onConfirm: vi.fn(),
      };

      cardSelectionStore.startSelection(config);
      cardSelectionStore.toggleCard(cards[0].instanceId);

      expect(cardSelectionStore.isValidSelection).toBe(true);
    });

    it("should return false when selection is below minimum", () => {
      const cards = createCardInstances(["12345678", "87654321"], "hand");
      const config: CardSelectionConfig = {
        availableCards: cards,
        minCards: 2,
        maxCards: 2,
        title: "Select",
        message: "Choose 2",
        onConfirm: vi.fn(),
      };

      cardSelectionStore.startSelection(config);
      cardSelectionStore.toggleCard(cards[0].instanceId); // Only 1 selected

      expect(cardSelectionStore.isValidSelection).toBe(false);
    });

    it("should return false when no config is set", () => {
      expect(cardSelectionStore.isValidSelection).toBe(false);
    });
  });

  describe("canToggleCard", () => {
    it("should allow deselecting an already selected card", () => {
      const cards = createCardInstances(["12345678"], "hand");
      const config: CardSelectionConfig = {
        availableCards: cards,
        minCards: 0,
        maxCards: 1,
        title: "Select",
        message: "Choose",
        onConfirm: vi.fn(),
      };

      cardSelectionStore.startSelection(config);
      cardSelectionStore.toggleCard(cards[0].instanceId);

      expect(cardSelectionStore.canToggleCard(cards[0].instanceId)).toBe(true);
    });

    it("should allow selecting when below max", () => {
      const cards = createCardInstances(["12345678", "87654321"], "hand");
      const config: CardSelectionConfig = {
        availableCards: cards,
        minCards: 1,
        maxCards: 2,
        title: "Select",
        message: "Choose",
        onConfirm: vi.fn(),
      };

      cardSelectionStore.startSelection(config);
      cardSelectionStore.toggleCard(cards[0].instanceId);

      expect(cardSelectionStore.canToggleCard(cards[1].instanceId)).toBe(true);
    });

    it("should not allow selecting when at max", () => {
      const cards = createCardInstances(["12345678", "87654321", "11111111"], "hand");
      const config: CardSelectionConfig = {
        availableCards: cards,
        minCards: 1,
        maxCards: 2,
        title: "Select",
        message: "Choose max 2",
        onConfirm: vi.fn(),
      };

      cardSelectionStore.startSelection(config);
      cardSelectionStore.toggleCard(cards[0].instanceId);
      cardSelectionStore.toggleCard(cards[1].instanceId);

      expect(cardSelectionStore.canToggleCard(cards[2].instanceId)).toBe(false);
    });

    it("should return false when no config is set", () => {
      expect(cardSelectionStore.canToggleCard("any-id")).toBe(false);
    });
  });

  describe("confirmSelection", () => {
    it("should execute onConfirm callback with selected IDs", () => {
      const cards = createCardInstances(["12345678", "87654321"], "hand");
      const onConfirm = vi.fn();
      const config: CardSelectionConfig = {
        availableCards: cards,
        minCards: 1,
        maxCards: 2,
        title: "Select",
        message: "Choose",
        onConfirm,
      };

      cardSelectionStore.startSelection(config);
      cardSelectionStore.toggleCard(cards[0].instanceId);
      cardSelectionStore.toggleCard(cards[1].instanceId);
      cardSelectionStore.confirmSelection();

      expect(onConfirm).toHaveBeenCalledWith([cards[0].instanceId, cards[1].instanceId]);
    });

    it("should reset state after confirming", () => {
      const cards = createCardInstances(["12345678"], "hand");
      const onConfirm = vi.fn();
      const config: CardSelectionConfig = {
        availableCards: cards,
        minCards: 1,
        maxCards: 1,
        title: "Select",
        message: "Choose",
        onConfirm,
      };

      cardSelectionStore.startSelection(config);
      cardSelectionStore.toggleCard(cards[0].instanceId);
      cardSelectionStore.confirmSelection();

      expect(cardSelectionStore.isActive).toBe(false);
      expect(cardSelectionStore.config).toBeNull();
      expect(cardSelectionStore.selectedCount).toBe(0);
    });

    it("should not execute callback when selection is invalid", () => {
      const cards = createCardInstances(["12345678"], "hand");
      const onConfirm = vi.fn();
      const config: CardSelectionConfig = {
        availableCards: cards,
        minCards: 2, // Require 2 cards
        maxCards: 2,
        title: "Select",
        message: "Choose 2",
        onConfirm,
      };

      cardSelectionStore.startSelection(config);
      cardSelectionStore.toggleCard(cards[0].instanceId); // Only select 1
      cardSelectionStore.confirmSelection();

      expect(onConfirm).not.toHaveBeenCalled();
    });

    it("should not execute callback when no config is set", () => {
      const onConfirm = vi.fn();
      cardSelectionStore.confirmSelection();

      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  describe("cancelSelection", () => {
    it("should execute onCancel callback if provided", () => {
      const cards = createCardInstances(["12345678"], "hand");
      const onCancel = vi.fn();
      const config: CardSelectionConfig = {
        availableCards: cards,
        minCards: 1,
        maxCards: 1,
        title: "Select",
        message: "Choose",
        onConfirm: vi.fn(),
        onCancel,
      };

      cardSelectionStore.startSelection(config);
      cardSelectionStore.toggleCard(cards[0].instanceId);
      cardSelectionStore.cancelSelection();

      expect(onCancel).toHaveBeenCalled();
    });

    it("should reset state after cancelling", () => {
      const cards = createCardInstances(["12345678"], "hand");
      const config: CardSelectionConfig = {
        availableCards: cards,
        minCards: 1,
        maxCards: 1,
        title: "Select",
        message: "Choose",
        onConfirm: vi.fn(),
      };

      cardSelectionStore.startSelection(config);
      cardSelectionStore.toggleCard(cards[0].instanceId);
      cardSelectionStore.cancelSelection();

      expect(cardSelectionStore.isActive).toBe(false);
      expect(cardSelectionStore.config).toBeNull();
      expect(cardSelectionStore.selectedCount).toBe(0);
    });

    it("should not throw when onCancel is not provided", () => {
      const cards = createCardInstances(["12345678"], "hand");
      const config: CardSelectionConfig = {
        availableCards: cards,
        minCards: 1,
        maxCards: 1,
        title: "Select",
        message: "Choose",
        onConfirm: vi.fn(),
        // No onCancel
      };

      cardSelectionStore.startSelection(config);
      expect(() => cardSelectionStore.cancelSelection()).not.toThrow();
    });
  });

  describe("reset", () => {
    it("should reset to initial state", () => {
      const cards = createCardInstances(["12345678"], "hand");
      const config: CardSelectionConfig = {
        availableCards: cards,
        minCards: 1,
        maxCards: 1,
        title: "Select",
        message: "Choose",
        onConfirm: vi.fn(),
      };

      cardSelectionStore.startSelection(config);
      cardSelectionStore.toggleCard(cards[0].instanceId);
      cardSelectionStore.reset();

      expect(cardSelectionStore.isActive).toBe(false);
      expect(cardSelectionStore.config).toBeNull();
      expect(cardSelectionStore.selectedInstanceIds).toEqual([]);
      expect(cardSelectionStore.selectedCount).toBe(0);
    });
  });
});
