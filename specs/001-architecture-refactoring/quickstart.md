# Quickstart Guide: リファクタリング後のアーキテクチャ

**対象者**: 新アーキテクチャの実装・利用を行う開発者
**前提知識**: TypeScript、Svelte、Clean Architectureの基本概念

---

## 概要

このガイドでは、リファクタリング後のアーキテクチャでの開発方法を説明します：
- **Domain層** (`domain/`) - 純粋なゲームロジック（UI依存なし）
- **Application層** (`application/`) - UIとドメインの橋渡し
- **Presentation層** (`presentation/`) - Svelteコンポーネント

### 核心原則
1. **不変性**: すべての状態更新は新しいオブジェクトを生成
2. **単方向データフロー**: UI → GameFacade → Command → GameState → Store → UI
3. **関心の分離**: ドメインロジックはUIなしでテスト可能

---

## クイックスタート: よくあるタスク

### 1. SvelteコンポーネントでGameFacadeを使用する

GameFacadeはゲームロジックへの唯一のエントリーポイントです。

```typescript
<script lang="ts">
  import { onMount } from 'svelte';
  import { gameFacade } from '$lib/application/GameFacade';
  import { gameState } from '$lib/application/stores/gameStateStore';

  // マウント時にゲームを初期化
  onMount(async () => {
    await gameFacade.initializeGame('exodia-deck');
  });

  // ドローボタンのハンドラ
  function handleDrawCard() {
    gameFacade.drawCard();
  }

  // 魔法カード発動のハンドラ
  async function handleActivateSpell(cardInstanceId: string) {
    // 発動可能かチェック
    if (!gameFacade.canActivateCard(cardInstanceId)) {
      console.log('このカードは発動できません');
      return;
    }

    // 発動して結果を処理
    const result = await gameFacade.activateSpell(cardInstanceId);
    if (result.success) {
      console.log(result.message); // 例: "強欲な壺を発動: カードを2枚ドロー"
    }
  }

  // ストアからリアクティブに状態を取得
  $: handCards = $gameState.zones.hand;
  $: currentPhase = $gameState.phase;
  $: isGameOver = $gameState.result.status !== 'ongoing';
</script>

<div>
  <p>フェイズ: {currentPhase}</p>
  <p>手札: {handCards.length} 枚</p>

  {#if !isGameOver}
    <button on:click={handleDrawCard}>ドロー</button>
  {/if}

  {#each handCards as card (card.instanceId)}
    <button on:click={() => handleActivateSpell(card.instanceId)}>
      {card.cardId} を発動
    </button>
  {/each}
</div>
```

**重要なポイント**:
- ✅ すべてのゲーム操作に`gameFacade`を使用
- ✅ リアクティブな更新のため`$gameState`を購読
- ✅ アクション実行前に`canActivateCard()`でチェック
- ❌ `$gameState`を直接変更しない
- ❌ コンポーネント内でdomainクラスを直接importしない

---

### 2. 新しいカード効果の追加

新しいカード効果（例: 天使の施し）を追加する手順：

#### ステップ1: 効果クラスを作成

```typescript
// domain/effects/cards/magic/normal/GracefulCharityEffect.ts
import { BaseEffect } from '../../bases/BaseEffect';
import { DrawEffect } from '../../primitives/DrawEffect';
import { DiscardEffect } from '../../primitives/DiscardEffect';
import type { GameState } from '../../../models/GameState';
import type { EffectResult } from '../../../contracts/EffectContract';
import { updateGameState } from '../../../models/GameState';

export class GracefulCharityEffect extends BaseEffect {
  constructor() {
    super(33691040, '天使の施し');
  }

  async execute(state: GameState, cardInstanceId: string): Promise<EffectResult> {
    // 3枚ドロー
    const drawResult = await DrawEffect.draw(state, 3);
    if (!drawResult.success) {
      return drawResult;
    }

    // 2枚捨てる（ユーザー選択が必要）
    const discardResult = await DiscardEffect.discard(drawResult.newState, 2);

    return {
      success: true,
      newState: discardResult.newState,
      message: '天使の施し: 3枚ドロー、2枚捨てた',
      logs: ['カードを3枚ドロー', 'カードを2枚捨てた'],
      gameEnded: false,
    };
  }
}
```

