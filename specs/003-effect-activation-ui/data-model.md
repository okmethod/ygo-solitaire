# Data Model: Effect Activation UI with Card Illustrations

**Feature**: 003-effect-activation-ui | **Date**: 2025-11-30

## Purpose

このドキュメントは、機能で使用するデータモデルとその関係性を定義する。3層アーキテクチャに従い、各レイヤーでのデータ表現を明確化する。

## Data Flow Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    User Action (Click Card)                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           Presentation Layer (V2 Simulator Page)             │
│  - CardDisplayData (images, name, description, stats)        │
│  - onClick handler → GameFacade.activateSpell()              │
└────────────────────┬────────────────────────────────────────┘
                     │ CardDisplayData
                     │ ← derived from cardDisplayStore
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         Application Layer (cardDisplayStore.ts)              │
│  - Svelte derived store                                      │
│  - Subscribe to gameStateStore (CardInstance[])              │
│  - Fetch from YGOPRODeck API → CardDisplayData               │
└────────────────────┬────────────────────────────────────────┘
                     │ CardInstance[]
                     │ ← from gameStateStore
                     ▼
┌─────────────────────────────────────────────────────────────┐
│            Domain Layer (GameState.zones)                    │
│  - CardInstance { instanceId, cardId, location }             │
│  - No display data (id only)                                 │
└─────────────────────────────────────────────────────────────┘
                     ▲
                     │ Commands update GameState
                     │
┌─────────────────────────────────────────────────────────────┐
│               GameFacade (Command Interface)                 │
│  - drawCard(), advancePhase(), activateSpell()               │
│  - Execute Commands → Update gameStateStore                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Layer 1: Domain Layer (既存)

### CardInstance

**Location**: `src/lib/domain/models/Card.ts` (既存)

**Purpose**: ゲーム状態における個々のカードインスタンスを表現

**Structure**:
```typescript
export interface CardInstance {
  readonly instanceId: string;      // 一意識別子 (例: "hand-0", "deck-5")
  readonly cardId: string;           // カードID (数値を文字列化, 例: "79571449")
  readonly location: ZoneLocation;   // 現在の位置
  readonly position?: "faceUp" | "faceDown"; // フィールド上の向き (オプション)
}

export type ZoneLocation = "deck" | "hand" | "field" | "graveyard" | "banished";
```

**Validation Rules**:
- `instanceId`: 一意性保証（`location-index`形式）
- `cardId`: 数値を文字列化した形式（YGOPRODeck API IDと対応）
- `location`: 5つのゾーンのいずれか

**State Transitions**:
```
deck → hand (DrawCardCommand)
hand → field (ActivateSpellCommand - 将来実装)
field → graveyard (効果解決後)
```

**変更なし**: このレイヤーは既存実装をそのまま使用

---

### GameState

**Location**: `src/lib/domain/models/GameState.ts` (既存)

**Purpose**: ゲーム全体の不変状態を保持

**Structure**:
```typescript
export interface GameState {
  readonly zones: {
    readonly deck: readonly CardInstance[];
    readonly hand: readonly CardInstance[];
    readonly field: readonly CardInstance[];
    readonly graveyard: readonly CardInstance[];
    readonly banished: readonly CardInstance[];
  };
  readonly lp: {
    readonly player: number;
    readonly opponent: number;
  };
  readonly phase: GamePhase;
  readonly turn: number;
  readonly chainStack: readonly CardInstance[];
  readonly result: {
    readonly isGameOver: boolean;
    readonly winner?: "player" | "opponent";
    readonly reason?: string;
    readonly message?: string;
  };
}
```

**Relationships**:
- `zones.*` は `CardInstance[]` の配列
- すべてのプロパティは `readonly` (不変性)
- Immer.jsの `produce()` で更新

**変更なし**: このレイヤーは既存実装をそのまま使用

---

## Layer 2: Application Layer (新規 + 既存)

### cardDisplayStore (新規)

