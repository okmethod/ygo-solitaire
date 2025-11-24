# Data Model: Architecture Refactoring

## Overview

このドキュメントは、遊戯王ソリティアアプリケーションのアーキテクチャリファクタリングにおけるドメインモデルを定義します。目的は、ゲームロジック（domain層）をフレームワーク非依存にし、不変性（Immutability）を保証した状態管理を実現することです。

**設計の核心原則**:
- **不変性**: GameStateは常に新しいインスタンスを生成（既存オブジェクトの変更禁止）
- **フレームワーク非依存**: domain層はSvelteやDOM APIに一切依存しない
- **既存資産の活用**: 効果システム（BaseEffect階層）は優れた設計のため、最小限の変更で移行

**MVPスコープ（Exodia Draw Deck限定）**:
- フェイズ管理（Draw/Standby/Main1/End）
- 通常魔法の発動（コスト → 効果 → 墓地）
- シンプルなチェーン（LIFO、割り込みなし）
- 勝利条件（エクゾディア5枚、LP=0）
- ❌ モンスター召喚ルール（ドロー専用デッキでは不要）
- ❌ 罠カード
- ❌ 複雑なタイミング処理

---

## Core Entities

### 1. GameState (Immutable)

**Purpose**: ゲームの完全な状態を表す不変オブジェクト
**Location**: `domain/models/GameState.ts`
**Immutability**: 必須 - すべての更新は新しいインスタンスを生成

#### Type Definition

```typescript
/**
 * ゲームの現在状態を表す不変オブジェクト
 * すべてのプロパティはreadonly修飾子で保護
 */
export interface GameState {
  readonly zones: Zones;
  readonly lp: LifePoints;
  readonly phase: GamePhase;
  readonly turn: number;
  readonly chainStack: readonly ChainBlock[];
  readonly result: GameResult;
}

/**
 * カードが配置される全てのゾーン
 */
export interface Zones {
  readonly deck: readonly CardInstance[];
  readonly hand: readonly CardInstance[];
  readonly monsterZone: readonly (CardInstance | null)[]; // 固定長5
  readonly spellTrapZone: readonly (CardInstance | null)[]; // 固定長5
  readonly fieldSpell: CardInstance | null;
  readonly graveyard: readonly CardInstance[];
  readonly banishment: readonly CardInstance[];
}

/**
 * ライフポイント（ValueObject）
 */
export interface LifePoints {
  readonly player: number;   // 0以上
  readonly opponent: number;  // 0以上
}

/**
 * ゲームフェイズ（MVPスコープ）
 */
export type GamePhase = 'Draw' | 'Standby' | 'Main1' | 'End';

/**
 * チェーンブロック（簡易版 - 割り込みなし）
 */
export interface ChainBlock {
  readonly effectId: string;
  readonly cardInstanceId: string;
  readonly chainIndex: number; // LIFOのインデックス
}

/**
 * ゲーム結果
 */
export type GameResult =
  | { status: 'ongoing' }
  | { status: 'win'; reason: 'Exodia' | 'LP0' }
  | { status: 'lose'; reason: 'LP0' | 'DeckOut' }
  | { status: 'draw' };
```

#### Validation Rules

```typescript
/**
 * GameState生成時のバリデーション
 */
export function validateGameState(state: GameState): ValidationResult {
  const errors: string[] = [];

  // ゾーンサイズのチェック
  if (state.zones.monsterZone.length !== 5) {
    errors.push('monsterZone must have exactly 5 slots');
  }
  if (state.zones.spellTrapZone.length !== 5) {
    errors.push('spellTrapZone must have exactly 5 slots');
  }

  // LPの非負チェック
  if (state.lp.player < 0) {
    errors.push('Player LP cannot be negative');
  }
  if (state.lp.opponent < 0) {
    errors.push('Opponent LP cannot be negative');
  }

  // ターン数の妥当性
  if (state.turn < 1) {
    errors.push('Turn number must be at least 1');
  }

  // チェーンスタックの整合性
  const chainIndices = state.chainStack.map(cb => cb.chainIndex);
  const expectedIndices = Array.from({ length: chainIndices.length }, (_, i) => i + 1);
  if (JSON.stringify(chainIndices.sort()) !== JSON.stringify(expectedIndices)) {
    errors.push('Chain stack indices must be sequential');
  }

  return { valid: errors.length === 0, errors };
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}
```

#### State Transitions

GameStateの変更は、以下のルールに従って新しいインスタンスを生成します。

```typescript
import { produce } from 'immer';

/**
 * 状態更新のヘルパー関数（Immerを使用）
 */
export function updateGameState(
  state: GameState,
  updater: (draft: GameState) => void
): GameState {
  return produce(state, updater);
}

// 使用例1: カードをドロー
const newState = updateGameState(state, draft => {
  const card = draft.zones.deck.pop()!;
  draft.zones.hand.push(card);
});

// 使用例2: フェイズ遷移
const newState = updateGameState(state, draft => {
  draft.phase = 'Main1';
});

// 使用例3: ライフポイント減少
const newState = updateGameState(state, draft => {
  draft.lp.player -= 1000;
});
```

#### Initial State Factory

