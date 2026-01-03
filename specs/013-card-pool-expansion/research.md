# Research: Additional Spell Cards Implementation

**Feature**: 013-card-pool-expansion
**Date**: 2026-01-02

## Overview

6枚の新規魔法カード実装に必要な技術調査を行います。主な調査項目は以下の3つです：

1. エンドフェイズ処理の実装パターン
2. 1ターンに1枚制約の実装方法
3. 墓地/デッキからのカード選択UIの拡張

## Research 1: End Phase Effects Implementation

### Question

エンドフェイズに実行される遅延効果（無の煉獄、命削りの宝札）をどのように実装するか？

### Options Considered

#### Option A: GameStateに遅延効果配列を追加

```typescript
interface GameState {
  pendingEndPhaseEffects: readonly EffectResolutionStep[];
}
```

**Pros**:
- シンプルで理解しやすい
- EffectResolutionStepの再利用が可能
- Application Layerでの実行が容易

**Cons**:
- GameStateの肥大化

#### Option B: 専用のEndPhaseEffectモデルを作成

```typescript
interface EndPhaseEffect {
  id: string;
  cardId: number;
  execute: (state: GameState) => GameStateUpdateResult;
}
```

**Pros**:
- 型安全性が高い
- カード固有のロジックを分離できる

**Cons**:
- 新しいモデルの学習コストがかかる
- EffectResolutionStepとの二重管理

### Decision

**Option A**を採用します。

**Rationale**:
- 既存のEffectResolutionStepを再利用することで、Application Layerの実装がシンプルになる
- GameStateの肥大化は許容範囲内（配列1つのみ追加）
- テストが容易（EffectResolutionStepの既存テストパターンを流用可能）

### Implementation Details

```typescript
// GameState.ts
export interface GameState {
  // ... existing fields
  readonly pendingEndPhaseEffects: readonly EffectResolutionStep[];
}

// AdvancePhaseCommand.ts
export class AdvancePhaseCommand implements GameCommand {
  execute(state: GameState): CommandResult {
    if (nextPhase === "End" && state.pendingEndPhaseEffects.length > 0) {
      return {
        success: true,
        newState: { ...state, phase: "End" },
        effectSteps: state.pendingEndPhaseEffects,
        message: `Executing ${state.pendingEndPhaseEffects.length} end phase effects`,
      };
    }
    // ...
  }
}
```

## Research 2: Once-Per-Turn Constraint Implementation

### Question

「1ターンに1枚しか発動できない」制約（強欲で謙虚な壺、命削りの宝札）をどのように実装するか？

### Options Considered

#### Option A: GameStateにカードID Setを追加

```typescript
interface GameState {
  activatedOncePerTurnCards: ReadonlySet<number>;
}
```

**Pros**:
- シンプルで効率的（O(1)で発動済みチェック可能）
- エンドフェイズでの一括クリアが容易
- 既存の`activatedIgnitionEffectsThisTurn`と同じパターン

**Cons**:
- GameStateの肥大化

#### Option B: カードクラスに状態を持たせる

```typescript
class PotOfDualityActivation extends NormalSpellAction {
  private activatedThisTurn = false;
}
```

**Pros**:
- GameStateを汚さない

**Cons**:
- ステートフルなクラスになり、テストが困難
- 複数インスタンスの管理が必要
- Clean Architectureの原則に反する

### Decision

**Option A**を採用します。

**Rationale**:
- ステートレスな設計を維持できる
- 既存の`activatedIgnitionEffectsThisTurn`と一貫性がある
- テストが容易（GameStateの値を変更するだけ）

### Implementation Details

```typescript
// GameState.ts
export interface GameState {
  readonly activatedOncePerTurnCards: ReadonlySet<number>;
}

// PotOfDualityActivation.ts
protected additionalActivationConditions(state: GameState): boolean {
  if (state.activatedOncePerTurnCards.has(this.cardId)) {
    return false; // Already activated this turn
  }
  // ... other conditions
}

// AdvancePhaseCommand.ts
if (nextPhase === "End") {
  newState.activatedOncePerTurnCards = new Set<number>();
}
```

## Research 3: Card Selection UI Extension

### Question

墓地からのカード選択、デッキの上N枚からの選択は、既存のcreateCardSelectionStep()で対応可能か？

### Analysis

既存のcreateCardSelectionStep()の実装を確認:

```typescript
export function createCardSelectionStep(config: {
  availableCards: readonly CardInstance[];
  minCards: number;
  maxCards: number;
  // ...
}): EffectResolutionStep
```

**Finding**: `availableCards`に任意のCardInstance配列を渡せるため、既存UIで対応可能。

### Options Considered

#### Option A: 既存のcreateCardSelectionStep()を再利用

```typescript
// 墓地から魔法カード選択
const spellsInGraveyard = state.zones.graveyard.filter(c => c.type === "spell");
createCardSelectionStep({
  availableCards: spellsInGraveyard,
  minCards: 1,
  maxCards: 1,
  // ...
})
```

**Pros**:
- 既存UIを再利用できる
- 実装コストが最小
- テスト済みの動作

**Cons**:
- フィルタリングロジックを呼び出し側で実装する必要がある

#### Option B: 専用のstep builder関数を作成

```typescript
createSearchFromGraveyardStep({
  filter: (card) => card.type === "spell",
  minCards: 1,
  maxCards: 1,
  // ...
})
```

**Pros**:
- フィルタリングロジックをカプセル化
- 再利用性が高い
- 墓地選択の意図が明確

**Cons**:
- 新規関数の実装が必要

### Decision

**Option B**を採用します。

**Rationale**:
- createSearchFromGraveyardStep()、createSearchFromDeckTopStep()を追加することで、カード効果の実装が簡潔になる
- 将来的に他のカードでも再利用可能
- フィルタリングロジックの一元化により、バグの混入を防げる

### Implementation Details

```typescript
// stepBuilders.ts
export function createSearchFromGraveyardStep(config: {
  id: string;
  summary: string;
  description: string;
  filter: (card: CardInstance) => boolean;
  minCards: number;
  maxCards: number;
  onSelect: (state: GameState, selectedIds: string[]) => GameStateUpdateResult;
}): EffectResolutionStep {
  return {
    id: config.id,
    summary: config.summary,
    description: config.description,
    notificationLevel: "interactive",
    cardSelectionConfig: {
      availableCards: [], // Populated from graveyard in action phase
      minCards: config.minCards,
      maxCards: config.maxCards,
      // ...
    },
    action: (currentState: GameState, selectedInstanceIds?: string[]) => {
      const graveyardCards = currentState.zones.graveyard.filter(config.filter);
      // ... validation and execution
      return config.onSelect(currentState, selectedInstanceIds || []);
    },
  };
}
```

## Summary of Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| End Phase Effects | GameState.pendingEndPhaseEffects配列 | EffectResolutionStepの再利用、シンプルな実装 |
| Once-Per-Turn Constraint | GameState.activatedOncePerTurnCards Set | 既存パターンとの一貫性、ステートレス設計 |
| Card Selection UI | 専用step builder関数追加 | フィルタリングロジックのカプセル化、再利用性 |

これらの決定により、既存のアーキテクチャを維持しつつ、新機能を効率的に実装できます。
