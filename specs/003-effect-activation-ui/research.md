# Research: Effect Activation UI with Card Illustrations

**Feature**: 003-effect-activation-ui | **Date**: 2025-11-30

## Purpose

このドキュメントは、実装開始前の技術調査結果をまとめ、設計判断の根拠を記録する。

## Research Areas

### 1. Svelte Derived Storesによるデータ変換パターン

**調査内容**: CardInstance → CardDisplayDataの変換をどこで行うか

**Decision**: Application Layerにderivedストア（cardDisplayStore.ts）を作成し、GameStateの変更を監視して自動的にYGOPRODeck APIからデータを取得・変換する

**Rationale**:
- **リアクティビティ**: Svelte derivedストアは依存元が更新されると自動的に再計算される
- **レイヤー分離**: Domain Layer（CardInstance）とPresentation Layer（CardDisplayData）の変換をApplication Layerに配置
- **再利用性**: 複数のコンポーネントから同じ変換結果を参照可能

**Alternatives considered**:
1. ❌ **コンポーネント内で都度変換**: 各コンポーネントでgetCardsByIds()を呼ぶ
   - 却下理由: API呼び出しの重複、キャッシュの効果が薄い
2. ❌ **GameState自体にCardDisplayDataを含める**: Domain Layerに表示データを持たせる
   - 却下理由: レイヤー分離の原則違反、Domainが肥大化
3. ✅ **derivedストアで変換**: 自動更新+キャッシュ活用
   - 選択理由: Svelteのリアクティビティと最も相性が良い

**Implementation approach**:
```typescript
// cardDisplayStore.ts (新規)
import { derived } from 'svelte/store';
import { gameStateStore } from './gameStateStore';
import { getCardsByIds } from '$lib/api/ygoprodeck';

export const handCards = derived(
  gameStateStore,
  ($gameState, set) => {
    const cardIds = $gameState.zones.hand.map(c => parseInt(c.cardId, 10));
    getCardsByIds(fetch, cardIds)
      .then(cards => set(cards))
      .catch(err => console.error('Failed to fetch hand cards:', err));
  },
  [] // 初期値
);

// 同様に fieldCards, graveyardCards, banishedCards も作成
```

---

### 2. YGOPRODeck APIバッチ取得の最適化

**調査内容**: 複数カードを効率的に取得する方法

**Decision**: 既存の `getCardsByIds()` 関数を活用し、メモリキャッシュを最大限利用

**Rationale**:
- **バッチリクエスト**: `cardinfo.php?id=123,456,789` 形式で複数カード同時取得
- **キャッシュヒット優先**: キャッシュ済みカードはAPIリクエストから除外
- **Rate Limit対策**: 不要なリクエストを削減し、429エラーを回避

**Existing implementation** (`src/lib/api/ygoprodeck.ts`):
```typescript
const cardCache = new Map<number, YGOProDeckCard>();

export async function getCardsByIds(
  fetchFunction: typeof fetch,
  ids: number[]
): Promise<YGOProDeckCard[]> {
  const uniqueIds = Array.from(new Set(ids));
  const cachedCards: YGOProDeckCard[] = [];
  const uncachedIds: number[] = [];

  for (const id of uniqueIds) {
    const cached = cardCache.get(id);
    if (cached) {
      cachedCards.push(cached);
    } else {
      uncachedIds.push(id);
    }
  }

  if (uncachedIds.length === 0) {
    return cachedCards;
  }

  const idsParam = uncachedIds.join(',');
  const response = await fetchFunction(`${BASE_URL}/cardinfo.php?id=${idsParam}`);
  // ... レスポンス処理、キャッシュ保存

  return [...cachedCards, ...fetchedCards];
}
```

**Performance characteristics**:
- キャッシュヒット時: <1ms（メモリアクセスのみ）
- APIリクエスト時: ~200-500ms（ネットワーク依存）
- バッチ効率: 20カード/リクエストまで推奨

**No changes needed**: 既存実装で十分に最適化されている

---

### 3. DuelFieldコンポーネントのpropsインターフェース設計

**調査内容**: 既存DuelField.svelteをGameStateに接続する方法

**Decision**: propsを `CardInstance[]` から `CardDisplayData[]` に変更し、cardDisplayStoreから直接渡す

**Current interface** (`DuelField.svelte`):
```typescript
interface DuelFieldProps {
  deckCards: number;
  extraDeckCards: Card[];          // Card = CardDisplayData
  graveyardCards: Card[];
  fieldCards: Card[];
  monsterCards: (Card | null)[];   // 5つのゾーン
  spellTrapCards: (Card | null)[];  // 5つのゾーン
}
```

**Rationale**:
- DuelFieldは**Presentation Layer**コンポーネント → CardDisplayDataを受け取るべき
- CardInstanceの変換は親コンポーネント（V2シミュレーター）で実施
- ゾーン分割ロジックも親側で行い、DuelFieldはレイアウトのみに専念

