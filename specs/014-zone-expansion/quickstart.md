# Quickstart Guide: Zone Architecture Expansion

**Feature**: 014-zone-expansion
**Date**: 2026-01-03
**Purpose**: Developer guide for implementing zone architecture and card placement commands

## Overview

この機能は遊戯王OCGのゾーンアーキテクチャを正確に実装し、モンスター・魔法・罠カードの基本的な配置操作を提供します。

**実装範囲**:
- 3つの専用ゾーン（mainMonsterZone、spellTrapZone、fieldZone）
- 新規コマンド3個（SummonMonster、SetMonster、SetSpellTrap）
- GameStateに召喚権管理フィールド追加
- ActivateSpellCommandのフィールド魔法対応

## Implementation Steps

### Phase 1: Core Data Models (Priority: P1)

#### Step 1.1: Update Zone.ts

**File**: `skeleton-app/src/lib/domain/models/Zone.ts`

```typescript
// 1. Zonesインターフェースを更新
export interface Zones {
  readonly deck: readonly CardInstance[];
  readonly hand: readonly CardInstance[];
  readonly mainMonsterZone: readonly CardInstance[];      // NEW
  readonly spellTrapZone: readonly CardInstance[];        // RENAMED from field
  readonly fieldZone: readonly CardInstance[];            // NEW
  readonly graveyard: readonly CardInstance[];
  readonly banished: readonly CardInstance[];
}

// 2. sendToGraveyard()を更新
export function sendToGraveyard(zones: Zones, instanceId: string): Zones {
  const card = [
    ...zones.mainMonsterZone,    // NEW
    ...zones.spellTrapZone,      // NEW
    ...zones.fieldZone,          // NEW
    ...zones.hand
  ].find(c => c.instanceId === instanceId);

  if (!card) {
    throw new Error(`Card with instanceId ${instanceId} not found`);
  }

  const sourceZone = card.location as keyof Zones;
  return moveCard(zones, instanceId, sourceZone, "graveyard");
}
```

**Test**: `tests/unit/domain/models/Zone.test.ts`を更新し、新ゾーンの動作を確認

#### Step 1.2: Update GameState.ts

**File**: `skeleton-app/src/lib/domain/models/GameState.ts`

```typescript
export interface GameState {
  // 既存フィールド...
  readonly zones: Zones;
  readonly lp: LifePoints;
  readonly phase: GamePhase;
  readonly turn: number;
  readonly chainStack: readonly ChainBlock[];
  readonly result: GameResult;

  // NEW: 召喚権管理
  readonly normalSummonLimit: number;      // デフォルト1
  readonly normalSummonUsed: number;       // 初期値0
}

// createInitialGameState()を更新
export function createInitialGameState(/* ... */): GameState {
  return {
    zones: {
      deck: shuffledDeck,
      hand: [],
      mainMonsterZone: [],          // NEW
      spellTrapZone: [],             // NEW
      fieldZone: [],                 // NEW
      graveyard: [],
      banished: [],
    },
    normalSummonLimit: 1,            // NEW
    normalSummonUsed: 0,             // NEW
    // ...
  };
}
```

**Test**: `tests/unit/domain/models/GameState.test.ts`で初期値を確認

#### Step 1.3: Update Card.ts

**File**: `skeleton-app/src/lib/domain/models/Card.ts`

```typescript
export interface CardInstance extends CardData {
  readonly instanceId: string;
  readonly location: keyof Zones;
  readonly position?: "faceUp" | "faceDown";
  readonly battlePosition?: "attack" | "defense";     // NEW
  readonly placedThisTurn: boolean;                   // NEW (default false)
}
```

**Test**: `tests/unit/domain/models/Card.test.ts`で新フィールドを確認

### Phase 2: Summon Rule (Priority: P1)

#### Step 2.1: Create SummonRule.ts

**File**: `skeleton-app/src/lib/domain/rules/SummonRule.ts` (NEW)

```typescript
import type { GameState } from "../models/GameState";

export interface SummonValidation {
  canSummon: boolean;
  reason?: string;
}

export function canNormalSummon(state: GameState): SummonValidation {
  if (state.phase !== "Main1") {
    return { canSummon: false, reason: "Main1フェーズではありません" };
  }

  if (state.normalSummonUsed >= state.normalSummonLimit) {
    return { canSummon: false, reason: "召喚権がありません" };
  }

  if (state.zones.mainMonsterZone.length >= 5) {
    return { canSummon: false, reason: "モンスターゾーンが満杯です" };
  }

  return { canSummon: true };
}
```