```typescript
/**
 * 初期GameStateを生成
 * @param deckRecipe デッキレシピ（40枚のカードデータ）
 * @returns シャッフル済みの初期状態
 */
export function createInitialGameState(deckRecipe: DeckRecipe): GameState {
  // カードデータからCardInstanceを生成（instanceIdを付与）
  const deckCards = deckRecipe.mainDeck.flatMap(({ cardData, quantity }) =>
    Array.from({ length: quantity }, (_, i) => ({
      cardId: cardData.id,
      instanceId: `${cardData.id}-${Date.now()}-${i}`,
      position: 'Deck' as const,
      faceUp: false,
    }))
  );

  // デッキをシャッフル
  const shuffledDeck = shuffleArray(deckCards);

  return {
    zones: {
      deck: shuffledDeck,
      hand: [],
      monsterZone: [null, null, null, null, null],
      spellTrapZone: [null, null, null, null, null],
      fieldSpell: null,
      graveyard: [],
      banishment: [],
    },
    lp: {
      player: 8000,
      opponent: 8000,
    },
    phase: 'Draw',
    turn: 1,
    chainStack: [],
    result: { status: 'ongoing' },
  };
}
```

---

### 2. Card / CardInstance

**Purpose**: カードの静的データ（CardData）とゲーム中のインスタンス（CardInstance）を分離
**Location**: `domain/models/Card.ts`

#### Type Definition

```typescript
/**
 * カードの静的データ（JSONから読み込まれる不変データ）
 * YGOPRODeck APIのデータ構造に対応
 */
export interface CardData {
  readonly id: number;           // カードID（例: 55144522 = 強欲な壺）
  readonly name: string;          // カード名
  readonly type: CardType;        // monster | spell | trap
  readonly description: string;   // テキスト
  readonly frameType?: string;    // "normal", "effect", etc.
  readonly archetype?: string;    // アーキタイプ名
  readonly images?: {
    readonly image?: string;
    readonly imageSmall?: string;
    readonly imageCropped?: string;
  };
  readonly monster?: {
    readonly attack?: number;
    readonly defense?: number;
    readonly level?: number;
    readonly attribute?: string;
    readonly race?: string;
  };
}

export type CardType = 'monster' | 'spell' | 'trap';

/**
 * ゲーム中のカードインスタンス
 * 同じCardDataから複数のインスタンスが生成される（例: 強欲な壺3枚）
 */
export interface CardInstance {
  readonly cardId: number;       // CardData.idへの参照
  readonly instanceId: string;   // インスタンス固有のID（追跡用）
  readonly position: CardPosition;
  readonly faceUp: boolean;
}

export type CardPosition = 'Deck' | 'Hand' | 'Field' | 'Graveyard' | 'Banished';
```

#### Relationships

```
CardData (JSON)
  ↓ 1:N
CardInstance (in GameState.zones)
  ↓ instanceIdで参照
CardBehavior (effects/)
```

**例**: 強欲な壺（ID: 55144522）が3枚デッキに入っている場合
- `CardData` は1つ（id: 55144522）
- `CardInstance` は3つ（instanceId: "55144522-1", "55144522-2", "55144522-3"）
- `CardBehavior` は1つ（PotOfGreedEffect）

#### Helper Functions

```typescript
/**
 * CardInstanceからCardDataを取得
 * @param instance カードインスタンス
 * @param cardDatabase カードデータベース
 * @returns 対応するCardData（存在しない場合はundefined）
 */
export function getCardData(
  instance: CardInstance,
  cardDatabase: Map<number, CardData>
): CardData | undefined {
  return cardDatabase.get(instance.cardId);
}

/**
 * 複数のCardInstanceから重複を除いたCardDataのセットを取得
 * @param instances カードインスタンスの配列
 * @param cardDatabase カードデータベース
 * @returns 一意なCardDataのMap
 */
export function getUniqueCardData(
  instances: readonly CardInstance[],
  cardDatabase: Map<number, CardData>
): Map<number, CardData> {
  const uniqueCards = new Map<number, CardData>();
  for (const instance of instances) {
    const cardData = cardDatabase.get(instance.cardId);
    if (cardData && !uniqueCards.has(cardData.id)) {
      uniqueCards.set(cardData.id, cardData);
    }
  }
  return uniqueCards;
}
```

---

### 3. CardBehavior (Strategy Pattern)

**Purpose**: カード効果のロジックを定義（既存の効果システムを維持）
**Location**: `domain/effects/`（既存の`skeleton-app/src/lib/classes/effects/`から移行）

#### Interface

```typescript
/**
 * カード効果のインターフェース（既存のEffect型を維持）
 */
export interface CardBehavior {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly cardId: number;

  /**
   * 効果が発動可能かどうかを判定
   * @param state 現在のゲーム状態
   * @returns 発動可能ならtrue
   */
  canActivate(state: GameState): boolean;

  /**
   * 効果を実行し、新しいGameStateを返す
   * 【重要】既存実装からの変更点: DuelStateを直接変更せず、新しいGameStateを返す
   * @param state 現在のゲーム状態
   * @returns 効果実行結果（新しいGameStateを含む）
   */
  execute(state: GameState): Promise<EffectResult>;
}

/**
 * 効果実行の結果
 */
export interface EffectResult {
  readonly success: boolean;
  readonly message: string;
  readonly newState: GameState;      // 【新規】新しい状態
  readonly affectedCards?: readonly CardInstance[];
  readonly drawnCards?: readonly CardInstance[];
  readonly gameEnded?: boolean;
}
```

