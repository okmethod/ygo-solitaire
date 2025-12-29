# Victory Rule Refactoring - Data Model Design

**Date**: 2025-01-29  
**Status**: Complete  
**Related**: [research.md](./research.md), [plan.md](./plan.md)

---

## Overview

このドキュメントは、Phase 1のデータモデル設計を記録する。ExodiaVictoryRuleの詳細設計とVictoryRule.tsのリファクタリング方針を定義する。

---

## Entity Definitions

### 1. ExodiaVictoryRule (NEW)

**Type**: AdditionalRule implementation class

**File Location**: `skeleton-app/src/lib/domain/effects/additional/ExodiaVictoryRule.ts`

**Purpose**: エクゾディアの特殊勝利条件を実装する。手札にエクゾディア5パーツが揃った時に勝利を判定する。

#### Fields

| Field | Type | Value | Description |
|-------|------|-------|-------------|
| isEffect | boolean | false | 効果外テキスト（無効化されない） |
| category | RuleCategory | "VictoryCondition" | 特殊勝利条件カテゴリ |

#### Methods

| Method | Signature | Description | Return Value |
|--------|-----------|-------------|--------------|
| canApply | (state: GameState, context: RuleContext) => boolean | 手札にエクゾディア5パーツが揃っているかを判定 | true: 5パーツ揃っている, false: 揃っていない |
| checkPermission | (state: GameState, context: RuleContext) => boolean | 勝利条件を満たしているかを確認 | 常にtrue（canApply()がtrueの場合のみ呼ばれる） |

#### Implementation Details

```typescript
/**
 * ExodiaVictoryRule - エクゾディアの特殊勝利条件
 *
 * 効果外テキスト: 手札にエクゾディア5パーツが揃った時、デュエルに勝利する
 *
 * カテゴリ: VictoryCondition（特殊勝利条件）
 *
 * @see ADR-0008: 効果モデルの導入とClean Architectureの完全実現
 * @see specs/009-victory-rule-refactor/spec.md
 */

import type { AdditionalRule, RuleCategory } from "../../models/AdditionalRule";
import type { RuleContext } from "../../models/RuleContext";
import type { GameState } from "../../models/GameState";
import { hasExodiaInHand } from "../../models/GameState";

export class ExodiaVictoryRule implements AdditionalRule {
  /**
   * 効果外テキストである（無効化されない）
   */
  readonly isEffect = false;

  /**
   * カテゴリ: 特殊勝利条件
   */
  readonly category: RuleCategory = "VictoryCondition";

  /**
   * 適用条件チェック
   *
   * 手札にエクゾディア5パーツが揃っているかを判定する。
   *
   * @param state - 現在のゲーム状態
   * @param _context - ルール適用コンテキスト（未使用）
   * @returns 5パーツが揃っている場合true
   */
  canApply(state: GameState, _context: RuleContext): boolean {
    return hasExodiaInHand(state);
  }

  /**
   * 勝利条件判定
   *
   * canApply()がtrueの場合、このメソッドが呼ばれて勝利を判定する。
   * エクゾディアの場合、5パーツが揃っていれば必ず勝利。
   *
   * @param _state - 現在のゲーム状態（未使用）
   * @param _context - ルール適用コンテキスト（未使用）
   * @returns 勝利条件を満たしている（常にtrue）
   */
  checkPermission(_state: GameState, _context: RuleContext): boolean {
    return true;
  }
}
```

#### Validation Rules

- canApply()は`hasExodiaInHand(state)`の結果を返す
- checkPermission()は常にtrueを返す（canApply()がtrueの場合のみ呼ばれるため）
- isEffect: falseにより、効果無効化の影響を受けない（型レベルで保証）
- category: "VictoryCondition"により、特殊勝利条件として分類される

#### State Transitions

```
VictoryRule.checkVictoryConditions() 呼び出し
  ↓
ExodiaVictoryRule.canApply(state, {}) 実行
  ↓ true の場合
ExodiaVictoryRule.checkPermission(state, {}) 実行
  ↓ true の場合
GameResult { 
  isGameOver: true, 
  winner: "player", 
  reason: "exodia",
  message: "エクゾディア揃った！..." 
} を返す
```

---

### 2. VictoryRule.ts (MODIFIED)

**File Location**: `skeleton-app/src/lib/domain/rules/VictoryRule.ts`

