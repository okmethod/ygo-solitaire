/**
 * Card モデル
 *
 * これらはプレーンなオブジェクトとして実装し、クラス化しない。
 * （理由: 不変性担保 / Svelte 5 Runes での変更追跡性 / シリアライズ可能）
 *
 * 代わりに名前空間としてエクスポートし、純粋関数をクラスライクに利用できるようにする。
 *
 * @module domain/models/Card
 * @see {@link docs/domain/card-model.md}
 */

export type {
  CardData,
  CardType,
  FrameSubType,
  MainMonsterSubType,
  ExtraMonsterSubType,
  SpellSubType,
  TrapSubType,
} from "./CardData";
export type { CardInstance } from "./CardInstance";
export type { StateOnField } from "./StateOnField";
export type { CounterType, CounterState } from "./Counter";

import * as CardDataFuncs from "./CardData";
import * as CardInstanceFuncs from "./CardInstance";
import * as CounterFuncs from "./Counter";

/* Card 名前空間
 *
 * カードに関する純粋関数（ロジック）を階層的に集約する。
 */
export const Card = {
  isMonster: CardDataFuncs.isMonsterCard,
  isSpell: CardDataFuncs.isSpellCard,
  isTrap: CardDataFuncs.isTrapCard,
  isNormalSpell: CardDataFuncs.isNormalSpellCard,
  isQuickPlaySpell: CardDataFuncs.isQuickPlaySpellCard,
  isFieldSpell: CardDataFuncs.isFieldSpellCard,

  Instance: {
    inHand: CardInstanceFuncs.inHand,
    onField: CardInstanceFuncs.onField,
    inGraveyard: CardInstanceFuncs.inGraveyard,
    isBanished: CardInstanceFuncs.isBanished,
    isFaceUp: CardInstanceFuncs.isFaceUp,
    isFaceDown: CardInstanceFuncs.isFaceDown,
    isAttackPosition: CardInstanceFuncs.isAttackPosition,
    isDefensePosition: CardInstanceFuncs.isDefensePosition,
    moved: CardInstanceFuncs.movedInstance,
    placedOnField: CardInstanceFuncs.placedOnFieldInstance,
    leavedFromField: CardInstanceFuncs.leavedFromFieldInstance,
    updatedState: CardInstanceFuncs.updateCardStateInPlace,
  },

  Counter: {
    updatedCounters: CounterFuncs.updateCounters,
    getCounterCount: CounterFuncs.getCounterCount,
  },
} as const;