#### Implementation Notes

**既存システムの維持ポイント**:
1. **BaseEffect階層**: `BaseEffect → BaseMagicEffect → DrawEffect → PotOfGreedEffect`
2. **EffectRepository**: カードID → Effect のFactory Pattern
3. **CardEffectRegistrar**: デッキレシピから必要な効果のみ登録

**変更点**:
- `execute()` が `DuelState` を直接変更する代わりに、新しい `GameState` を返す
- `EffectResult` に `newState: GameState` プロパティを追加

#### Migration Example

```typescript
// 【Before】既存実装（DuelStateを直接変更）
export class PotOfGreedEffect extends BaseMagicEffect {
  protected async resolveMagicEffect(state: DuelState): Promise<EffectResult> {
    // state.drawCard(2) で内部状態を変更
    const drawnCards = state.drawCard(2);
    return this.createSuccessResult('2枚ドロー', true, drawnCards);
  }
}

// 【After】新実装（新しいGameStateを返す）
export class PotOfGreedEffect extends BaseMagicEffect {
  protected async resolveMagicEffect(state: GameState): Promise<EffectResult> {
    // Immerで新しいGameStateを生成
    const newState = updateGameState(state, draft => {
      for (let i = 0; i < 2 && draft.zones.deck.length > 0; i++) {
        const card = draft.zones.deck.pop()!;
        draft.zones.hand.push(card);
      }
    });

    const drawnCards = newState.zones.hand.slice(-2);
    return {
      success: true,
      message: '2枚ドロー',
      newState,
      drawnCards,
      gameEnded: false,
    };
  }
}
```

---

### 4. GameCommand (Command Pattern)

**Purpose**: プレイヤーの操作をオブジェクトとして表現
**Location**: `application/commands/`

#### Interface

```typescript
/**
 * ゲームコマンドの基本インターフェース
 * プレイヤーの操作（ドロー、魔法発動等）をカプセル化
 */
export interface GameCommand {
  /**
   * コマンドの説明（ログ・履歴用）
   */
  readonly description: string;

  /**
   * コマンドが実行可能かを検証
   * @param state 現在のゲーム状態
   * @returns 実行可能ならtrue
   */
  canExecute(state: GameState): boolean;

  /**
   * コマンドを実行し、新しいGameStateを返す
   * @param state 現在のゲーム状態
   * @returns 新しいゲーム状態
   */
  execute(state: GameState): GameState | Promise<GameState>;
}
```

#### Concrete Commands

```typescript
/**
 * カードをドローするコマンド
 */
export class DrawCardCommand implements GameCommand {
  description: string;

  constructor(private count: number) {
    this.description = `Draw ${count} card(s)`;
  }

  canExecute(state: GameState): boolean {
    return state.zones.deck.length >= this.count && state.phase === 'Draw';
  }

  execute(state: GameState): GameState {
    if (!this.canExecute(state)) {
      throw new Error(`Cannot draw ${this.count} cards`);
    }

    return updateGameState(state, draft => {
      for (let i = 0; i < this.count && draft.zones.deck.length > 0; i++) {
        const card = draft.zones.deck.pop()!;
        draft.zones.hand.push(card);
      }
    });
  }
}

/**
 * 通常魔法を発動するコマンド（MVPスコープ）
 */
export class ActivateSpellCommand implements GameCommand {
  description: string;

  constructor(private cardInstanceId: string) {
    this.description = `Activate spell card ${cardInstanceId}`;
  }

  canExecute(state: GameState): boolean {
    // Main1フェイズであること
    if (state.phase !== 'Main1') {
      return false;
    }

    // 手札にカードが存在すること
    const card = state.zones.hand.find(c => c.instanceId === this.cardInstanceId);
    if (!card) {
      return false;
    }

    // 魔法・罠ゾーンに空きがあること
    const hasEmptySlot = state.zones.spellTrapZone.some(slot => slot === null);
    return hasEmptySlot;
  }

  async execute(state: GameState): Promise<GameState> {
    if (!this.canExecute(state)) {
      throw new Error('Cannot activate spell card');
    }

    const card = state.zones.hand.find(c => c.instanceId === this.cardInstanceId)!;

    // 1. 手札からフィールドに移動
    let newState = updateGameState(state, draft => {
      const handIndex = draft.zones.hand.findIndex(c => c.instanceId === this.cardInstanceId);
      draft.zones.hand.splice(handIndex, 1);

      const emptySlotIndex = draft.zones.spellTrapZone.findIndex(slot => slot === null);
      draft.zones.spellTrapZone[emptySlotIndex] = { ...card, position: 'Field', faceUp: true };
    });

    // 2. 効果を取得・実行
    const effect = EffectRepository.getEffects(card.cardId)[0];
    if (effect) {
      const result = await effect.execute(newState);
      newState = result.newState;
    }

    // 3. フィールドから墓地に送る
    newState = updateGameState(newState, draft => {
      const fieldIndex = draft.zones.spellTrapZone.findIndex(
        c => c?.instanceId === this.cardInstanceId
      );
      const fieldCard = draft.zones.spellTrapZone[fieldIndex]!;
      draft.zones.spellTrapZone[fieldIndex] = null;
      draft.zones.graveyard.push({ ...fieldCard, position: 'Graveyard' });
    });

    return newState;
  }
}

/**
 * フェイズを進めるコマンド
 */
export class AdvancePhaseCommand implements GameCommand {
  description = 'Advance to next phase';

  canExecute(state: GameState): boolean {
    // ゲームが継続中であること
    return state.result.status === 'ongoing';
  }

  execute(state: GameState): GameState {
    const nextPhase = this.getNextPhase(state.phase);

    return updateGameState(state, draft => {
      draft.phase = nextPhase;
      if (nextPhase === 'Draw') {
        draft.turn += 1;
      }
    });
  }

  private getNextPhase(current: GamePhase): GamePhase {
    const transitions: Record<GamePhase, GamePhase> = {
      Draw: 'Standby',
      Standby: 'Main1',
      Main1: 'End',
      End: 'Draw',
    };
    return transitions[current];
  }
}
```