**Purpose**: 勝利条件をチェックし、GameResultを返す。特殊勝利条件（エクゾディア等）と基本勝利条件（LP0、デッキアウト）を統合的に判定する。

#### Changes Overview

| Change Type | Description |
|-------------|-------------|
| ADD | ExodiaVictoryRuleの直接インスタンス化とチェック |
| MODIFY | checkVictoryConditions()のリファクタリング |
| KEEP | 既存のヘルパー関数（hasExodiaVictory, getMissingExodiaPieces等）を維持 |

#### Modified Function: checkVictoryConditions()

**Before**:
```typescript
export function checkVictoryConditions(state: GameState): GameResult {
  // Exodia check (ハードコード)
  if (hasExodiaInHand(state)) {
    return {
      isGameOver: true,
      winner: "player",
      reason: "exodia",
      message: `エクゾディア揃った！5つのパーツが手札に揃いました。勝利です！`,
    };
  }

  // LP0 checks
  if (state.lp.player <= 0) { ... }
  if (state.lp.opponent <= 0) { ... }

  // Deck out check
  if (state.zones.deck.length === 0 && state.phase === "Draw") { ... }

  return { isGameOver: false };
}
```

**After**:
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
  
  // LP0敗北（プレイヤー）
  if (state.lp.player <= 0) {
    return {
      isGameOver: true,
      winner: "opponent",
      reason: "lp0",
      message: `ライフポイントが0になりました。敗北です。`,
    };
  }

  // LP0勝利（相手）
  if (state.lp.opponent <= 0) {
    return {
      isGameOver: true,
      winner: "player",
      reason: "lp0",
      message: `相手のライフポイントが0になりました。勝利です！`,
    };
  }

  // デッキアウト敗北
  if (state.zones.deck.length === 0 && state.phase === "Draw") {
    return {
      isGameOver: true,
      winner: "opponent",
      reason: "deckout",
      message: `デッキが空でドローできません。デッキアウトで敗北です。`,
    };
  }

  // 勝敗なし
  return {
    isGameOver: false,
  };
}
```

**Rationale for Changes**:
1. **特殊勝利条件の明示**: ExodiaVictoryRuleを使うことで、エクゾディアが「効果外テキスト」であることを型レベルで保証
2. **拡張性の向上**: 将来の特殊勝利条件（最終列車等）も同じパターンで追加可能
3. **基本勝利条件のハードコード維持**: LP0とデッキアウトは遊戯王の基本ルールであり、パフォーマンスと可読性の観点からハードコード維持

#### Preserved Helper Functions

以下のヘルパー関数は後方互換性のために維持する:

| Function | Purpose | Status |
|----------|---------|--------|
| hasExodiaVictory(state) | エクゾディア勝利判定 | KEEP（UIやテストで使用中） |
| hasLPDefeat(state) | LP0敗北判定 | KEEP |
| hasLPVictory(state) | LP0勝利判定 | KEEP |
| hasDeckOutDefeat(state) | デッキアウト敗北判定 | KEEP |
| getMissingExodiaPieces(state) | 不足エクゾディアパーツ取得 | KEEP（UI表示で使用） |
| countExodiaPiecesInHand(state) | 手札のエクゾディアパーツ数 | KEEP（UI表示で使用） |

**Implementation**: これらのヘルパー関数はそのまま維持し、変更しない。

---

## Relationships

### Dependency Graph

```
VictoryRule.ts
  ├─→ ExodiaVictoryRule (直接インスタンス化)
  │     └─→ hasExodiaInHand() (GameState.ts)
  └─→ GameState (型定義)
```

### Data Flow

```
1. GameFacade または Command が checkVictoryConditions(state) を呼ぶ
   ↓
2. checkVictoryConditions() 内で ExodiaVictoryRule をインスタンス化
   ↓
3. exodiaRule.canApply(state, {}) で手札チェック
   ↓ (true の場合)
4. exodiaRule.checkPermission(state, {}) で勝利判定
   ↓ (true の場合)
5. GameResult { isGameOver: true, winner: "player", reason: "exodia" } を返す
   ↓
6. GameFacade が Store を更新
   ↓
