# Implementation Plan: Effect Model Implementation

**Branch**: `008-effect-model` | **Date**: 2025-01-28 | **Spec**: [spec.md](./spec.md)

## Summary

遊戯王OCG公式ルールに準拠した効果モデル（ChainableAction と AdditionalRule）を導入し、既存の CardEffect システムから移行する。これによりClean Architectureの完全実現（Domain層がApplication層に依存しない設計）を達成する。チキンレースを実装例として使用し、効果モデルの実用性を検証する。

**技術的アプローチ**: 
- Registry Pattern によるO(1)高速ルックアップを維持
- 効果ステップを「返す」設計により、Domain層とApplication層の責務を明確に分離
- CONDITIONS/ACTIVATION/RESOLUTIONの3ステップ構成で公式ルールと対応
- 段階的移行により既存システムとの共存期間を設ける

## Technical Context

**Language/Version**: TypeScript 5.0 (ES2022), Svelte 5 (Runes mode), SvelteKit 2  
**Primary Dependencies**: Vitest (testing), Immer.js (immutability), TailwindCSS (styling), Skeleton UI  
**Storage**: N/A (フロントエンドのみ、状態はメモリ内)  
**Testing**: Vitest (unit/integration), Playwright (E2E)  
**Target Platform**: Web browser (SPA)  
**Project Type**: Web (single-page application)  
**Performance Goals**: O(1) registry lookup, 60fps UI rendering  
**Constraints**: 
- Svelte 5 Runes mode必須（$state, $derived, $effect）
- すべての状態更新はImmer.jsのproduce()を使用（不変性保持）
- Domain LayerにSvelte/UI依存コードを書かない（Clean Architecture準拠）
- チェーンシステムはスコープ外（基盤のみ実装）

**Scale/Scope**: 
- 既存カード効果: 2枚（Pot of Greed, Graceful Charity）
- 新規カード: 1枚（Chicken Game - 検証用）
- Domain Layer: ~15ファイル（models, registries, effects, commands）
- Application Layer: ~10ファイル（stores, services, GameFacade）
- Test Coverage: 単体テスト（全モデル・コマンド）、統合テスト（効果解決フロー）、E2E（チキンレース発動）

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Initial Check (Before Phase 0)

**✅ Planning Principles**:
- **I. 目的と手段の分離**: 
  - Why: 既存のDomain→Application依存を解消し、Clean Architectureを実現
  - What/How: 効果モデル導入とeffectStepsを返す設計への変更
  - 目的が明確であり、手段が適切に選択されている

- **II. 段階的な理解の深化**: 
  - 5つのPhaseに分割し、各段階で検証可能
  - 移行期間中の共存を許容（既存システムを壊さない）
  - フィードバックに基づく調整が可能

**✅ Architecture Principles**:
- **III. 最適解の選択と記録**: 
  - ADR-0008で設計判断を記録済み
  - Alternatives Consideredで代替案を評価済み
  - トレードオフ（大規模リファクタリング vs Clean Architecture実現）を明確化

- **IV. 関心の分離**: 
  - Domain Layer: 効果モデル定義、Registry、Commands（ゲームロジック）
  - Application Layer: effectResolutionStore、GameFacade（フロー制御）
  - 依存の方向が正しい（Application→Domain、逆はNG）

- **V. 変更に対応できる設計**: 
  - Open/Closed Principle: 新規カード追加時、既存コード変更不要
  - Registry Patternによる拡張性
  - Interface Segregation: ChainableActionとAdditionalRuleの責務分離

**✅ Coding Principles**:
- **VI. 理解しやすさ最優先**: 
  - 公式ルール（CONDITIONS/ACTIVATION/RESOLUTION）との明確な対応
  - 効果の分類（chainable vs additional）が直感的
  - TypeScript型システムによる自己文書化

- **VII. シンプルに問題を解決する**: 
  - YAGNIの適用: チェーンシステムは現時点で実装せず、基盤のみ
  - 既存パターン（Registry Pattern, Strategy Pattern）の再利用
  - 過剰な抽象化を避ける（effectStepsを直接返すシンプルな設計）