**Mapping logic** (V2シミュレーターで実装):
```typescript
// +page.svelte
import { handCards, fieldCards, graveyardCards } from '$lib/application/stores/cardDisplayStore';

// ゾーンごとにCardDisplayDataを取得
$: monsterZone = $fieldCards.filter(c => c.type === 'monster').slice(0, 5);
$: spellTrapZone = $fieldCards.filter(c => c.type !== 'monster').slice(0, 5);
```

**Alternative considered**:
- ❌ **DuelField内でCardInstance → CardDisplayData変換**: コンポーネントが肥大化
  - 却下理由: 単一責任原則違反、テストが複雑化

---

### 4. 非同期データ取得時のUI状態管理

**調査内容**: API取得中のローディング表示とエラーハンドリング

**Decision**:
1. derivedストアの初期値を空配列 `[]` に設定
2. Card.svelteの既存placeholder機能を活用
3. エラー時はconsole.errorログ + カードIDのみ表示

**Rationale**:
- **段階的レンダリング**: キャッシュヒット分は即座に表示、未キャッシュ分は後から追加
- **エラー回復性**: API失敗時もアプリがクラッシュしない
- **UXバランス**: ローディングスピナーは過剰（大半がキャッシュヒットするため）

**Error handling strategy**:
```typescript
export const handCards = derived(
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
        console.error('Failed to fetch hand cards:', err);
        // 空配列のまま（Card.svelteがplaceholder表示）
        set([]);
      });
  },
  [] // 初期値: 空配列
);
```

**Placeholder behavior** (既存Card.svelte):
```svelte
{#if placeholder}
  <div class="relative">
    <div style="filter: sepia(0.3) hue-rotate(90deg);">
      <CardComponent placeholder={true} placeholderText="..." size="medium" />
    </div>
  </div>
{/if}
```

---

### 5. カードクリックイベントのハンドリング

**調査内容**: 効果発動コマンド実行の実装方法

**Decision**: Card.svelteの既存 `onClick` propsを活用し、V2シミュレーターページでGameFacadeを呼び出す

**Implementation pattern**:
```typescript
// +page.svelte
function handleCardClick(card: CardDisplayData, instanceId: string) {
  const result = gameFacade.activateSpell(instanceId);
  if (result.success) {
    showSuccessToast(result.message || "効果を発動しました");
  } else {
    showErrorToast(result.error || "発動に失敗しました");
  }
}
```

**Rationale**:
- **既存インターフェース活用**: Card.svelteは変更不要
- **責務分離**: カードは「クリックされた」を通知、親が「何を実行するか」を決定
- **テスト容易性**: ハンドラー関数を単体でテスト可能

**Phase restriction** (既存ルール):
- Main1フェーズのみ魔法カード発動可能
- derivedストア `canActivateSpells` を使用して判定

```typescript
{#if $currentPhase === "Main1" && $canActivateSpells}
  <Card
    card={cardData}
    clickable={true}
    onClick={() => handleCardClick(cardData, instanceId)}
  />
{:else}
  <Card card={cardData} clickable={false} />
{/if}
```

---

### 6. Svelte 5ルーンとstoreの相互運用

**調査内容**: `$state` と `$derived` をSvelteストアと併用する方法

**Decision**: ストアは `$` プレフィックスでリアクティブアクセス、コンポーネント内状態は `$state` ルーンを使用

**Pattern**:
```svelte
<script lang="ts">
  import { handCards } from '$lib/application/stores/cardDisplayStore';
  import { currentPhase } from '$lib/application/stores/derivedStores';

  // ストアは $ プレフィックスで自動サブスクライブ
  $: displayCards = $handCards;

  // コンポーネント内ローカル状態は $state ルーン
  let selectedCardId = $state<string | null>(null);

  // 計算プロパティは $derived ルーン
  let canActivate = $derived($currentPhase === "Main1" && selectedCardId !== null);
</script>
```

**Best practices**:
- **ストア**: アプリ全体の状態（GameState, CardDisplayData）
- **$state**: コンポーネント固有の一時状態（選択状態、モーダル表示など）
- **$derived**: ストアまたは$stateから計算される値

**Reference**: [Svelte 5 Migration Guide - Runes](https://svelte.dev/docs/svelte/v5-migration-guide#Runes)

---

## Summary of Key Decisions

| 領域 | 決定 | 根拠 |
|------|------|------|
| データ変換 | derivedストアでCardInstance→CardDisplayData | リアクティビティ+レイヤー分離 |
| API取得 | 既存getCardsByIds()活用、キャッシュ優先 | 最適化済み、変更不要 |
| DuelField統合 | propsにCardDisplayData[]を渡す | 責務分離、テスト容易性 |
| エラーハンドリング | console.error + placeholder表示 | 段階的レンダリング、UXバランス |
| クリックイベント | 既存onClick props活用 | 既存インターフェース維持 |
| Svelte 5ルーン | ストアは$、ローカルは$state/$derived | 相互運用ベストプラクティス |

---

## Open Questions Resolved

すべての技術的疑問は調査により解決済み。Phase 1（設計）へ進む準備完了。
