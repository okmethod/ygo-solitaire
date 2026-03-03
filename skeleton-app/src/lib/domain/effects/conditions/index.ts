/**
 * AtomicCondition Effect Library - 条件ライブラリ
 *
 * 条件の登録とエクスポートを行う。
 * DSLの "conditions" セクションで使用する条件チェック関数を登録する。
 *
 * @module domain/effects/conditions
 */

// レジストリAPI
import { AtomicConditionRegistry, type ConditionChecker } from "./AtomicConditionRegistry";
import { CONDITION_NAMES, type ConditionName } from "./ConditionNames";

// ConditionChecker 実装
import { canDrawCondition, deckHasCardCondition, deckHasNameIncludesCondition } from "./builders/deckConditions";
import { handCountCondition, handCountExcludingSelfCondition, handHasSpellCondition } from "./builders/handConditions";
import { graveyardHasSpellCondition, graveyardHasMonsterCondition } from "./builders/graveyardConditions";
import { hasCounterCondition } from "./builders/counterConditions";
import { oncePerTurnCondition, oncePerTurnEffectCondition } from "./builders/activationConditions";
import { lpAtLeastCondition, lpGreaterThanCondition } from "./builders/lpConditions";

// ===========================
// エクスポート
// ===========================

export { AtomicConditionRegistry, type ConditionChecker };
export { CONDITION_NAMES, type ConditionName };
export const checkCondition = AtomicConditionRegistry.check.bind(AtomicConditionRegistry);

// ===========================
// 条件登録
// ===========================

const C = CONDITION_NAMES;

// デッキ関連
AtomicConditionRegistry.register(C.CAN_DRAW, canDrawCondition);
AtomicConditionRegistry.register(C.DECK_HAS_CARD, deckHasCardCondition);
AtomicConditionRegistry.register(C.DECK_HAS_NAME_INCLUDES, deckHasNameIncludesCondition);

// 手札関連
AtomicConditionRegistry.register(C.HAND_COUNT, handCountCondition);
AtomicConditionRegistry.register(C.HAND_COUNT_EXCLUDING_SELF, handCountExcludingSelfCondition);
AtomicConditionRegistry.register(C.HAND_HAS_SPELL, handHasSpellCondition);

// 墓地関連
AtomicConditionRegistry.register(C.GRAVEYARD_HAS_SPELL, graveyardHasSpellCondition);
AtomicConditionRegistry.register(C.GRAVEYARD_HAS_MONSTER, graveyardHasMonsterCondition);

// カウンター関連
AtomicConditionRegistry.register(C.HAS_COUNTER, hasCounterCondition);

// 発動条件関連
AtomicConditionRegistry.register(C.ONCE_PER_TURN, oncePerTurnCondition);
AtomicConditionRegistry.register(C.ONCE_PER_TURN_EFFECT, oncePerTurnEffectCondition);

// LP関連
AtomicConditionRegistry.register(C.LP_AT_LEAST, lpAtLeastCondition);
AtomicConditionRegistry.register(C.LP_GREATER_THAN, lpGreaterThanCondition);
