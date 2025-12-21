# Implementation Plan: UX改善（自動フェーズ進行・デッキシャッフル・自動勝利判定）

**Branch**: `006-ux-automation` | **Date**: 2024-12-20 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/006-ux-automation/spec.md`

## Summary

「強欲なエクゾディア」デッキのUX改善として、4つの自動化機能を実装する：

1. **自動フェーズ進行** (P1): ゲーム開始時、Draw→Standby→Main Phaseまで自動進行し、トースト通知で各フェーズ移行を表示
2. **デッキシャッフル** (P2): Fisher-Yatesアルゴリズムでゲーム開始時にデッキをランダム化
3. **自動勝利判定** (P1): カード効果解決後・フェーズ移行後に自動的に勝利条件をチェック
4. **UIボタン削除** (P3): 不要になった「Draw Card」「Advance Phase」「Check Victory」ボタンを削除（またはDebug Infoセクション内に移動）

**技術的アプローチ**:
- **Svelte 5の`$effect`ルーン**を使用してゲーム状態の変化を監視し、自動処理をトリガー
- **既存のCommand Pattern**（AdvancePhaseCommand等）を再利用
- **既存のVictoryRule**を自動判定で呼び出す
- **Immer.js**で不変性を保持したままデッキシャッフルを実装

## Technical Context

**Language/Version**: TypeScript 5.x (SvelteKit environment)
**Primary Dependencies**: Svelte 5 (Runes), Immer.js, Skeleton UI v3, TailwindCSS v4
**Storage**: N/A (クライアントサイドのみ、永続化不要)
**Testing**: Vitest (Unit/Integration), Playwright (E2E)
**Target Platform**: Web Browser (Modern browsers with ES2022+ support)
**Project Type**: Single-page Web Application (SvelteKit)
**Performance Goals**:
- ゲーム開始後2秒以内にMain Phaseに到達
- デッキシャッフル処理は10ms以下
- 勝利判定処理は5ms以下（UI blocking最小化）

**Constraints**:
- 既存の312テストが引き続きpassすること
- 4層Clean Architecture（Domain/Application/Infrastructure/Presentation）に準拠
- Immer.jsによる不変性保証を維持
- レイヤー依存関係違反なし（Application→Presentation依存NG）

**Scale/Scope**:
- 1デッキ（40枚）のシャッフル処理
- 最大5つのフェーズ自動進行
- 1ゲームあたり最大20回程度の勝利判定（カード効果×10 + フェーズ移行×5）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Planning Principles

**I. 目的と手段の分離** ✅
- **目的**: プレイヤーがストレスなく1ターンキルコンボを体験できる
- **手段**: 自動フェーズ進行、自動勝利判定、デッキシャッフル
- **根拠**: 手動でフェーズを進める・勝利判定ボタンをクリックするのはゲーム体験を阻害する操作であり、自動化により本質的な「コンボを楽しむ」体験に集中できる

**II. 段階的な理解の深化** ✅
- **要求**: 「もっと遊びやすくしたい」
- **要件**: 自動フェーズ進行・デッキシャッフル・自動勝利判定
- **仕様**: Svelte 5 `$effect`による監視 + 既存Command/Ruleの再利用
- **未決定事項**: なし（spec.mdで十分に明確化済み）

### Architecture Principles

**III. 最適解の選択と記録** ✅
- **選択**: Svelte 5の`$effect`ルーンを使用してゲーム状態変化を監視
- **代替案**: setInterval/setTimeoutによるポーリング → 却下（パフォーマンス・精度の問題）
- **トレードオフ**: `$effect`はSvelteに依存するが、Presentation LayerでのUI制御であり問題なし
- **記録**: このplan.mdに記載

**IV. 関心の分離（Separation of Concerns）** ✅
- **ゲームロジック（Domain Layer）**: VictoryRule, PhaseRule（変更不要、既存ロジックを利用）
- **インターフェース層（Application Layer）**: GameFacade, AdvancePhaseCommand（既存を利用）
- **UI層（Presentation Layer）**: `+page.svelte`に`$effect`で自動化ロジックを追加
- **依存の方向**: Presentation → Application → Domain（正しい依存関係を維持）

**V. 変更に対応できる設計** ✅
- **SRP**: 自動フェーズ進行・自動勝利判定・デッキシャッフルは各々独立した機能
- **OCP**: 既存のCommand/Ruleに変更を加えず、Presentation Layerで新しい振る舞いを追加
- **DIP**: GameFacadeを介してゲームロジックを呼び出す（具象クラスに直接依存しない）

### Coding Principles

**VI. 理解しやすさ最優先** ✅
- **命名**: `autoAdvanceToMainPhase()`, `shuffleDeck()`, `autoCheckVictory()` など目的が明確
- **コメント**: 「なぜ自動化するか」をコメントで説明
- **関数**: 各自動化機能を独立した関数に分離（単一責任）

**VII. シンプルに問題を解決する** ✅
- **YAGNI**: 今必要な4つの自動化のみ実装（設定UI等は不要）
- **まず動くシンプルな実装**: `$effect`で状態監視 → 既存Commandを呼び出すだけ
- **抽象化は3回同じパターンが現れてから**: 各自動化機能は独立（共通化不要）

**VIII. テスト可能性を意識する** ✅
- **純粋関数優先**: `shuffleDeck(cards: CardInstance[]): CardInstance[]` は純粋関数
- **DIパターン**: GameFacadeを介してテスト可能
- **UIなしでビジネスロジックをテスト可能**: Domain/Application Layerは既にテスト済み、Presentation Layerの自動化ロジックのみ追加テスト

### Project-Specific Principles

**IX. 技術スタック** ✅
- **Svelte 5 Runes**: `$effect`による状態監視は、Svelteのリアクティビティと相性が良い
- **Immer.js**: デッキシャッフル時の不変性保証
- **TypeScript**: 型安全性を維持したままリファクタリング可能

### Development Workflow

**1. ブランチ戦略** ✅
- ブランチ`006-ux-automation`で作業中
- 完了後PR作成→レビュー→マージ

**2. コミット前の品質保証** ✅
- 動作確認: 各機能ごとにブラウザで動作確認
- Linter/Formatter実行: `npm run lint`, `npm run format`
- テスト実行: `npm run test:run`（312テスト全pass確認）

**3. コミットメッセージ** ✅
- `feat: 自動フェーズ進行を実装`, `feat: デッキシャッフル機能を追加`, etc.

### Testing Strategy

**テストレベル** ✅
1. **単体テスト**: デッキシャッフル関数（Fisher-Yatesアルゴリズム検証）
2. **統合テスト**: GameFacade経由の自動フェーズ進行・自動勝利判定
3. **E2Eテスト**: 既存のdeck-loading.spec.tsを拡張（自動フェーズ進行の確認を追加）

### Constitution Violations

**なし** - このプランはすべての憲法原則に準拠しています。

## Project Structure

### Documentation (this feature)

```text
specs/006-ux-automation/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command) - 不要（技術調査完了）
├── data-model.md        # Phase 1 output (/speckit.plan command) - 既存モデル利用のため不要
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command) - API変更なしのため不要
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
skeleton-app/
├── src/
│   ├── lib/
│   │   ├── domain/                    # ゲームロジック（変更なし）
│   │   │   ├── models/
│   │   │   │   └── GameState.ts      # 既存（読み取りのみ）
│   │   │   └── rules/
│   │   │       ├── VictoryRule.ts    # 既存（呼び出すのみ）
│   │   │       └── PhaseRule.ts      # 既存（呼び出すのみ）
│   │   ├── application/               # ユースケース層
│   │   │   ├── GameFacade.ts         # 既存（ShuffleDeckCommandを呼び出す）
│   │   │   ├── commands/
│   │   │   │   ├── ShuffleDeckCommand.ts  # 新規（デッキシャッフルCommand）
│   │   │   │   └── AdvancePhaseCommand.ts # 既存（呼び出すのみ）
│   │   │   └── stores/
│   │   │       └── gameStateStore.ts # 既存（読み取りのみ）
│   │   ├── shared/                   # 共通ユーティリティ
│   │   │   └── utils/
│   │   │       └── arrayUtils.ts     # 新規（shuffleArray<T>汎用関数）
│   │   └── presentation/              # UI層（主な変更箇所）
│   │       ├── components/            # 既存コンポーネント
│   │       └── utils/
│   │           └── toaster.ts        # 既存（トースト通知で利用）
│   └── routes/
│       └── (auth)/simulator/[deckId]/
│           └── +page.svelte          # 主な変更箇所（$effect追加、UIボタン削除）
└── tests/
    ├── unit/
    │   ├── application/
    │   │   └── commands/
    │   │       └── ShuffleDeckCommand.test.ts  # 新規テスト
    │   └── shared/
    │       └── utils/
    │           └── arrayUtils.test.ts  # 新規テスト
    ├── integration/
    │   └── GameFacade.test.ts        # 既存（shuffleDeck追加テスト）
    └── e2e/
        └── deck-loading.spec.ts      # 既存（スモークテスト拡張: 自動フェーズ進行確認を追加）