**Location**: `src/lib/application/stores/cardDisplayStore.ts` (新規作成)

**Purpose**: CardInstanceからCardDisplayDataへの変換をリアクティブに提供

**Implementation**:
```typescript
import { derived, type Readable } from 'svelte/store';
import { gameStateStore } from './gameStateStore';
import { getCardsByIds } from '$lib/api/ygoprodeck';
import type { CardDisplayData } from '$lib/types/card';

/**
 * 手札のCardDisplayData配列を提供
 * gameStateStoreの変更を監視し、自動的にYGOPRODeck APIから取得
 */
export const handCards: Readable<CardDisplayData[]> = derived(
  gameStateStore,
  ($gameState, set) => {
    const cardIds = $gameState.zones.hand.map(c => parseInt(c.cardId, 10));

    if (cardIds.length === 0) {
      set([]);
      return;
    }

    getCardsByIds(fetch, cardIds)
      .then(cards => set(cards))
      .catch(err => {
        console.error('[cardDisplayStore] Failed to fetch hand cards:', err);
        set([]); // エラー時は空配列（placeholder表示）
      });
  },
  [] as CardDisplayData[] // 初期値
);

/**
 * フィールドのCardDisplayData配列を提供
 */
export const fieldCards: Readable<CardDisplayData[]> = derived(
  gameStateStore,
  ($gameState, set) => {
    const cardIds = $gameState.zones.field.map(c => parseInt(c.cardId, 10));

    if (cardIds.length === 0) {
      set([]);
      return;
    }

    getCardsByIds(fetch, cardIds)
      .then(cards => set(cards))
      .catch(err => {
        console.error('[cardDisplayStore] Failed to fetch field cards:', err);
        set([]);
      });
  },
  [] as CardDisplayData[]
);

/**
 * 墓地のCardDisplayData配列を提供
 */
export const graveyardCards: Readable<CardDisplayData[]> = derived(
  gameStateStore,
  ($gameState, set) => {
    const cardIds = $gameState.zones.graveyard.map(c => parseInt(c.cardId, 10));

    if (cardIds.length === 0) {
      set([]);
      return;
    }

    getCardsByIds(fetch, cardIds)
      .then(cards => set(cards))
      .catch(err => {
        console.error('[cardDisplayStore] Failed to fetch graveyard cards:', err);
        set([]);
      });
  },
  [] as CardDisplayData[]
);

/**
 * 除外ゾーンのCardDisplayData配列を提供
 */
export const banishedCards: Readable<CardDisplayData[]> = derived(
  gameStateStore,
  ($gameState, set) => {
    const cardIds = $gameState.zones.banished.map(c => parseInt(c.cardId, 10));

    if (cardIds.length === 0) {
      set([]);
      return;
    }

    getCardsByIds(fetch, cardIds)
      .then(cards => set(cards))
      .catch(err => {
        console.error('[cardDisplayStore] Failed to fetch banished cards:', err);
        set([]);
      });
  },
  [] as CardDisplayData[]
);

/**
 * CardInstanceのinstanceIdからCardDisplayDataを取得するヘルパー関数
 */
export function getCardDisplayDataByInstanceId(
  instanceId: string,
  allCards: CardDisplayData[]
): CardDisplayData | null {
  const instance = gameStateStore.getCurrentState().zones.hand.find(c => c.instanceId === instanceId)
    || gameStateStore.getCurrentState().zones.field.find(c => c.instanceId === instanceId);

  if (!instance) return null;

  const cardId = parseInt(instance.cardId, 10);
  return allCards.find(c => c.id === cardId) || null;
}
```

**Key Features**:
- **自動更新**: gameStateStoreが変更されると自動的に再取得
- **キャッシュ活用**: getCardsByIds()の内部キャッシュを利用
- **エラーハンドリング**: API失敗時は空配列を返し、placeholder表示
- **型安全**: `CardDisplayData[]` の型付きReadableストア

