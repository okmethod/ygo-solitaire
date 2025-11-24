# Research: Architecture Refactoring

## Overview

このリサーチでは、遊戯王ソリティアアプリケーションのアーキテクチャリファクタリングにおける主要な設計判断を文書化します。目標は、ゲームロジックとUIを完全に分離し、Clean Architectureの原則に従った保守性の高いコードベースを実現することです。

現在の課題：
- `DuelState`クラスがSvelteコンポーネントと密結合（`duelState = duelState`でリアクティビティを強制）
- ゲームロジックがUIなしで独立してテストできない
- 効果システムは既に優れた設計（Strategy Pattern + Factory Pattern）だが、状態管理がフレームワーク依存

このリサーチは、既存の良い設計（効果システム）を維持しつつ、状態管理とUI層を Clean Architecture に沿って再設計するための判断基準を提供します。

---

## Key Decisions

### Decision 1: Clean Architecture Adoption - TypeScript/Svelte向け3層構造

**Question**: TypeScript + Svelteプロジェクトで、どのようにdomain/application/presentation層を構造化するか？

**Answer**: 以下のディレクトリ構造を採用します。

```
skeleton-app/src/lib/
├── domain/                    # ドメイン層（フレームワーク非依存）
│   ├── models/               # コアデータモデル
│   │   ├── GameState.ts     # 不変な状態オブジェクト（interface）
│   │   ├── Card.ts          # カード関連の型・バリューオブジェクト
│   │   └── Zone.ts          # ゾーン関連のモデル
│   ├── rules/               # ゲームルールロジック
│   │   ├── GameEngine.ts    # ルール実行エンジン
│   │   ├── PhaseManager.ts  # フェイズ遷移管理
│   │   └── WinCondition.ts  # 勝利条件チェック
│   └── effects/             # 既存の効果システム（移動）
│       ├── bases/           # BaseEffect, BaseMagicEffect
│       ├── primitives/      # DrawEffect, DiscardEffect
│       └── cards/           # カード固有効果
├── application/              # アプリケーション層（ユースケース）
│   ├── GameFacade.ts        # UIとドメインの橋渡し
│   ├── commands/            # Commandパターン実装
│   │   ├── GameCommand.ts   # コマンド基底インターフェース
│   │   ├── DrawCardCommand.ts
│   │   ├── ActivateEffectCommand.ts
│   │   └── SummonMonsterCommand.ts
│   └── stores/              # Svelte Store（Observer実装）
│       └── gameStateStore.ts
└── presentation/             # プレゼンテーション層（既存のcomponents/）
    └── components/          # Svelteコンポーネント（表示のみ）
```

**Rationale**:
- **依存の方向性**: `presentation → application → domain`（依存性逆転の原則）
- **既存資産の活用**: 効果システム（`effects/`）は既に優れた設計のため、そのまま`domain/effects/`に移動
- **段階的移行**: 既存の`classes/DuelState.ts`を`domain/models/GameState.ts`として純粋化し、`application/GameFacade.ts`でラップ

**Alternatives Considered**:
1. **完全なDDD（ドメイン駆動設計）アプローチ**: Entity/ValueObject/Repository/Aggregateの厳格な分離
   - 却下理由: 小規模プロジェクトには過剰。学習コストが高く、初期実装が複雑化
2. **MVC（Model-View-Controller）パターン**: 従来型の3層構造
   - 却下理由: ビジネスロジックとUIロジックが混在しやすい。テスト容易性が低い
3. **単一のServices層**: domain層を作らず、全てをservices/で管理
   - 却下理由: フレームワーク依存を排除できない。ゲームエンジンの切り出しが困難

**Trade-offs**:
- ✅ Pro: UIなしでドメインロジックを完全にテスト可能
- ✅ Pro: フレームワーク変更（Svelte → React等）に対する耐性
- ✅ Pro: ゲームエンジンの他プロジェクトへの流用が容易
- ⚠️ Con: 初期実装の抽象化コストが高い（学習曲線）
- ⚠️ Con: ファイル数が増加し、ナビゲーションが複雑化

---

### Decision 2: Command Pattern Implementation - TypeScriptでの実装アプローチ