```

**Structure Decision**: 既存の4層Clean Architecture構造を維持。Command Patternに統一し、デッキシャッフルを`ShuffleDeckCommand`として実装。純粋関数（Fisher-Yates）は`shared/utils/arrayUtils.ts`に配置し、汎用性を確保。Domain Layerは変更不要。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

憲法違反なし。このセクションは不要。

---

## Phase 0: Research & Technical Decisions

### Research Status

**すべての技術選択が確定済み** - research.mdの生成は不要です。

### Key Technical Decisions

#### 1. 自動フェーズ進行の実装方法

**決定**: Svelte 5の`$effect`ルーンを使用

**根拠**:
- Svelteのリアクティビティシステムと統合され、状態変化を自動で追跡
- `$effect`はコンポーネントマウント時とリアクティブな依存関係の変化時に実行される
- 既存のSvelte 5環境と一貫性がある

**代替案**:
- `setInterval`/`setTimeout`でポーリング → 却下（パフォーマンス悪化、精度の問題）
- カスタムイベントリスナー → 却下（複雑性増加、Svelteの仕組みと重複）

**実装方針**:
```typescript
$effect(() => {
  // currentTurn === 1 && currentPhase === "Draw" の場合、Main Phaseまで自動進行
  if ($currentTurn === 1 && $currentPhase === "Draw" && !hasAutoAdvanced) {
    autoAdvanceToMainPhase();
  }
});
```

#### 2. デッキシャッフルのアルゴリズムと実装パターン

**決定**: Fisher-Yates (Knuth) シャッフルアルゴリズム + Command Pattern

**根拠**:
- **アルゴリズム選択**: O(n)の時間計算量で効率的、完全にランダムな並び替えを保証（すべての順列が等確率）、業界標準
- **実装パターン**: Command Patternに統一することで、他の操作（DrawCard, AdvancePhase等）と一貫性を保つ（憲法VI: 理解しやすさ最優先）
- **汎用化**: `shuffleArray<T>()`として実装し、`shared/utils/`に配置することで、将来的に他の配列シャッフルにも再利用可能

**代替案**:
- `Array.sort(() => Math.random() - 0.5)` → 却下（バイアスあり、非推奨）
- Lodash `_.shuffle` → 却下（追加依存、Fisher-Yatesと同等）
- Utility関数のみ（Commandなし） → 却下（Command Patternとの一貫性欠如）

**実装方針**:
```typescript
// shared/utils/arrayUtils.ts（純粋関数）
export function shuffleArray<T>(array: readonly T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// application/commands/ShuffleDeckCommand.ts（Command）
export class ShuffleDeckCommand implements Command {
  execute(state: GameState): CommandResult<GameState> {
    return produce(state, (draft) => {
      draft.zones.deck = shuffleArray(state.zones.deck);
    });
  }
}
```

#### 3. 自動勝利判定のトリガータイミング

**決定**: カード効果解決後・フェーズ移行後の2箇所

**根拠**:
- カード効果（強欲な壺等）でExodiaパーツがドローされた瞬間に勝利判定が必要
- フェーズ移行時にも状態変化があるため、念のため判定
- 重複判定は`isGameOver`フラグでガード（既に勝利している場合はスキップ）

**実装方針**:
```typescript
// カード効果解決後
effectResolutionStore.subscribe((state) => {
  if (!state.isActive && !$isGameOver) {
    gameFacade.checkVictory();
  }
});

// フェーズ移行後
$effect(() => {
  if ($currentPhase && !$isGameOver) {
    gameFacade.checkVictory();
  }
});
```

#### 4. UIボタンの扱い

**決定**: Debug Infoセクション内に移動（完全削除ではない）

**根拠**:
- デバッグ時に手動操作が必要になる可能性あり
- `<details>`タグ内に格納することで、通常プレイでは非表示、デバッグ時のみ展開可能

**実装方針**:
```svelte
<details class="card p-4">
  <summary class="cursor-pointer font-bold">Debug Info</summary>

  <!-- 既存のデバッグ情報 -->
  <pre class="text-xs mt-4 overflow-auto">{JSON.stringify(gameFacade.getGameState(), null, 2)}</pre>

  <!-- デバッグ用ボタン（新規追加） -->
  <div class="grid grid-cols-3 gap-2 mt-4">
    <button class="btn btn-sm variant-filled-primary" on:click={handleDrawCard}>Draw Card</button>
    <button class="btn btn-sm variant-filled-secondary" on:click={handleAdvancePhase}>Advance Phase</button>
    <button class="btn btn-sm variant-filled-tertiary" on:click={handleCheckVictory}>Check Victory</button>
  </div>
</details>
```

---

## Phase 1: Design & Implementation Details

### Data Model

**既存のGameStateモデルを使用** - data-model.mdの生成は不要です。

変更点はありません。以下の既存モデルをそのまま利用：
- `GameState`: ゲーム状態（フェーズ、ターン、ゾーン、プレイヤーLP等）
- `CardInstance`: カードインスタンス（instanceId, cardData）
- `Zone`: デッキ・手札・墓地等のゾーン

### API Contracts

**APIエンドポイントの変更なし** - contracts/ディレクトリの生成は不要です。

すべてクライアントサイドの機能であり、バックエンドAPIの変更は不要。

### Component Interactions

以下のコンポーネント間の相互作用を実装：

#### 1. ゲーム開始時のフロー

```text
+page.svelte ($effect)
  → GameFacade.shuffleDeck()
    → deckShuffler.shuffleDeck() (Fisher-Yates)
      → produce() (Immer.js) → 新しいGameState

  → GameFacade.advancePhase() (3回実行: Draw→Standby→Main)
    → AdvancePhaseCommand.execute()
      → PhaseRule.getNextPhase()
      → produce() → 新しいGameState
        → showSuccessToast("フェーズ移行しました")
```

#### 2. カード効果解決後のフロー

```text
effectResolutionStore.subscribe()
  → state.isActive === false (効果解決完了)
  → GameFacade.checkVictory()
    → VictoryRule.checkVictory()
      → GameState.isGameOver = true (Exodia5体揃い等)
        → UI: Game Result表示
```

#### 3. フェーズ移行後のフロー

```text
$effect(() => currentPhase変化)
  → GameFacade.checkVictory()
    → VictoryRule.checkVictory()
      → （勝利条件チェック）
```

### Implementation Checklist

以下の実装タスクを順次実行（詳細はtasks.mdで定義）：

1. **デッキシャッフル実装（Command Pattern）**
   - [ ] `src/lib/shared/utils/arrayUtils.ts` 作成（`shuffleArray<T>()` 汎用関数）
   - [ ] `src/lib/application/commands/ShuffleDeckCommand.ts` 作成（Command実装）
   - [ ] `GameFacade.shuffleDeck()` メソッド追加（ShuffleDeckCommandを実行）
   - [ ] ユニットテスト作成（arrayUtils.test.ts, ShuffleDeckCommand.test.ts）

2. **自動フェーズ進行実装**
   - [ ] `+page.svelte`に`$effect`追加（ターン1・Drawフェーズ検知）
   - [ ] `autoAdvanceToMainPhase()` 関数実装（Draw→Standby→Main）
   - [ ] トースト通知追加（各フェーズ移行時）
   - [ ] フラグ管理（`hasAutoAdvanced`で重複実行防止）

3. **自動勝利判定実装**
   - [ ] effectResolutionStore購読（カード効果解決後）
   - [ ] `$effect`追加（フェーズ移行後）
   - [ ] `isGameOver`フラグガード（重複判定防止）

4. **UIボタン移動**
   - [ ] 「Draw Card」「Advance Phase」「Check Victory」ボタンをDebug Infoセクション内に移動
   - [ ] `<details>`タグで折りたたみ可能にする

5. **テスト実装**
   - [ ] ユニットテスト（arrayUtils.test.ts, ShuffleDeckCommand.test.ts）
   - [ ] 統合テスト（GameFacade.shuffleDeck, autoCheckVictory）
   - [ ] E2Eテスト（deck-loading.spec.ts拡張 - 自動フェーズ進行の確認を追加）

6. **品質保証**
   - [ ] 既存312テスト全pass確認
   - [ ] Linter/Formatter実行
   - [ ] ブラウザ動作確認（10回リロードで異なる手札確認）

---

## Quickstart (開発者向け実装ガイド)

### 前提条件

- ブランチ`006-ux-automation`にチェックアウト済み
- 既存の312テストがすべてpass
- `npm install`実行済み

### 実装手順

#### Step 1: デッキシャッフル機能実装（Command Pattern）

```bash
# 1. 汎用シャッフル関数作成
mkdir -p skeleton-app/src/lib/shared/utils
touch skeleton-app/src/lib/shared/utils/arrayUtils.ts

# 2. ShuffleDeckCommand作成
touch skeleton-app/src/lib/application/commands/ShuffleDeckCommand.ts

# 3. テストファイル作成
mkdir -p skeleton-app/tests/unit/shared/utils
touch skeleton-app/tests/unit/shared/utils/arrayUtils.test.ts
mkdir -p skeleton-app/tests/unit/application/commands
touch skeleton-app/tests/unit/application/commands/ShuffleDeckCommand.test.ts
```

**実装コード（arrayUtils.ts - 汎用シャッフル関数）**:

```typescript
/**
 * Fisher-Yates (Knuth) シャッフルアルゴリズム
 * 配列をランダムにシャッフルする（完全な等確率保証）
 *
 * @param array シャッフル対象の配列（readonly）
 * @returns シャッフルされた新しい配列
 */
export function shuffleArray<T>(array: readonly T[]): T[] {
  const shuffled = [...array]; // 不変性を保持するためコピー

  // Fisher-Yatesアルゴリズム: O(n)で完全ランダム
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // スワップ
  }

  return shuffled;
}
```

**実装コード（ShuffleDeckCommand.ts - Command）**:

```typescript
import { produce } from "immer";
import type { GameState } from "$lib/domain/models/GameState";
import type { Command, CommandResult } from "$lib/application/commands/Command";
import { shuffleArray } from "$lib/shared/utils/arrayUtils";

