/**
 * DSLパーサーのテスト
 */

import { describe, it, expect } from "vitest";
import {
  parseCardDSL,
  parseMultipleCardDSL,
  isDSLParseError,
  isDSLValidationError,
} from "$lib/domain/dsl/core/parsers";
import { DSLParseError, DSLValidationError } from "$lib/domain/dsl/types";

// =============================================================================
// テストデータ
// =============================================================================

/** 有効な最小限の定義 */
const VALID_MINIMAL_YAML = `
id: 1111
data:
  jaName: "ダミーミニマムカード"
  type: "spell"
  frameType: "spell"
`;

/** 有効な通常魔法カード定義 */
const VALID_GRACEFUL_CHARITY_YAML = `
id: 22222
data:
  jaName: "ダミー天使の施し"
  type: "spell"
  frameType: "spell"
  spellType: "normal"
effectChainableActions:
  activations:
    conditions:
      requirements:
        - step: "CAN_DRAW"
          args: { count: 3 }
    resolutions:
      - step: "DRAW"
        args: { count: 3 }
      - step: "THEN"
      - step: "SELECT_AND_DISCARD"
        args: { count: 2 }
`;

/** 有効なモンスターカード定義 */
const VALID_MONSTER_YAML = `
id: 333333
data:
  jaName: "ダミー王立魔法図書館"
  type: "monster"
  frameType: "effect"
  race: "spellcaster"
  attribute: "light"
  level: 4
  attack: 0
  defense: 2000
effectAdditionalRules:
  continuous:
    - category: "TriggerRule"
      conditions:
        trigger:
          events:
            - "spellActivated"
      resolutions:
        - step: "PLACE_COUNTER"
          args: { count: 1, counterType: "SPELL_COUNTER" }
`;

/** 無効なYAML構文 */
const INVALID_YAML_SYNTAX = `
id: 4444444
data:
  jaName: "ダミー無効YAMLカード
  type: spell  # クォートなし、これは問題なし
`;

/** 必須フィールド欠落 */
const MISSING_REQUIRED_FIELD_YAML = `
data:
  jaName: "ダミー欠損カード"
  type: "spell"
  frameType: "spell"
`;

/** 不正なtype値 */
const INVALID_TYPE_VALUE_YAML = `
id: 55555555
data:
  jaName: "ダミー不正カード"
  type: "invalid_type"
  frameType: "spell"
`;

/** 空のYAML */
const EMPTY_YAML = ``;

// =============================================================================
// 正常系テスト
// =============================================================================

describe("parseCardDSL - 正常系", () => {
  it("最小限の定義をパースできる", () => {
    const result = parseCardDSL(VALID_MINIMAL_YAML);

    expect(result.id).toBe(1111);
    expect(result.data.jaName).toBe("ダミーミニマムカード");
    expect(result.data.type).toBe("spell");
    expect(result.data.frameType).toBe("spell");

    // オプションフィールドはundefined
    expect(result.data.spellType).toBeUndefined();
    expect(result["effectChainableActions"]).toBeUndefined();
  });

  it("有効な通常魔法カード定義をパースできる", () => {
    const result = parseCardDSL(VALID_GRACEFUL_CHARITY_YAML);

    expect(result.id).toBe(22222);
    expect(result.data.jaName).toBe("ダミー天使の施し");
    expect(result.data.type).toBe("spell");
    expect(result.data.frameType).toBe("spell");
    expect(result.data.spellType).toBe("normal");

    // effectChainableActions の検証
    const actions = result["effectChainableActions"];
    expect(actions).toBeDefined();
    expect(actions?.activations?.conditions?.requirements).toHaveLength(1);
    expect(actions?.activations?.conditions?.requirements?.[0].step).toBe("CAN_DRAW");
    expect(actions?.activations?.resolutions).toHaveLength(3);
  });

  it("有効なモンスターカード定義をパースできる", () => {
    const result = parseCardDSL(VALID_MONSTER_YAML);

    expect(result.id).toBe(333333);
    expect(result.data.jaName).toBe("ダミー王立魔法図書館");
    expect(result.data.type).toBe("monster");
    expect(result.data.frameType).toBe("effect");
    expect(result.data.race).toBe("spellcaster");
    expect(result.data.attribute).toBe("light");
    expect(result.data.level).toBe(4);

    // effectAdditionalRules の検証（PSCT準拠構造）
    const rules = result["effectAdditionalRules"];
    expect(rules).toBeDefined();
    expect(rules?.continuous).toHaveLength(1);
    expect(rules?.continuous?.[0].category).toBe("TriggerRule");
    expect(rules?.continuous?.[0].conditions?.trigger?.events).toContain("spellActivated");
  });
});

