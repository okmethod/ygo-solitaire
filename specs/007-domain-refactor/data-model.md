# Data Model: Domain Layer Refactoring

**Date**: 2025-12-22
**Context**: ドメイン層の型定義整理とCommand/Effect構造

## Overview

このドキュメントでは、リファクタリング後のDomain層の型定義とその関係性を整理する。ドメインドキュメント（docs/domain/）の用語と完全に一致させる。

---

## Core Types (Domain Models)

### CardData (旧 DomainCardData)

**Purpose**: ゲームロジックに必要な最小限のカード情報

**Location**: `domain/models/Card.ts`

**Definition**:
```typescript
export interface CardData {
  readonly id: number;              // カードID（YGOPRODeck API互換）
  readonly type: SimpleCardType;    // "monster" | "spell" | "trap"
  readonly frameType?: string;      // フレームタイプ（"normal", "effect"等）
  readonly spellType?: SpellSubType; // 魔法サブタイプ（spellの場合）
  readonly trapType?: TrapSubType;  // 罠サブタイプ（trapの場合）
}

export type SimpleCardType = "monster" | "spell" | "trap";
export type SpellSubType = "normal" | "quick-play" | "continuous" | "field" | "equip" | "ritual";
export type TrapSubType = "normal" | "continuous" | "counter";
```

**Relationships**:
- Used by: `cardDatabase.ts` (Registry), `CardInstance` (runtime reference)
- Referenced in: ドキュメント「Card Data (カードデータ)」

**Validation Rules**:
- `id` must be positive integer
- `type` must be one of SimpleCardType values
- `spellType` required only when `type === "spell"`
- `trapType` required only when `type === "trap"`

---

### CardInstance

**Purpose**: ゲーム内の1枚のカード実体（ランタイム表現）

**Location**: `domain/models/Card.ts`

**Definition**:
```typescript
export interface CardInstance {
  readonly instanceId: string;      // 一意なインスタンスID（例: "deck-0", "hand-1"）
  readonly cardId: string;          // CardDataへの参照（数値を文字列化）
  readonly type: SimpleCardType;    // ゲームルール検証用
  readonly location: ZoneLocation;  // 現在の位置
  readonly position?: "faceUp" | "faceDown"; // フィールドカードの表示形式
}

export type ZoneLocation = "deck" | "hand" | "field" | "graveyard" | "banished";
```

**Relationships**:
- References: `CardData` (via `cardId`)
- Used by: `GameState.zones`, `ChainBlock`
- Referenced in: ドキュメント「Card Instance (カードインスタンス)」

**State Transitions**:
```
deck → hand (draw)
hand → field (summon/activate)
hand → graveyard (discard)
field → graveyard (destroy/resolve)
graveyard → banished (banish)
```

---

### GameState

**Purpose**: ゲーム全体の不変状態

**Location**: `domain/models/GameState.ts`

**Definition**:
```typescript
export interface GameState {
  readonly zones: Zones;
  readonly lp: LifePoints;
  readonly phase: GamePhase;
  readonly turn: number;
  readonly chainStack: readonly ChainBlock[];
  readonly result: GameResult;
}

export interface Zones {
  readonly deck: readonly CardInstance[];
  readonly hand: readonly CardInstance[];
  readonly field: readonly CardInstance[];
  readonly graveyard: readonly CardInstance[];
  readonly banished: readonly CardInstance[];
}

export interface LifePoints {
  readonly player: number;
  readonly opponent: number;
}

export type GamePhase = "Draw" | "Standby" | "Main1" | "Battle" | "Main2" | "End";

export interface GameResult {
  readonly isGameOver: boolean;
  readonly winner?: "player" | "opponent" | "draw";
  readonly reason?: "exodia" | "lp0" | "deckout" | "surrender";
  readonly message?: string;
}
```

**Immutability Pattern**:
- すべてのフィールドは`readonly`
- 更新はspread構文で新しいインスタンスを生成
- Zone操作は`Zone.ts`の純粋関数を使用

**Example Update**:
```typescript
// Command内での更新パターン
const newZones = drawCard(state.zones, 1);  // Zone.tsの純粋関数
const newState: GameState = {
  ...state,
  zones: newZones,
};
```

---

## Command Pattern Types

### GameCommand

**Purpose**: ゲーム操作の抽象インターフェース

**Location**: `domain/commands/GameCommand.ts`

**Definition**:
```typescript
export interface GameCommand {
  readonly description: string;
  canExecute(state: GameState): boolean;
  execute(state: GameState): CommandResult;
}

export interface CommandResult {
  readonly success: boolean;
  readonly newState: GameState;
  readonly message?: string;
  readonly error?: string;
}
```

**Implementations** (all in `domain/commands/`):
1. `DrawCardCommand` - デッキからカードをドローする
2. `DiscardCardsCommand` - 手札からカードを捨てる
3. `ActivateSpellCommand` - 魔法カードを発動する
4. `AdvancePhaseCommand` - フェイズを進める
5. `ShuffleDeckCommand` - デッキをシャッフルする

**Usage Pattern**:
```typescript
const cmd = new DrawCardCommand(2);
if (cmd.canExecute(state)) {
  const result = cmd.execute(state);
  if (result.success) {
    // result.newState を使用
  }
}
```

---

## Effect System Types

### CardEffect

**Purpose**: カード効果の抽象インターフェース

**Location**: `domain/effects/CardEffect.ts`

**Definition**:
```typescript
export interface CardEffect {
  canActivate(state: GameState): boolean;
  createSteps(state: GameState, activatedCardInstanceId: string): EffectResolutionStep[];
}
```