#### ステップ2: CardEffectsに登録

```typescript
// domain/effects/cards/cardEffects.ts
import { GracefulCharityEffect } from './magic/normal/GracefulCharityEffect';

export const CARD_EFFECTS = {
  // ... 既存の効果
  '33691040': GracefulCharityEffect, // 天使の施し
};
```

#### ステップ3: テストを追加

```typescript
// domain/effects/cards/__tests__/GracefulCharityEffect.test.ts
import { describe, it, expect } from 'vitest';
import { GracefulCharityEffect } from '../magic/normal/GracefulCharityEffect';
import { createTestGameState } from '../../../__testUtils__/gameStateFactory';

describe('GracefulCharityEffect', () => {
  it('3枚ドローして2枚捨てる', async () => {
    const effect = new GracefulCharityEffect();
    const initialState = createTestGameState({
      deck: createMockCards(40),
      hand: createMockCards(5),
    });

    const result = await effect.execute(initialState, 'test-instance-id');

    expect(result.success).toBe(true);
    expect(result.newState.zones.hand.length).toBe(6); // 5 + 3 - 2
    expect(result.newState.zones.deck.length).toBe(37); // 40 - 3
    expect(result.newState.zones.graveyard.length).toBe(3); // 魔法カード + 捨てた2枚
  });
});
```

**これだけです！** GameEngineの変更は不要。効果は`CardEffectRegistrar`経由で自動認識されます。

---

### 3. ドメインロジックのテスト（UIなし）

主要な利点の1つ：ブラウザなしでゲームロジックをテストできます。

#### 単体テストの例

```typescript
// domain/rules/__tests__/VictoryRule.test.ts
import { describe, it, expect } from 'vitest';
import { VictoryRule } from '../VictoryRule';
import { createTestGameState } from '../../__testUtils__/gameStateFactory';
import { EXODIA_PIECE_IDS } from '../../models/constants';

describe('VictoryRule', () => {
  const rule = new VictoryRule();

  it('エクゾディア5枚揃いで勝利を検出', () => {
    const state = createTestGameState({
      hand: EXODIA_PIECE_IDS.map(id => ({ cardId: id, instanceId: `${id}` })),
    });

    const result = rule.checkVictory(state);

    expect(result.isGameOver).toBe(true);
    expect(result.winner).toBe('player');
    expect(result.reason).toBe('Exodia');
  });

  it('エクゾディア4枚では勝利しない', () => {
    const state = createTestGameState({
      hand: EXODIA_PIECE_IDS.slice(0, 4).map(id => ({ cardId: id, instanceId: `${id}` })),
    });

    const result = rule.checkVictory(state);

    expect(result.isGameOver).toBe(false);
  });

  it('LP=0で敗北を検出', () => {
    const state = createTestGameState({
      lp: { player: 0, opponent: 8000 }
    });

    const result = rule.checkVictory(state);

    expect(result.isGameOver).toBe(true);
    expect(result.winner).toBe('opponent');
    expect(result.reason).toBe('LP0');
  });
});
```

テストの実行:
```bash
cd skeleton-app
npm run test:run
# または ウォッチモード
npm test
```

---

### 4. 新しいゲームルールの追加

例: ドローフェイズ中は魔法カードを発動できないルールを追加。

#### ステップ1: ルールクラスを作成

```typescript
// domain/rules/SpellActivationRule.ts
import type { GameState } from '../models/GameState';

export class SpellActivationRule {
  canActivate(state: GameState, cardInstanceId: string): boolean {
    // フェイズチェック
    if (!this.isCorrectPhase(state)) {
      return false;
    }

    // カードが手札にあるかチェック
    if (!this.isCardInHand(state, cardInstanceId)) {
      return false;
    }

    // 空きゾーンがあるかチェック
    if (!this.hasEmptyZone(state)) {
      return false;
    }

    return true;
  }

  private isCorrectPhase(state: GameState): boolean {
    return state.phase === 'Main1' || state.phase === 'Main2';
  }

  private isCardInHand(state: GameState, cardInstanceId: string): boolean {
    return state.zones.hand.some(c => c.instanceId === cardInstanceId);
  }

  private hasEmptyZone(state: GameState): boolean {
    return state.zones.spellTrapZone.some(slot => slot === null);
  }
}
```