/**
 * デッキシャッフルCommand
 * Fisher-Yatesアルゴリズムでデッキをランダムに並び替える
 */
export class ShuffleDeckCommand implements Command {
  execute(state: GameState): CommandResult<GameState> {
    try {
      const newState = produce(state, (draft) => {
        draft.zones.deck = shuffleArray(state.zones.deck);
      });

      return {
        success: true,
        state: newState,
        message: "デッキをシャッフルしました",
      };
    } catch (error) {
      console.error("[ShuffleDeckCommand] Error:", error);
      return {
        success: false,
        state,
        error: "デッキのシャッフルに失敗しました",
      };
    }
  }
}
```

**テストコード（arrayUtils.test.ts）**:

```typescript
import { describe, it, expect } from "vitest";
import { shuffleArray } from "$lib/shared/utils/arrayUtils";

describe("shuffleArray", () => {
  it("should return array with same length", () => {
    const array = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(array);
    expect(shuffled).toHaveLength(array.length);
  });

  it("should contain all original elements", () => {
    const array = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(array);
    expect(shuffled).toEqual(expect.arrayContaining(array));
  });

  it("should shuffle elements randomly (statistical test)", () => {
    const array = Array.from({ length: 10 }, (_, i) => i);
    let sameOrderCount = 0;
    const iterations = 1000;

    for (let i = 0; i < iterations; i++) {
      const shuffled = shuffleArray(array);
      if (shuffled[0] === array[0]) {
        sameOrderCount++;
      }
    }

    // 統計的に約10%の確率で最初の要素が同じはず
    const ratio = sameOrderCount / iterations;
    expect(ratio).toBeGreaterThan(0.05); // 5%以上
    expect(ratio).toBeLessThan(0.15);    // 15%以下
  });

  it("should not mutate original array", () => {
    const array = [1, 2, 3];
    const original = [...array];
    shuffleArray(array);
    expect(array).toEqual(original);
  });
});
```

**テストコード（ShuffleDeckCommand.test.ts）**:

```typescript
import { describe, it, expect } from "vitest";
import { ShuffleDeckCommand } from "$lib/application/commands/ShuffleDeckCommand";
import type { GameState, CardInstance } from "$lib/domain/models/GameState";

