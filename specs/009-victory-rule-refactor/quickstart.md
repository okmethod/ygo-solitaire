# Victory Rule Refactoring - Development Quickstart

**Date**: 2025-01-29  
**Status**: Complete  
**Related**: [plan.md](./plan.md), [data-model.md](./data-model.md)

---

## Overview

このドキュメントは、009-victory-rule-refactorの開発を始めるためのクイックスタートガイドです。開発環境のセットアップから実装、テスト、デプロイまでの手順を記載します。

---

## Prerequisites

### Required Software

- **Node.js**: 18.x以上
- **npm**: 9.x以上
- **Git**: 2.x以上

### Knowledge Requirements

- TypeScript基本知識
- Svelte基本知識（UIレイヤーには影響しないが、テスト実行に必要）
- 遊戯王OCGの基本ルール（エクゾディアの勝利条件）

---

## Setup

### 1. Clone Repository

```bash
git clone https://github.com/okmethod/ygo-solitaire.git
cd ygo-solitaire
```

### 2. Checkout Feature Branch

```bash
git checkout -b 009-victory-rule-refactor
```

### 3. Install Dependencies

```bash
cd skeleton-app
npm install
```

### 4. Verify Setup

```bash
# Run all tests
npm run test:run

# Run dev server
npm run dev
```

**Expected**:
- すべてのテストがパス
- 開発サーバーがhttp://localhost:5173で起動

---

## File Locations

### New Files (作成するファイル)

| File Path | Description |
|-----------|-------------|
| `skeleton-app/src/lib/domain/effects/additional/ExodiaVictoryRule.ts` | エクゾディア勝利条件の実装 |
| `skeleton-app/tests/unit/domain/effects/additional/ExodiaVictoryRule.test.ts` | ExodiaVictoryRuleの単体テスト |

### Modified Files (修正するファイル)

| File Path | Changes |
|-----------|---------|
| `skeleton-app/src/lib/domain/rules/VictoryRule.ts` | checkVictoryConditions()のリファクタリング |
| `skeleton-app/tests/unit/domain/rules/VictoryRule.test.ts` | 既存テストの実行確認（変更不要） |

### Reference Files (参考にするファイル)

| File Path | Purpose |
|-----------|---------|
| `skeleton-app/src/lib/domain/effects/additional/ChickenGameContinuousRule.ts` | AdditionalRule実装のパターン参考 |
| `skeleton-app/src/lib/domain/models/AdditionalRule.ts` | AdditionalRuleインターフェース定義 |
| `skeleton-app/src/lib/domain/models/GameState.ts` | hasExodiaInHand()ヘルパー |
| `skeleton-app/tests/unit/domain/effects/additional/ChickenGameContinuousRule.test.ts` | テストパターン参考 |

---

## Development Workflow

### Step 1: ExodiaVictoryRule実装

#### 1.1 Create File

```bash
touch skeleton-app/src/lib/domain/effects/additional/ExodiaVictoryRule.ts
```

#### 1.2 Implement Class

**File**: `skeleton-app/src/lib/domain/effects/additional/ExodiaVictoryRule.ts`

```typescript
/**
 * ExodiaVictoryRule - エクゾディアの特殊勝利条件
 *
 * 効果外テキスト: 手札にエクゾディア5パーツが揃った時、デュエルに勝利する
 *
 * @see specs/009-victory-rule-refactor/data-model.md
 */

import type { AdditionalRule, RuleCategory } from "../../models/AdditionalRule";
import type { RuleContext } from "../../models/RuleContext";
import type { GameState } from "../../models/GameState";
import { hasExodiaInHand } from "../../models/GameState";

export class ExodiaVictoryRule implements AdditionalRule {
  readonly isEffect = false;
  readonly category: RuleCategory = "VictoryCondition";

  canApply(state: GameState, _context: RuleContext): boolean {
    return hasExodiaInHand(state);
  }

  checkPermission(_state: GameState, _context: RuleContext): boolean {
    return true;
  }
}
```

#### 1.3 Create Test File

```bash
touch skeleton-app/tests/unit/domain/effects/additional/ExodiaVictoryRule.test.ts
```

**File**: `skeleton-app/tests/unit/domain/effects/additional/ExodiaVictoryRule.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import { ExodiaVictoryRule } from "$lib/domain/effects/additional/ExodiaVictoryRule";
import { createExodiaVictoryState, createMockGameState } from "../../../../__testUtils__/gameStateFactory";

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
    it("should return true when all 5 Exodia pieces are in hand", () => {
      const state = createExodiaVictoryState();
      expect(rule.canApply(state, {})).toBe(true);
    });

    it("should return false when Exodia is incomplete", () => {
      const state = createMockGameState({ zones: { hand: [] } });
      expect(rule.canApply(state, {})).toBe(false);
    });
  });

  describe("checkPermission()", () => {
    it("should return true when canApply() is true", () => {
      const state = createExodiaVictoryState();
      expect(rule.checkPermission(state, {})).toBe(true);
    });
  });
});
```

#### 1.4 Run Tests

```bash
npm run test:run -- ExodiaVictoryRule.test.ts
```

**Expected**: すべてのテストがパス

---

