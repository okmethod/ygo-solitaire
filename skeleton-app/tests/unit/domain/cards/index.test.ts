/**
 * cards/index.ts のテスト
 *
 * カードデータライブラリの登録関数を検証する。
 *
 * TEST STRATEGY:
 * - registerCardDataByIds: DSL定義優先、マップフォールバック
 * - registerCardDataWithEffectsByIds: トークン事前登録、効果一括登録
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  registerCardDataByIds,
  registerCardDataWithEffectsByIds,
  TOKEN_CARD_IDS,
  CardDataRegistry,
} from "$lib/domain/cards";
import { ChainableActionRegistry } from "$lib/domain/effects/actions";
import { AdditionalRuleRegistry } from "$lib/domain/effects/rules";

// =============================================================================
// テストセットアップ
// =============================================================================

// DSL定義が存在するカードID
const DSL_DEFINED_CARD_ID = 55144522; // 強欲な壺（Pot of Greed）
const DSL_DEFINED_MONSTER_ID = 33396948; // 封印されしエクゾディア
const DSL_DEFINED_EFFECT_MONSTER_ID = 70791313; // 王立魔法図書館

// マップにのみ存在するカードID
const MAP_ONLY_CARD_ID = 83968380; // 強欲な瓶（罠カード）

// トークンカードID
const TOKEN_CARD_ID = 24874631; // メタルデビル・トークン

beforeEach(() => {
  CardDataRegistry.clear();
  ChainableActionRegistry.clear();
  AdditionalRuleRegistry.clear();
});

afterEach(() => {
  CardDataRegistry.clear();
  ChainableActionRegistry.clear();
  AdditionalRuleRegistry.clear();
});

// =============================================================================
// registerCardDataByIds テスト
// =============================================================================

describe("registerCardDataByIds", () => {
  it("DSL定義が存在するカードを登録できる", () => {
    registerCardDataByIds([DSL_DEFINED_CARD_ID]);

    expect(CardDataRegistry.has(DSL_DEFINED_CARD_ID)).toBe(true);

    const cardData = CardDataRegistry.get(DSL_DEFINED_CARD_ID);
    expect(cardData.id).toBe(DSL_DEFINED_CARD_ID);
    expect(cardData.type).toBe("spell");
  });

  it("複数のDSL定義カードを登録できる", () => {
    registerCardDataByIds([DSL_DEFINED_CARD_ID, DSL_DEFINED_MONSTER_ID]);

    expect(CardDataRegistry.has(DSL_DEFINED_CARD_ID)).toBe(true);
    expect(CardDataRegistry.has(DSL_DEFINED_MONSTER_ID)).toBe(true);
  });

  it("マップにのみ存在するカードを登録できる", () => {
    registerCardDataByIds([MAP_ONLY_CARD_ID]);

    expect(CardDataRegistry.has(MAP_ONLY_CARD_ID)).toBe(true);

    const cardData = CardDataRegistry.get(MAP_ONLY_CARD_ID);
    expect(cardData.id).toBe(MAP_ONLY_CARD_ID);
    expect(cardData.type).toBe("trap");
    expect(cardData.jaName).toBe("強欲な瓶");
  });

  it("DSL定義とマップ定義を混在して登録できる", () => {
    registerCardDataByIds([DSL_DEFINED_CARD_ID, MAP_ONLY_CARD_ID]);

    expect(CardDataRegistry.has(DSL_DEFINED_CARD_ID)).toBe(true);
    expect(CardDataRegistry.has(MAP_ONLY_CARD_ID)).toBe(true);
  });

  it("登録前にレジストリがクリアされる", () => {
    // 事前に別のカードを登録
    CardDataRegistry.register(99999, {
      jaName: "Test Card",
      type: "monster",
      frameType: "normal",
      edition: "latest",
    });
    expect(CardDataRegistry.has(99999)).toBe(true);

    // registerCardDataByIds を呼び出す
    registerCardDataByIds([DSL_DEFINED_CARD_ID]);

    // 事前に登録したカードはクリアされる
    expect(CardDataRegistry.has(99999)).toBe(false);
    expect(CardDataRegistry.has(DSL_DEFINED_CARD_ID)).toBe(true);
  });

  it("存在しないカードIDは無視される", () => {
    const nonExistentId = 999999999;

    registerCardDataByIds([DSL_DEFINED_CARD_ID, nonExistentId]);

    expect(CardDataRegistry.has(DSL_DEFINED_CARD_ID)).toBe(true);
    expect(CardDataRegistry.has(nonExistentId)).toBe(false);
  });

  it("空の配列でもエラーにならない", () => {
    expect(() => registerCardDataByIds([])).not.toThrow();
  });
});

// =============================================================================
// registerCardDataWithEffectsByIds テスト
// =============================================================================

describe("registerCardDataWithEffectsByIds", () => {
  it("DSL定義が存在するカードと効果を登録できる", () => {
    registerCardDataWithEffectsByIds([DSL_DEFINED_CARD_ID]);

    expect(CardDataRegistry.has(DSL_DEFINED_CARD_ID)).toBe(true);
    // 効果も登録される（強欲な壺は ChainableAction を持つ）
    expect(ChainableActionRegistry.getActivation(DSL_DEFINED_CARD_ID)).toBeDefined();
  });

  it("効果モンスターのカードデータと効果を登録できる", () => {
    registerCardDataWithEffectsByIds([DSL_DEFINED_EFFECT_MONSTER_ID]);

    expect(CardDataRegistry.has(DSL_DEFINED_EFFECT_MONSTER_ID)).toBe(true);
  });

  it("トークンカードが事前登録される", () => {
    // トークンを含まないカードリストでも登録
    registerCardDataWithEffectsByIds([DSL_DEFINED_CARD_ID]);

    // トークンカードが登録されている
    expect(CardDataRegistry.has(TOKEN_CARD_ID)).toBe(true);
  });

  it("TOKEN_CARD_IDS にトークンIDが含まれている", () => {
    expect(TOKEN_CARD_IDS).toContain(TOKEN_CARD_ID);
  });

  it("マップにのみ存在するカードと効果を登録できる", () => {
    registerCardDataWithEffectsByIds([MAP_ONLY_CARD_ID]);

    expect(CardDataRegistry.has(MAP_ONLY_CARD_ID)).toBe(true);
  });

  it("登録前に全レジストリがクリアされる", () => {
    // 事前にカードを登録
    CardDataRegistry.register(99999, {
      jaName: "Test Card",
      type: "monster",
      frameType: "normal",
      edition: "latest",
    });

    registerCardDataWithEffectsByIds([DSL_DEFINED_CARD_ID]);

    // 事前に登録したカードはクリアされる
    expect(CardDataRegistry.has(99999)).toBe(false);
    expect(CardDataRegistry.has(DSL_DEFINED_CARD_ID)).toBe(true);
  });

  it("空の配列でもトークンは登録される", () => {
    registerCardDataWithEffectsByIds([]);

    // トークンカードは登録される
    expect(CardDataRegistry.has(TOKEN_CARD_ID)).toBe(true);
  });
});