describe("ShuffleDeckCommand", () => {
  it("should shuffle deck successfully", () => {
    const cards: CardInstance[] = Array.from({ length: 10 }, (_, i) => ({
      instanceId: String(i),
      cardData: { id: i, type: "spell" as const },
    }));

    const initialState: GameState = {
      zones: { deck: cards, hand: [], graveyard: [], field: [] },
      // ... 他のプロパティ
    } as GameState;

    const command = new ShuffleDeckCommand();
    const result = command.execute(initialState);

    expect(result.success).toBe(true);
    expect(result.state.zones.deck).toHaveLength(cards.length);
    expect(result.state.zones.deck).toEqual(expect.arrayContaining(cards));
  });

  it("should not mutate original state", () => {
    const initialState: GameState = {
      zones: { deck: [{ instanceId: "1", cardData: { id: 1, type: "spell" } }], hand: [], graveyard: [], field: [] },
      // ... 他のプロパティ
    } as GameState;

    const originalDeck = initialState.zones.deck;
    const command = new ShuffleDeckCommand();
    command.execute(initialState);

    expect(initialState.zones.deck).toBe(originalDeck); // 参照が同じ（不変）
  });
});
```

#### Step 2: GameFacadeにshuffleDeckメソッド追加

```typescript
// skeleton-app/src/lib/application/GameFacade.ts

