# Data Model: Zone Architecture Expansion

**Feature**: 014-zone-expansion
**Date**: 2026-01-03
**Purpose**: Define data structures and relationships for zone architecture and card placement

## Core Entities

### 1. Zones (Updated)

**Purpose**: ゲームフィールドの各ゾーンを管理するコンテナ

**Fields**:

```typescript
interface Zones {
  readonly deck: readonly CardInstance[];
  readonly hand: readonly CardInstance[];
  readonly mainMonsterZone: readonly CardInstance[]; // NEW: モンスター専用ゾーン（最大5枚）
  readonly spellTrapZone: readonly CardInstance[]; // RENAMED: field → spellTrapZone（最大5枚）
  readonly fieldZone: readonly CardInstance[]; // NEW: フィールド魔法専用（最大1枚）
  readonly graveyard: readonly CardInstance[];
  readonly banished: readonly CardInstance[];
}
```

**Validation Rules**:

- `mainMonsterZone.length <= 5`
- `spellTrapZone.length <= 5`
- `fieldZone.length <= 1`
- 各 CardInstance の`location`プロパティはゾーン名と一致すること

**Relationships**:

- 各ゾーンは`CardInstance`の配列
- `CardInstance.location`で現在のゾーンを識別

### 2. GameState (Extended)

**Purpose**: ゲーム全体の状態を管理

**New Fields**:

```typescript
interface GameState {
  // 既存フィールド...
  readonly zones: Zones;
  readonly lp: LifePoints;
  readonly phase: GamePhase;
  readonly turn: number;

  // NEW: 召喚権管理
  readonly normalSummonLimit: number; // デフォルト1、カード効果で増減可
  readonly normalSummonUsed: number; // 初期値0、召喚・セット毎に+1

  readonly chainStack: readonly ChainBlock[];
  readonly result: GameResult;

  readonly activatedIgnitionEffectsThisTurn: ReadonlySet<string>;
  readonly activatedOncePerTurnCards: ReadonlySet<number>;
  readonly pendingEndPhaseEffects: readonly EffectResolutionStep[];
  readonly damageNegation: boolean;
}
```

**Validation Rules**:

- `normalSummonLimit >= 0`
- `normalSummonUsed >= 0`
- `normalSummonUsed <= normalSummonLimit`（通常時）

**State Transitions**:

```
Initial: { normalSummonLimit: 1, normalSummonUsed: 0 }
After Summon/Set: { normalSummonLimit: 1, normalSummonUsed: 1 }
Turn End (future): { normalSummonLimit: 1, normalSummonUsed: 0 }  // リセット
```

### 3. CardInstance (Extended)

**Purpose**: 個別のカードインスタンスを管理

**New Fields**:

```typescript
interface CardInstance extends CardData {
  readonly instanceId: string;
  readonly location: keyof Zones;
  readonly position?: "faceUp" | "faceDown";

  // NEW: モンスターカード用
  readonly battlePosition?: "attack" | "defense"; // 召喚時"attack"、セット時"defense"

  // NEW: 配置ターン追跡
  readonly placedThisTurn: boolean; // 初期値false、配置時true
}
```

**Validation Rules**:

- `battlePosition`はモンスターカード（`type === "monster"`）のみ設定
- `placedThisTurn`は配置コマンド実行時に`true`に設定
- ターン終了時に`placedThisTurn`を`false`にリセット（将来実装）

**Field Dependencies**:

- `location === "mainMonsterZone"` → `battlePosition`必須
- `position === "faceDown" && battlePosition === "defense"` → セット状態
- `position === "faceUp" && battlePosition === "attack"` → 召喚状態

## Commands

### 4. SummonMonsterCommand (New)

**Purpose**: モンスターカードを表側攻撃表示で mainMonsterZone に配置

**Input**:

```typescript
constructor(cardInstanceId: string)
```

**Preconditions**:

- `state.phase === "Main1"`
- `state.normalSummonUsed < state.normalSummonLimit`
- `state.zones.mainMonsterZone.length < 5`
- `cardInstance.location === "hand"`
- `cardInstance.type === "monster"`
- `!state.result.isGameOver`

**State Changes**:

```typescript
// Before
zones.hand: [cardInstance]
normalSummonUsed: 0

// After
zones.mainMonsterZone: [{ ...cardInstance, location: "mainMonsterZone", position: "faceUp", battlePosition: "attack", placedThisTurn: true }]
normalSummonUsed: 1
```

### 5. SetMonsterCommand (New)

**Purpose**: モンスターカードを裏側守備表示で mainMonsterZone に配置

**Input**:

```typescript
constructor(cardInstanceId: string)
```

**Preconditions**:

- `state.phase === "Main1"`
- `state.normalSummonUsed < state.normalSummonLimit`
- `state.zones.mainMonsterZone.length < 5`
- `cardInstance.location === "hand"`
- `cardInstance.type === "monster"`
- `!state.result.isGameOver`

**State Changes**:

```typescript
// Before
zones.hand: [cardInstance]
normalSummonUsed: 0

// After
zones.mainMonsterZone: [{ ...cardInstance, location: "mainMonsterZone", position: "faceDown", battlePosition: "defense", placedThisTurn: true }]
normalSummonUsed: 1
```