// =============================================================================
// 異常系テスト
// =============================================================================

describe("parseCardDSL - 異常系", () => {
  it("無効なYAML構文でDSLParseErrorを投げる", () => {
    expect(() => parseCardDSL(INVALID_YAML_SYNTAX)).toThrow(DSLParseError);
  });

  it("必須フィールド欠落でDSLValidationErrorを投げる", () => {
    expect(() => parseCardDSL(MISSING_REQUIRED_FIELD_YAML)).toThrow(DSLValidationError);

    try {
      parseCardDSL(MISSING_REQUIRED_FIELD_YAML);
    } catch (error) {
      expect(isDSLValidationError(error)).toBe(true);
      if (isDSLValidationError(error)) {
        // issuesにエラー詳細が含まれる
        expect(error.issues.length).toBeGreaterThan(0);
        expect(error.issues.some((i) => i.includes("id"))).toBe(true);
      }
    }
  });

  it("不正なtype値でDSLValidationErrorを投げる", () => {
    expect(() => parseCardDSL(INVALID_TYPE_VALUE_YAML)).toThrow(DSLValidationError);

    try {
      parseCardDSL(INVALID_TYPE_VALUE_YAML);
    } catch (error) {
      expect(isDSLValidationError(error)).toBe(true);
      if (isDSLValidationError(error)) {
        expect(error.cardId).toBe(55555555);
        expect(error.issues.some((i) => i.includes("type"))).toBe(true);
      }
    }
  });

  it("空のYAMLでDSLParseErrorを投げる", () => {
    expect(() => parseCardDSL(EMPTY_YAML)).toThrow(DSLParseError);
  });

  it("nullでDSLParseErrorを投げる", () => {
    expect(() => parseCardDSL("null")).toThrow(DSLParseError);

    try {
      parseCardDSL("null");
    } catch (error) {
      expect(isDSLParseError(error)).toBe(true);
      if (isDSLParseError(error)) {
        expect(error.message).toContain("empty or null");
      }
    }
  });
});

// =============================================================================
// 複数パーステスト
// =============================================================================

describe("parseMultipleCardDSL", () => {
  it("複数のYAML定義を一括パースできる", () => {
    const results = parseMultipleCardDSL([VALID_MINIMAL_YAML, VALID_GRACEFUL_CHARITY_YAML]);

    expect(results).toHaveLength(2);
    expect(results[0].id).toBe(1111);
    expect(results[1].id).toBe(22222);
  });

  it("最初のエラーで停止する", () => {
    expect(() =>
      parseMultipleCardDSL([VALID_MINIMAL_YAML, INVALID_TYPE_VALUE_YAML, VALID_GRACEFUL_CHARITY_YAML]),
    ).toThrow(DSLValidationError);
  });
});

// =============================================================================
// 型ガードテスト
// =============================================================================

describe("型ガード関数", () => {
  it("isDSLParseErrorがDSLParseErrorを識別する", () => {
    const parseError = new DSLParseError("test error");
    const validationError = new DSLValidationError("test", 123, "field", ["issue"]);
    const genericError = new Error("generic");

    expect(isDSLParseError(parseError)).toBe(true);
    expect(isDSLParseError(validationError)).toBe(false);
    expect(isDSLParseError(genericError)).toBe(false);
    expect(isDSLParseError(null)).toBe(false);
  });

  it("isDSLValidationErrorがDSLValidationErrorを識別する", () => {
    const parseError = new DSLParseError("test error");
    const validationError = new DSLValidationError("test", 123, "field", ["issue"]);
    const genericError = new Error("generic");

    expect(isDSLValidationError(validationError)).toBe(true);
    expect(isDSLValidationError(parseError)).toBe(false);
    expect(isDSLValidationError(genericError)).toBe(false);
    expect(isDSLValidationError(undefined)).toBe(false);
  });
});
