# Implementation Plan: Domain Layer Refactoring

**Branch**: `007-domain-refactor` | **Date**: 2025-12-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-domain-refactor/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

ドメインドキュメント（docs/domain/）の刷新に伴い、コードベースを見直してClean Architectureに準拠させる。主要な変更は以下の3つ:

1. **型命名の統一**: `DomainCardData` → `CardData`等、ドキュメントとコードの命名を一致させる
2. **Immer依存の削除**: Commands のspread構文への置き換え、package.jsonから依存削除
3. **ゲーム操作のDomain層移管**: `application/commands/` → `domain/commands/`、`application/effects/CardEffectRegistry` → `domain/effects/`

効果システム（CardEffect、EffectResolutionStep）は次のSpecに延期。

## Technical Context

**Language/Version**: TypeScript (ES2022)
**Primary Dependencies**: Svelte 5 (Runes mode), SvelteKit 2, TailwindCSS, Skeleton UI
**Storage**: なし（フロントエンドのみ、状態はメモリ内）
**Testing**: Vitest + Testing Library (@testing-library/svelte), Playwright (E2E)
**Target Platform**: ブラウザ（Chromium-based, Firefox, Safari）
**Project Type**: Single Page Application (SPA)
**Performance Goals**:
- State updates: <16ms (60fps維持)
- Initial load: <2秒（開発ビルド）
- Test suite: <30秒（全テスト）

**Constraints**:
- Svelte 5 Runes API使用（$state, $derived, $effect）
- Domain層はSvelte/UI依存禁止
- すべての状態更新は不変性を保持
- 既存のテストは100%パスを維持

**Scale/Scope**:
- 既存ファイル数: ~50ファイル（domain/application層）
- 影響を受けるファイル: ~30ファイル（型名変更、import更新）
- 移動対象: 6ファイル（Commands × 5 + CardEffectRegistry × 1）

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### ✅ Planning Principles

- **I. 目的と手段の分離**:
  - 目的: ドキュメントとコードの一貫性向上、Clean Architectureへの準拠
  - 手段: 型名変更、ファイル移動、依存削除
  - 判断: 目的が明確で、手段は最小限

- **II. 段階的な理解の深化**:
  - Phase 1 (型名変更) → Phase 2 (Immer削除) → Phase 3 (ファイル移動)
  - 各フェーズで影響範囲を確認しながら進める
  - 効果システムは次のSpecに延期（複雑性の分離）

### ✅ Architecture Principles

- **III. 最適解の選択と記録**:
  - ADR0007を作成し、設計判断を記録
  - トレードオフ: 効果システムの現状維持 vs 完全な再設計
  - 選択: 現状維持（次のSpecで扱う）

- **IV. 関心の分離**:
  - Commands をDomain層に移管（ドメインロジックの集約）
  - GameFacade はApplication層に残す（UI-Domain ブリッジ）
  - 依存の方向: UI → Application (GameFacade) → Domain (Commands)

- **V. 変更に対応できる設計**:
  - 既存のテストが回帰検出の役割を果たす
  - 段階的なリファクタリングで、各ステップで動作確認

### ✅ Coding Principles

- **VI. 理解しやすさ最優先**:
  - 型名をドキュメントに一致させることで、理解しやすさ向上
  - import文の整理で、依存関係が明確に

- **VII. シンプルに問題を解決する**:
  - Immer削除: 既にspread構文で実装されているZone.tsに倣う
  - 過剰な抽象化なし、必要最小限の変更のみ

- **VIII. テスト可能性を意識する**:
  - Commands のDomain層移管により、UI依存なしでテスト可能
  - 既存テストを維持しながらリファクタリング

### ✅ Development Workflow

- **ブランチ戦略**: `007-domain-refactor` ブランチで作業
- **コミット前の品質保証**: 各フェーズでlint/format/test実行
- **PR作成**: 変更理由、設計判断、テスト方法を記載

### 評価結果

すべてのConstitution原則に準拠。違反なし。

## Project Structure

### Documentation (this feature)

```text
specs/007-domain-refactor/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output: リファクタリングパターンの調査
├── data-model.md        # Phase 1 output: 型定義の整理
├── quickstart.md        # Phase 1 output: リファクタリング手順
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

既存の構造をClean Architectureに準拠するよう再編成:

```text
skeleton-app/src/lib/
├── domain/                           # Domain Layer（ドメインロジック）
│   ├── models/                       # ドメインモデル
│   │   ├── Card.ts                  # CardData (旧 DomainCardData)
│   │   ├── GameState.ts             # ゲーム状態
│   │   ├── Zone.ts                  # ゾーン管理（純粋関数）
│   │   └── constants.ts             # 定数定義
│   ├── commands/                     # ゲーム操作（移動先）
│   │   ├── GameCommand.ts           # Command インターフェース
│   │   ├── DrawCardCommand.ts       # [移動] from application/
│   │   ├── DiscardCardsCommand.ts   # [移動] from application/
│   │   ├── ActivateSpellCommand.ts  # [移動] from application/
│   │   ├── AdvancePhaseCommand.ts   # [移動] from application/
│   │   └── ShuffleDeckCommand.ts    # [移動] from application/
│   ├── effects/                      # カード効果
│   │   ├── CardEffect.ts            # Effect インターフェース
│   │   ├── CardEffectRegistry.ts    # [移動] from application/
│   │   ├── EffectResolutionStep.ts
│   │   └── cards/                   # 個別カード効果
│   ├── rules/                        # ドメインルール
│   │   ├── VictoryRule.ts
│   │   └── SpellActivationRule.ts
│   └── data/                         # ドメインデータ
│       └── cardDatabase.ts
│
├── application/                      # Application Layer（ユースケース）
│   ├── GameFacade.ts                # UI-Domain ブリッジ（維持）
│   ├── stores/                       # Svelte stores
│   ├── effects/                      # [削除予定] CardEffectRegistry移動後
│   ├── types/                        # Application DTO
│   │   └── card.ts                  # CardDisplayData
│   └── ports/                        # Port（抽象インターフェース）
│       └── ICardDataRepository.ts
│
├── infrastructure/                   # Infrastructure Layer（外部I/F）
│   └── adapters/
│       └── YGOProDeckAdapter.ts
│
└── presentation/                     # Presentation Layer（UI）
    ├── components/
    └── pages/

tests/
├── unit/
│   ├── domain/                       # [移動] application/commands → domain/commands
│   │   ├── commands/                # Command テスト
│   │   ├── effects/                 # Effect テスト
│   │   └── rules/                   # Rule テスト
│   └── application/
└── e2e/
```

**Structure Decision**:

このプロジェクトはSingle Page Application（SPA）構成。Clean Architectureの4層構造（Domain, Application, Infrastructure, Presentation）を採用している。

リファクタリングにより、Commands を `application/commands/` から `domain/commands/` に移動し、ドメインロジックをDomain層に集約する。GameFacadeはApplication層に残し、UI（Svelte store）とDomain層の橋渡しを担う。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

該当なし。すべての変更はConstitution原則に準拠している。

効果システム（EffectResolutionStepのSvelte store依存）は次のSpecに延期することで、複雑性を管理している。