---

### 5. Rule Classes (Domain Layer)

**Purpose**: ゲームルールのロジックを集約
**Location**: `domain/rules/`

#### PhaseRule

```typescript
/**
 * フェイズ遷移のルール（MVPスコープ）
 */
export class PhaseRule {
  /**
   * フェイズ遷移が可能かをチェック
   */
  canTransition(from: GamePhase, to: GamePhase): boolean {
    const validTransitions: Record<GamePhase, GamePhase[]> = {
      Draw: ['Standby'],
      Standby: ['Main1'],
      Main1: ['End'],
      End: ['Draw'], // 次のターンのドローフェイズへ
    };

    return validTransitions[from]?.includes(to) ?? false;
  }

  /**
   * 次のフェイズを取得
   */
  nextPhase(current: GamePhase): GamePhase {
    const transitions: Record<GamePhase, GamePhase> = {
      Draw: 'Standby',
      Standby: 'Main1',
      Main1: 'End',
      End: 'Draw',
    };
    return transitions[current];
  }
}
```

#### SpellActivationRule (MVP Scope)

```typescript
/**
 * 通常魔法の発動ルール（MVPスコープ）
 */
export class SpellActivationRule {
  /**
   * 通常魔法が発動可能かをチェック
   */
  canActivate(state: GameState, cardInstanceId: string): boolean {
    // 1. Main1フェイズであること
    if (state.phase !== 'Main1') {
      return false;
    }

    // 2. カードが手札に存在すること
    const card = state.zones.hand.find(c => c.instanceId === cardInstanceId);
    if (!card) {
      return false;
    }

    // 3. 魔法・罠ゾーンに空きがあること
    const hasEmptySlot = state.zones.spellTrapZone.some(slot => slot === null);
    if (!hasEmptySlot) {
      return false;
    }

    return true;
  }
}
```

#### ChainRule (Simple Version - No Interruptions)

```typescript
/**
 * チェーン処理のルール（簡易版 - 割り込みなし）
 */
export class ChainRule {
  /**
   * チェーンスタックを解決（LIFO）
   * MVPスコープでは、対戦相手の割り込みはなし
   */
  async resolveChain(state: GameState): Promise<GameState> {
    let currentState = state;

    // チェーンを逆順（LIFO）で解決
    const chainBlocks = [...state.chainStack].reverse();

    for (const block of chainBlocks) {
      const effect = EffectRepository.getEffects(block.cardInstanceId)[0];
      if (effect) {
        const result = await effect.execute(currentState);
        currentState = result.newState;
      }
    }

    // チェーンスタックをクリア
    return updateGameState(currentState, draft => {
      draft.chainStack = [];
    });
  }

  /**
   * チェーンにブロックを追加
   */
  addToChain(state: GameState, effectId: string, cardInstanceId: string): GameState {
    return updateGameState(state, draft => {
      const chainIndex = draft.chainStack.length + 1;
      draft.chainStack.push({ effectId, cardInstanceId, chainIndex });
    });
  }
}
```

#### VictoryRule

```typescript
/**
 * 勝利条件のルール
 */
export class VictoryRule {
  /**
   * 勝利条件をチェック
   */
  checkVictory(state: GameState): VictoryResult {
    // エクゾディア判定（5枚揃い）
    if (this.hasExodiaPieces(state)) {
      return {
        isGameOver: true,
        winner: 'player',
        reason: 'Exodia',
      };
    }

    // LP=0判定（プレイヤー敗北）
    if (state.lp.player === 0) {
      return {
        isGameOver: true,
        winner: 'opponent',
        reason: 'LP0',
      };
    }

    // LP=0判定（対戦相手敗北）
    if (state.lp.opponent === 0) {
      return {
        isGameOver: true,
        winner: 'player',
        reason: 'LP0',
      };
    }

    // デッキ切れ（ドロー不可）
    if (state.zones.deck.length === 0 && state.phase === 'Draw') {
      return {
        isGameOver: true,
        winner: 'opponent',
        reason: 'DeckOut',
      };
    }

    return {
      isGameOver: false,
    };
  }

  /**
   * エクゾディアパーツが手札に5枚揃っているかをチェック
   */
  private hasExodiaPieces(state: GameState): boolean {
    const exodiaPieceIds = [
      33396948, // 封印されしエクゾディア
      7902349,  // 封印されし者の右腕
      70903634, // 封印されし者の左腕
      8124921,  // 封印されし者の右足
      44519536, // 封印されし者の左足
    ];

    const handCardIds = state.zones.hand.map(c => c.cardId);
    return exodiaPieceIds.every(id => handCardIds.includes(id));
  }
}

export interface VictoryResult {
  isGameOver: boolean;
  winner?: 'player' | 'opponent';
  reason?: 'Exodia' | 'LP0' | 'DeckOut';
}
```