- **VIII. テスト可能性を意識する**: 
  - DI削除により、ActivateSpellCommandのテストが簡略化
  - 純粋関数優先（effect.canActivate, effect.createSteps）
  - UI なしでビジネスロジック完全テスト可能

**✅ Project-Specific Principles**:
- **IX. 技術スタック**: 
  - TypeScript + Svelte 5 + TailwindCSSを維持
  - 新規依存関係なし
  - 既存のImmer.jsパターンを継続

**判定**: ✅ All gates passed. 憲法違反なし。

### Re-check after Phase 1 (Design Complete)

（Phase 1完了後に再評価）

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

（憲法違反がないため、記載不要）

## Project Structure

### Documentation (this feature)

```text
specs/008-effect-model/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output (研究・調査結果)
├── data-model.md        # Phase 1 output (データモデル設計)
├── quickstart.md        # Phase 1 output (実装クイックスタート)
├── contracts/           # Phase 1 output (API contracts)
│   └── effect-model-interfaces.ts  # ChainableAction, AdditionalRule型定義
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
skeleton-app/src/lib/
├── domain/
│   ├── models/
│   │   ├── ChainableAction.ts          # 新規: チェーン可能な処理インターフェース
│   │   ├── AdditionalRule.ts           # 新規: 追加ルールインターフェース
│   │   ├── GameStateUpdateResult.ts    # 修正: effectStepsフィールド追加
│   │   └── RuleContext.ts              # 新規: ルール適用コンテキスト
│   │
│   ├── registries/
│   │   ├── CardDataRegistry.ts         # 既存: カード基本データ
│   │   ├── ChainableActionRegistry.ts  # 新規: チェーン可能な処理レジストリ
│   │   └── AdditionalRuleRegistry.ts   # 新規: 追加ルールレジストリ
│   │
│   ├── effects/
│   │   ├── CardEffect.ts               # 既存→削除予定（Phase 5）
│   │   ├── CardEffectRegistry.ts       # 既存→削除予定（Phase 5）
│   │   ├── EffectResolutionStep.ts     # 既存: 効果解決ステップ定義
│   │   │
│   │   ├── chainable/                  # 新規ディレクトリ: チェーン可能な処理実装
│   │   │   ├── PotOfGreedAction.ts     # 新規: Pot of Greed効果（移行）
│   │   │   ├── GracefulCharityAction.ts # 新規: Graceful Charity効果（移行）
│   │   │   ├── ChickenGameActivation.ts # 新規: チキンレース発動処理
│   │   │   └── ChickenGameIgnitionEffect.ts # 新規: チキンレース起動効果
│   │   │
│   │   ├── additional/                 # 新規ディレクトリ: 追加ルール実装
│   │   │   └── ChickenGameContinuousRule.ts # 新規: チキンレース永続効果
│   │   │
│   │   ├── bases/                      # 既存: 効果基底クラス
│   │   │   ├── SpellEffect.ts          # 既存（Phase 5で削除検討）
│   │   │   └── NormalSpellEffect.ts    # 既存（Phase 5で削除検討）
│   │   │
│   │   └── cards/                      # 既存: カード効果実装
│   │       ├── PotOfGreedEffect.ts     # 既存（Phase 5で削除）
│   │       └── GracefulCharityEffect.ts # 既存（Phase 5で削除）
│   │
│   ├── commands/
│   │   ├── ActivateSpellCommand.ts     # 修正: effectSteps返却、DI削除
│   │   └── [other commands]            # 既存: 変更なし
│   │
│   └── services/
│       └── IEffectResolutionService.ts # 既存→削除（Phase 3）
│
├── application/
│   ├── GameFacade.ts                   # 修正: effectSteps処理追加
│   ├── services/
│   │   └── EffectResolutionServiceImpl.ts # 既存→削除（Phase 3）
│   │
│   └── stores/
│       ├── gameStateStore.ts           # 既存: 変更なし
│       └── effectResolutionStore.ts    # 既存: 変更なし
│
└── [infrastructure/, presentation/]     # 変更なし

tests/
├── unit/
│   └── domain/
│       ├── models/
│       │   ├── ChainableAction.test.ts       # 新規
│       │   └── AdditionalRule.test.ts        # 新規
│       │
│       ├── registries/
│       │   ├── ChainableActionRegistry.test.ts # 新規
│       │   └── AdditionalRuleRegistry.test.ts  # 新規
│       │
│       ├── effects/
│       │   ├── chainable/
│       │   │   ├── PotOfGreedAction.test.ts      # 新規
│       │   │   └── ChickenGameActions.test.ts    # 新規
│       │   │
│       │   └── additional/
│       │       └── ChickenGameContinuousRule.test.ts # 新規
│       │
│       └── commands/
│           └── ActivateSpellCommand.test.ts  # 修正: DI不要のテストに変更
│
└── integration/
    └── card-effects/
        ├── NormalSpells.test.ts          # 修正: 新旧システム両方テスト
        └── ChickenGame.test.ts           # 新規: チキンレース統合テスト
```