import { ShuffleDeckCommand } from "$lib/application/commands/ShuffleDeckCommand";

export class GameFacade {
  // ... 既存メソッド

  /**
   * デッキをシャッフルする
   * ShuffleDeckCommandを実行してデッキをランダムに並び替える
   */
  shuffleDeck(): { success: boolean; message?: string; error?: string } {
    const command = new ShuffleDeckCommand();
    const result = this.executeCommand(command); // 既存のexecuteCommandメソッド利用

    if (result.success) {
      return { success: true, message: result.message };
    } else {
      return { success: false, error: result.error };
    }
  }
}
```

#### Step 3: +page.svelteに自動化ロジック追加

```svelte
<!-- skeleton-app/src/routes/(auth)/simulator/[deckId]/+page.svelte -->

<script lang="ts">
  import { onMount } from "svelte";
  import { gameFacade } from "$lib/application/GameFacade";
  import { currentTurn, currentPhase, isGameOver } from "$lib/application/stores/derivedStores";
  import { effectResolutionStore } from "$lib/application/stores/effectResolutionStore";
  import { showSuccessToast, showErrorToast } from "$lib/presentation/utils/toaster";

  // 自動フェーズ進行フラグ（重複実行防止）
  let hasAutoAdvanced = $state(false);
  let hasShuffled = $state(false);

  // ゲーム開始時: デッキシャッフル
  onMount(() => {
    if (!hasShuffled) {
      const result = gameFacade.shuffleDeck();
      if (result.success) {
        console.log("[Simulator] Deck shuffled");
        hasShuffled = true;
      }
    }
  });

  // 自動フェーズ進行: ターン1のDrawフェーズからMain Phaseまで自動進行
  $effect(() => {
    if ($currentTurn === 1 && $currentPhase === "Draw" && !hasAutoAdvanced && !$isGameOver) {
      console.log("[Simulator] Auto-advancing to Main Phase...");

      // Draw → Standby
      gameFacade.advancePhase();
      showSuccessToast("ドローフェーズに移行しました");

      // Standby → Main1
      setTimeout(() => {
        gameFacade.advancePhase();
        showSuccessToast("スタンバイフェーズに移行しました");

        setTimeout(() => {
          gameFacade.advancePhase();
          showSuccessToast("メインフェーズ1に移行しました");
          hasAutoAdvanced = true;
        }, 300);
      }, 300);
    }
  });

  // 自動勝利判定: カード効果解決後
  effectResolutionStore.subscribe((state) => {
    if (!state.isActive && !$isGameOver) {
      gameFacade.checkVictory();
    }
  });

  // 自動勝利判定: フェーズ移行後
  $effect(() => {
    if ($currentPhase && !$isGameOver) {
      gameFacade.checkVictory();
    }
  });