### 6. SetSpellTrapCommand (New)

**Purpose**: 魔法・罠カードを裏側表示で spellTrapZone または fieldZone に配置

**Input**:

```typescript
constructor(cardInstanceId: string)
```

**Preconditions**:

- `state.phase === "Main1"`
- `cardInstance.location === "hand"`
- `cardInstance.type === "spell" || cardInstance.type === "trap"`
- フィールド魔法の場合: `true`（既存カードは自動墓地送り）
- フィールド魔法以外の場合: `state.zones.spellTrapZone.length < 5`
- `!state.result.isGameOver`

**State Changes**:

```typescript
// Case 1: フィールド魔法
// Before
zones.hand: [fieldSpellInstance]
zones.fieldZone: [existingFieldSpell]

// After
zones.fieldZone: [{ ...fieldSpellInstance, location: "fieldZone", position: "faceDown", placedThisTurn: true }]
zones.graveyard: [...graveyard, existingFieldSpell]

// Case 2: 通常魔法・永続魔法・速攻魔法・罠
// Before
zones.hand: [spellInstance]

// After
zones.spellTrapZone: [{ ...spellInstance, location: "spellTrapZone", position: "faceDown", placedThisTurn: true }]
```

**Zone Selection Logic**:

```typescript
const targetZone = cardData.subtype === "Field" ? "fieldZone" : "spellTrapZone";
```

### 7. ActivateSpellCommand (Updated)

**Purpose**: 魔法カードを発動（既存機能 + フィールド魔法対応）

**New Logic**:

```typescript
// フィールド魔法判定
if (cardData.subtype === "Field") {
  targetZone = "fieldZone";
  // 既存フィールド魔法を墓地送り
  if (zones.fieldZone.length > 0) {
    zones = sendToGraveyard(zones, zones.fieldZone[0].instanceId);
  }
} else {
  targetZone = "spellTrapZone";
}

// 裏側表示からの発動制限チェック
if (cardInstance.position === "faceDown" && cardData.subtype === "Quick-Play" && cardInstance.placedThisTurn) {
  return createFailureResult(state, "速攻魔法はセットしたターンに発動できません");
}
```

## Helper Functions

### Zone Operations (Updated)

**moveCard**:

```typescript
function moveCard(
  zones: Zones,
  instanceId: string,
  from: keyof Zones,
  to: keyof Zones,
  position?: "faceUp" | "faceDown",
  battlePosition?: "attack" | "defense",
  placedThisTurn?: boolean,
): Zones;
```

- 新パラメータ: `battlePosition`、`placedThisTurn`
- 既存の実装を拡張

**sendToGraveyard** (Updated):

```typescript
function sendToGraveyard(zones: Zones, instanceId: string): Zones {
  const card = [
    ...zones.mainMonsterZone, // NEW
    ...zones.spellTrapZone, // NEW
    ...zones.fieldZone, // NEW
    ...zones.hand,
  ].find((c) => c.instanceId === instanceId);

  if (!card) throw new Error(`Card ${instanceId} not found`);

  const sourceZone = card.location as keyof Zones;
  return moveCard(zones, instanceId, sourceZone, "graveyard");
}
```

## Summon Rule

### 8. SummonRule (New)

**Purpose**: 召喚権チェックロジックを集約

**Function**:

```typescript
export function canNormalSummon(state: GameState): {
  canSummon: boolean;
  reason?: string;
} {
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

## Entity Relationship Diagram

```
GameState
├── zones: Zones
│   ├── deck: CardInstance[]
│   ├── hand: CardInstance[]
│   ├── mainMonsterZone: CardInstance[]      (max 5, monsters only)
│   ├── spellTrapZone: CardInstance[]        (max 5, spell/trap except field)
│   ├── fieldZone: CardInstance[]            (max 1, field spells only)
│   ├── graveyard: CardInstance[]
│   └── banished: CardInstance[]
├── normalSummonLimit: number                 (default 1)
└── normalSummonUsed: number                  (default 0)

CardInstance
├── instanceId: string
├── location: keyof Zones
├── position: "faceUp" | "faceDown"
├── battlePosition: "attack" | "defense"      (monsters only)
└── placedThisTurn: boolean                   (default false)
```

## Validation Summary

| Entity       | Field             | Constraint                 |
| ------------ | ----------------- | -------------------------- |
| Zones        | mainMonsterZone   | length <= 5                |
| Zones        | spellTrapZone     | length <= 5                |
| Zones        | fieldZone         | length <= 1                |
| GameState    | normalSummonLimit | >= 0                       |
| GameState    | normalSummonUsed  | >= 0, <= limit             |
| CardInstance | battlePosition    | Only if type === "monster" |
| CardInstance | placedThisTurn    | Set to true on placement   |

## Migration Notes

### Breaking Changes

- `Zones.field` → `Zones.spellTrapZone`（リネーム）
- 既存のすべての`zones.field`参照を更新必要

### Backward Compatibility

- 既存の CardInstance は`battlePosition`と`placedThisTurn`が undefined で互換性維持
- 既存の Zone 操作ヘルパー関数は新ゾーンに対応する形で拡張