**Structure Decision**: 

既存の4層Clean Architecture（Domain/Application/Infrastructure/Presentation）を維持しつつ、Domain Layer内のeffectsディレクトリを再編成：

- **chainable/**: チェーンブロックを作る処理の具象実装（カード発動、効果発動）
- **additional/**: 追加ルールの具象実装（永続効果、ルール効果）
- **bases/** と **cards/**: 既存の CardEffect 実装（Phase 5で削除予定）

この構造により、既存システムと新システムが段階的移行期間中に共存可能。

---

## Phase 0: Outline & Research

### Research Tasks

以下の技術的不明点を調査し、`research.md`に記録する：

#### 1. ChainableAction と CardEffect の共存戦略

**調査内容**:
- 既存の `CardEffectRegistry.get()` と新規の `ChainableActionRegistry.get()` を同時に使用する際の処理フロー
- `ActivateSpellCommand` でどちらのregistryを優先するか（フォールバック戦略）
- 移行期間中のテスト戦略（両方のシステムで同じカードをテスト）

**決定事項**:
- CardEffectRegistryとChainableActionRegistryの優先順位
- 移行完了の判定基準（すべてのカードがChainableActionに移行完了）

#### 2. effectSteps の型安全性と非同期処理

**調査内容**:
- 現在の `EffectResolutionStep.action` は `Promise<GameStateUpdateResult> | GameStateUpdateResult` を許容
- 非同期処理が実際に必要なユースケースはあるか？
- 型を `(state: GameState, selectedInstanceIds?: string[]) => GameStateUpdateResult` に統一すべきか？

**決定事項**:
- actionシグネチャの統一（同期 or 非同期）
- 型安全性向上のための型定義変更の要否

#### 3. AdditionalRule の apply/checkPermission/replace の使い分け

**調査内容**:
- チキンレースの「ダメージを0にする」効果は、どのメソッドで実装すべきか？
  - `apply()`: データ書き換え → ダメージ値を0にする
  - `checkPermission()`: 判定追加 → ダメージ処理の可否を判定
  - `replace()`: 処理置換 → ダメージ処理を別の処理に置換
- 各メソッドの責務を明確化
- Ruleカテゴリとの対応関係

**決定事項**:
- チキンレースダメージ無効化の実装方針
- apply/checkPermission/replaceの使い分けガイドライン

#### 4. チキンレースの「1ターンに1度」制限の実装方法

**調査内容**:
- GameStateに発動履歴を記録する方法
  - 新規フィールド `activatedEffectsThisTurn: Set<string>` を追加？
  - 既存の `actionHistory` を活用？
- ターン終了時のクリーンアップ処理
- `canActivate()` での発動可否判定

**決定事項**:
- 発動履歴の保存場所とデータ構造
- ターン終了時のリセット方法

#### 5. テスト戦略: 既存テストの保守と新規テストの追加

**調査内容**:
- 既存のActivateSpellCommand.test.tsの修正範囲
  - DI削除によるテストコードの簡略化
  - effectStepsの検証方法
- 新規テストのカバレッジ目標
  - ChainableAction/AdditionalRuleの単体テスト
  - Registry Pattern のテスト
  - チキンレース統合テスト

**決定事項**:
- テストファイル構成
- モック不要なテスト設計の確認

### Output: research.md

すべての調査結果を `research.md` に以下のフォーマットで記録：

```markdown
## [調査項目名]

**Decision**: [選択した設計アプローチ]

**Rationale**: [選択理由]

**Alternatives Considered**: 
- [代替案1]: [却下理由]
- [代替案2]: [却下理由]

**Implementation Notes**: [実装時の注意点]
```

---

## Phase 1: Design & Contracts

**Prerequisites**: `research.md` complete

### 1. Data Model Design (data-model.md)

以下のエンティティとインターフェースを定義：

#### A. ChainableAction Interface

```typescript
/**
 * ChainableAction - チェーンブロックを作る処理のモデル
 * 
 * カードの発動と効果の発動を統一的に扱う。
 * 公式ルールのCONDITIONS/ACTIVATION/RESOLUTIONに対応。
 */
