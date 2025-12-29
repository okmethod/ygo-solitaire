# Research Document: Victory Rule Refactoring

**Date**: 2025-01-29  
**Status**: Complete  
**Related**: [spec.md](./spec.md), [plan.md](./plan.md)

---

## Overview

このドキュメントは、Phase 0のリサーチ結果を記録する。すべてのNEEDS CLARIFICATIONを解決し、実装判断の根拠を明確化する。

---

## Research Questions & Answers

### Q1: AdditionalRuleRegistryの実装詳細

**Question**: AdditionalRuleRegistryはO(1)でルックアップ可能か？パフォーマンス上の懸念はないか？

**Research Method**: ソースコード調査（`domain/registries/AdditionalRuleRegistry.ts`）

**Findings**:
- **実装**: `Map<number, AdditionalRule[]>`を使用
- **ルックアップ**: `get(cardId)`はO(1)
- **カテゴリフィルタ**: `getByCategory(cardId, category)`はO(n)（n = そのカードIDに紐付くルール数）
- **フィールドスキャン**: `collectActiveRules(state, category)`はO(m * n)（m = フィールド上のカード数、n = 各カードのルール数）

**Decision**: 
- パフォーマンス懸念なし（フィールド上のカード数は最大5-10枚程度）
- エクゾディアの勝利条件チェックにAdditionalRuleRegistryを使用しても問題ない

**Rationale**: 
- フィールドスキャンはO(m * n)だが、mとnが小さいためパフォーマンス問題なし
- 基本勝利条件（LP0、デッキアウト）はRegistry参照不要（ハードコード維持）

---

### Q2: VictoryConditionカテゴリの既存定義

**Question**: VictoryConditionカテゴリは既にAdditionalRule.tsで定義済みか？新規追加が必要か？

**Research Method**: ソースコード調査（`domain/models/AdditionalRule.ts`）

**Findings**:
```typescript
export type RuleCategory =
  | "NameOverride"
  | "StatusModifier"
  | "SummonCondition"
  | "SummonPermission"
  | "ActionPermission"
  | "VictoryCondition"  // ✅ 既に定義済み
  | "ActionReplacement"
  | "SelfDestruction";
```

**Decision**: 新規追加不要。VictoryConditionカテゴリは既に定義済み。

**Rationale**: specs/008-effect-modelで既に定義されており、そのまま使用可能。

---

### Q3: hasExodiaInHand()ヘルパーの実装

**Question**: hasExodiaInHand()は正しく動作しているか？先頭ゼロの問題は解決済みか？

**Research Method**: ソースコード調査（`domain/models/GameState.ts`、`domain/rules/VictoryRule.ts`）

**Findings**:
- **実装**: 数値ID比較（`card.id`は数値型）
- **エクゾディアパーツ**: 
  ```typescript
  const exodiaPieceNumericIds = [
    33396948,  // Exodia the Forbidden One (head)
    7902349,   // Right Arm of the Forbidden One
    70903634,  // Left Arm of the Forbidden One
    8124921,   // Right Leg of the Forbidden One
    44519536,  // Left Leg of the Forbidden One
  ];
  ```
- **チェックロジック**: `exodiaPieceNumericIds.every((pieceId) => handCardNumericIds.includes(pieceId))`

**Decision**: hasExodiaInHand()は正しく動作している。ExodiaVictoryRule.canApply()で再利用可能。

**Rationale**: 数値ID比較により先頭ゼロの問題を回避済み。DRY原則に従い、既存ヘルパーを再利用する。

---

### Q4: ChickenGameContinuousRuleのパターン

**Question**: 既存のAdditionalRule実装（ChickenGameContinuousRule）のベストプラクティスは？

**Research Method**: ソースコード調査（`domain/effects/additional/ChickenGameContinuousRule.ts`）

**Findings**:

**Class Structure**:
```typescript
export class ChickenGameContinuousRule implements AdditionalRule {
  readonly isEffect = true;  // 永続効果
  readonly category: RuleCategory = "ActionPermission";

  canApply(state: GameState, context: RuleContext): boolean {
    // 1. フィールド上に存在するかチェック
    const chickenGameOnField = state.zones.field.some(
      (card) => card.id === 67616300 && card.position === "faceUp"
    );

    // 2. 条件チェック（LP差分等）
    if (!chickenGameOnField) return false;
    // ...
  }

  checkPermission(_state: GameState, _context: RuleContext): boolean {
    return false; // ダメージ禁止
  }
}
```