**Implementations** (in `domain/effects/cards/`):
- `PotOfGreedEffect` - 強欲な壺（2ドロー）
- `GracefulCharityEffect` - 天使の施し（3ドロー→2捨て）

---

### EffectResolutionStep

**Purpose**: 効果解決ステップの定義

**Location**: `domain/effects/EffectResolutionStep.ts`

**Definition**:
```typescript
export interface EffectResolutionStep {
  readonly id: string;
  readonly title: string;
  readonly message: string;
  readonly action: () => void;  // FIXME: Presentation層依存（次のSpecで解消）
}
```

**Known Issue**:
- `action`がSvelte storeを直接操作（Presentation層依存）
- 次のSpecで`execute: (state: GameState) => CommandResult`に変更予定

---

### CardEffectRegistry

**Purpose**: カードIDと効果実装のマッピング管理

**Location**: `domain/effects/CardEffectRegistry.ts` (移動後)

**Definition**:
```typescript
export class CardEffectRegistry {
  private static effects: Map<number, CardEffect> = new Map();

  static register(cardId: number, effect: CardEffect): void;
  static get(cardId: number): CardEffect | undefined;
  static has(cardId: number): boolean;
  static clear(): void;
}
```

**Usage**:
```typescript
// 登録（アプリ起動時）
CardEffectRegistry.register(55144522, new PotOfGreedEffect());

// 取得（ActivateSpellCommand内）
const effect = CardEffectRegistry.get(cardId);
if (effect && effect.canActivate(state)) {
  const steps = effect.createSteps(state, instanceId);
  // ...
}
```

---

## Application Layer Types (DTOs)

### CardDisplayData

**Purpose**: UI表示用のカード情報

**Location**: `application/types/card.ts`

**Definition**:
```typescript
export interface CardDisplayData {
  id: number;
  name: string;
  type: CardType;  // "monster" | "spell" | "trap" (Application層の型)
  description: string;
  frameType?: string;
  archetype?: string;
  monsterAttributes?: MonsterAttributes;
  images?: CardImages;
}

export type CardType = "monster" | "spell" | "trap";  // SimpleCardTypeと同等だが別定義
```

**Distinction from CardData**:
- `CardData` (Domain): ゲームロジック用、最小限の情報
- `CardDisplayData` (Application): UI表示用、名前・画像含む
- Application層がInfrastructure層（YGOProDeckAdapter）から取得

---

## Type Naming Consistency

| ドメインドキュメント用語 | コード型名（Before） | コード型名（After） | レイヤー |
|---|---|---|---|
| Card Data (カードデータ) | DomainCardData | **CardData** | Domain |
| Card Instance (カードインスタンス) | CardInstance | CardInstance | Domain |
| Game State (ゲーム状態) | GameState | GameState | Domain |
| - (UI表示用) | CardDisplayData | CardDisplayData | Application |

**Key Changes**:
- `DomainCardData` → `CardData` (ドキュメント用語と完全一致)
- `SimpleCardType`はそのまま（3種類のみの簡略型として妥当）

---

## Validation Rules Summary

### CardData
- `id`: Positive integer, YGOPRODeck API compatible
- `type`: One of ["monster", "spell", "trap"]
- `spellType`: Required if type === "spell"
- `trapType`: Required if type === "trap"

### CardInstance
- `instanceId`: Unique string (format: "{location}-{index}")
- `cardId`: String representation of CardData.id
- `location`: One of ["deck", "hand", "field", "graveyard", "banished"]
- `position`: Optional, only for field cards

### GameState
- `zones.deck.length`: >= 0
- `lp.player`: >= 0 (0で敗北)
- `lp.opponent`: >= 0 (0で勝利)
- `phase`: One of GamePhase values
- `turn`: >= 1
- Immutability: All updates via spread syntax

---

## Relationships Diagram

```
CardData (domain/models/Card.ts)
  ↑ referenced by
CardInstance (domain/models/Card.ts)
  ↑ contained in
GameState (domain/models/GameState.ts)
  ↑ operated by
GameCommand (domain/commands/GameCommand.ts)
  ├─ DrawCardCommand
  ├─ DiscardCardsCommand
  ├─ ActivateSpellCommand
  ├─ AdvancePhaseCommand
  └─ ShuffleDeckCommand

CardEffect (domain/effects/CardEffect.ts)
  ├─ PotOfGreedEffect
  └─ GracefulCharityEffect
  ↑ registered in
CardEffectRegistry (domain/effects/CardEffectRegistry.ts)
  ↑ used by
ActivateSpellCommand

GameFacade (application/GameFacade.ts)
  → calls → GameCommand
  → updates → Svelte stores (presentation/)
```

---

## Migration Notes

### Type Renaming
- すべての`import type { DomainCardData }`を`import type { CardData }`に更新
- 影響範囲: ~30ファイル（domain/, application/, infrastructure/）

### File Movements
- `application/commands/` → `domain/commands/` (5ファイル)
- `application/effects/CardEffectRegistry.ts` → `domain/effects/`
- テストファイルも同様に移動

### Import Path Updates
```typescript
// Before
import { DrawCardCommand } from '$lib/application/commands/DrawCardCommand';

// After
import { DrawCardCommand } from '$lib/domain/commands/DrawCardCommand';
```

---

## Testing Strategy

### Unit Tests (domain/commands/)
- `canExecute()`: 実行条件の検証
- `execute()`: 状態遷移の検証、不変性の検証
- Edge cases: 空デッキ、手札上限、無効な操作

### Integration Tests
- GameFacade ↔ Commands の連携
- CardEffectRegistry ↔ ActivateSpellCommand の連携

### Validation
- すべてのテストが移動後も100%パス
- TypeScriptコンパイルエラーゼロ
- ESLint/Prettierエラーゼロ