**Question**: TypeScriptでCommandパターンをどう実装するか？

**Answer**: 以下の構造を採用します。

```typescript
// application/commands/GameCommand.ts
export interface GameCommand {
  /**
   * コマンドを実行し、新しいGameStateを返す
   * 純粋関数として実装（副作用なし）
   */
  execute(state: GameState): GameState | Promise<GameState>;

  /**
   * コマンドが実行可能かどうかを検証
   */
  canExecute(state: GameState): boolean;

  /**
   * コマンドの説明（ログ・履歴用）
   */
  readonly description: string;
}

// 具体例：ドローコマンド
export class DrawCardCommand implements GameCommand {
  constructor(private count: number) {}

  canExecute(state: GameState): boolean {
    return state.zones.deck.length >= this.count;
  }

  execute(state: GameState): GameState {
    if (!this.canExecute(state)) {
      throw new Error(`Cannot draw ${this.count} cards`);
    }

    const newDeck = [...state.zones.deck];
    const newHand = [...state.zones.hand];

    for (let i = 0; i < this.count; i++) {
      const card = newDeck.pop()!;
      newHand.push(card);
    }

    return {
      ...state,
      zones: {
        ...state.zones,
        deck: newDeck,
        hand: newHand,
      },
    };
  }

  get description(): string {
    return `Draw ${this.count} card(s)`;
  }
}
```

**Rationale**:
- **不変性の保証**: `execute()`は既存stateを変更せず、新しいGameStateを返す
- **検証の分離**: `canExecute()`で事前検証を行い、`execute()`は成功を前提とする
- **ログ機能**: `description`プロパティで操作履歴を記録可能（将来的なUndoにも対応）

**Alternatives Considered**:
1. **クラス継承ベースのCommand**: 抽象クラス`AbstractCommand`を継承
   - 却下理由: TypeScriptではinterfaceの方が柔軟。mixinや関数型アプローチとの併用が容易
2. **関数ベースのCommand**: Commandを関数として実装 `(state: GameState) => GameState`
   - 却下理由: 検証ロジック・説明文・Undo情報をオブジェクトとして保持できない

**Trade-offs**:
- ✅ Pro: 操作履歴の保存が容易（将来的なリプレイ機能）
- ✅ Pro: Undo/Redo実装の基盤となる
- ✅ Pro: 単体テストが書きやすい（純粋関数）
- ⚠️ Con: 小規模な操作でもCommandクラスを作る必要があり、ボイラープレートが増加
- ⚠️ Con: 非同期処理（カード選択待ち等）の扱いが複雑化

---

### Decision 3: Strategy Pattern for Card Effects - 既存システムの維持と強化

**Question**: 既存の効果システム（Strategy Pattern）をどう改善し、拡張性を保証するか？

**Answer**: 現在の効果システムは既に優れた設計のため、**基本構造は維持**し、以下の改善のみ実施：

```typescript
// domain/effects/bases/BaseEffect.ts（既存を改良）
export abstract class BaseEffect implements Effect {
  // 既存のプロパティ・メソッドは維持

  /**
   * 【改善】GameStateを直接変更せず、新しいGameStateを返す
   * 既存の実装はDuelStateインスタンスを変更していたが、
   * 不変性を保証するため、新しいオブジェクトを生成する
   */
  abstract execute(state: GameState): Promise<EffectResult>;
}

// 効果登録システム（既存のEffectRepository.ts）
// ✅ 既に優れた設計のため、変更不要
// - Factory Patternで効果を生成
// - カードIDでの登録・取得
// - メモリ効率的な遅延生成
```

**既存システムの維持ポイント**:
1. **EffectRepository**: カードID → Effect の Factory Pattern（現状維持）
2. **CardEffectRegistrar**: デッキレシピから必要な効果のみ登録（現状維持）
3. **BaseEffect階層**: BaseEffect → BaseMagicEffect → DrawEffect → PotOfGreedEffect（現状維持）

**Rationale**:
- 既存の効果システムは、Open-Closed Principleを満たしており、新カード追加時に既存コードを修正不要
- Strategy Patternの実装が明確で、`canActivate()` / `execute()` の責務分離が適切
- 効果の継承階層（primitives → cards）が再利用性を高めている