#### ステップ2: Commandで使用

```typescript
// application/commands/ActivateSpellCommand.ts
import { SpellActivationRule } from '../../domain/rules/SpellActivationRule';

export class ActivateSpellCommand implements IGameCommand {
  private spellRule = new SpellActivationRule();

  canExecute(state: GameState): boolean {
    return this.spellRule.canActivate(state, this.cardInstanceId);
  }

  // ...
}
```

---

## アーキテクチャ層の詳細説明

### Domain層 (`domain/`)

**目的**: 純粋なゲームロジック、UI依存なし

**配置するもの**:
- ✅ GameState、Card、Zoneモデル
- ✅ ルールクラス（VictoryRule、PhaseRule等）
- ✅ カード効果（BaseEffect、DrawEffect、PotOfGreedEffect等）

**配置しないもの**:
- ❌ Svelteのimport
- ❌ DOM操作
- ❌ HTTPリクエスト
- ❌ ブラウザAPI

**テスト**: Vitestで単体テスト（高速、ブラウザ不要）

---

### Application層 (`application/`)

**目的**: UIとドメインの橋渡し

**配置するもの**:
- ✅ GameFacade（UIのメインAPI）
- ✅ Commands（DrawCardCommand、ActivateSpellCommand）
- ✅ Stores（gameStateStore、derivedStores）
- ✅ アダプターとユーティリティ

**配置しないもの**:
- ❌ Svelteコンポーネント（`.svelte`ファイル）
- ❌ 直接的なDOM操作

**テスト**: 統合テスト（コマンド＋ルールを組み合わせてテスト）

---

### Presentation層 (`presentation/`)

**目的**: UIコンポーネント（Svelte）

**配置するもの**:
- ✅ Svelteコンポーネント
- ✅ UI固有のロジック（アニメーション、ドラッグ&ドロップ）
- ✅ GameFacadeを呼び出すイベントハンドラ

**配置しないもの**:
- ❌ ゲームルールロジック（例: "このカードは発動できるか？"）
- ❌ 状態の変更（代わりにGameFacadeを使用）
- ❌ domainの直接import（インターフェースとしてGameFacadeを使用）

**テスト**: PlaywrightでのE2Eテスト（完全なユーザーフローをテスト）

---

## 共通パターン

### パターン1: 不変な状態更新

**❌ 間違い（状態を変更）**:
```typescript
function drawCard(state: GameState) {
  const card = state.zones.deck.pop()!; // 変更！
  state.zones.hand.push(card);          // 変更！
  return state; // 同じ参照！
}
```

**✅ 正しい（Immerを使用）**:
```typescript
import { produce } from 'immer';

function drawCard(state: GameState) {
  return produce(state, draft => {
    const card = draft.zones.deck.pop()!;
    draft.zones.hand.push(card);
  }); // 新しいstateを返す
}
```

---

### パターン2: コマンドの検証

**常に実行前に検証**:

```typescript
const command = new DrawCardCommand();

if (command.canExecute(state)) {
  const newState = command.execute(state);
  // 成功パス
} else {
  // ユーザーにエラーを表示
  console.log('カードをドローできません: 条件を満たしていません');
}
```

---

### パターン3: 派生ストア

**コンポーネント内で状態を複製しない**:

```typescript
// ❌ 悪い: ロジックの重複
<script lang="ts">
  $: handCardCount = $gameState.zones.hand.length;
  $: hasExodia = checkExodiaPieces($gameState.zones.hand);
</script>

// ✅ 良い: 派生ストアを使用
import { handCardCount, hasExodia } from '$lib/application/stores/derivedStores';

<script lang="ts">
  // 購読のみ
  $: count = $handCardCount;
  $: exodia = $hasExodia;
</script>
```

