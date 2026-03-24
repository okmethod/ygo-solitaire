# Implementation Plan: Domain Layer Test Improvement

**Branch**: `020-test-improvement` | **Date**: 2026-03-22 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/020-test-improvement/spec.md`

## Summary

ドメイン層のテストカバレッジを現状の22%から40%以上に向上させる。Vitestのカバレッジツールが既に設定済み（v8プロバイダ、80%閾値）であることを確認。Phase 2-4でGameState/GameProcessing層、Effect基盤クラス、Commands/Rules層の未テスト箇所にテストを追加する。

## Technical Context

**Language/Version**: TypeScript 5.0 (ES2022)
**Primary Dependencies**: SvelteKit 2, Vitest 3.2.4, Immer.js
**Storage**: N/A (フロントエンドのみ、状態はメモリ内)
**Testing**: Vitest 3.2.4 + @vitest/ui
**Target Platform**: Web Browser (SPA)
**Project Type**: Web Application (frontend only)
**Performance Goals**: N/A (テスト改善のため)
**Constraints**: カバレッジ閾値80%が既に設定済み（line/function/branch/statements）
**Scale/Scope**: ドメイン層約50ファイル、現在約29テストファイル

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Gate | Status | Notes |
|------|--------|-------|
| VIII. テスト可能性を意識する | PASS | テスト追加は憲法の原則に合致 |
| VI. 理解しやすさ最優先 | PASS | テストは仕様のドキュメントとして機能 |
| IV. 関心の分離 | PASS | ドメイン層のみを対象としUI非依存 |
| VII. シンプルに問題を解決する | PASS | 既存パターンに従いテストを追加 |
| ブランチ戦略 (NON-NEGOTIABLE) | PASS | 020-test-improvementブランチで作業中 |
| コミット前の品質保証 (NON-NEGOTIABLE) | PASS | テスト追加はこの原則を強化する |

**Constitution Check Result**: PASS - 全ゲートをクリア

## Project Structure

### Documentation (this feature)

```text
specs/020-test-improvement/
├── spec.md              # Feature specification
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0 output: Technical research findings
├── data-model.md        # Phase 1 output: Test structure and patterns
├── quickstart.md        # Phase 1 output: Quick reference for test implementation
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
skeleton-app/
├── src/lib/domain/           # テスト対象のドメイン層
│   ├── models/
│   │   ├── GameState/        # Phase 2対象: GameSnapshot, ActivationContext
│   │   └── GameProcessing/   # Phase 2対象: GameEvent, EventTimeline, UpdateValidation
│   ├── effects/
│   │   ├── actions/
│   │   │   ├── ignitions/    # Phase 3対象: BaseIgnitionEffect
│   │   │   └── triggers/     # Phase 3対象: BaseTriggerEffect
│   │   └── rules/
│   │       └── continuouses/ # Phase 3対象: BaseContinuousEffect
│   ├── commands/             # Phase 4対象: SynchroSummonCommand
│   └── rules/                # Phase 4対象: SynchroSummonRule, ActivationRule
│
├── tests/
│   ├── unit/domain/          # ユニットテスト配置先
│   │   ├── models/           # 既存: 5ファイル
│   │   ├── commands/         # 既存: 5ファイル（SynchroSummonCommand欠落）
│   │   ├── effects/          # 既存: base/4ファイル, registries/2ファイル
│   │   ├── rules/            # 既存: SummonRule.test.ts のみ
│   │   └── dsl/              # 既存: 9ファイル
│   └── __testUtils__/        # テストヘルパー（gameStateFactory.ts等）
│
└── vitest.config.ts          # カバレッジ設定済み（v8, 80%閾値）
```

**Structure Decision**: 既存の `tests/unit/domain/` 構造に準拠。テストファイルはソース構造をミラーリング。

## Phase 0: Research Findings

### FR-001〜FR-004: カバレッジツール導入状況

**Status**: 既に設定済み

調査結果:
- `vitest.config.ts` に v8 プロバイダでカバレッジ設定済み
- `npm run test:coverage` コマンド定義済み
- 出力形式: text, html, json-summary
- 対象: `src/lib/domain/**/*.ts`
- 閾値: lines/functions/branches/statements 全て80%

**必要な追加作業**:
- `.gitignore` に `/coverage/` ディレクトリを追加（現在未設定の場合）

### FR-005〜FR-009: GameState/GameProcessing層テスト

**現状調査**:
- `GameSnapshot.ts`: createInitialGameSnapshot, updatedActivatedCardIds の2関数
- `ActivationContext.ts`: 8つの純粋関数（set/get/clear系）
- `GameEvent.ts`: インターフェース定義のみ（テスト不要）
- `EventTimeline.ts`: 7つの純粋関数
- `UpdateValidation.ts`: 2つのファクトリ関数 + エラーメッセージ取得関数

**既存テスト**: `GameState.test.ts` でGameSnapshot作成・不変性のみテスト済み。ActivationContext/EventTimeline/UpdateValidationはテスト未存在。

### FR-010〜FR-012: Effect基盤クラステスト

**現状調査**:
- `BaseIgnitionEffect.ts`: 抽象クラス、Template Methodパターン
- `BaseTriggerEffect.ts`: 抽象クラス、Template Methodパターン + 型ガード関数
- `BaseContinuousEffect.ts`: 抽象クラス、Template Methodパターン

**テスト戦略**: 具象サブクラスを作成してTemplate Methodの動作を検証（BaseSpellActivation.test.tsパターンに準拠）

### FR-013〜FR-015: Commands/Rules層補完

**現状調査**:
- `SynchroSummonCommand.ts`: canExecute/execute メソッド、SynchroSummonRuleに委譲
- `SynchroSummonRule.ts`: canSynchroSummon, performSynchroSummon + 内部ヘルパー関数群
- `ActivationRule.ts`: placeCardForActivation 関数1つ

**既存テスト**: commands/に5ファイル存在（AdvancePhase, ActivateSpell, NormalSummon, SetSpellTrap, ActivateIgnitionEffect）。rules/にはSummonRule.test.tsのみ。

## Phase 1: Design & Contracts

### テストファイル構造

```text
tests/unit/domain/
├── models/
│   ├── GameState.test.ts           # 既存（拡張不要）
│   ├── ActivationContext.test.ts   # 新規作成
│   ├── EventTimeline.test.ts       # 新規作成
│   └── UpdateValidation.test.ts    # 新規作成
├── effects/
│   ├── base/
│   │   ├── BaseSpellActivation.test.ts    # 既存
│   │   ├── NormalSpellActivation.test.ts  # 既存
│   │   ├── QuickPlaySpellActivation.test.ts # 既存
│   │   ├── FieldSpellActivation.test.ts   # 既存
│   │   ├── BaseIgnitionEffect.test.ts     # 新規作成
│   │   ├── BaseTriggerEffect.test.ts      # 新規作成
│   │   └── BaseContinuousEffect.test.ts   # 新規作成
│   └── registries/                        # 既存
├── commands/
│   ├── (既存5ファイル)
│   └── SynchroSummonCommand.test.ts       # 新規作成
└── rules/
    ├── SummonRule.test.ts                 # 既存
    ├── SynchroSummonRule.test.ts          # 新規作成
    └── ActivationRule.test.ts             # 新規作成