export interface ChainableAction {
  /** カードの発動か効果の発動か */
  readonly isCardActivation: boolean;

  /** スペルスピード (1: Normal, 2: Quick-Play, 3: Counter) */
  readonly spellSpeed: 1 | 2 | 3;

  /**
   * CONDITIONS: 発動条件チェック
   * @param state - 現在のゲーム状態
   * @returns 発動可能ならtrue
   */
  canActivate(state: GameState): boolean;

  /**
   * ACTIVATION: 発動時の処理（即座に実行）
   * コスト支払い、対象指定、カード配置など
   * @param state - 現在のゲーム状態
   * @returns 発動時の処理ステップ配列
   */
  createActivationSteps(state: GameState): EffectResolutionStep[];

  /**
   * RESOLUTION: 効果解決時の処理（チェーン解決時に実行）
   * @param state - 現在のゲーム状態
   * @param activatedCardInstanceId - 発動したカードのインスタンスID
   * @returns 効果解決時の処理ステップ配列
   */
  createResolutionSteps(state: GameState, activatedCardInstanceId: string): EffectResolutionStep[];
}
```

**フィールド詳細**:
- `isCardActivation`: true=カードの発動（手札→フィールド）, false=効果の発動（既にフィールドに存在）
- `spellSpeed`: チェーンシステムで使用（本specではスコープ外だが、型定義は先行実装）
- `canActivate`: 発動条件（フェーズ、コスト、対象の存在等）
- `createActivationSteps`: 発動を宣言した瞬間に実行（無効化されても取り消されない）
- `createResolutionSteps`: チェーン解決時に実行（無効化される可能性あり）

#### B. AdditionalRule Interface

```typescript
/**
 * RuleCategory - 追加ルールのカテゴリ
 * どの処理に介入するかを定義
 */
export type RuleCategory =
  // データ書き換え
  | "NameOverride"        // カード名変更
  | "StatusModifier"      // 攻撃力/守備力変更
  // 判定追加・制限追加
  | "SummonCondition"     // 特殊召喚条件
  | "SummonPermission"    // 召喚回数制限
  | "ActionPermission"    // 行動制限（攻撃不可、効果発動不可等）
  | "VictoryCondition"    // 特殊勝利判定
  // 処理置換・処理フック
  | "ActionReplacement"   // 破壊耐性、身代わり効果
  | "SelfDestruction";    // 維持コスト、自壊

/**
 * RuleContext - ルール適用時のコンテキスト
 * 汎用的なパラメータ受け渡し用
 */
export interface RuleContext {
  /** ダメージ量（ダメージ無効化系で使用） */
  damageAmount?: number;
  
  /** 対象カードインスタンスID */
  targetCardInstanceId?: string;
  
  /** その他の汎用パラメータ */
  [key: string]: unknown;
}

/**
 * AdditionalRule - 追加ルールのモデル
 * 
 * 永続効果、ルール効果、効果外テキストを表現。
 */
export interface AdditionalRule {
  /** ルール上「効果」にあたるか（無効化可否の判定に使用） */
  readonly isEffect: boolean;

  /** ルールのカテゴリ（介入するタイミングを定義） */
  readonly category: RuleCategory;