**Alternatives Considered**:
1. **完全なプラグインシステム**: 効果を外部JSONで定義し、インタプリタで実行
   - 却下理由: TypeScriptの型安全性を失う。デバッグが困難
2. **Decorator Pattern**: 効果を装飾的に組み合わせる
   - 却下理由: 遊戯王の効果は組み合わせより固有性が高い。既存システムの方が適している

**Trade-offs**:
- ✅ Pro: 既存の効果実装（強欲な壺、天使の施し等）をそのまま流用可能
- ✅ Pro: 新カード追加時のワークフローが確立済み（`CARD_EFFECTS`に1行追加のみ）
- ✅ Pro: 効果のテストケースが既に存在
- ⚠️ Con: `DuelState`への直接変更（mutability）を`GameState`の不変更新に変更する必要あり

---

### Decision 4: Immutable GameState Management - ImmerによるImmutability実現

**Question**: TypeScriptでGameStateの不変性をどう保証するか？

**Answer**: **Immer.js**を採用し、不変更新をシンプルに記述できるようにします。

```typescript
// domain/models/GameState.ts
import { produce } from 'immer';

export interface GameState {
  readonly zones: {
    readonly deck: readonly CardInstance[];
    readonly hand: readonly CardInstance[];
    readonly field: readonly (CardInstance | null)[];
    readonly graveyard: readonly CardInstance[];
    readonly banished: readonly CardInstance[];
  };
  readonly lp: {
    readonly player: number;
    readonly opponent: number;
  };
  readonly phase: Phase;
  readonly turn: number;
  readonly result: GameResult;
}

// ヘルパー関数: Immerでの状態更新
export function updateGameState(
  state: GameState,
  updater: (draft: GameState) => void
): GameState {
  return produce(state, updater);
}

// 使用例（DrawCardCommand内）
execute(state: GameState): GameState {
  return updateGameState(state, (draft) => {
    const card = draft.zones.deck.pop()!;
    draft.zones.hand.push(card);
    // Immerが自動的に新しい不変オブジェクトを生成
  });
}
```

**Rationale**:
- **開発者体験**: 手動のスプレッド構文（`{...state, zones: {...state.zones, ...}}`）は深いネストで煩雑
- **パフォーマンス**: Immerは構造共有（Structural Sharing）で無駄なコピーを削減
- **型安全性**: TypeScriptの`readonly`修飾子で不変性を静的に保証

**Alternatives Considered**:
1. **手動スプレッド構文**: `const newState = {...state, zones: {...state.zones, hand: [...state.zones.hand, card]}}`
   - 却下理由: ネストが深い場合にエラーが混入しやすい。可読性が低い
2. **Immutable.js**: FacebookのImmutableライブラリ
   - 却下理由: 独自のAPI（`Map`, `List`）を学習する必要がある。TypeScriptの型システムと統合が弱い
3. **手動でのクローン関数**: `cloneGameState(state: GameState): GameState`を自作
   - 却下理由: 車輪の再発明。バグの温床になりやすい

**Trade-offs**:
- ✅ Pro: コードが読みやすく、バグが減る
- ✅ Pro: Svelteのリアクティビティ（参照変更の検知）と相性が良い
- ✅ Pro: Time-travel debugging（過去の状態に戻る）が実装可能
- ⚠️ Con: 依存ライブラリが1つ増える（約14KB gzipped）
- ⚠️ Con: `readonly`を徹底しないと、手動変更が混入するリスク

---

### Decision 5: Observer Pattern for State Management - Svelte Storeの活用

**Question**: ドメイン層の`GameState`とUI層（Svelte）の同期をどう実現するか？

**Answer**: **Svelte Store（Writable/Derived）**を`application/stores/`に配置し、Observer Patternを実装します。