</script>

<!-- UI部分: DrawCard/AdvancePhase/CheckVictoryボタンをDebug Infoセクション内に移動 -->

<!-- Actions セクションから削除 -->
<!--
<div class="card p-4 space-y-4">
  <h2 class="text-xl font-bold mb-4">Actions</h2>
  <div class="grid grid-cols-3 gap-4">
    <button class="btn variant-filled-primary" on:click={handleDrawCard}>Draw Card</button>
    <button class="btn variant-filled-secondary" on:click={handleAdvancePhase}>Advance Phase</button>
    <button class="btn variant-filled-tertiary" on:click={handleCheckVictory}>Check Victory</button>
  </div>
</div>
-->

<!-- Debug Info セクションに移動 -->
<details class="card p-4">
  <summary class="cursor-pointer font-bold">Debug Info</summary>

  <pre class="text-xs mt-4 overflow-auto">{JSON.stringify(gameFacade.getGameState(), null, 2)}</pre>

  <!-- デバッグ用手動操作ボタン -->
  <div class="grid grid-cols-3 gap-2 mt-4">
    <button class="btn btn-sm variant-filled-primary" on:click={handleDrawCard}>Draw Card</button>
    <button class="btn btn-sm variant-filled-secondary" on:click={handleAdvancePhase}>Advance Phase</button>
    <button class="btn btn-sm variant-filled-tertiary" on:click={handleCheckVictory}>Check Victory</button>
  </div>
