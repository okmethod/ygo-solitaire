/**
 * Card Selection Store (Svelte 5 Runes)
 *
 * Manages card selection state for effects that require player choices.
 * Used by CardSelectionModal to track which cards the player has selected.
 *
 * Usage:
 * - startSelection(config): Start card selection with specific constraints
 * - toggleCard(instanceId): Toggle a card's selection state
 * - confirmSelection(): Confirm selection and execute callback
 * - cancelSelection(): Cancel selection without executing callback
 *
 * @module stores/cardSelectionStore
 */

import type { CardInstance } from "$lib/application/types/card";

/**
 * Card selection configuration (Presentation Layer)
 *
 * Extends Domain Layer's CardSelectionConfig with presentation-specific callbacks.
 */
export interface CardSelectionConfig {
  /** Available cards to choose from */
  availableCards: readonly CardInstance[];
  /** Minimum number of cards that must be selected */
  minCards: number;
  /** Maximum number of cards that can be selected */
  maxCards: number;
  /** Summary shown in selection UI */
  summary: string;
  /** Description/instructions shown in selection UI */
  description: string;
  /** Whether user can cancel the selection (default: true) */
  cancelable?: boolean;
  /** Callback executed when selection is confirmed */
  onConfirm: (selectedInstanceIds: string[]) => void;
  /** Optional callback executed when selection is cancelled */
  onCancel?: () => void;
}

/**
 * Card selection state
 */
interface CardSelectionState {
  /** Whether selection is currently active */
  isActive: boolean;
  /** Configuration for current selection */
  config: CardSelectionConfig | null;
  /** Set of selected card instance IDs */
  selectedInstanceIds: Set<string>;
}

/**
 * Create initial state
 */
function createInitialState(): CardSelectionState {
  return {
    isActive: false,
    config: null,
    selectedInstanceIds: new Set(),
  };
}

/**
 * Card Selection Store (Svelte 5 Runes API)
 */
class CardSelectionStore {
  private state = $state<CardSelectionState>(createInitialState());

  /**
   * Check if selection is active
   */
  get isActive(): boolean {
    return this.state.isActive;
  }

  /**
   * Get current configuration
   */
  get config(): CardSelectionConfig | null {
    return this.state.config;
  }

  /**
   * Get selected instance IDs as array
   */
  get selectedInstanceIds(): string[] {
    return Array.from(this.state.selectedInstanceIds);
  }

  /**
   * Get selected cards count
   */
  get selectedCount(): number {
    return this.state.selectedInstanceIds.size;
  }

  /**
   * Check if a card is selected
   */
  isSelected(instanceId: string): boolean {
    return this.state.selectedInstanceIds.has(instanceId);
  }

  /**
   * Check if selection is valid (meets min/max constraints)
   */
  get isValidSelection(): boolean {
    if (!this.state.config) return false;

    const count = this.state.selectedInstanceIds.size;
    return count >= this.state.config.minCards && count <= this.state.config.maxCards;
  }

  /**
   * Check if a card can be toggled (considering max constraint)
   */
  canToggleCard(instanceId: string): boolean {
    if (!this.state.config) return false;

    // If already selected, can always deselect
    if (this.state.selectedInstanceIds.has(instanceId)) {
      return true;
    }

    // If not selected, check if we've reached max
    return this.state.selectedInstanceIds.size < this.state.config.maxCards;
  }

  /**
   * Start card selection
   */
  startSelection(config: CardSelectionConfig): void {
    this.state = {
      isActive: true,
      config,
      selectedInstanceIds: new Set(),
    };
  }

  /**
   * Toggle a card's selection state
   */
  toggleCard(instanceId: string): void {
    if (!this.state.config) return;

    // Check if card is in available cards
    const isAvailable = this.state.config.availableCards.some((card) => card.instanceId === instanceId);
    if (!isAvailable) return;

    const newSelectedIds = new Set(this.state.selectedInstanceIds);

    if (newSelectedIds.has(instanceId)) {
      // Deselect
      newSelectedIds.delete(instanceId);
    } else {
      // Select (if not at max)
      if (newSelectedIds.size < this.state.config.maxCards) {
        newSelectedIds.add(instanceId);
      }
    }

    this.state.selectedInstanceIds = newSelectedIds;
  }

  /**
   * Confirm selection and execute callback
   */
  confirmSelection(): void {
    if (!this.state.config || !this.isValidSelection) return;

    const selectedIds = Array.from(this.state.selectedInstanceIds);
    const callback = this.state.config.onConfirm;

    // Reset state before executing callback
    this.reset();

    // Execute callback
    callback(selectedIds);
  }

  /**
   * Cancel selection without executing callback
   */
  cancelSelection(): void {
    const cancelCallback = this.state.config?.onCancel;

    // Reset state before executing callback
    this.reset();

    // Execute cancel callback if provided
    if (cancelCallback) {
      cancelCallback();
    }
  }

  /**
   * Reset selection state
   */
  reset(): void {
    this.state = createInitialState();
  }
}

/**
 * Export singleton instance
 */
export const cardSelectionStore = new CardSelectionStore();
