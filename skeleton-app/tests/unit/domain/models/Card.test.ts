import { describe, it, expect } from "vitest";
import { isCardData, isMonsterCard, isSpellCard, isTrapCard } from "$lib/domain/models/Card";
import type { CardData } from "$lib/domain/models/Card";

describe("isCardData (T026)", () => {
  it("should return true for valid CardData - monster", () => {
    const validData: CardData = {
      id: 33396948,
      type: "monster",
    };

    expect(isCardData(validData)).toBe(true);
  });

  it("should return true for CardData with optional frameType", () => {
    const validData: CardData = {
      id: 33396948,
      type: "monster",
      frameType: "effect",
    };

    expect(isCardData(validData)).toBe(true);
  });

  it("should return true for spell type", () => {
    const validData: CardData = {
      id: 55144522,
      type: "spell",
    };

    expect(isCardData(validData)).toBe(true);
  });

  it("should return true for trap type", () => {
    const validData: CardData = {
      id: 12345678,
      type: "trap",
    };

    expect(isCardData(validData)).toBe(true);
  });

  it("should return false for null", () => {
    expect(isCardData(null)).toBe(false);
  });

  it("should return false for undefined", () => {
    expect(isCardData(undefined)).toBe(false);
  });

  it("should return false for non-object", () => {
    expect(isCardData("string")).toBe(false);
    expect(isCardData(123)).toBe(false);
    expect(isCardData(true)).toBe(false);
  });

  it("should return false for missing id", () => {
    const invalidData = {
      type: "monster",
    };

    expect(isCardData(invalidData)).toBe(false);
  });

  it("should return false for missing type", () => {
    const invalidData = {
      id: 33396948,
    };

    expect(isCardData(invalidData)).toBe(false);
  });

  it("should return false for invalid id type", () => {
    const invalidData = {
      id: "33396948", // should be number
      type: "monster",
    };

    expect(isCardData(invalidData)).toBe(false);
  });

  it("should return false for invalid type value", () => {
    const invalidData = {
      id: 33396948,
      type: "invalid-type", // should be "monster" | "spell" | "trap"
    };

    expect(isCardData(invalidData)).toBe(false);
  });

  it("should return false for invalid frameType type", () => {
    const invalidData = {
      id: 33396948,
      type: "monster",
      frameType: 123, // should be string
    };

    expect(isCardData(invalidData)).toBe(false);
  });
});

describe("isMonsterCard (T027)", () => {
  it("should return true for monster card", () => {
    const monsterCard: CardData = {
      id: 33396948,
      type: "monster",
    };

    expect(isMonsterCard(monsterCard)).toBe(true);
  });

  it("should return false for spell card", () => {
    const spellCard: CardData = {
      id: 55144522,
      type: "spell",
    };

    expect(isMonsterCard(spellCard)).toBe(false);
  });

  it("should return false for trap card", () => {
    const trapCard: CardData = {
      id: 12345678,
      type: "trap",
    };

    expect(isMonsterCard(trapCard)).toBe(false);
  });
});

describe("isSpellCard (T027)", () => {
  it("should return true for spell card", () => {
    const spellCard: CardData = {
      id: 55144522,
      type: "spell",
    };

    expect(isSpellCard(spellCard)).toBe(true);
  });

  it("should return false for monster card", () => {
    const monsterCard: CardData = {
      id: 33396948,
      type: "monster",
    };

    expect(isSpellCard(monsterCard)).toBe(false);
  });

  it("should return false for trap card", () => {
    const trapCard: CardData = {
      id: 12345678,
      type: "trap",
    };

    expect(isSpellCard(trapCard)).toBe(false);
  });
});

describe("isTrapCard (T027)", () => {
  it("should return true for trap card", () => {
    const trapCard: CardData = {
      id: 12345678,
      type: "trap",
    };

    expect(isTrapCard(trapCard)).toBe(true);
  });

  it("should return false for monster card", () => {
    const monsterCard: CardData = {
      id: 33396948,
      type: "monster",
    };

    expect(isTrapCard(monsterCard)).toBe(false);
  });

  it("should return false for spell card", () => {
    const spellCard: CardData = {
      id: 55144522,
      type: "spell",
    };

    expect(isTrapCard(spellCard)).toBe(false);
  });
});