### Step 2: VictoryRule.tsリファクタリング

#### 2.1 Modify checkVictoryConditions()

**File**: `skeleton-app/src/lib/domain/rules/VictoryRule.ts`

**Changes**:

1. Import ExodiaVictoryRule:
```typescript
import { ExodiaVictoryRule } from "../effects/additional/ExodiaVictoryRule";
```

2. Refactor checkVictoryConditions():
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

3. Remove old Exodia check:
```typescript
// DELETE THIS:
if (hasExodiaInHand(state)) {
  return {
    isGameOver: true,
    winner: "player",
    reason: "exodia",
    message: `エクゾディア揃った！5つのパーツが手札に揃いました。勝利です！`,
  };
}
```

4. Keep helper functions (no changes):
```typescript
// KEEP AS-IS:
export function hasExodiaVictory(state: GameState): boolean {
  return hasExodiaInHand(state);
}

export function hasLPDefeat(state: GameState): boolean { ... }
export function hasLPVictory(state: GameState): boolean { ... }
export function hasDeckOutDefeat(state: GameState): boolean { ... }
export function getMissingExodiaPieces(state: GameState): string[] { ... }
export function countExodiaPiecesInHand(state: GameState): number { ... }
```

#### 2.2 Run Tests

```bash
npm run test:run -- VictoryRule.test.ts
```

**Expected**: すべてのテストがパス（後方互換性の確認）

---

### Step 3: Lint & Format

```bash
# Lint
npm run lint

# Format
npm run format
```

**Expected**: エラーゼロ

---

### Step 4: Full Test Suite

```bash
npm run test:run
```

**Expected**: すべてのテストがパス

---

### Step 5: Manual Testing

#### 5.1 Start Dev Server

```bash
npm run dev
```

#### 5.2 Test Exodia Victory

1. ブラウザでhttp://localhost:5173を開く
2. デッキを選択（エクゾディアデッキを推奨）
3. 手札にエクゾディア5パーツが揃うまでドロー
4. 勝利メッセージが表示されることを確認

**Expected**: "エクゾディア揃った！5つのパーツが手札に揃いました。勝利です！"

---

## Testing Commands

### Run All Tests

```bash
npm run test:run
```

### Run Specific Test File

```bash
npm run test:run -- ExodiaVictoryRule.test.ts
npm run test:run -- VictoryRule.test.ts
```

### Run Tests in Watch Mode

```bash
npm run test
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

---

## Linting & Formatting

### ESLint

```bash
npm run lint
```

### Prettier

```bash
npm run format
```

### Combined

```bash
npm run lint && npm run format
```

---

## Commit Guidelines

### Commit Message Format

```
feat: ExodiaVictoryRuleを実装し、VictoryRule.tsをリファクタリング

- ExodiaVictoryRuleをAdditionalRuleとして実装
- VictoryRule.checkVictoryConditions()を修正
- 既存のヘルパー関数は後方互換性のために維持
```

### Before Commit Checklist

- [ ] すべてのテストがパス（`npm run test:run`）
- [ ] Lintエラーゼロ（`npm run lint`）
- [ ] Formatエラーゼロ（`npm run format`）
- [ ] 手動テストで動作確認

---

## Troubleshooting

### Test Failures

**Issue**: ExodiaVictoryRule.test.tsでcreateExodiaVictoryState is not definedエラー

**Solution**: テストユーティリティをimport
```typescript
import { createExodiaVictoryState } from "../../../../__testUtils__/gameStateFactory";
```

### Import Errors

**Issue**: Cannot find module 'ExodiaVictoryRule'

**Solution**: 相対パスを確認
```typescript
// VictoryRule.ts内でimport
import { ExodiaVictoryRule } from "../effects/additional/ExodiaVictoryRule";
```

### Type Errors

**Issue**: Type 'ExodiaVictoryRule' is not assignable to type 'AdditionalRule'

**Solution**: すべてのメソッドを実装
```typescript
export class ExodiaVictoryRule implements AdditionalRule {
  readonly isEffect = false;
  readonly category: RuleCategory = "VictoryCondition";
  canApply(state: GameState, _context: RuleContext): boolean { ... }
  checkPermission(_state: GameState, _context: RuleContext): boolean { ... }
}
```

---

## Performance Benchmarking

### Measure checkVictoryConditions() Performance

```typescript
// Add to VictoryRule.test.ts
it("should maintain performance (< 10% overhead)", () => {
  const state = createMockGameState();
  const iterations = 10000;

  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    checkVictoryConditions(state);
  }
  const end = performance.now();

  const avgTime = (end - start) / iterations;
  console.log(`Average execution time: ${avgTime}ms`);
  
  // 10%以内の変動を許容（ベースライン: 0.01ms）
  expect(avgTime).toBeLessThan(0.011);
});
```

---

## References

- [plan.md](./plan.md) - 実装計画の詳細
- [data-model.md](./data-model.md) - データモデル設計
- [research.md](./research.md) - リサーチ結果
- [CLAUDE.md](../../CLAUDE.md) - プロジェクト開発ガイド
- [docs/architecture/overview.md](../../docs/architecture/overview.md) - アーキテクチャ概要