**Pattern**:
1. canApply()でフィールド存在チェック + 条件チェック
2. checkPermission()で許可/禁止を返す
3. isEffect, categoryは明示的に設定

**Decision**: ExodiaVictoryRuleでも同じパターンを踏襲する。

**Differences for ExodiaVictoryRule**:
- isEffect: false（効果外テキスト）
- category: "VictoryCondition"
- canApply(): hasExodiaInHand(state)を呼ぶだけ（フィールドチェック不要）
- checkPermission(): 常にtrueを返す（勝利条件を満たしている）

---

### Q5: エクゾディアのAdditionalRuleRegistry登録方法

**Question**: エクゾディアの勝利条件をAdditionalRuleRegistryに登録する場合、どのCard IDに紐付けるべきか？

**Research Method**: ドメイン知識調査 + AdditionalRuleRegistryの設計意図

**Options**:

1. **Option A**: エクゾディア本体（33396948）に紐付ける
   - `AdditionalRuleRegistry.register(33396948, new ExodiaVictoryRule())`
   - collectActiveRules()で「エクゾディア本体がフィールドor手札にある場合」にチェック

2. **Option B**: 特定のCard IDに紐付けない（VictoryRule.ts内で直接インスタンス化）
   - `const exodiaRule = new ExodiaVictoryRule()`
   - AdditionalRuleRegistryは使用しない

**Analysis**:

| Aspect | Option A (Registry登録) | Option B (直接インスタンス化) |
|--------|-------------------------|------------------------------|
| 一貫性 | ✅ AdditionalRuleパターンを統一 | ❌ 他のルールと異なるパターン |
| 適切性 | ❌ エクゾディアは「カード1枚の効果」ではない | ✅ 「5パーツが揃った状態」を表現 |
| 実装 | ❌ collectActiveRules()はフィールドスキャン（手札をチェックしない） | ✅ VictoryRule.ts内で手札をチェック可能 |
| 拡張性 | ❌ 他の特殊勝利条件（最終列車等）と統一できない | ✅ 各特殊勝利条件ごとに柔軟に実装可能 |

**Decision**: **Option Bを採用** - VictoryRule.ts内で直接ExodiaVictoryRuleをインスタンス化

**Rationale**:
1. **適切性**: エクゾディアの勝利条件は「5パーツが手札に揃った状態」であり、特定のカード1枚の効果ではない。AdditionalRuleRegistryは「フィールド上のカードに紐付く効果」を管理するため、エクゾディアの勝利条件には不適切。
2. **実装の明確さ**: collectActiveRules()はフィールドスキャンを前提としており、手札チェックには不向き。VictoryRule.ts内で直接チェックする方が明確。
3. **将来の拡張性**: 最終列車やエクゾード・ネクロスなどの特殊勝利条件も、それぞれ異なる条件チェックが必要。統一的なパターンを強制するより、柔軟に実装する方が適切。

**Alternative Considered**: 
- collectActiveRules()の引数を拡張して手札もチェックできるようにする
- Rejected Because: AdditionalRuleRegistryの責務が肥大化し、Single Responsibility Principleに違反する

---

### Q6: VictoryRule.tsリファクタリングのアプローチ

**Question**: checkVictoryConditions()をどのようにリファクタリングするべきか？

**Research Method**: 既存実装調査 + Phase 1のDesign Decision

**Current Implementation**:
```typescript
export function checkVictoryConditions(state: GameState): GameResult {
  // Exodia check (ハードコード)
  if (hasExodiaInHand(state)) {
    return { isGameOver: true, winner: "player", reason: "exodia", ... };
  }

  // LP0 checks (ハードコード)
  if (state.lp.player <= 0) { ... }
  if (state.lp.opponent <= 0) { ... }

  // Deck out check (ハードコード)
  if (state.zones.deck.length === 0 && state.phase === "Draw") { ... }

  return { isGameOver: false };
}
```