  /**
   * 適用条件チェック
   * @param state - 現在のゲーム状態
   * @param context - ルール適用コンテキスト
   * @returns 適用可能ならtrue
   */
  canApply(state: GameState, context: RuleContext): boolean;

  /**
   * データ書き換え系（NameOverride, StatusModifier）
   * @param state - 現在のゲーム状態
   * @param context - ルール適用コンテキスト
   * @returns 新しいゲーム状態
   */
  apply?(state: GameState, context: RuleContext): GameState;

  /**
   * 判定追加・制限系（SummonCondition, Permission, VictoryCondition）
   * @param state - 現在のゲーム状態
   * @param context - ルール適用コンテキスト
   * @returns 許可ならtrue、禁止ならfalse
   */
  checkPermission?(state: GameState, context: RuleContext): boolean;

  /**
   * 処理置換・フック系（ActionReplacement, SelfDestruction）
   * @param state - 現在のゲーム状態
   * @param context - ルール適用コンテキスト
   * @returns 置換後のゲーム状態
   */
  replace?(state: GameState, context: RuleContext): GameState;
}
```

**メソッド使い分け**:
- `apply()`: ステータス変更、カード名変更など、データを直接書き換える
- `checkPermission()`: 「攻撃できない」「効果を発動できない」など、行動の可否を判定
- `replace()`: 「破壊されない」「破壊される代わりに除外」など、処理を別の処理に置き換える

#### C. GameStateUpdateResult (修正)

```typescript
/**
 * GameStateUpdateResult - ゲーム状態更新結果
 * 
 * 既存の型に effectSteps フィールドを追加
 */
export interface GameStateUpdateResult {
  readonly success: boolean;
  readonly newState: GameState;
  readonly message?: string;
  readonly error?: string;

  /**
   * 効果解決ステップ（オプショナル）
   * Domain層がApplication層に効果解決を委譲する際に使用
   */
  readonly effectSteps?: EffectResolutionStep[];
}
```

#### D. Registry Classes

**ChainableActionRegistry**:

```typescript
/**
 * ChainableActionRegistry - チェーン可能な処理のレジストリ
 * 
 * Card ID → ChainableAction のマッピングを管理
 * Registry Pattern + Strategy Pattern
 */
export class ChainableActionRegistry {
  private static actions = new Map<number, ChainableAction>();

  /**
   * 効果を登録
   * @param cardId - カードID
   * @param action - チェーン可能な処理
   */
  static register(cardId: number, action: ChainableAction): void {
    this.actions.set(cardId, action);
  }

  /**
   * 効果を取得
   * @param cardId - カードID
   * @returns ChainableAction（未登録の場合はundefined）
   */
  static get(cardId: number): ChainableAction | undefined {
    return this.actions.get(cardId);
  }

  /**
   * レジストリをクリア（テスト用）
   */
  static clear(): void {
    this.actions.clear();
  }

  /**
   * 登録済みカードIDの一覧を取得（デバッグ用）
   */
  static getRegisteredCardIds(): number[] {
    return Array.from(this.actions.keys());
  }
}
```

**AdditionalRuleRegistry**:

```typescript
/**
 * AdditionalRuleRegistry - 追加ルールのレジストリ
 * 
 * Card ID → AdditionalRule[] のマッピングを管理
 * 1枚のカードに複数のルールが存在可能
 */
export class AdditionalRuleRegistry {
  private static rules = new Map<number, AdditionalRule[]>();

  /**
   * ルールを登録
   * @param cardId - カードID
   * @param rule - 追加ルール
   */
  static register(cardId: number, rule: AdditionalRule): void {
    const existing = this.rules.get(cardId) || [];
    this.rules.set(cardId, [...existing, rule]);
  }

  /**
   * カードIDから全ルールを取得
   * @param cardId - カードID
   * @returns AdditionalRule配列（未登録の場合は空配列）
   */
  static get(cardId: number): AdditionalRule[] {
    return this.rules.get(cardId) || [];
  }