```

### テストパターン規約

既存テストから抽出したパターン:

1. **純粋関数テスト** (ActivationContext, EventTimeline, UpdateValidation向け)
   - Arrange-Act-Assert パターン
   - 入力と出力の検証
   - 不変性の検証

2. **抽象クラステスト** (BaseIgnitionEffect, BaseTriggerEffect, BaseContinuousEffect向け)
   - 具象テストクラスを作成
   - Template Methodパターンの検証
   - ChainableAction/AdditionalRuleインターフェースプロパティ検証

3. **Commandテスト** (SynchroSummonCommand向け)
   - canExecute: 各種条件のtrue/false検証
   - execute: 状態更新と戻り値検証
   - gameStateFactoryヘルパー活用

4. **Ruleテスト** (SynchroSummonRule, ActivationRule向け)
   - ルール判定ロジックの検証
   - エッジケース（素材不足、不正なカード等）

## Complexity Tracking

特に複雑性の違反はなし。全ての作業は既存パターンに従う。

## Critical Files for Implementation

1. **vitest.config.ts** - カバレッジ設定確認・必要に応じて調整（.gitignore追加のみ必要）
2. **tests/__testUtils__/gameStateFactory.ts** - テストヘルパー。シンクロ素材用モンスターファクトリ関数の追加が必要
3. **src/lib/domain/models/GameState/ActivationContext.ts** - Phase 2テスト対象。8つの純粋関数のテスト作成
4. **src/lib/domain/effects/actions/ignitions/BaseIgnitionEffect.ts** - Phase 3テスト対象。抽象クラスのTemplate Methodテスト
5. **src/lib/domain/rules/SynchroSummonRule.ts** - Phase 4テスト対象。シンクロ召喚ロジックの複雑なテスト
