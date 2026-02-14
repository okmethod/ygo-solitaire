/**
 * GameStateInvariants - GameStateの整合性チェック
 *
 * @module domain/models/GameStateInvariants
 * @see {@link docs/domain/overview.md}
 * TODO: 現状未使用のため、GameState変更の際にチェックするようにする
 */

import type { GameState } from "$lib/domain/models/GameStateOld";
import type { GamePhase } from "$lib/domain/models/Phase";

/** 整合性チェック結果 */
interface ConsistencyAssessment {
  readonly isConsistent: boolean;
  readonly errors: readonly string[];
  // 別の評価結果と結合するメソッド
  and(next: ConsistencyAssessment): ConsistencyAssessment;
}

/** チェック結果を生成するファクトリ */
function assessment(errors: string[] = []): ConsistencyAssessment {
  return {
    isConsistent: errors.length === 0,
    errors,
    and(next: ConsistencyAssessment) {
      return assessment([...this.errors, ...next.errors]);
    },
  };
}

/** GameState 全体の整合性をチェックする */
export function validateGameState(state: GameState): ConsistencyAssessment {
  return validateZones(state)
    .and(validateLifePoints(state))
    .and(validatePhase(state))
    .and(validateTurn(state))
    .and(validateResult(state));
}

/**
 * ゲーム状態の整合性をアサートし、エラーがあれば例外をスローする
 *
 * @throws Error if validation fails
 */
export function assertValidGameState(state: GameState): void {
  const result = validateGameState(state);
  if (!result.isConsistent) {
    throw new Error(`Invalid GameState:\n${result.errors.join("\n")}`);
  }
}

// 数値範囲をチェックするヘルパー
const checkRange = (val: number, min: number, max: number, label: string): string[] => {
  const errs: string[] = [];
  if (!Number.isInteger(val)) {
    errs.push(`${label} must be an integer: ${val}`);
  }
  if (val < min || val > max) {
    errs.push(`${label} is out of bounds: ${val} (Allowed: ${min} to ${max})`);
  }
  return errs;
};

// ゾーンのlocationプロパティをチェックするヘルパー
const checkZoneLocation = (cards: readonly { location: string }[], expectedLocation: string): string[] => {
  const invalid = cards.filter((card) => card.location !== expectedLocation);
  return invalid.length > 0 ? [`${invalid.length} cards in ${expectedLocation} have incorrect location property`] : [];
};

/** 各ゾーンの整合性をチェックする */
export function validateZones(state: GameState): ConsistencyAssessment {
  const errors: string[] = [];

  // 各ゾーンの枚数チェック
  errors.push(...checkRange(state.zones.deck.length, 0, 60, "Deck size"));
  errors.push(...checkRange(state.zones.hand.length, 0, 10, "Hand size"));
  errors.push(...checkRange(state.zones.mainMonsterZone.length, 0, 5, "Main Monster Zone size"));
  errors.push(...checkRange(state.zones.spellTrapZone.length, 0, 5, "Spell/Trap Zone size"));
  errors.push(...checkRange(state.zones.fieldZone.length, 0, 1, "Field Zone size"));

  // 全ゾーンにわたるインスタンスIDの重複チェック
  const allInstances = [
    ...state.zones.deck,
    ...state.zones.hand,
    ...state.zones.mainMonsterZone,
    ...state.zones.spellTrapZone,
    ...state.zones.fieldZone,
    ...state.zones.graveyard,
    ...state.zones.banished,
  ];
  const instanceIds = allInstances.map((card) => card.instanceId);
  const duplicates = instanceIds.filter((id, index) => instanceIds.indexOf(id) !== index);
  if (duplicates.length > 0) {
    errors.push(`Duplicate card instance IDs found: ${duplicates.join(", ")}`);
  }

  // インスタンスIDとカードIDの存在チェック
  const invalidInstances = allInstances.filter((card) => !card.instanceId || !card.id);
  if (invalidInstances.length > 0) {
    errors.push(`Found ${invalidInstances.length} card instances with missing IDs`);
  }

  // 各ゾーンのlocationプロパティチェック
  errors.push(...checkZoneLocation(state.zones.deck, "deck"));
  errors.push(...checkZoneLocation(state.zones.hand, "hand"));
  errors.push(...checkZoneLocation(state.zones.mainMonsterZone, "mainMonsterZone"));
  errors.push(...checkZoneLocation(state.zones.spellTrapZone, "spellTrapZone"));
  errors.push(...checkZoneLocation(state.zones.fieldZone, "fieldZone"));
  errors.push(...checkZoneLocation(state.zones.graveyard, "graveyard"));
  errors.push(...checkZoneLocation(state.zones.banished, "banished"));

  return assessment(errors);
}

/** ライフポイントの整合性をチェックする */
export function validateLifePoints(state: GameState): ConsistencyAssessment {
  const errors: string[] = [];

  // ライフポイントチェック
  errors.push(...checkRange(state.lp.player, 0, 99999, "Player LP"));
  errors.push(...checkRange(state.lp.opponent, 0, 99999, "Opponent LP"));

  return assessment(errors);
}

/** フェーズの整合性をチェックする  */
export function validatePhase(state: GameState): ConsistencyAssessment {
  const errors: string[] = [];

  const validPhases: GamePhase[] = ["Draw", "Standby", "Main1", "End"];
  if (!validPhases.includes(state.phase)) {
    errors.push(`Invalid phase: ${state.phase}. Must be one of: ${validPhases.join(", ")}`);
  }

  return assessment(errors);
}

/** ターン数の整合性をチェックする */
export function validateTurn(state: GameState): ConsistencyAssessment {
  const errors: string[] = [];

  // ターン数チェック（checkRange を活用）
  errors.push(...checkRange(state.turn, 1, 999, "Turn"));

  return assessment(errors);
}

/** ゲーム結果の整合性をチェックする */
export function validateResult(state: GameState): ConsistencyAssessment {
  const errors: string[] = [];

  if (state.result.isGameOver) {
    // 勝者チェック
    if (!state.result.winner) {
      errors.push("Game is over but winner is not set");
    }
    if (state.result.winner && !["player", "opponent"].includes(state.result.winner)) {
      errors.push(`Invalid winner: ${state.result.winner}. Must be "player" or "opponent"`);
    }
    // ゲーム終了理由チェック
    if (!state.result.reason) {
      errors.push("Game is over but reason is not set");
    }
    if (state.result.reason && !["exodia", "lp0", "deckout"].includes(state.result.reason)) {
      errors.push(`Invalid reason: ${state.result.reason}. Must be "exodia", "lp0", or "deckout"`);
    }
  } else {
    // ゲーム進行中は、勝者と理由が未設定
    if (state.result.winner) {
      errors.push("Game is ongoing but winner is set");
    }
    if (state.result.reason) {
      errors.push("Game is ongoing but reason is set");
    }
  }

  return assessment(errors);
}