7. UI が勝利メッセージを表示
```

---

## Testing Strategy

### Unit Tests

#### ExodiaVictoryRule.test.ts (NEW)

**File Location**: `skeleton-app/tests/unit/domain/effects/additional/ExodiaVictoryRule.test.ts`

**Test Cases**:

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| metadata.isEffect | isEffectがfalseであること | expect(rule.isEffect).toBe(false) |
| metadata.category | categoryが"VictoryCondition"であること | expect(rule.category).toBe("VictoryCondition") |
| canApply - complete | 5パーツ揃っている場合 | expect(rule.canApply(state, {})).toBe(true) |
| canApply - incomplete | 5パーツ未満の場合 | expect(rule.canApply(state, {})).toBe(false) |
| checkPermission | canApply()がtrueの場合 | expect(rule.checkPermission(state, {})).toBe(true) |

#### VictoryRule.test.ts (MODIFIED)

**Changes**:
- 既存のテストはすべてパスすること（後方互換性の検証）
- checkVictoryConditions()のエクゾディア判定テストは、内部実装が変わっても結果は同じ

**No Changes Required**: 既存のテストスイートは変更不要（後方互換性を保証）

---

## Migration Path

### Step 1: ExodiaVictoryRule実装

1. `domain/effects/additional/ExodiaVictoryRule.ts`を作成
2. AdditionalRuleインターフェースを実装
3. canApply()とcheckPermission()を実装

### Step 2: VictoryRule.tsリファクタリング

1. ExodiaVictoryRuleをimport
2. checkVictoryConditions()の先頭でExodiaVictoryRuleをインスタンス化
3. 既存のhasExodiaInHand()チェックを削除
4. 既存のヘルパー関数は維持

### Step 3: テスト作成・更新

1. ExodiaVictoryRule.test.tsを作成
2. VictoryRule.test.tsを実行（変更不要だが、すべてパスすることを確認）

### Step 4: Lint/Format

1. `npm run lint && npm run format`を実行
2. エラーゼロの状態を確認

---

## Performance Considerations

### Benchmark Target

- **Before**: checkVictoryConditions()の平均実行時間 = Tms
- **After**: checkVictoryConditions()の平均実行時間 ≤ T * 1.1ms（10%以内の変動）

### Performance Analysis

**Before**:
```typescript
if (hasExodiaInHand(state)) { ... }
```

**After**:
```typescript
const exodiaRule = new ExodiaVictoryRule();
if (exodiaRule.canApply(state, {}) && exodiaRule.checkPermission(state, {})) { ... }
```

**Overhead**:
- クラスインスタンス化: O(1)（軽量オブジェクト）
- メソッド呼び出し: 2回（canApply, checkPermission）
- 実質的なオーバーヘッド: 無視できるレベル（< 1μs）

**Conclusion**: パフォーマンス劣化なし（10%以内の目標を達成）

---

## Future Extensions

### 新しい特殊勝利条件の追加（例: 最終列車）

**Approach**:
1. 新しいAdditionalRule実装クラスを作成（例: LastTrainVictoryRule）
2. VictoryRule.checkVictoryConditions()内でインスタンス化してチェック

**Example**:
```typescript
export function checkVictoryConditions(state: GameState): GameResult {
  // 1. 特殊勝利条件チェック
  const exodiaRule = new ExodiaVictoryRule();
  if (exodiaRule.canApply(state, {}) && exodiaRule.checkPermission(state, {})) {
    return { isGameOver: true, winner: "player", reason: "exodia", ... };
  }

  const lastTrainRule = new LastTrainVictoryRule();
  if (lastTrainRule.canApply(state, {}) && lastTrainRule.checkPermission(state, {})) {
    return { isGameOver: true, winner: "player", reason: "last_train", ... };
  }

  // 2. 基本勝利条件チェック（ハードコード維持）
  // ...
}
```

**Note**: 将来的に特殊勝利条件が増えた場合、配列管理やFactory Patternの導入を検討する。

---

## References

- [AdditionalRule Interface](../../skeleton-app/src/lib/domain/models/AdditionalRule.ts)
- [RuleContext Interface](../../skeleton-app/src/lib/domain/models/RuleContext.ts)
- [GameState Model](../../skeleton-app/src/lib/domain/models/GameState.ts)
- [ChickenGameContinuousRule (Reference Implementation)](../../skeleton-app/src/lib/domain/effects/additional/ChickenGameContinuousRule.ts)
- [ADR-0008: Effect Model](../../docs/adr/0008-effect-model-and-clean-architecture.md)