---

## デバッグのヒント

### 1. 状態変更のトレース

コマンドにログを追加:

```typescript
export class DrawCardCommand implements IGameCommand {
  execute(state: GameState): GameState {
    console.log('[DrawCard] Before:', state.zones.hand.length);

    const newState = produce(state, draft => {
      const card = draft.zones.deck.pop()!;
      draft.zones.hand.push(card);
    });

    console.log('[DrawCard] After:', newState.zones.hand.length);
    return newState;
  }
}
```

### 2. 不変性のチェック

```typescript
const oldState = currentState;
const newState = command.execute(currentState);

console.assert(oldState !== newState, '状態は不変であるべき！');
console.assert(oldState.zones.hand.length === 5, '古い状態は変更されないべき');
```

### 3. Svelte Devtoolsの使用

[Svelte Devtools](https://github.com/sveltejs/svelte-devtools)をインストールして、ストアの値をリアルタイムで確認。

---

## 移行チェックリスト

古い`DuelState`から移行する場合：

- [ ] 効果クラスを`classes/effects/`から`domain/effects/`に移動
- [ ] `BaseEffect.execute()`を`Promise<EffectResult>`に更新し、`newState`を返すように変更
- [ ] `application/GameFacade.ts`を作成
- [ ] `application/stores/gameStateStore.ts`を作成
- [ ] Svelteコンポーネントを`DuelState`直接アクセスから`gameFacade`使用に更新
- [ ] `duelState = duelState`をストアのsubscriptionに置き換え
- [ ] domain層の単体テストを追加（80%カバレッジ目標）
- [ ] `npm run test:run`を実行してすべてのテストがパスすることを確認
- [ ] 古い`classes/DuelState.ts`ファイルを削除

---

## 次のステップ

1. **Domain層の実装**: `GameState.ts`とルールクラスから始める
2. **効果の移行**: 既存の効果を新しい`GameState`を使用するように更新
3. **Application層の構築**: `GameFacade`とコマンドを実装
4. **UIの更新**: Svelteコンポーネントを`GameFacade`使用にリファクタリング
5. **テストの追加**: domain層で80%カバレッジを目指す

---

## 実用的なコード例集

### 例1: ゲームの初期化と最初のドロー

```typescript
<script lang="ts">
  import { onMount } from 'svelte';
  import { gameFacade } from '$lib/application/GameFacade';
  import { gameState } from '$lib/application/stores/gameStateStore';

  let isInitialized = false;

  onMount(async () => {
    try {
      // デッキレシピを指定してゲームを初期化
      await gameFacade.initializeGame('exodia-deck');

      // 最初のドローフェイズで5枚ドロー
      if (gameFacade.getCurrentPhase() === 'Draw') {
        for (let i = 0; i < 5; i++) {
          gameFacade.drawCard();
        }
      }

      // メインフェイズに進む
      gameFacade.advancePhase(); // Draw → Standby
      gameFacade.advancePhase(); // Standby → Main1

      isInitialized = true;
    } catch (error) {
      console.error('ゲームの初期化に失敗:', error);
    }
  });

  $: if (isInitialized) {
    console.log('現在の手札:', $gameState.zones.hand.length);
    console.log('現在のフェイズ:', $gameState.phase);
  }
</script>

{#if isInitialized}
  <p>ゲーム開始！手札: {$gameState.zones.hand.length} 枚</p>
{:else}
  <p>ゲームを準備中...</p>
{/if}
```

### 例2: カードの選択と発動

```typescript
<script lang="ts">
  import { gameFacade } from '$lib/application/GameFacade';
  import { gameState } from '$lib/application/stores/gameStateStore';
  import CardComponent from './CardComponent.svelte';

  let selectedCardId: string | null = null;
  let activationMessage = '';

  function handleCardSelect(instanceId: string) {
    selectedCardId = instanceId;
  }

  async function handleActivate() {
    if (!selectedCardId) {
      activationMessage = 'カードを選択してください';
      return;
    }

    if (!gameFacade.canActivateCard(selectedCardId)) {
      activationMessage = 'このカードは現在発動できません';
      return;
    }

    try {
      const result = await gameFacade.activateSpell(selectedCardId);
      if (result.success) {
        activationMessage = result.message;
        selectedCardId = null;

        // 勝利条件チェック
        const victoryResult = gameFacade.checkVictory();
        if (victoryResult.isGameOver) {
          alert(`ゲーム終了！ 勝者: ${victoryResult.winner}`);
        }
      } else {
        activationMessage = `発動失敗: ${result.message}`;
      }
    } catch (error) {
      activationMessage = `エラー: ${error.message}`;
    }
  }

  $: handCards = $gameState.zones.hand;
  $: canActivate = selectedCardId !== null &&
                   gameFacade.canActivateCard(selectedCardId);
</script>

<div class="hand-area">
  <h2>手札</h2>
  <div class="cards">
    {#each handCards as card (card.instanceId)}
      <CardComponent
        {card}
        selected={card.instanceId === selectedCardId}
        on:click={() => handleCardSelect(card.instanceId)}
      />
    {/each}
  </div>

  <button
    disabled={!canActivate}
    on:click={handleActivate}
  >
    カードを発動
  </button>

  {#if activationMessage}
    <p class="message">{activationMessage}</p>
  {/if}
</div>
```

### 例3: フェイズ管理とターン進行

```typescript
<script lang="ts">
  import { gameFacade } from '$lib/application/GameFacade';
  import { gameState } from '$lib/application/stores/gameStateStore';

  function handleAdvancePhase() {
    gameFacade.advancePhase();
  }

  function getPhaseDisplayName(phase: string): string {
    const phaseNames = {
      'Draw': 'ドローフェイズ',
      'Standby': 'スタンバイフェイズ',
      'Main1': 'メインフェイズ1',
      'End': 'エンドフェイズ',
    };
    return phaseNames[phase] || phase;
  }

  $: currentPhase = $gameState.phase;
  $: currentTurn = $gameState.turn;
  $: phaseDisplay = getPhaseDisplayName(currentPhase);
</script>

<div class="phase-control">
  <div class="phase-info">
    <p>ターン {currentTurn}</p>
    <p>{phaseDisplay}</p>
  </div>

  <button on:click={handleAdvancePhase}>
    次のフェイズへ
  </button>
</div>

<style>
  .phase-control {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: var(--surface-2);
    border-radius: 0.5rem;
  }

  .phase-info {
    display: flex;
    gap: 2rem;
  }
</style>
```

### 例4: 派生ストアの使用

```typescript
// application/stores/derivedStores.ts
import { derived } from 'svelte/store';
import { gameState } from './gameStateStore';
import { EXODIA_PIECE_IDS } from '$lib/domain/models/constants';

/**
 * 手札の枚数
 */
export const handCardCount = derived(
  gameState,
  $state => $state.zones.hand.length
);

/**
 * デッキの残り枚数
 */
export const deckCardCount = derived(
  gameState,
  $state => $state.zones.deck.length
);

/**
 * エクゾディアパーツの所持状況
 */
export const exodiaPiecesInHand = derived(
  gameState,
  $state => {
    const handCardIds = $state.zones.hand.map(c => c.cardId);
    return EXODIA_PIECE_IDS.filter(id => handCardIds.includes(id));
  }
);

/**
 * エクゾディア勝利条件を満たしているか
 */
export const hasExodia = derived(
  exodiaPiecesInHand,
  $pieces => $pieces.length === 5
);

/**
 * プレイヤーのライフポイント
 */
export const playerLP = derived(
  gameState,
  $state => $state.lp.player
);

/**
 * ゲームが終了しているか
 */
export const isGameOver = derived(
  gameState,
  $state => $state.result.status !== 'ongoing'
);
```

```svelte
<!-- 派生ストアを使用するコンポーネント -->
<script lang="ts">
  import {
    handCardCount,
    deckCardCount,
    exodiaPiecesInHand,
    hasExodia,
    playerLP,
    isGameOver
  } from '$lib/application/stores/derivedStores';
</script>

<div class="game-status">
  <div class="stat">
    <span>手札:</span>
    <strong>{$handCardCount}</strong>
  </div>

  <div class="stat">
    <span>デッキ:</span>
    <strong>{$deckCardCount}</strong>
  </div>

  <div class="stat">
    <span>LP:</span>
    <strong>{$playerLP}</strong>
  </div>

  <div class="exodia-status">
    <span>エクゾディア:</span>
    <strong>{$exodiaPiecesInHand.length} / 5</strong>
    {#if $hasExodia}
      <span class="victory">勝利！</span>
    {/if}
  </div>

  {#if $isGameOver}
    <div class="game-over">
      ゲーム終了
    </div>
  {/if}
</div>
```

---

## よくある質問

### Q1: なぜ`duelState = duelState`が不要になるのですか？

**A**: 新アーキテクチャでは、状態はSvelteストアで管理されます。ストアは自動的に変更を検知してコンポーネントを再描画するため、手動のリアクティビティトリガーは不要です。

```typescript
// ❌ 旧方式
let duelState = new DuelState(...);
function drawCard() {
  duelState.drawCard(1);
  duelState = duelState; // 手動トリガー
}

// ✅ 新方式
import { gameState } from '$lib/application/stores/gameStateStore';
function drawCard() {
  gameFacade.drawCard();
  // ストアが自動更新され、UIも自動的に再描画
}
```

### Q2: Commandパターンは必須ですか？単純な関数では駄目ですか？

**A**: MVPスコープでは単純な関数でも動作しますが、Commandパターンには以下の利点があります：

1. **検証ロジックの分離**: `canExecute()`で実行前チェック
2. **履歴管理**: 将来的なUndo/Redo、リプレイ機能の基盤
3. **テスタビリティ**: モック化が容易
4. **拡張性**: 複雑な操作（複数ステップ）の管理

### Q3: domain層でどこまでテストを書くべきですか？

**A**: 以下を優先的にテスト：

1. **ルールクラス** (PhaseRule, VictoryRule等) - 100%カバレッジ推奨
2. **カード効果** (PotOfGreedEffect等) - 各効果の正常系・異常系
3. **GameState生成** (createInitialGameState) - 不変性、バリデーション
4. **ValueObject** (LifePoints等) - 制約違反のチェック

目標: domain層全体で**80%以上のカバレッジ**

### Q4: 既存のDuelStateクラスはどうなりますか？

**A**: 段階的に置き換えます：

1. **Phase 1-3**: 新しいdomain/application層を構築（DuelStateと共存）
2. **Phase 4**: UIを徐々に移行（コンポーネント単位で）
3. **Phase 5**: すべての移行完了後、DuelStateを削除

移行期間中は`convertDuelStateToGameState()`アダプターで互換性を保ちます。

---

## リソース

- [アーキテクチャ決定記録](../research.md) - なぜこれらの選択をしたのか
- [データモデルドキュメント](../data-model.md) - エンティティの関係
- [API契約](../contracts/README.md) - TypeScriptインターフェース
- [プロジェクト憲法](../../.specify/memory/constitution.md) - プロジェクトの原則

---

## まとめ

### 主要な実践パターン

1. **UIからの操作**: すべて`GameFacade`経由
2. **状態の購読**: `$gameState`でリアクティブに
3. **新カード追加**: 効果クラス作成 → `CARD_EFFECTS`に1行追加
4. **ルール検証**: `canExecute()`で事前チェック
5. **状態更新**: Immerで不変性を保証
6. **テスト**: domain層はVitestで、UIはPlaywrightで

### 開発フロー

```
1. 仕様確認
   ↓
2. domain/にルール・効果を実装（単体テスト）
   ↓
3. application/にコマンド・Facadeを実装（統合テスト）
   ↓
4. presentation/でUIを実装（E2Eテスト）
   ↓
5. すべてのテストがパスすることを確認
```

**質問がありますか？** [contracts/README.md](../contracts/README.md)で詳細なAPIドキュメントを確認してください。