**Refactored Approach**:

```typescript
export function checkVictoryConditions(state: GameState): GameResult {
  // 1. 特殊勝利条件チェック（AdditionalRuleパターン）
  const exodiaRule = new ExodiaVictoryRule();
  if (exodiaRule.canApply(state, {}) && exodiaRule.checkPermission(state, {})) {
    return {
      isGameOver: true,
      winner: "player",
      reason: "exodia",
      message: `エクゾディア揃った！5つのパーツが手札に揃いました。勝利です！`,
    };
  }

  // 2. 基本勝利条件チェック（ハードコード維持）
  // LP0 checks
  if (state.lp.player <= 0) { ... }
  if (state.lp.opponent <= 0) { ... }

  // Deck out check
  if (state.zones.deck.length === 0 && state.phase === "Draw") { ... }

  return { isGameOver: false };
}
```

**Decision**: ExodiaVictoryRuleを直接インスタンス化してチェックする。AdditionalRuleRegistryは使用しない。

**Rationale**:
- Option Bの決定に従い、AdditionalRuleRegistryは使用しない
- 将来の拡張（最終列車等）も同じパターンで実装可能
- 基本勝利条件はハードコード維持（パフォーマンスと可読性）

---

## Technology Best Practices

### TypeScript Best Practices

**Type Safety**:
- AdditionalRuleインターフェースを厳密に実装
- isEffect: falseで効果外テキストを型レベルで保証
- RuleContextは`{}`（空オブジェクト）でOK（エクゾディアは追加パラメータ不要）

**Immutability**:
- hasExodiaInHand()は純粋関数（副作用なし）
- ExodiaVictoryRule.canApply()も純粋関数

### Testing Best Practices

**Test Coverage**:
- ExodiaVictoryRule.test.ts: 単体テスト（canApply, checkPermission, メタデータ）
- VictoryRule.test.ts: 既存テストの更新（後方互換性の検証）

**Test Pattern** (ChickenGameContinuousRule.test.tsを参考):
```typescript
describe("ExodiaVictoryRule", () => {
  const rule = new ExodiaVictoryRule();

  describe("metadata", () => {
    it("should have isEffect = false", () => {
      expect(rule.isEffect).toBe(false);
    });

    it("should have category = VictoryCondition", () => {
      expect(rule.category).toBe("VictoryCondition");
    });
  });

  describe("canApply()", () => {
    it("should return true when all 5 Exodia pieces are in hand", () => { ... });
    it("should return false when Exodia is incomplete", () => { ... });
  });

  describe("checkPermission()", () => {
    it("should return true when canApply() is true", () => { ... });
  });
});
```

---

## Final Design Summary

### Decision Matrix

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| AdditionalRuleRegistry使用 | ❌ 不使用 | エクゾディアは特定カードの効果ではない |
| 直接インスタンス化 | ✅ 採用 | VictoryRule.ts内でnew ExodiaVictoryRule() |
| 基本勝利条件 | ✅ ハードコード維持 | パフォーマンスと可読性 |
| 後方互換性 | ✅ 維持 | 既存ヘルパー関数を保持 |

### Key Takeaways

1. **AdditionalRuleパターンの柔軟性**: AdditionalRuleインターフェースを実装することで型安全性を保ちつつ、AdditionalRuleRegistryに依存しない実装も可能
2. **適切な抽象化レベル**: すべてをRegistryに登録するのではなく、適切な場所で適切なパターンを使う
3. **後方互換性の重要性**: 既存のヘルパー関数を維持することで、UI層への影響を最小化

---

## References

- [AdditionalRuleRegistry.ts](../../skeleton-app/src/lib/domain/registries/AdditionalRuleRegistry.ts)
- [AdditionalRule.ts](../../skeleton-app/src/lib/domain/models/AdditionalRule.ts)
- [VictoryRule.ts](../../skeleton-app/src/lib/domain/rules/VictoryRule.ts)
- [ChickenGameContinuousRule.ts](../../skeleton-app/src/lib/domain/effects/additional/ChickenGameContinuousRule.ts)
- [ADR-0008: Effect Model](../../docs/adr/0008-effect-model-and-clean-architecture.md)
