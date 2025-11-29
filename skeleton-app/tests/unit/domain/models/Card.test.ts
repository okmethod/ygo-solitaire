import { describe, it, expect } from "vitest";
import { isDomainCardData, isDomainMonsterCard, isDomainSpellCard, isDomainTrapCard } from "$lib/domain/models/Card";
import type { DomainCardData } from "$lib/domain/models/Card";

describe("isDomainCardData (T026)", () => {
  it("should return true for valid DomainCardData - monster", () => {
    const validData: DomainCardData = {
      id: 33396948,
      type: "monster",
    };

    expect(isDomainCardData(validData)).toBe(true);
  });

  it("should return true for DomainCardData with optional frameType", () => {
    const validData: DomainCardData = {
      id: 33396948,
      type: "monster",
      frameType: "effect",
    };

    expect(isDomainCardData(validData)).toBe(true);
  });

  it("should return true for spell type", () => {
    const validData: DomainCardData = {
      id: 55144522,
      type: "spell",
    };

    expect(isDomainCardData(validData)).toBe(true);
  });

  it("should return true for trap type", () => {
    const validData: DomainCardData = {
      id: 12345678,
      type: "trap",
    };

    expect(isDomainCardData(validData)).toBe(true);
  });

  it("should return false for null", () => {
    expect(isDomainCardData(null)).toBe(false);
  });

  it("should return false for undefined", () => {
    expect(isDomainCardData(undefined)).toBe(false);
  });

  it("should return false for non-object", () => {
    expect(isDomainCardData("string")).toBe(false);
    expect(isDomainCardData(123)).toBe(false);
    expect(isDomainCardData(true)).toBe(false);
  });

  it("should return false for missing id", () => {
    const invalidData = {
      type: "monster",
    };

    expect(isDomainCardData(invalidData)).toBe(false);
  });

  it("should return false for missing type", () => {
    const invalidData = {
      id: 33396948,
    };

    expect(isDomainCardData(invalidData)).toBe(false);
  });

  it("should return false for invalid id type", () => {
    const invalidData = {
      id: "33396948", // should be number
      type: "monster",
    };

    expect(isDomainCardData(invalidData)).toBe(false);
  });

  it("should return false for invalid type value", () => {
    const invalidData = {
      id: 33396948,
      type: "invalid-type", // should be "monster" | "spell" | "trap"
    };

    expect(isDomainCardData(invalidData)).toBe(false);
  });

  it("should return false for invalid frameType type", () => {
    const invalidData = {
      id: 33396948,
      type: "monster",
      frameType: 123, // should be string
    };

    expect(isDomainCardData(invalidData)).toBe(false);
  });
});

describe("isDomainMonsterCard (T027)", () => {
  it("should return true for monster card", () => {
    const monsterCard: DomainCardData = {
      id: 33396948,
      type: "monster",
    };

    expect(isDomainMonsterCard(monsterCard)).toBe(true);
  });

  it("should return false for spell card", () => {
    const spellCard: DomainCardData = {
      id: 55144522,
      type: "spell",
    };

    expect(isDomainMonsterCard(spellCard)).toBe(false);
  });

  it("should return false for trap card", () => {
    const trapCard: DomainCardData = {
      id: 12345678,
      type: "trap",
    };

    expect(isDomainMonsterCard(trapCard)).toBe(false);
  });
});

describe("isDomainSpellCard (T027)", () => {
  it("should return true for spell card", () => {
    const spellCard: DomainCardData = {
      id: 55144522,
      type: "spell",
    };

    expect(isDomainSpellCard(spellCard)).toBe(true);
  });

  it("should return false for monster card", () => {
    const monsterCard: DomainCardData = {
      id: 33396948,
      type: "monster",
    };

    expect(isDomainSpellCard(monsterCard)).toBe(false);
  });

  it("should return false for trap card", () => {
    const trapCard: DomainCardData = {
      id: 12345678,
      type: "trap",
    };

    expect(isDomainSpellCard(trapCard)).toBe(false);
  });
});

describe("isDomainTrapCard (T027)", () => {
  it("should return true for trap card", () => {
    const trapCard: DomainCardData = {
      id: 12345678,
      type: "trap",
    };

    expect(isDomainTrapCard(trapCard)).toBe(true);
  });

  it("should return false for monster card", () => {
    const monsterCard: DomainCardData = {
      id: 33396948,
      type: "monster",
    };

    expect(isDomainTrapCard(monsterCard)).toBe(false);
  });

  it("should return false for spell card", () => {
    const spellCard: DomainCardData = {
      id: 55144522,
      type: "spell",
    };

    expect(isDomainTrapCard(spellCard)).toBe(false);
  });
});
