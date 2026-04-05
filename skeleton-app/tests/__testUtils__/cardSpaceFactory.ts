/**
 * テスト用カードスペース ファクトリ
 *
 * CardSpace の各ゾーンを表す Partial<CardSpace> を生成するユーティリティ関数群
 * （テストシナリオで GameSnapshot の space フィールドに spread して使用する）
 *
 * - createMonsterZone: モンスターゾーンを n 体で埋めた状態
 * - createSpellZone: 魔法・罠ゾーンを n 枚で埋めた状態
 */

import type { CardSpace } from "$lib/domain/models/GameState";
import { createMonsterOnField, createSpellOnField } from "./cardInstanceFactory";
import { TEST_CARD_IDS } from "./constants";

/**
 * フィールドに n 体のモンスターを配置したゾーン状態を返す
 *
 * instanceId は "monster-0", "monster-1", ... の形式で生成される。
 *
 * @param count - モンスター数
 * @param options - オプション設定
 * @returns `{ mainMonsterZone: CardInstance[] }`
 */
export function createMonsterZone(
  count: number,
  options?: { position?: "faceUp" | "faceDown" },
): Pick<CardSpace, "mainMonsterZone"> {
  return {
    mainMonsterZone: Array.from({ length: count }, (_, i) =>
      createMonsterOnField(TEST_CARD_IDS.DUMMY, `monster-${i}`, { position: options?.position }),
    ),
  };
}

/**
 * 魔法・罠ゾーンを n 枚の通常魔法で埋めたゾーン状態を返す
 *
 * instanceId は "spell-0", "spell-1", ... の形式で生成される。
 *
 * @param count - 魔法カード数
 * @returns `{ spellTrapZone: CardInstance[] }`
 */
export function createSpellZone(count: number): Pick<CardSpace, "spellTrapZone"> {
  return {
    spellTrapZone: Array.from({ length: count }, (_, i) =>
      createSpellOnField(TEST_CARD_IDS.SPELL_NORMAL, `spell-${i}`, { position: "faceUp" }),
    ),
  };
}