</details>
```

#### Step 4: E2Eスモークテスト拡張

既存の`deck-loading.spec.ts`に、自動フェーズ進行の確認を追加。

**拡張内容**:

```typescript
// skeleton-app/tests/e2e/deck-loading.spec.ts

test.describe("Application Smoke Test", () => {
  test("should load application with mocked YGOPRODeck API", async ({ page }) => {
    // ... 既存のAPIモック設定 ...

    // アプリケーションページに移動
    await page.goto("/");

    // ページが正常に読み込まれることを確認（既存）
    await expect(page).toHaveTitle(/.*/, { timeout: 5000 });
    await expect(page).not.toHaveURL(/error/);

    // ✅ 新規追加: 自動フェーズ進行の確認
    // ターン1開始時、自動的にMain Phaseまで進行することを確認
    // （DOMに現在のフェーズが表示されている前提）
    const phaseIndicator = page.locator('[data-testid="current-phase"]');
    await expect(phaseIndicator).toContainText(/Main Phase|メインフェーズ/, { timeout: 3000 });
  });
});
```

**注意**:
- `data-testid="current-phase"` 属性は、+page.svelteでフェーズ表示要素に追加する必要があります
- フェーズ表示がない場合は、このテストはスキップして「ページ読み込み成功」のみ確認します

**テスト実行**:

```bash
cd skeleton-app

# ユニットテスト実行
npm run test:run

# E2Eスモークテスト実行
npx playwright test tests/e2e/deck-loading.spec.ts

# 全E2Eテスト実行
npx playwright test

# Linter/Formatter実行
npm run lint
npm run format
```

#### Step 5: 動作確認

1. ブラウザでシミュレータページにアクセス
2. ページロード時にデッキがシャッフルされることを確認
3. 自動的にMain Phaseまで進行することを確認（トースト通知表示）
4. カードを発動し、Exodia5体揃い時に自動勝利画面が表示されることを確認
5. 10回リロードして、毎回異なる手札になることを確認

---

## Next Steps

このplan.md完成後、以下のステップで進めます：

1. ✅ Phase 0 研究（完了 - このplan.mdに記載済み）
2. ✅ Phase 1 設計（完了 - このplan.mdに記載済み）
3. ⏳ Phase 2 タスク分解 - `/speckit.tasks`コマンドを実行してtasks.mdを生成
4. ⏳ 実装開始 - tasks.mdに従って実装
5. ⏳ PR作成・レビュー・マージ

**現在のステータス**: plan.md生成完了。次は`/speckit.tasks`でタスク分解を行います。