  /**
   * カテゴリ別フィルタ
   * @param cardId - カードID
   * @param category - ルールカテゴリ
   * @returns 該当カテゴリのルール配列
   */
  static getByCategory(cardId: number, category: RuleCategory): AdditionalRule[] {
    const allRules = this.get(cardId);
    return allRules.filter(rule => rule.category === category);
  }

  /**
   * フィールド全体から適用可能なルールを収集
   * @param state - 現在のゲーム状態
   * @param category - ルールカテゴリ
   * @param context - ルール適用コンテキスト
   * @returns 適用可能なルール配列
   */
  static collectActiveRules(
    state: GameState,
    category: RuleCategory,
    context: RuleContext = {}
  ): AdditionalRule[] {
    const activeRules: AdditionalRule[] = [];

    // フィールド上のすべてのカードをチェック
    for (const card of state.zones.field) {
      const cardRules = this.getByCategory(card.id, category);
      for (const rule of cardRules) {
        if (rule.canApply(state, context)) {
          activeRules.push(rule);
        }
      }
    }

    return activeRules;
  }

  /**
   * レジストリをクリア（テスト用）
   */
  static clear(): void {
    this.rules.clear();
  }
}
```

#### E. Chicken Game (チキンレース) Data Model

**カード基本情報**:
```typescript
// CardDataRegistryに登録
{
  id: 67616300,
  name: "Chicken Game",
  nameJa: "チキンレース",
  type: "Spell",
  frameType: "spell",
  race: "Field",
  desc: "相手よりLPが少ないプレイヤーが受けるダメージは0になる。" +
        "①：1ターンに1度、1000LPを払って以下の効果から1つを選択して発動できる。" +
        "この効果の発動に対して、お互いに魔法・罠・モンスターの効果を発動できない。" +
        "●デッキから1枚ドローする。" +
        "●このカードを破壊する。" +
        "●相手は1000LP回復する。"
}
```

**ChainableAction実装**:
- `ChickenGameActivation`: カードの発動（フィールド魔法の配置）
- `ChickenGameIgnitionEffect`: 起動効果（1ターンに1度、1000LP支払い）

**AdditionalRule実装**:
- `ChickenGameContinuousRule`: 永続効果（ダメージ無効化）

### 2. API Contracts (contracts/)

`contracts/effect-model-interfaces.ts` に型定義をエクスポート：

```typescript
/**
 * Effect Model Interfaces
 * 
 * Domain層で定義される効果モデルの型定義を集約
 */

export type { ChainableAction } from "$lib/domain/models/ChainableAction";
export type { AdditionalRule, RuleCategory, RuleContext } from "$lib/domain/models/AdditionalRule";
export type { GameStateUpdateResult } from "$lib/domain/models/GameStateUpdateResult";
export type { EffectResolutionStep } from "$lib/domain/effects/EffectResolutionStep";
```

### 3. Quickstart Guide (quickstart.md)

実装者向けのクイックスタートガイドを作成：

```markdown
# Effect Model Implementation Quickstart

## 新規カード効果の実装手順

### 1. ChainableAction の実装

1. `domain/effects/chainable/` に新規ファイルを作成
2. `ChainableAction` インターフェースを実装
3. `ChainableActionRegistry.register()` で登録

### 2. AdditionalRule の実装

1. `domain/effects/additional/` に新規ファイルを作成
2. `AdditionalRule` インターフェースを実装
3. `AdditionalRuleRegistry.register()` で登録

### 3. テスト実装

1. 単体テスト: `tests/unit/domain/effects/`
2. 統合テスト: `tests/integration/card-effects/`

## チキンレース実装例