---

## Entity Relationships

```
┌─────────────────────────────────────────────────────────────┐
│ CardData (JSON)                                             │
│ - id, name, type, description                               │
└───────────────────┬─────────────────────────────────────────┘
                    │ 1:N
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ CardInstance (in GameState.zones)                           │
│ - cardId, instanceId, position, faceUp                      │
└───────────────────┬─────────────────────────────────────────┘
                    │ cardId で参照
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ CardBehavior (effects/)                                     │
│ - canActivate(), execute()                                  │
└───────────────────┬─────────────────────────────────────────┘
                    │ 使用される
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ GameCommand (actions)                                       │
│ - ActivateSpellCommand, DrawCardCommand                     │
└───────────────────┬─────────────────────────────────────────┘
                    │ 検証に使用
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ Rule Classes (validation)                                   │
│ - PhaseRule, SpellActivationRule, ChainRule, VictoryRule    │
└───────────────────┬─────────────────────────────────────────┘
                    │ 更新される
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ GameState (immutable)                                       │
│ - zones, lp, phase, turn, chainStack, result                │
└─────────────────────────────────────────────────────────────┘
```

**データフロー**:
1. UI → GameCommand.execute()
2. GameCommand → Rule.canExecute() で検証
3. GameCommand → CardBehavior.execute() で効果実行
4. CardBehavior → 新しい GameState を返す
5. 新しい GameState → Store に反映
6. Store → UI が再描画

---

## Validation & Invariants

### GameState Invariants

```typescript
/**
 * GameStateの不変条件（常に満たされるべき制約）
 */
export class GameStateInvariants {
  /**
   * カードの総数チェック（カードの紛失・重複を検出）
   */
  static checkTotalCards(state: GameState, expectedTotal: number): boolean {
    const totalCards = [
      ...state.zones.deck,
      ...state.zones.hand,
      ...state.zones.monsterZone.filter(c => c !== null),
      ...state.zones.spellTrapZone.filter(c => c !== null),
      state.zones.fieldSpell ? [state.zones.fieldSpell] : [],
      ...state.zones.graveyard,
      ...state.zones.banishment,
    ].length;

    return totalCards === expectedTotal;
  }

  /**
   * instanceIdの一意性チェック（重複を検出）
   */
  static checkUniqueInstanceIds(state: GameState): boolean {
    const allCards = [
      ...state.zones.deck,
      ...state.zones.hand,
      ...state.zones.monsterZone.filter((c): c is CardInstance => c !== null),
      ...state.zones.spellTrapZone.filter((c): c is CardInstance => c !== null),
      ...(state.zones.fieldSpell ? [state.zones.fieldSpell] : []),
      ...state.zones.graveyard,
      ...state.zones.banishment,
    ];

    const instanceIds = allCards.map(c => c.instanceId);
    const uniqueIds = new Set(instanceIds);
    return instanceIds.length === uniqueIds.size;
  }

  /**
   * ゾーンサイズチェック
   */
  static checkZoneSizes(state: GameState): boolean {
    return (
      state.zones.monsterZone.length === 5 &&
      state.zones.spellTrapZone.length === 5
    );
  }
}
```

### Rule Enforcement Points

```typescript
/**
 * ルールの強制ポイント（どこでバリデーションを実行するか）
 */

// 1. GameCommand.canExecute() - コマンド実行前
class DrawCardCommand implements GameCommand {
  canExecute(state: GameState): boolean {
    // PhaseRuleでフェイズをチェック
    // デッキ枚数をチェック
    return state.phase === 'Draw' && state.zones.deck.length >= this.count;
  }
}

// 2. CardBehavior.canActivate() - 効果発動前
class PotOfGreedEffect extends BaseEffect {
  canActivate(state: GameState): boolean {
    // SpellActivationRuleで発動条件をチェック
    return new SpellActivationRule().canActivate(state, this.cardId.toString());
  }
}

// 3. Rule Classes - 汎用的な検証
const phaseRule = new PhaseRule();
if (!phaseRule.canTransition(state.phase, 'Main1')) {
  throw new Error('Invalid phase transition');
}

// 4. GameState生成後 - 不変条件の検証（開発時のみ）
if (process.env.NODE_ENV === 'development') {
  if (!GameStateInvariants.checkTotalCards(newState, 40)) {
    console.error('Card count mismatch!');
  }
}
```

---

## Migration Notes

### From Current Implementation

**現在**: `skeleton-app/src/lib/classes/DuelState.ts`（可変状態）
**目標**: `domain/models/GameState.ts`（不変状態）

#### 段階的移行パス

**Phase 1: domain/層の作成（UIに影響なし）**