```typescript
// application/stores/gameStateStore.ts
import { writable, derived } from 'svelte/store';
import type { GameState } from '$lib/domain/models/GameState';

/**
 * ゲーム状態を保持するストア
 * ドメイン層のGameStateを保持し、UI層に公開
 */
export const gameState = writable<GameState>(initialGameState);

/**
 * 派生ストア: 手札の枚数（例）
 */
export const handCount = derived(gameState, ($state) => $state.zones.hand.length);

/**
 * 派生ストア: 勝利条件の判定
 */
export const hasWon = derived(gameState, ($state) => $state.result === 'win');
```

```typescript
// application/GameFacade.ts
import { gameState } from './stores/gameStateStore';
import { DrawCardCommand } from './commands/DrawCardCommand';

export class GameFacade {
  /**
   * UIから呼ばれる公開メソッド
   * Commandパターンでドメインロジックを実行し、Storeを更新
   */
  drawCards(count: number): void {
    gameState.update((currentState) => {
      const command = new DrawCardCommand(count);

      if (!command.canExecute(currentState)) {
        throw new Error('Cannot draw cards');
      }

      return command.execute(currentState);
    });
  }

  async activateCardEffect(cardId: number): Promise<EffectResult> {
    // 効果を取得
    const effects = EffectRepository.getEffects(cardId);
    if (effects.length === 0) {
      return { success: false, message: 'No effect found' };
    }

    // 効果を実行し、結果を取得
    const currentState = get(gameState);
    const result = await effects[0].execute(currentState);

    // GameStateを更新（effectが返した新しい状態で上書き）
    if (result.stateChanged) {
      gameState.set(result.newState); // effectは新しいGameStateを返す前提
    }

    return result;
  }
}
```

```svelte
<!-- presentation/components/organisms/board/Hands.svelte -->
<script lang="ts">
  import { gameState } from '$lib/application/stores/gameStateStore';
  import { GameFacade } from '$lib/application/GameFacade';

  const facade = new GameFacade();

  function handleCardClick(card: Card) {
    facade.activateCardEffect(card.id);
  }
</script>

{#each $gameState.zones.hand as card}
  <CardComponent {card} on:click={() => handleCardClick(card)} />
{/each}
```

**Rationale**:
- **ドメイン層の純粋性**: `GameState`はSvelteを知らない。Storeは`application/`層で管理
- **リアクティビティの自動化**: Svelte Storeの変更検知で、手動の`duelState = duelState`が不要に
- **単方向データフロー**: UI → GameFacade → Command → GameState → Store → UI（予測可能）

**Alternatives Considered**:
1. **独自のObserverパターン実装**: `addEventListener('stateChange', callback)`を自作
   - 却下理由: Svelteが提供するStoreの方が強力で、DXが高い
2. **Context API（Svelte 5のルーン）**: `$state`ルーンを直接使用
   - 却下理由: コンポーネントツリーに依存し、テストが困難。グローバルStoreの方が適している
3. **Redux/Zustand等の外部状態管理**: 汎用的な状態管理ライブラリ
   - 却下理由: Svelte Storeで十分。余分な学習コストを避ける

**Trade-offs**:
- ✅ Pro: Svelteの標準機能を活用し、エコシステムとの統合が良い
- ✅ Pro: Derived Storeで計算プロパティを定義でき、パフォーマンス最適化が容易
- ✅ Pro: DevToolsとの統合が可能（将来的にSvelte DevToolsで状態追跡）
- ⚠️ Con: グローバルStoreは複数のゲームセッションには向かない（将来対応が必要）
- ⚠️ Con: テスト時にStoreのモックが必要

---

## Best Practices

### TypeScript in Domain Layer（ドメイン層でのTypeScript活用）

#### 1. 厳格な型定義で不正な状態を排除

```typescript
// ❌ Bad: あいまいな型
type Phase = string;

// ✅ Good: リテラル型で限定
type Phase = 'draw' | 'standby' | 'main1' | 'battle' | 'main2' | 'end';

// ✅ Good: 不正な状態を型で防ぐ
interface GameState {
  phase: Phase;
  // ドローフェイズ以外ではドロー不可を型で保証したい場合
  // → Branded Typeや型ガードを活用
}
```

#### 2. ValueObjectパターンで型安全性を向上

