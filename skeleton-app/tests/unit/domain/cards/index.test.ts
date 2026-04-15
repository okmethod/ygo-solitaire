/**
 * カードデータライブラリ登録関数のテスト
 *
 * TEST STRATEGY:
 * - registerCardDataByIds: DSL定義優先、マップフォールバック
 * - registerCardDataWithEffectsByIds: トークン事前登録、効果一括登録
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { registerCardDataByIds, registerCardDataWithEffectsByIds, CardDataRegistry } from "$lib/domain/cards";
import { ChainableActionRegistry } from "$lib/domain/effects/actions";
import { AdditionalRuleRegistry } from "$lib/domain/effects/rules";
import { ACTUAL_CARD_IDS, DUMMY_CARD_IDS } from "../../../__testUtils__";

// =============================================================================
// テストセットアップ
// =============================================================================

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
    registerCardDataByIds([ACTUAL_CARD_IDS.POT_OF_GREED]);

    expect(CardDataRegistry.has(ACTUAL_CARD_IDS.POT_OF_GREED)).toBe(true);

    const cardData = CardDataRegistry.get(ACTUAL_CARD_IDS.POT_OF_GREED);
    expect(cardData.id).toBe(ACTUAL_CARD_IDS.POT_OF_GREED);
    expect(cardData.type).toBe("spell");
  });

  it("複数のDSL定義カードを登録できる", () => {
    registerCardDataByIds([ACTUAL_CARD_IDS.POT_OF_GREED, ACTUAL_CARD_IDS.ROYAL_MAGIC_LIBRARY]);

    expect(CardDataRegistry.has(ACTUAL_CARD_IDS.POT_OF_GREED)).toBe(true);
    expect(CardDataRegistry.has(ACTUAL_CARD_IDS.ROYAL_MAGIC_LIBRARY)).toBe(true);
  });

  it("マップにのみ存在するカードを登録できる", () => {
    registerCardDataByIds([ACTUAL_CARD_IDS.JAR_OF_GREED]);

    expect(CardDataRegistry.has(ACTUAL_CARD_IDS.JAR_OF_GREED)).toBe(true);

    const cardData = CardDataRegistry.get(ACTUAL_CARD_IDS.JAR_OF_GREED);
    expect(cardData.id).toBe(ACTUAL_CARD_IDS.JAR_OF_GREED);
    expect(cardData.type).toBe("trap");
    expect(cardData.jaName).toBe("強欲な瓶");
  });

  it("DSL定義とマップ定義を混在して登録できる", () => {
    registerCardDataByIds([ACTUAL_CARD_IDS.POT_OF_GREED, ACTUAL_CARD_IDS.JAR_OF_GREED]);

    expect(CardDataRegistry.has(ACTUAL_CARD_IDS.POT_OF_GREED)).toBe(true);
    expect(CardDataRegistry.has(ACTUAL_CARD_IDS.JAR_OF_GREED)).toBe(true);
  });

  it("登録前にレジストリがクリアされる", () => {
    // 事前に別のカードを登録
    CardDataRegistry.register(DUMMY_CARD_IDS.NOT_EXISTING_CARD, {
      jaName: "Test Card",
      type: "monster",
      frameType: "normal",
      edition: "latest",
    });
    expect(CardDataRegistry.has(DUMMY_CARD_IDS.NOT_EXISTING_CARD)).toBe(true);

    // registerCardDataByIds を呼び出す
    registerCardDataByIds([ACTUAL_CARD_IDS.POT_OF_GREED]);

    // 事前に登録したカードはクリアされる
    expect(CardDataRegistry.has(DUMMY_CARD_IDS.NOT_EXISTING_CARD)).toBe(false);
    expect(CardDataRegistry.has(ACTUAL_CARD_IDS.POT_OF_GREED)).toBe(true);
  });

  it("存在しないカードIDは無視される", () => {
    registerCardDataByIds([ACTUAL_CARD_IDS.POT_OF_GREED, DUMMY_CARD_IDS.NOT_EXISTING_CARD]);

    expect(CardDataRegistry.has(ACTUAL_CARD_IDS.POT_OF_GREED)).toBe(true);
    expect(CardDataRegistry.has(DUMMY_CARD_IDS.NOT_EXISTING_CARD)).toBe(false);
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
    registerCardDataWithEffectsByIds([ACTUAL_CARD_IDS.POT_OF_GREED]);

    expect(CardDataRegistry.has(ACTUAL_CARD_IDS.POT_OF_GREED)).toBe(true);
    // 効果も登録される（強欲な壺は ChainableAction を持つ）
    expect(ChainableActionRegistry.getActivation(ACTUAL_CARD_IDS.POT_OF_GREED)).toBeDefined();
  });

  it("効果モンスターのカードデータと効果を登録できる", () => {
    registerCardDataWithEffectsByIds([ACTUAL_CARD_IDS.ROYAL_MAGIC_LIBRARY]);

    expect(CardDataRegistry.has(ACTUAL_CARD_IDS.ROYAL_MAGIC_LIBRARY)).toBe(true);
  });

  it("トークンカードが事前登録される", () => {
    // トークンを含まないカードリストでも登録
    registerCardDataWithEffectsByIds([ACTUAL_CARD_IDS.POT_OF_GREED]);

    // トークンカードが登録されている
    expect(CardDataRegistry.has(ACTUAL_CARD_IDS.METAL_FIEND_TOKEN)).toBe(true);
  });

  it("マップにのみ存在するカードと効果を登録できる", () => {
    registerCardDataWithEffectsByIds([ACTUAL_CARD_IDS.JAR_OF_GREED]);

    expect(CardDataRegistry.has(ACTUAL_CARD_IDS.JAR_OF_GREED)).toBe(true);
  });

  it("登録前に全レジストリがクリアされる", () => {
    // 事前にカードを登録
    CardDataRegistry.register(99999, {
      jaName: "Test Card",
      type: "monster",
      frameType: "normal",
      edition: "latest",
    });

    registerCardDataWithEffectsByIds([ACTUAL_CARD_IDS.POT_OF_GREED]);

    // 事前に登録したカードはクリアされる
    expect(CardDataRegistry.has(99999)).toBe(false);
    expect(CardDataRegistry.has(ACTUAL_CARD_IDS.POT_OF_GREED)).toBe(true);
  });

  it("空の配列でもトークンは登録される", () => {
    registerCardDataWithEffectsByIds([]);

    // トークンカードは登録される
    expect(CardDataRegistry.has(ACTUAL_CARD_IDS.METAL_FIEND_TOKEN)).toBe(true);
  });
});
