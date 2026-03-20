/**
 * AtomicStep Effect Library - ステップライブラリ
 *
 * ステップの登録とエクスポートを行う。
 * DSLの "activations", "resolutions" セクションで使用するステップビルダーを登録する。
 *
 * @module domain/effects/steps
 */

// レジストリAPI
import { AtomicStepRegistry } from "./AtomicStepRegistry";
import { STEP_NAMES, type StepName } from "./StepNames";

// StepBuilder 実装
import { drawStepBuilder, fillHandsStepBuilder } from "./builders/draws";
import { selectAndDiscardStepBuilder, discardAllHandEndPhaseStepBuilder } from "./builders/discards";
import { thenStepBuilder } from "./builders/timing";
import { gainLpStepBuilder, payLpStepBuilder, burnDamageStepBuilder } from "./builders/lifePoints";
import {
  searchFromDeckStepBuilder,
  searchFromDeckByNameStepBuilder,
  searchFromDeckTopStepBuilder,
  searchMonsterByStatStepBuilder,
  salvageFromGraveyardStepBuilder,
} from "./builders/searches";
import { placeCounterStepBuilder, removeCounterStepBuilder } from "./builders/counters";
import { shuffleDeckStepBuilder } from "./builders/deckOperations";
import { selectReturnShuffleDrawStepBuilder } from "./builders/compositeOperations";
import { changeBattlePositionStepBuilder } from "./builders/battlePosition";
import {
  specialSummonFromDeckStepBuilder,
  specialSummonFromExtraDeckStepBuilder,
  selectTargetFromFieldByRaceStepBuilder,
  selectTargetFromGraveyardStepBuilder,
  specialSummonFromContextStepBuilder,
} from "./builders/summons";
import { releaseAndBurnStepBuilder, sendMonsterToGraveyardStepBuilder } from "./builders/releases";
import { selectAndBanishFromGraveyardStepBuilder } from "./builders/banishments";
import { saveTargetsToContextStepBuilder, clearContextStepBuilder } from "./builders/contextOperations";
import {
  establishEquipStepBuilder,
  sendEquippedAndSelfToGraveyardStepBuilder,
  unequipStepBuilder,
} from "./builders/equipOperations";

// ===========================
// エクスポート
// ===========================

export { AtomicStepRegistry };
export { STEP_NAMES, type StepName };
export const buildStep = AtomicStepRegistry.build.bind(AtomicStepRegistry);

// ===========================
// ステップ登録
// ===========================

const S = STEP_NAMES;

// ドロー・手札操作関連
AtomicStepRegistry.register(S.DRAW, drawStepBuilder);
AtomicStepRegistry.register(S.FILL_HANDS, fillHandsStepBuilder);
AtomicStepRegistry.register(S.SELECT_AND_DISCARD, selectAndDiscardStepBuilder);
AtomicStepRegistry.register(S.SELECT_RETURN_SHUFFLE_DRAW, selectReturnShuffleDrawStepBuilder);
AtomicStepRegistry.register(S.DISCARD_ALL_HAND_END_PHASE, discardAllHandEndPhaseStepBuilder);

// サーチ・サルベージ関連
AtomicStepRegistry.register(S.SEARCH_FROM_DECK, searchFromDeckStepBuilder);
AtomicStepRegistry.register(S.SEARCH_FROM_DECK_BY_NAME, searchFromDeckByNameStepBuilder);
AtomicStepRegistry.register(S.SEARCH_FROM_DECK_TOP, searchFromDeckTopStepBuilder);
AtomicStepRegistry.register(S.SEARCH_MONSTER_BY_STAT, searchMonsterByStatStepBuilder);
AtomicStepRegistry.register(S.SALVAGE_FROM_GRAVEYARD, salvageFromGraveyardStepBuilder);

// ライフポイント関連
AtomicStepRegistry.register(S.GAIN_LP, gainLpStepBuilder);
AtomicStepRegistry.register(S.PAY_LP, payLpStepBuilder);
AtomicStepRegistry.register(S.BURN_DAMAGE, burnDamageStepBuilder);

// カウンター関連
AtomicStepRegistry.register(S.PLACE_COUNTER, placeCounterStepBuilder);
AtomicStepRegistry.register(S.REMOVE_COUNTER, removeCounterStepBuilder);

// モンスター関連
AtomicStepRegistry.register(S.CHANGE_BATTLE_POSITION, changeBattlePositionStepBuilder);
AtomicStepRegistry.register(S.SPECIAL_SUMMON_FROM_DECK, specialSummonFromDeckStepBuilder);
AtomicStepRegistry.register(S.SPECIAL_SUMMON_FROM_EXTRA_DECK, specialSummonFromExtraDeckStepBuilder);
AtomicStepRegistry.register(S.SELECT_TARGET_FROM_FIELD_BY_RACE, selectTargetFromFieldByRaceStepBuilder);
AtomicStepRegistry.register(S.SELECT_TARGET_FROM_GRAVEYARD, selectTargetFromGraveyardStepBuilder);
AtomicStepRegistry.register(S.SPECIAL_SUMMON_FROM_CONTEXT, specialSummonFromContextStepBuilder);

// リリース関連
AtomicStepRegistry.register(S.RELEASE_AND_BURN, releaseAndBurnStepBuilder);
AtomicStepRegistry.register(S.SEND_MONSTER_TO_GRAVEYARD, sendMonsterToGraveyardStepBuilder);

// 除外関連
AtomicStepRegistry.register(S.SELECT_AND_BANISH_FROM_GRAVEYARD, selectAndBanishFromGraveyardStepBuilder);

// デッキ操作関連
AtomicStepRegistry.register(S.SHUFFLE_DECK, shuffleDeckStepBuilder);

// コンテキスト操作関連
AtomicStepRegistry.register(S.SAVE_TARGETS_TO_CONTEXT, saveTargetsToContextStepBuilder);
AtomicStepRegistry.register(S.CLEAR_CONTEXT, clearContextStepBuilder);

// 装備関連
AtomicStepRegistry.register(S.ESTABLISH_EQUIP, establishEquipStepBuilder);
AtomicStepRegistry.register(S.SEND_EQUIPPED_AND_SELF_TO_GRAVEYARD, sendEquippedAndSelfToGraveyardStepBuilder);
AtomicStepRegistry.register(S.UNEQUIP, unequipStepBuilder);

// その他
AtomicStepRegistry.register(S.THEN, thenStepBuilder);