```typescript
// ライフポイントは0以上のみ有効
export class LifePoints {
  private constructor(private value: number) {
    if (value < 0) throw new Error('LP cannot be negative');
  }

  static create(value: number): LifePoints {
    return new LifePoints(value);
  }

  subtract(amount: number): LifePoints {
    return LifePoints.create(this.value - amount);
  }

  getValue(): number {
    return this.value;
  }

  isZero(): boolean {
    return this.value === 0;
  }
}
```

#### 3. フレームワーク依存の排除チェック

```json
// tsconfig.json で明示的に制限
{
  "compilerOptions": {
    "paths": {
      // domain/ から presentation/ へのimportを禁止（linterで強制）
      "$lib/domain/*": ["src/lib/domain/*"]
    }
  }
}
```

```typescript
// ESLint + eslint-plugin-import でチェック
// .eslintrc.js
module.exports = {
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['svelte', 'svelte/*'],
            message: 'Domain layer must not depend on Svelte',
          },
        ],
      },
    ],
  },
  overrides: [
    {
      files: ['src/lib/domain/**/*.ts'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: ['$lib/application/*', '$lib/presentation/*', 'svelte'],
          },
        ],
      },
    },
  ],
};
```

---

### Testing Strategy（テスト戦略）

#### 1. ドメイン層の単体テスト（UI不要）

```typescript
// domain/rules/__tests__/GameEngine.test.ts
import { describe, it, expect } from 'vitest';
import { GameEngine } from '../GameEngine';
import { createInitialGameState } from '../models/GameState';

describe('GameEngine', () => {
  it('should draw cards correctly', () => {
    const initialState = createInitialGameState();
    const engine = new GameEngine();

    const newState = engine.drawCards(initialState, 2);

    expect(newState.zones.hand).toHaveLength(2);
    expect(newState.zones.deck).toHaveLength(38); // 40 - 2
    expect(initialState.zones.hand).toHaveLength(0); // 元の状態は不変
  });
});
```

#### 2. アプリケーション層の統合テスト

```typescript
// application/__tests__/GameFacade.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { GameFacade } from '../GameFacade';
import { get } from 'svelte/store';
import { gameState } from '../stores/gameStateStore';

describe('GameFacade', () => {
  let facade: GameFacade;

  beforeEach(() => {
    facade = new GameFacade();
    // ストアを初期状態にリセット
    gameState.set(createInitialGameState());
  });

  it('should update store when drawing cards', () => {
    facade.drawCards(2);

    const state = get(gameState);
    expect(state.zones.hand).toHaveLength(2);
  });
});
```

#### 3. E2Eテスト（ユーザーシナリオ）

```typescript
// tests/e2e/duel.spec.ts (Playwright)
import { test, expect } from '@playwright/test';

test('should draw initial hand and activate Pot of Greed', async ({ page }) => {
  await page.goto('/simulator/exodia-deck');

  // 初期手札が5枚表示されることを確認
  await expect(page.locator('.hand-card')).toHaveCount(5);

  // 強欲な壺をクリック
  await page.locator('[data-card-id="55144522"]').click();

  // 効果発動後、手札が6枚（5 - 1（壺） + 2（ドロー））になる
  await expect(page.locator('.hand-card')).toHaveCount(6);
});
```

#### 4. テストカバレッジ目標

- **Domain層**: 80%以上（ゲームロジックの正確性が重要）
- **Application層**: 60%以上（統合テスト中心）
- **Presentation層**: 必要最小限（E2Eテストでカバー）

---

### Module Boundaries（モジュール境界の強制）

#### 1. TypeScript Path Aliases（階層間の依存を明示）

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "$lib/domain/*": ["src/lib/domain/*"],
      "$lib/application/*": ["src/lib/application/*"],
      "$lib/presentation/*": ["src/lib/presentation/*"]
    }
  }
}
```

#### 2. Barrel Exports（公開APIの制御）

```typescript
// domain/index.ts （外部に公開するAPIのみエクスポート）
export type { GameState, Card, Zone } from './models/GameState';
export { GameEngine } from './rules/GameEngine';
export { EffectRepository } from './effects/EffectRepository';