```
skeleton-app/src/lib/
├── domain/                     # 新規作成
│   ├── models/
│   │   ├── GameState.ts       # 新しい不変型
│   │   └── Card.ts            # CardData, CardInstance
│   └── rules/
│       └── VictoryRule.ts     # ルールロジック
└── classes/                    # 既存（一時的に共存）
    └── DuelState.ts           # 既存のまま維持
```

**Phase 2: 効果システムの移行**

```typescript
// 既存の効果クラスを段階的に移行
// Before: skeleton-app/src/lib/classes/effects/cards/magic/normal/PotOfGreedEffect.ts
// After:  skeleton-app/src/lib/domain/effects/cards/magic/normal/PotOfGreedEffect.ts

// 変更点: execute() の戻り値に newState を追加
export class PotOfGreedEffect extends BaseMagicEffect {
  protected async resolveMagicEffect(state: GameState): Promise<EffectResult> {
    const newState = updateGameState(state, draft => {
      // ドロー処理
    });

    return {
      success: true,
      message: '2枚ドロー',
      newState, // 【追加】新しい状態を返す
      drawnCards,
      gameEnded: false,
    };
  }
}
```

**Phase 3: application/層の構築**

```
skeleton-app/src/lib/
├── application/
│   ├── GameFacade.ts          # UIとドメインの橋渡し
│   ├── commands/
│   │   ├── DrawCardCommand.ts
│   │   └── ActivateSpellCommand.ts
│   └── stores/
│       └── gameStateStore.ts  # Svelte Store
└── domain/
    └── ...
```

**Phase 4: UIの接続**

```svelte
<!-- Before: DuelStateを直接操作 -->
<script lang="ts">
  let duelState = new DuelState(...);

  function drawCard() {
    duelState.drawCard(1);
    duelState = duelState; // リアクティビティのトリガー
  }
</script>

<!-- After: GameFacade経由で操作 -->
<script lang="ts">
  import { gameState } from '$lib/application/stores/gameStateStore';
  import { GameFacade } from '$lib/application/GameFacade';

  const facade = new GameFacade();

  function drawCard() {
    facade.drawCards(1); // Storeが自動的に更新される
  }
</script>

<div>手札: {$gameState.zones.hand.length}枚</div>
```

### Backward Compatibility

**共存期間中の対応**:

```typescript
/**
 * 既存DuelStateから新しいGameStateへの変換
 * 移行期間中のアダプター
 */
export function convertDuelStateToGameState(duelState: DuelState): GameState {
  return {
    zones: {
      deck: duelState.mainDeck.map(toCardInstance),
      hand: duelState.hands.map(toCardInstance),
      monsterZone: duelState.field.monsterZones.map(c => c ? toCardInstance(c) : null),
      spellTrapZone: duelState.field.spellTrapZones.map(c => c ? toCardInstance(c) : null),
      fieldSpell: duelState.field.fieldSpell ? toCardInstance(duelState.field.fieldSpell) : null,
      graveyard: duelState.graveyard.map(toCardInstance),
      banishment: duelState.banished.map(toCardInstance),
    },
    lp: {
      player: duelState.playerLifePoints,
      opponent: duelState.opponentLifePoints,
    },
    phase: convertPhase(duelState.currentPhase),
    turn: duelState.currentTurn,
    chainStack: [],
    result: convertGameResult(duelState.gameResult),
  };
}

function toCardInstance(card: Card): CardInstance {
  return {
    cardId: card.id,
    instanceId: card.instanceId || `${card.id}-${Date.now()}`,
    position: 'Hand', // デフォルト値、実際は文脈から判断
    faceUp: true,
  };
}
```

### Migration Checklist

```markdown
- [ ] Phase 1: domain/models/GameState.ts を作成
- [ ] Phase 1: domain/models/Card.ts を作成
- [ ] Phase 1: domain/rules/VictoryRule.ts を作成
- [ ] Phase 1: 単体テストを作成（GameState生成、バリデーション）
- [ ] Phase 2: BaseEffect.execute() のシグネチャ変更
- [ ] Phase 2: PotOfGreedEffect を新しい形式に移行
- [ ] Phase 2: GracefulCharityEffect を新しい形式に移行
- [ ] Phase 2: 効果システムの単体テスト更新
- [ ] Phase 3: application/GameFacade.ts を作成
- [ ] Phase 3: application/stores/gameStateStore.ts を作成
- [ ] Phase 3: DrawCardCommand を実装
- [ ] Phase 3: ActivateSpellCommand を実装
- [ ] Phase 4: DuelField.svelte を GameFacade 経由に変更
- [ ] Phase 4: 既存の UI コンポーネントを全て更新
- [ ] Phase 4: E2E テストで動作確認
- [ ] Phase 5: 旧 DuelState.ts を削除
- [ ] Phase 5: リファクタリング完了の確認
```

---

## Testing Strategy

### Unit Tests (Domain Layer)