（実装例のコードスニペットを記載）
```

### 4. Agent Context Update

```bash
.specify/scripts/bash/update-agent-context.sh claude
```

このスクリプトにより、以下が自動更新される：
- `.claude/commands/speckit.constitution.md` に新規技術スタックを追加
- 手動追加された内容は保護される

**Output**: data-model.md, contracts/, quickstart.md, CLAUDE.md更新

---

## Next Steps

Phase 0とPhase 1が完了した時点で、このコマンドは終了します。

**次に実行するコマンド**: `/speckit.tasks`

Phase 2以降の詳細なタスク分解、実装順序、依存関係は `/speckit.tasks` コマンドで生成されます。

**報告事項**:
- **Branch**: 008-effect-model
- **Implementation Plan**: /Users/shohei/github/ygo-solitaire/specs/008-effect-model/plan.md
- **Generated Artifacts** (after Phase 0-1 completion):
  - research.md
  - data-model.md
  - contracts/effect-model-interfaces.ts
  - quickstart.md

**Implementation Phases Overview** (詳細はtasks.mdで定義):
1. Phase 1: モデル定義とRegistry実装
2. Phase 2: ChainableAction移行
3. Phase 3: ActivateSpellCommandリファクタリング
4. Phase 4: Chicken Game実装
5. Phase 5: 既存CardEffectRegistry削除

---

## Constitution Check Re-evaluation (After Phase 1)

_Phase 1 (Design & Contracts) 完了後の再評価_

### Design Artifacts Review

以下のアーティファクトを生成し、設計を完了しました：

1. **research.md**: 5つの技術的不明点を解決
   - ChainableAction/CardEffect共存戦略
   - effectSteps型安全性（非同期削除）
   - AdditionalRuleメソッド使い分け
   - 1ターンに1度制限の実装
   - テスト戦略

2. **data-model.md**: 完全なエンティティ定義
   - ChainableAction/AdditionalRuleインターフェース
   - GameStateUpdateResult拡張（effectSteps追加）
   - GameState拡張（activatedIgnitionEffectsThisTurn追加）
   - Registry Classes（ChainableActionRegistry, AdditionalRuleRegistry）
   - Chicken Gameエンティティ詳細

3. **contracts/effect-model-interfaces.ts**: API契約
   - TypeScript型定義
   - Type Guards
   - 実装例（コメント内ドキュメント）

4. **quickstart.md**: 実装者向けガイド
   - ChainableAction実装手順
   - AdditionalRule実装手順
   - テスト実装例
   - Chicken Game完全実装例

### Constitution Compliance Re-check

**✅ Planning Principles**:
- **I. 目的と手段の分離**: Phase 0 researchで「なぜ」を明確化し、具体的な「how」を決定
- **II. 段階的な理解の深化**: 5つの調査項目で段階的に理解を深め、data-modelで収束

**✅ Architecture Principles**:
- **III. 最適解の選択と記録**: 
  - research.mdで代替案評価と選択理由を記録
  - data-model.mdで設計の根拠を明示
- **IV. 関心の分離**: 
  - Domain Layer: ChainableAction, AdditionalRule, Registry（ゲームロジック）
  - Application Layer: GameFacade, effectResolutionStore（フロー制御）
  - 依存の方向が正しいことを確認（effectStepsによる委譲）
- **V. 変更に対応できる設計**: 
  - Registry Patternによる拡張性を維持
  - Interface Segregationにより責務分離明確

**✅ Coding Principles**:
- **VI. 理解しやすさ最優先**: 
  - 公式ルールとの明確な対応（CONDITIONS/ACTIVATION/RESOLUTION）
  - quickstart.mdで実装例を豊富に提供
- **VII. シンプルに問題を解決する**: 
  - 非同期処理削除により型を単純化
  - YAGNIの適用（チェーンシステムは基盤のみ）
- **VIII. テスト可能性を意識する**: 
  - DI削除により単体テストが簡略化
  - 純粋関数優先の設計

**✅ Project-Specific Principles**:
- **IX. 技術スタック**: 既存技術を維持、新規依存なし

**判定**: ✅ All gates passed. Phase 1設計は憲法に準拠。

### Summary

Phase 0とPhase 1を完了し、以下を達成しました：

- [x] すべての技術的不明点を解決（research.md）
- [x] 完全なデータモデル設計（data-model.md）
- [x] API契約定義（contracts/）
- [x] 実装ガイド作成（quickstart.md）
- [x] Agent Context更新（CLAUDE.md）
- [x] 憲法準拠確認（Constitution Check）

**次のステップ**: `/speckit.tasks` コマンドでPhase 2以降の詳細タスクを生成