// 内部実装は非公開
// ❌ export { GameStateImpl } from './models/GameStateImpl'; // 外部には公開しない
```

#### 3. ESLint Plugin: eslint-plugin-boundaries（自動検証）

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['boundaries'],
  settings: {
    'boundaries/elements': [
      { type: 'domain', pattern: 'src/lib/domain/*' },
      { type: 'application', pattern: 'src/lib/application/*' },
      { type: 'presentation', pattern: 'src/lib/presentation/*' },
    ],
    'boundaries/rules': [
      {
        from: 'domain',
        disallow: ['application', 'presentation'],
        message: 'Domain layer cannot depend on Application or Presentation',
      },
      {
        from: 'application',
        disallow: ['presentation'],
        message: 'Application layer cannot depend on Presentation',
      },
    ],
  },
};
```

---

## References

### Clean Architecture Resources

1. **Clean Architecture (Robert C. Martin)**: [https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
   - 依存の方向性、レイヤーの責務に関する原典

2. **Hexagonal Architecture (Alistair Cockburn)**: [https://alistair.cockburn.us/hexagonal-architecture/](https://alistair.cockburn.us/hexagonal-architecture/)
   - Ports and Adaptersパターン（今回のGameFacadeに相当）

### Design Pattern Resources

3. **Gang of Four (GoF) Design Patterns**: Command, Strategy, Factory, Observer
   - Command: [https://refactoring.guru/design-patterns/command](https://refactoring.guru/design-patterns/command)
   - Strategy: [https://refactoring.guru/design-patterns/strategy](https://refactoring.guru/design-patterns/strategy)

4. **Immer.js Documentation**: [https://immerjs.github.io/immer/](https://immerjs.github.io/immer/)
   - Immutability実現のベストプラクティス

### TypeScript/Svelte Best Practices

5. **TypeScript Deep Dive**: [https://basarat.gitbook.io/typescript/](https://basarat.gitbook.io/typescript/)
   - ValueObject、Branded Type、型ガードのパターン

6. **Svelte Store Best Practices**: [https://svelte.dev/docs/svelte-store](https://svelte.dev/docs/svelte-store)
   - Writable/Derived/Readableの使い分け

7. **Testing Library for Svelte**: [https://testing-library.com/docs/svelte-testing-library/intro/](https://testing-library.com/docs/svelte-testing-library/intro/)
   - UIコンポーネントのテスト手法

### Project-Specific Resources

8. **プロジェクト憲法（constitution.md）**: Principle IV - 関心の分離
9. **アーキテクチャ設計（02-architecture.md）**: Clean Architecture風の層構造
10. **要件定義（01-requirement.md）**: ドメインモデル、ユビキタス言語

---

## Summary of Decisions

このリサーチで確定した主要な技術選択：

| 項目 | 選択 | 理由 |
|------|------|------|
| **アーキテクチャパターン** | Clean Architecture（3層構造） | ドメインロジックの独立性、テスト容易性 |
| **コマンド実装** | Command Pattern（interface + class） | 操作履歴、Undo/Redo対応、型安全性 |
| **カード効果システム** | 既存のStrategy Pattern維持 | 既に優れた設計、拡張性が高い |
| **不変性管理** | Immer.js | 開発者体験、パフォーマンス、型安全性 |
| **状態管理** | Svelte Store（application層） | Svelteとの統合、単方向データフロー |
| **依存管理** | ESLint + Path Aliases | レイヤー境界の自動検証 |
| **テスト戦略** | Vitest（domain単体）+ Playwright（E2E） | UIなしでのロジックテスト |

---

## Next Steps

この`research.md`の判断に基づき、次のフェーズで以下を実施：

1. **Phase 1: data-model.md生成**
   - `GameState`インターフェースの詳細設計
   - `Card`, `Zone`, `LifePoints`等のValueObject定義

2. **Phase 2: implementation-plan.md作成**
   - 段階的リファクタリング手順（既存コードを壊さない移行パス）
   - マイルストーン設定（MVP: domain層のみ → application層 → UI統合）

3. **Phase 3: tasks.md作成**
   - 具体的な実装タスクの洗い出し
   - 依存関係の明確化

---

**Document Version**: 1.0.0
**Last Updated**: 2025-01-23
**Status**: Ready for Phase 1 (data-model.md generation)