```typescript
// domain/models/__tests__/GameState.test.ts
import { describe, it, expect } from 'vitest';
import { createInitialGameState, updateGameState } from '../GameState';
import { GameStateInvariants } from '../GameStateInvariants';

describe('GameState', () => {
  describe('createInitialGameState', () => {
    it('should create initial state with 40-card deck', () => {
      const deckRecipe = createMockDeckRecipe(40);
      const state = createInitialGameState(deckRecipe);

      expect(state.zones.deck.length).toBe(40);
      expect(state.zones.hand.length).toBe(0);
      expect(state.lp.player).toBe(8000);
      expect(state.phase).toBe('Draw');
    });

    it('should generate unique instanceIds for each card', () => {
      const deckRecipe = createMockDeckRecipe(40);
      const state = createInitialGameState(deckRecipe);

      expect(GameStateInvariants.checkUniqueInstanceIds(state)).toBe(true);
    });

    it('should initialize zones with correct sizes', () => {
      const deckRecipe = createMockDeckRecipe(40);
      const state = createInitialGameState(deckRecipe);

      expect(state.zones.monsterZone.length).toBe(5);
      expect(state.zones.spellTrapZone.length).toBe(5);
      expect(state.zones.monsterZone.every(slot => slot === null)).toBe(true);
    });
  });

  describe('updateGameState (Immutability)', () => {
    it('should not mutate original state', () => {
      const originalState = createInitialGameState(createMockDeckRecipe(40));
      const originalDeckLength = originalState.zones.deck.length;

      const newState = updateGameState(originalState, draft => {
        draft.zones.deck.pop();
      });

      // 元の状態は変更されていない
      expect(originalState.zones.deck.length).toBe(originalDeckLength);
      // 新しい状態は変更されている
      expect(newState.zones.deck.length).toBe(originalDeckLength - 1);
    });

    it('should create new reference for updated state', () => {
      const originalState = createInitialGameState(createMockDeckRecipe(40));

      const newState = updateGameState(originalState, draft => {
        draft.lp.player -= 1000;
      });

      // 参照が異なることを確認（Svelteのリアクティビティに重要）
      expect(newState).not.toBe(originalState);
      expect(newState.lp).not.toBe(originalState.lp);
    });
  });
});
```

```typescript
// domain/rules/__tests__/VictoryRule.test.ts
import { describe, it, expect } from 'vitest';
import { VictoryRule } from '../VictoryRule';
import { createMockGameState } from '../../__tests__/helpers';

describe('VictoryRule', () => {
  const victoryRule = new VictoryRule();

  describe('checkVictory', () => {
    it('should detect Exodia victory', () => {
      const state = createMockGameState({
        hand: [
          { cardId: 33396948, instanceId: '1' }, // 封印されしエクゾディア
          { cardId: 7902349, instanceId: '2' },  // 右腕
          { cardId: 70903634, instanceId: '3' }, // 左腕
          { cardId: 8124921, instanceId: '4' },  // 右足
          { cardId: 44519536, instanceId: '5' }, // 左足
        ],
      });

      const result = victoryRule.checkVictory(state);

      expect(result.isGameOver).toBe(true);
      expect(result.winner).toBe('player');
      expect(result.reason).toBe('Exodia');
    });

    it('should not detect victory with incomplete Exodia', () => {
      const state = createMockGameState({
        hand: [
          { cardId: 33396948, instanceId: '1' }, // エクゾディア本体のみ
        ],
      });

      const result = victoryRule.checkVictory(state);

      expect(result.isGameOver).toBe(false);
    });

    it('should detect LP0 victory', () => {
      const state = createMockGameState({
        lp: { player: 8000, opponent: 0 },
      });

      const result = victoryRule.checkVictory(state);

      expect(result.isGameOver).toBe(true);
      expect(result.winner).toBe('player');
      expect(result.reason).toBe('LP0');
    });

    it('should detect deck out loss', () => {
      const state = createMockGameState({
        deck: [],
        phase: 'Draw',
      });

      const result = victoryRule.checkVictory(state);

      expect(result.isGameOver).toBe(true);
      expect(result.winner).toBe('opponent');
      expect(result.reason).toBe('DeckOut');
    });
  });
});
```

### Integration Tests (Application Layer)

```typescript
// application/commands/__tests__/DrawCardCommand.test.ts
import { describe, it, expect } from 'vitest';
import { DrawCardCommand } from '../DrawCardCommand';
import { createInitialGameState } from '$lib/domain/models/GameState';

describe('DrawCardCommand', () => {
  it('should draw cards from deck to hand', () => {
    const deckRecipe = createMockDeckRecipe(40);
    const initialState = createInitialGameState(deckRecipe);
    const command = new DrawCardCommand(2);

    const newState = command.execute(initialState);

    expect(newState.zones.hand.length).toBe(2);
    expect(newState.zones.deck.length).toBe(38);
  });

  it('should not allow drawing in non-Draw phase', () => {
    const deckRecipe = createMockDeckRecipe(40);
    const initialState = updateGameState(
      createInitialGameState(deckRecipe),
      draft => { draft.phase = 'Main1'; }
    );
    const command = new DrawCardCommand(1);

    expect(command.canExecute(initialState)).toBe(false);
    expect(() => command.execute(initialState)).toThrow();
  });

  it('should not allow drawing more cards than available', () => {
    const deckRecipe = createMockDeckRecipe(2); // デッキ2枚のみ
    const initialState = createInitialGameState(deckRecipe);
    const command = new DrawCardCommand(5); // 5枚ドローしようとする

    expect(command.canExecute(initialState)).toBe(false);
  });
});
```