**Test**: `tests/unit/domain/rules/SummonRule.test.ts` (NEW)で全条件を網羅

### Phase 3: Commands (Priority: P1)

#### Step 3.1: Create SummonMonsterCommand.ts

**File**: `skeleton-app/src/lib/domain/commands/SummonMonsterCommand.ts` (NEW)

```typescript
import type { GameState } from "$lib/domain/models/GameState";
import { findCardInstance } from "$lib/domain/models/GameState";
import type { GameCommand, CommandResult } from "./GameCommand";
import { createSuccessResult, createFailureResult } from "./GameCommand";
import { moveCard } from "$lib/domain/models/Zone";
import { canNormalSummon } from "$lib/domain/rules/SummonRule";

export class SummonMonsterCommand implements GameCommand {
  readonly description: string;

  constructor(private readonly cardInstanceId: string) {
    this.description = `Summon monster ${cardInstanceId}`;
  }

  canExecute(state: GameState): boolean {
    if (state.result.isGameOver) return false;

    const validation = canNormalSummon(state);
    if (!validation.canSummon) return false;

    const cardInstance = findCardInstance(state, this.cardInstanceId);
    if (!cardInstance || cardInstance.location !== "hand") return false;
    if (cardInstance.type !== "monster") return false;

    return true;
  }

  execute(state: GameState): CommandResult {
    const validation = canNormalSummon(state);
    if (!validation.canSummon) {
      return createFailureResult(state, validation.reason || "Cannot summon");
    }

    const cardInstance = findCardInstance(state, this.cardInstanceId);
    if (!cardInstance) {
      return createFailureResult(state, `Card ${this.cardInstanceId} not found`);
    }

    if (cardInstance.location !== "hand") {
      return createFailureResult(state, "Card not in hand");
    }

    if (cardInstance.type !== "monster") {
      return createFailureResult(state, "Not a monster card");
    }

    // Move card to mainMonsterZone
    const updatedCard: CardInstance = {
      ...cardInstance,
      location: "mainMonsterZone",
      position: "faceUp",
      battlePosition: "attack",
      placedThisTurn: true,
    };

    const zonesAfterMove = moveCard(
      state.zones,
      this.cardInstanceId,
      "hand",
      "mainMonsterZone",
      "faceUp"
    );

    // Update card properties manually (moveCard doesn't handle new fields)
    const mainMonsterZone = zonesAfterMove.mainMonsterZone.map(card =>
      card.instanceId === this.cardInstanceId
        ? { ...card, battlePosition: "attack" as const, placedThisTurn: true }
        : card
    );

    const newState: GameState = {
      ...state,
      zones: {
        ...zonesAfterMove,
        mainMonsterZone,
      },
      normalSummonUsed: state.normalSummonUsed + 1,
    };

    return createSuccessResult(newState, `Monster summoned: ${this.cardInstanceId}`);
  }

  getCardInstanceId(): string {
    return this.cardInstanceId;
  }
}
```

**Test**: `tests/unit/domain/commands/SummonMonsterCommand.test.ts` (NEW)

**Test Cases**:
- ✅ 正常に召喚できる
- ✅ Main1フェーズでないと失敗
- ✅ 召喚権がないと失敗
- ✅ ゾーンが満杯だと失敗
- ✅ 手札にないと失敗
- ✅ モンスターカードでないと失敗

#### Step 3.2: Create SetMonsterCommand.ts

**File**: `skeleton-app/src/lib/domain/commands/SetMonsterCommand.ts` (NEW)

ほぼSummonMonsterCommandと同じ実装で、以下の違いのみ:
- `position: "faceDown"`
- `battlePosition: "defense"`

**Test**: `tests/unit/domain/commands/SetMonsterCommand.test.ts` (NEW)

#### Step 3.3: Create SetSpellTrapCommand.ts

**File**: `skeleton-app/src/lib/domain/commands/SetSpellTrapCommand.ts` (NEW)