---

### gameStateStore (既存)

**Location**: `src/lib/application/stores/gameStateStore.ts` (既存)

**Purpose**: GameStateの単一情報源

**変更なし**: cardDisplayStoreがこのストアを監視する形で依存

---

### derivedStores (既存)

**Location**: `src/lib/application/stores/derivedStores.ts` (既存)

**Purpose**: ゲーム状態から計算される派生値

**使用するストア** (この機能で利用):
- `currentPhase`: 現在のフェーズ（"Main1"で魔法発動可能）
- `canActivateSpells`: 魔法カード発動可否
- `isGameOver`: ゲーム終了フラグ

**変更なし**: 既存の派生ストアをそのまま使用

---

## Layer 3: Presentation Layer (既存 + 変更)

### CardDisplayData (既存)

**Location**: `src/lib/types/card.ts` (既存)

**Purpose**: UI表示用の完全なカードデータ

**Structure**:
```typescript
export interface CardDisplayData {
  // 必須プロパティ
  id: number;                         // YGOPRODeck API ID
  name: string;                       // カード名
  type: CardType;                     // "monster" | "spell" | "trap"
  description: string;                // 効果テキスト

  // オプショナルプロパティ
  frameType?: string;                 // "normal", "effect", "xyz" など
  archetype?: string;                 // アーキタイプ名

  // モンスター専用
  monsterAttributes?: MonsterAttributes; // ATK, DEF, Level, Attribute, Race

  // 画像
  images?: CardImages;                // image, imageSmall, imageCropped
}

export type Card = CardDisplayData;   // エイリアス
```

**Validation Rules**:
- `id`: YGOPRODeck APIから取得した数値ID
- `name`: 空文字列不可
- `type`: "monster" | "spell" | "trap" のいずれか
- `images`: API取得時は常に存在（エラー時のみundefined）

**Usage**:
- Card.svelteコンポーネントに渡す
- DuelField.svelteの配列propsに使用

**変更なし**: 既存の型定義をそのまま使用

---

### DuelFieldProps (変更)

**Location**: `src/lib/components/organisms/board/DuelField.svelte` (既存、propsのみ変更)

**Current interface**:
```typescript
interface DuelFieldProps {
  deckCards: number;                    // デッキ枚数
  extraDeckCards: Card[];               // エクストラデッキのカード
  graveyardCards: Card[];               // 墓地のカード
  fieldCards: Card[];                   // フィールド魔法
  monsterCards: (Card | null)[];        // モンスターゾーン (5つ)
  spellTrapCards: (Card | null)[];      // 魔法・罠ゾーン (5つ)
}
```

**変更内容**:
- `extraDeckCards`: 現状は空配列（将来実装）
- `monsterCards`, `spellTrapCards`: `fieldCards`をフィルタして分割
- その他のpropsは既存のまま

**親コンポーネントでのマッピング** (V2シミュレーター):
```typescript
// +page.svelte
import { fieldCards, graveyardCards } from '$lib/application/stores/cardDisplayStore';
import { deckCardCount } from '$lib/application/stores/derivedStores';

$: monsterZone = $fieldCards
  .filter(c => c.type === 'monster')
  .slice(0, 5)
  .concat(Array(5 - $fieldCards.filter(c => c.type === 'monster').length).fill(null));

$: spellTrapZone = $fieldCards
  .filter(c => c.type !== 'monster')
  .slice(0, 5)
  .concat(Array(5 - $fieldCards.filter(c => c.type !== 'monster').length).fill(null));
```

---

## Entity Relationships

```
GameState (Domain)
  └── zones.hand: CardInstance[]
       ├── instanceId: "hand-0"
       └── cardId: "79571449"
            │
            ▼ (cardDisplayStore observes)
            │
YGOPRODeck API
  └── /cardinfo.php?id=79571449
       │
       ▼ (getCardsByIds fetches)
       │
CardDisplayData (Presentation)
  ├── id: 79571449
  ├── name: "Graceful Charity"
  ├── type: "spell"
  ├── description: "Draw 3 cards..."
  └── images: { imageSmall: "https://..." }
       │
       ▼ (passed to component)
       │
Card.svelte
  └── Displays card illustration
```