```typescript
// application/commands/__tests__/ActivateSpellCommand.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { ActivateSpellCommand } from '../ActivateSpellCommand';
import { EffectRepository } from '$lib/domain/effects/EffectRepository';
import { PotOfGreedEffect } from '$lib/domain/effects/cards/magic/normal/PotOfGreedEffect';

describe('ActivateSpellCommand', () => {
  beforeEach(() => {
    // 強欲な壺の効果を登録
    EffectRepository.register(55144522, () => [new PotOfGreedEffect()]);
  });

  it('should activate spell from hand and send to graveyard', async () => {
    const state = createMockGameState({
      phase: 'Main1',
      deck: createMockCards(40),
      hand: [
        { cardId: 55144522, instanceId: 'pot-1', position: 'Hand', faceUp: false },
      ],
    });

    const command = new ActivateSpellCommand('pot-1');
    const newState = await command.execute(state);

    // 手札から消えている
    expect(newState.zones.hand.length).toBe(2); // 0枚（壺発動） + 2枚（ドロー効果）
    // 墓地に送られている
    expect(newState.zones.graveyard.length).toBe(1);
    expect(newState.zones.graveyard[0].cardId).toBe(55144522);
  });

  it('should not activate spell in non-Main1 phase', () => {
    const state = createMockGameState({
      phase: 'Draw',
      hand: [
        { cardId: 55144522, instanceId: 'pot-1', position: 'Hand', faceUp: false },
      ],
    });

    const command = new ActivateSpellCommand('pot-1');
    expect(command.canExecute(state)).toBe(false);
  });

  it('should not activate spell when no empty spell/trap zone', () => {
    const state = createMockGameState({
      phase: 'Main1',
      hand: [
        { cardId: 55144522, instanceId: 'pot-1', position: 'Hand', faceUp: false },
      ],
      spellTrapZone: [
        // 全て埋まっている
        createMockCard(), createMockCard(), createMockCard(), createMockCard(), createMockCard(),
      ],
    });

    const command = new ActivateSpellCommand('pot-1');
    expect(command.canExecute(state)).toBe(false);
  });
});
```

### E2E Tests (User Scenarios)

```typescript
// tests/e2e/exodia-victory.spec.ts
import { test, expect } from '@playwright/test';

test('Exodia victory scenario', async ({ page }) => {
  await page.goto('/simulator/exodia-deck');

  // 初期手札5枚を確認
  await expect(page.locator('.hand-card')).toHaveCount(5);

  // 強欲な壺を発動（ID: 55144522）
  await page.locator('[data-card-id="55144522"]').click();
  await page.locator('button:has-text("発動")').click();

  // 手札が6枚になる（5 - 1 + 2）
  await expect(page.locator('.hand-card')).toHaveCount(6);

  // ... (複数のドロー効果を繰り返し)

  // エクゾディア5枚が揃ったら勝利メッセージ
  await expect(page.locator('.victory-message')).toContainText('エクゾディア');
});
```

---

## References

- **research.md**: 設計判断の根拠（Immer, Command Pattern, Strategy Pattern）
- **docs/02-architecture.md**: Clean Architectureの層構造
- **docs/01-requirement.md**: ドメインモデル、ユビキタス言語
- **constitution.md**: Principle IV（関心の分離）
- **existing code**:
  - `skeleton-app/src/lib/classes/DuelState.ts`: 現在の状態管理
  - `skeleton-app/src/lib/classes/effects/`: 既存の効果システム
  - `skeleton-app/src/lib/types/`: 型定義

---

## Summary

### 定義したエンティティ

1. **GameState** (不変型): ゲームの完全な状態（zones, lp, phase, turn, chainStack, result）
2. **CardData / CardInstance**: 静的データとゲーム中のインスタンスを分離
3. **CardBehavior**: 既存の効果システムを維持（execute()の戻り値を新しいGameStateに変更）
4. **GameCommand**: プレイヤー操作のカプセル化（DrawCardCommand, ActivateSpellCommand, AdvancePhaseCommand）
5. **Rule Classes**: ルールロジックの集約（PhaseRule, SpellActivationRule, ChainRule, VictoryRule）

### 移行戦略

**段階的移行パス**:
1. **Phase 1**: domain/層の作成（既存DuelStateと共存）
2. **Phase 2**: 効果システムの移行（execute()の戻り値変更）
3. **Phase 3**: application/層の構築（GameFacade, Stores, Commands）
4. **Phase 4**: UIの接続（Svelteコンポーネントを段階的に更新）
5. **Phase 5**: 旧DuelState削除

**後方互換性**:
- 移行期間中は`convertDuelStateToGameState()`アダプターで共存
- 既存の効果クラス階層（BaseEffect → BaseMagicEffect → DrawEffect）は維持
- EffectRepository、CardEffectRegistrarは変更不要

**テスト戦略**:
- **Domain層**: 単体テスト（GameState生成、不変性、ルール検証）
- **Application層**: 統合テスト（Command実行、効果連携）
- **Presentation層**: E2Eテスト（ユーザーシナリオ）

**次のステップ**: `contracts/`の生成（インターフェース定義、型ガード、ヘルパー関数）

---

**Document Version**: 1.0.0
**Created**: 2025-01-23
**Status**: Ready for contracts/ generation