```typescript
export class SetSpellTrapCommand implements GameCommand {
  canExecute(state: GameState): boolean {
    if (state.result.isGameOver) return false;
    if (state.phase !== "Main1") return false;

    const cardInstance = findCardInstance(state, this.cardInstanceId);
    if (!cardInstance || cardInstance.location !== "hand") return false;
    if (cardInstance.type !== "spell" && cardInstance.type !== "trap") return false;

    // Field spell: always allowed
    if (cardInstance.subtype === "Field") return true;

    // Non-field spell/trap: check spellTrapZone capacity
    return state.zones.spellTrapZone.length < 5;
  }

  execute(state: GameState): CommandResult {
    const cardInstance = findCardInstance(state, this.cardInstanceId);
    // ... validation ...

    const isFieldSpell = cardInstance.subtype === "Field";
    let zones = state.zones;

    // If field spell and fieldZone occupied, send to graveyard
    if (isFieldSpell && zones.fieldZone.length > 0) {
      const existingCard = zones.fieldZone[0];
      zones = sendToGraveyard(zones, existingCard.instanceId);
    }

    const targetZone = isFieldSpell ? "fieldZone" : "spellTrapZone";
    zones = moveCard(zones, this.cardInstanceId, "hand", targetZone, "faceDown");

    // Update placedThisTurn
    const updatedZone = zones[targetZone].map(card =>
      card.instanceId === this.cardInstanceId
        ? { ...card, placedThisTurn: true }
        : card
    );

    const newState: GameState = {
      ...state,
      zones: {
        ...zones,
        [targetZone]: updatedZone,
      },
    };

    return createSuccessResult(newState, `Card set: ${this.cardInstanceId}`);
  }
}
```

**Test**: `tests/unit/domain/commands/SetSpellTrapCommand.test.ts` (NEW)

#### Step 3.4: Update ActivateSpellCommand.ts

**File**: `skeleton-app/src/lib/domain/commands/ActivateSpellCommand.ts`

```typescript
// execute()メソッド内を更新
execute(state: GameState): CommandResult {
  const cardInstance = findCardInstance(state, this.cardInstanceId);
  // ... validation ...

  const isFieldSpell = cardInstance.subtype === "Field";

  // Check placedThisTurn restriction for Quick-Play spells
  if (cardInstance.position === "faceDown" &&
      cardInstance.subtype === "Quick-Play" &&
      cardInstance.placedThisTurn) {
    return createFailureResult(state, "速攻魔法はセットしたターンに発動できません");
  }

  let zonesAfterActivation = state.zones;

  // Field spell: auto-replace existing field spell
  if (isFieldSpell) {
    if (zonesAfterActivation.fieldZone.length > 0) {
      const existingCard = zonesAfterActivation.fieldZone[0];
      zonesAfterActivation = sendToGraveyard(zonesAfterActivation, existingCard.instanceId);
    }
    zonesAfterActivation = moveCard(
      zonesAfterActivation,
      this.cardInstanceId,
      "hand",
      "fieldZone",
      "faceUp"
    );
  } else {
    zonesAfterActivation = moveCard(
      zonesAfterActivation,
      this.cardInstanceId,
      "hand",
      "spellTrapZone",
      "faceUp"
    );
  }

  // ... rest of effect execution ...
}
```

**Test**: 既存の`ActivateSpellCommand.test.ts`を更新 + フィールド魔法のテスト追加

### Phase 4: Application Layer (Priority: P1)

#### Step 4.1: Update GameFacade.ts

**File**: `skeleton-app/src/lib/application/GameFacade.ts`

```typescript
import { SummonMonsterCommand } from "$lib/domain/commands/SummonMonsterCommand";
import { SetMonsterCommand } from "$lib/domain/commands/SetMonsterCommand";
import { SetSpellTrapCommand } from "$lib/domain/commands/SetSpellTrapCommand";

export class GameFacade {
  // 既存メソッド...

  // NEW
  summonMonster(cardInstanceId: string): CommandResult {
    const command = new SummonMonsterCommand(cardInstanceId);
    return this.executeCommand(command);
  }

  // NEW
  setMonster(cardInstanceId: string): CommandResult {
    const command = new SetMonsterCommand(cardInstanceId);
    return this.executeCommand(command);
  }

  // NEW
  setSpellTrap(cardInstanceId: string): CommandResult {
    const command = new SetSpellTrapCommand(cardInstanceId);
    return this.executeCommand(command);
  }
}
```

**Test**: `tests/unit/application/GameFacade.test.ts`を更新

### Phase 5: UI Layer (Priority: P3)

#### Step 5.1: Update DuelField.svelte

**File**: `skeleton-app/src/lib/presentation/components/DuelField.svelte`

