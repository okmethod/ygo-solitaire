/**
 * GameFacade API Contract - Zone Architecture Expansion
 *
 * This contract defines the public API extensions for the GameFacade
 * to support monster summoning/setting and spell/trap setting operations.
 *
 * Feature: 014-zone-expansion
 * Date: 2026-01-03
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { CommandResult } from "$lib/domain/commands/GameCommand";

/**
 * GameFacade - Application Layer Entry Point
 *
 * Provides high-level game operations to the Presentation Layer.
 * All methods return CommandResult with success/failure status.
 */
export interface GameFacadeContract {
  // ========================================
  // Existing Methods (unchanged)
  // ========================================

  /**
   * Get current game state (readonly)
   */
  getState(): Readonly<GameState>;

  /**
   * Initialize a new game with deck recipe
   */
  startGame(deckRecipeId: string): CommandResult;

  /**
   * Advance to next phase
   */
  advancePhase(): CommandResult;

  /**
   * Draw card from deck to hand
   */
  drawCard(): CommandResult;

  /**
   * Activate spell card from hand
   */
  activateSpell(cardInstanceId: string): CommandResult;

  // ========================================
  // NEW METHODS - Zone Architecture Expansion
  // ========================================

  /**
   * Summon a monster card from hand to mainMonsterZone (face-up attack position)
   *
   * @param cardInstanceId - Instance ID of the monster card to summon
   * @returns CommandResult with success status and updated state
   *
   * Preconditions:
   * - Current phase must be Main1
   * - normalSummonUsed < normalSummonLimit (summon rights available)
   * - mainMonsterZone has available space (< 5 cards)
   * - Card must be in hand
   * - Card must be a monster card (type === "monster")
   *
   * Effects:
   * - Move card from hand to mainMonsterZone
   * - Set position to "faceUp", battlePosition to "attack"
   * - Set placedThisTurn to true
   * - Increment normalSummonUsed by 1
   *
   * Returns:
   * - success: true, newState: updated GameState
   * - success: false, message: error reason (if preconditions not met)
   */
  summonMonster(cardInstanceId: string): CommandResult;

  /**
   * Set a monster card from hand to mainMonsterZone (face-down defense position)
   *
   * @param cardInstanceId - Instance ID of the monster card to set
   * @returns CommandResult with success status and updated state
   *
   * Preconditions:
   * - Current phase must be Main1
   * - normalSummonUsed < normalSummonLimit (summon rights available)
   * - mainMonsterZone has available space (< 5 cards)
   * - Card must be in hand
   * - Card must be a monster card (type === "monster")
   *
   * Effects:
   * - Move card from hand to mainMonsterZone
   * - Set position to "faceDown", battlePosition to "defense"
   * - Set placedThisTurn to true
   * - Increment normalSummonUsed by 1
   *
   * Returns:
   * - success: true, newState: updated GameState
   * - success: false, message: error reason (if preconditions not met)
   */
  setMonster(cardInstanceId: string): CommandResult;

  /**
   * Set a spell/trap card from hand to spellTrapZone or fieldZone (face-down)
   *
   * @param cardInstanceId - Instance ID of the spell/trap card to set
   * @returns CommandResult with success status and updated state
   *
   * Preconditions:
   * - Current phase must be Main1
   * - Card must be in hand
   * - Card must be a spell or trap card
   * - If field spell: always allowed (existing field spell auto-sent to graveyard)
   * - If non-field spell/trap: spellTrapZone must have space (< 5 cards)
   *
   * Effects:
   * - If field spell (subtype === "Field"):
   *   - If fieldZone occupied, send existing field spell to graveyard
   *   - Move card from hand to fieldZone
   * - If non-field spell/trap:
   *   - Move card from hand to spellTrapZone
   * - Set position to "faceDown"
   * - Set placedThisTurn to true
   * - Does NOT consume summon rights
   *
   * Returns:
   * - success: true, newState: updated GameState
   * - success: false, message: error reason (if preconditions not met)
   */
  setSpellTrap(cardInstanceId: string): CommandResult;
}

/**
 * Usage Example (in Svelte component)
 *
 * ```typescript
 * import { gameFacade } from '$lib/application/GameFacade';
 *
 * function handleSummonClick(cardInstanceId: string) {
 *   const result = gameFacade.summonMonster(cardInstanceId);
 *   if (result.success) {
 *     console.log("Monster summoned successfully!");
 *   } else {
 *     console.error("Failed to summon:", result.message);
 *   }
 * }
 * ```
 */

/**
 * Command Execution Flow
 *
 * UI Component (Hands.svelte)
 *   │
 *   ├─→ gameFacade.summonMonster(id)
 *   │     │
 *   │     ├─→ new SummonMonsterCommand(id)
 *   │     ├─→ command.canExecute(state)
 *   │     └─→ command.execute(state)
 *   │           │
 *   │           ├─→ validate preconditions
 *   │           ├─→ moveCard(hand → mainMonsterZone)
 *   │           ├─→ increment normalSummonUsed
 *   │           └─→ return CommandResult
 *   │
 *   └─→ Update UI with new state
 */

/**
 * Error Codes
 *
 * Common error messages returned in CommandResult.message:
 * - "Main1フェーズではありません" - Not in Main1 phase
 * - "召喚権がありません" - No summon rights available
 * - "モンスターゾーンが満杯です" - Monster zone full
 * - "魔法・罠ゾーンが満杯です" - Spell/Trap zone full
 * - "手札にカードが見つかりません" - Card not in hand
 * - "モンスターカードではありません" - Not a monster card
 * - "魔法・罠カードではありません" - Not a spell/trap card
 * - "ゲームが終了しています" - Game is over
 */

/**
 * State Invariants
 *
 * After any command execution, the following must hold:
 * - normalSummonUsed <= normalSummonLimit
 * - zones.mainMonsterZone.length <= 5
 * - zones.spellTrapZone.length <= 5
 * - zones.fieldZone.length <= 1
 * - All cards in mainMonsterZone have battlePosition defined
 * - All cards in zones have location matching their zone name
 */