---

## Validation Rules Summary

| Entity | Rule | Layer |
|--------|------|-------|
| CardInstance.instanceId | 一意性、`location-index`形式 | Domain |
| CardInstance.cardId | 数値を文字列化（例: "123456"） | Domain |
| CardDisplayData.id | YGOPRODeck API数値ID | Presentation |
| CardDisplayData.type | "monster" \| "spell" \| "trap" | Presentation |
| DuelFieldProps.monsterCards | 長さ5の配列（null埋め） | Presentation |
| DuelFieldProps.spellTrapCards | 長さ5の配列（null埋め） | Presentation |

---

## Data Conversion Functions

### cardId (string) → API ID (number)

```typescript
// src/lib/application/stores/cardDisplayStore.ts
const cardIds = $gameState.zones.hand.map(c => parseInt(c.cardId, 10));
```

### YGOProDeckCard → CardDisplayData

```typescript
// src/lib/types/ygoprodeck.ts (既存)
export function convertToCardDisplayData(apiCard: YGOProDeckCard): CardDisplayData {
  const cardType = normalizeType(apiCard.type);
  const cardImage = apiCard.card_images[0];

  const monsterAttributes = cardType === "monster" ? {
    attack: apiCard.atk ?? 0,
    defense: apiCard.def ?? 0,
    level: apiCard.level ?? 0,
    attribute: apiCard.attribute ?? "",
    race: apiCard.race ?? "",
  } : undefined;

  const images = {
    image: cardImage.image_url,
    imageSmall: cardImage.image_url_small,
    imageCropped: cardImage.image_url_cropped,
  };

  return {
    id: apiCard.id,
    name: apiCard.name,
    type: cardType,
    description: apiCard.desc,
    frameType: apiCard.frameType,
    archetype: apiCard.archetype,
    monsterAttributes,
    images,
  };
}
```

---

## Performance Considerations

### メモリ使用量

- **CardInstance**: ~100 bytes/card × 40 cards = 4KB
- **CardDisplayData**: ~2KB/card × 40 cards = 80KB
- **YGOPRODeck APIキャッシュ**: ~5KB/card × 100 cards = 500KB

**合計**: < 1MB（許容範囲）

### API呼び出し頻度

- **初回ロード**: デッキ全体（20-40カード） → 1-2リクエスト
- **ドロー時**: 1カード → キャッシュヒット（0リクエスト）
- **フェーズ移行**: 状態変更なし → 0リクエスト

**Rate Limit対策**: キャッシュにより、ほとんどのケースでAPIリクエスト不要

---

## Testing Strategy

### Unit Tests

**cardDisplayStore.test.ts** (新規):
```typescript
describe('cardDisplayStore', () => {
  it('should return empty array when hand is empty', async () => {
    gameStateStore.set(createEmptyGameState());
    const cards = get(handCards);
    expect(cards).toEqual([]);
  });

  it('should fetch CardDisplayData when hand has cards', async () => {
    gameStateStore.set(createGameStateWithHand(['79571449']));
    await tick(); // Wait for derived store update
    const cards = get(handCards);
    expect(cards).toHaveLength(1);
    expect(cards[0].name).toBe('Graceful Charity');
  });

  it('should return empty array on API error', async () => {
    // Mock fetch to throw error
    const cards = get(handCards);
    expect(cards).toEqual([]);
  });
});
```

### Integration Tests

V2シミュレーターページで、GameState更新 → cardDisplayStore更新 → UI再レンダリングの一連の流れをテスト

### E2E Tests

Playwrightで実際のカード表示を検証

---

## Open Questions

なし。すべてのデータモデルが明確化された。