```svelte
<script lang="ts">
  import { gameStore } from "../stores/gameStore.svelte";
  const state = $derived(gameStore.state);
</script>

<div class="duel-field">
  <!-- Main Monster Zone -->
  <div class="main-monster-zone">
    <h3>Main Monster Zone</h3>
    <div class="zone-grid">
      {#each state.zones.mainMonsterZone as card}
        <CardDisplay {card} />
      {/each}
    </div>
  </div>

  <!-- Spell/Trap Zone -->
  <div class="spell-trap-zone">
    <h3>Spell/Trap Zone</h3>
    <div class="zone-grid">
      {#each state.zones.spellTrapZone as card}
        <CardDisplay {card} />
      {/each}
    </div>
  </div>

  <!-- Field Zone -->
  <div class="field-zone">
    <h3>Field Zone</h3>
    {#if state.zones.fieldZone.length > 0}
      <CardDisplay card={state.zones.fieldZone[0]} />
    {:else}
      <div class="empty-zone">Empty</div>
    {/if}
  </div>
</div>
```

#### Step 5.2: Update Hands.svelte

**File**: `skeleton-app/src/lib/presentation/components/Hands.svelte`

```svelte
<script lang="ts">
  import { gameFacade } from "$lib/application/GameFacade";

  function handleSummon(cardInstanceId: string) {
    const result = gameFacade.summonMonster(cardInstanceId);
    if (!result.success) {
      alert(result.message);
    }
  }

  function handleSet(cardInstanceId: string, cardType: string) {
    const result = cardType === "monster"
      ? gameFacade.setMonster(cardInstanceId)
      : gameFacade.setSpellTrap(cardInstanceId);
    if (!result.success) {
      alert(result.message);
    }
  }
</script>

<!-- カード選択時にボタンを表示 -->
{#if selectedCard}
  {#if selectedCard.type === "monster"}
    <button on:click={() => handleSummon(selectedCard.instanceId)}>召喚</button>
    <button on:click={() => handleSet(selectedCard.instanceId, "monster")}>セット</button>
  {:else}
    <button on:click={() => gameFacade.activateSpell(selectedCard.instanceId)}>発動</button>
    <button on:click={() => handleSet(selectedCard.instanceId, "spell")}>セット</button>
  {/if}
{/if}
```

## Testing Strategy

### Unit Tests Priority
1. **Zone.test.ts**: 新ゾーンの基本操作
2. **GameState.test.ts**: 召喚権の初期値と更新
3. **SummonRule.test.ts**: 召喚権チェックロジック
4. **SummonMonsterCommand.test.ts**: 召喚コマンドの全条件
5. **SetMonsterCommand.test.ts**: セットコマンドの全条件
6. **SetSpellTrapCommand.test.ts**: 魔法・罠セットの全条件
7. **ActivateSpellCommand.test.ts**: フィールド魔法対応

### Integration Tests
- `summon-flow.test.ts`: 召喚→セット→発動の一連のフロー

### E2E Tests
- `zone-separation.spec.ts`: UIで3ゾーンが正しく表示されるか

## Common Pitfalls

1. **moveCard()の拡張を忘れる**: `battlePosition`と`placedThisTurn`は手動で設定する
2. **sendToGraveyard()の更新を忘れる**: 新ゾーンから検索するように拡張
3. **既存テストの修正を忘れる**: `zones.field`を`zones.spellTrapZone`に置換
4. **フィールド魔法の自動置換を忘れる**: SetSpellTrapCommandとActivateSpellCommandの両方で実装

## Checklist

- [x] Zone.ts: Zonesインターフェース拡張
- [x] Zone.ts: sendToGraveyard()更新
- [x] GameState.ts: normalSummonLimit/Used追加
- [x] Card.ts: battlePosition/placedThisTurn追加
- [x] SummonRule.ts: 新規作成
- [x] SummonMonsterCommand.ts: 新規作成
- [x] SetMonsterCommand.ts: 新規作成
- [x] SetSpellTrapCommand.ts: 新規作成
- [x] ActivateSpellCommand.ts: フィールド魔法対応
- [x] GameFacade.ts: 新規メソッド3個追加
- [x] DuelField.svelte: 3ゾーン表示
- [x] Hands.svelte: 召喚・セットボタン
- [x] 全Unit Tests作成
- [x] Integration Tests作成
- [ ] E2E Tests作成 (Manual testing required)
- [x] 既存439テストがすべてパス (556 tests pass)
- [x] Lint/Formatエラーゼロ
