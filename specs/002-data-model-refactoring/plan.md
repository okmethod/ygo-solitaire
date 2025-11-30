# Implementation Plan: データモデルのYGOPRODeck API互換化とレイヤー分離

**Branch**: `002-data-model-refactoring` | **Date**: 2025-11-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-data-model-refactoring/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

データモデルをYGOPRODeck API互換に整理し、Domain LayerとPresentation Layerのデータ責務を明確に分離する。Domain Layerは最小限のデータ（カードID, タイプ）のみを保持し、YGOPRODeck APIに依存せずテスト可能にする。Presentation Layerは表示用データをYGOPRODeck APIから動的取得する。テスト環境ではモック/キャッシュを活用してAPI負荷を最小化する。

## Technical Context

**Language/Version**: TypeScript 5.x (SvelteKit + Vite環境)
**Primary Dependencies**:
- SvelteKit (フロントエンドフレームワーク)
- Svelte 5 (UI - Runes使用)
- Immer.js (不変性保証 - ADR-0002)
- Vitest (Unit/Integration tests - 204 tests)
- Playwright (E2E tests - 16 tests)
- YGOPRODeck API (外部カードデータソース)

**Storage**: N/A (フロントエンドのみ、外部API依存)
**Testing**: Vitest (Unit/Integration) + Playwright (E2E)
**Target Platform**: Web (SPA - GitHub Pages静的ホスティング)
**Project Type**: Web (SvelteKit monorepo - frontend only)

**Performance Goals**:
- E2Eテスト実行時のYGOPRODeck APIリクエスト最小化（モック/キャッシュ使用）
- デッキロード時のバッチリクエスト活用（1リクエストで複数カード取得）

**Constraints**:
- YGOPRODeck API rate limiting配慮（無料公共サービス）
- Domain Layerの204 testsがネットワーク接続なしで実行可能
- 既存のデッキレシピ（RecipeCardEntry）の後方互換性維持

**Scale/Scope**:
- 既存コードベース: 204 unit tests + 16 E2E tests
- 対象: Domain Layer型定義とPresentation Layer統合
- 影響範囲: `domain/models/Card.ts`, `types/card.ts`, `api/ygoprodeck.ts`, UI components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Planning Principles

**I. 目的と手段の分離**
- ✅ **目的**: Domain Layerの独立性とYGOPRODeck API互換性を確保
- ✅ **手段**: データ型の分離とレイヤー境界の明確化

**II. 段階的な理解の深化**
- ✅ 仕様書で要求→要件→実装の段階を明確化
- ✅ 既存コード調査により、UIがカード表示を既に実装済みであることが判明
- ✅ Out of Scopeでスコープを明確化（UI改善は003で対応）

### ✅ Architecture Principles

**III. 最適解の選択と記録**
- ✅ 前回セッションでデータモデル分離方針を合意（ADR作成予定）
- ✅ 2段階アプローチ: 002=データモデル整理、003=UI改善（スコープ分割の根拠を記録）

**IV. 関心の分離（Separation of Concerns）**
- ✅ Domain Layer: カードID + タイプのみ（ゲームロジック）
- ✅ Presentation Layer: YGOPRODeck APIから表示データ取得（UI表示）
- ✅ 依存の方向: Presentation → Application → Domain（Clean Architecture準拠）

**V. 変更に対応できる設計**
- ✅ Domain LayerがYGOPRODeck APIに依存しない設計
- ✅ Presentation Layerの表示データ取得ロジックをカプセル化

### ✅ Coding Principles

**VI. 理解しやすさ最優先**
- ✅ 型名を明確化: `DomainCardData` vs `CardDisplayData`
- ✅ レイヤー境界が明確な命名規則

**VII. シンプルに問題を解決する**
- ✅ 既存のUIコンポーネントを最小限の修正で対応（過剰な抽象化を避ける）
- ✅ 既存の`getCardsByIds()`バッチAPIを活用（新規実装不要）

**VIII. テスト可能性を意識する**
- ✅ Domain Layerのユニットテストがネットワーク不要（FR-006）
- ✅ テスト環境でのモック/フィクスチャ導入（FR-009）

### ✅ Project-Specific Principles

**IX. 技術スタック**
- ✅ 既存のTypeScript + Svelte + TailwindCSSを維持
- ✅ 既存のClean Architecture実装（specs/001完了）に準拠

### ✅ Development Workflow

- ✅ ブランチ戦略: 専用ブランチ `002-data-model-refactoring` を作成済み
- ✅ コミット前の品質保証: lint/format/test実行を計画に含める

### 🟡 憲法違反の検証

**違反なし** - すべての原則に準拠しています。

## Project Structure

### Documentation (this feature)

```text
specs/002-data-model-refactoring/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── domain-types.ts  # Domain Layer型定義のコントラクト
└── checklists/
    └── requirements.md  # Specification quality checklist (completed)
```

### Source Code (repository root)

```text
# Web application structure (SvelteKit monorepo)
skeleton-app/
├── src/
│   ├── lib/
│   │   ├── domain/                    # Domain Layer (Pure TypeScript)
│   │   │   ├── models/
│   │   │   │   ├── Card.ts           # 🔄 Domain Layer card data (minimal)
│   │   │   │   ├── GameState.ts      # 🔄 Uses domain card data
│   │   │   │   └── Phase.ts
│   │   │   └── rules/
│   │   ├── application/               # Application Layer
│   │   │   ├── commands/              # Command Pattern
│   │   │   ├── stores/
│   │   │   └── facade/
│   │   ├── types/                     # Presentation Layer types
│   │   │   ├── card.ts                # 🔄 Presentation Layer card display data
│   │   │   └── deck.ts                # 🔄 Uses presentation types
│   │   ├── api/
│   │   │   └── ygoprodeck.ts          # 🔄 API integration + caching
│   │   ├── utils/
│   │   │   └── deckLoader.ts          # 🔄 Uses YGOPRODeck API
│   │   └── components/                # UI (Svelte 5)
│   │       ├── atoms/
│   │       │   ├── Card.svelte        # 🔄 Uses presentation types
│   │       │   └── CardDetailDisplay.svelte # 🔄 Uses presentation types
│   │       └── organisms/
│   └── routes/                        # SvelteKit pages
└── tests/
    ├── unit/                          # Domain Layer tests (204 tests)
    │   └── domain/                    # 🔄 Mock-based (no API)
    └── e2e/                           # E2E tests (16 tests)
        └── playwright/                # 🔄 Fixture/Cache-based (minimal API)

docs/
└── architecture/
    └── data-model-design.md           # ✨ NEW: Data model design documentation
```

**Structure Decision**:
既存のSvelteKit monorepoを維持。Clean Architecture（3層構造）に準拠し、Domain Layer（`domain/models/`）とPresentation Layer（`types/`, `components/`）の型定義を明確に分離する。

**変更対象ファイル** (🔄):
- `domain/models/Card.ts`: Domain Layer用最小限データ型に変更
- `types/card.ts`: Presentation Layer用表示データ型に特化
- `api/ygoprodeck.ts`: キャッシュ機能追加
- `utils/deckLoader.ts`: 新しい型定義に対応
- `components/atoms/*.svelte`: 新しいPresentation Layer型を使用
- Tests: モック/フィクスチャ導入

**新規作成ファイル** (✨):
- `docs/architecture/data-model-design.md`: データモデル設計方針の文書化

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**違反なし** - Complexity Trackingテーブルは不要です。

---

## Phase 0: Research & Technical Discovery

**Status**: ✅ 完了 (spec.md作成時に調査済み)

### 既に解決済みの技術的疑問

1. **既存のカード型定義の競合**
   - **調査結果**: `types/card.ts` と `domain/models/Card.ts` の2つの`CardData`型が存在
   - **決定**: Domain Layer用とPresentation Layer用に明確に分離

2. **カードIDの型の不統一**
   - **調査結果**: `types/card.ts`は`number`、`domain/models/Card.ts`は`string`
   - **決定**: YGOPRODeck API互換の`number`型に統一（FR-004）

3. **既存UIコンポーネントの状況**
   - **調査結果**: Card.svelte, CardDetailDisplay.svelteがカード表示を既に実装済み
   - **決定**: 最小限の修正で対応、UI改善は003で対応（Out of Scope）

4. **YGOPRODeck API統合**
   - **調査結果**: `api/ygoprodeck.ts`の`getCardsByIds()`が既に実装済み
   - **決定**: 既存のバッチAPI活用（NFR-001）

### 追加調査が必要な項目（Phase 0で対応）

#### 0. YGOPRODeck API実装の妥当性検証 ⭐ 優先

**疑問**: 既存のAPI統合コードにデータスキーマの誤りや最適ではない実装が含まれていないか？

**調査タスク**:
- YGOPRODeck API公式スキーマとの整合性確認
- 型定義の完全性（必須 vs オプショナルフィールド）検証
- エラーハンドリングの改善点洗い出し
- データ変換ロジック（`normalizeType`等）の正確性確認

**決定の基準**:
- API仕様との完全な整合性
- ランタイムエラーの防止
- デバッグ容易性

**実施方法**: 公式ドキュメント + 実APIレスポンス確認（curl）

#### 1. テストモック戦略

**疑問**: Vitestでのモック実装パターンとフィクスチャ管理方法

**調査タスク**:
- Vitestの`vi.mock()`を使用したAPI mock実装パターン
- テストフィクスチャの配置場所とロード方法
- E2EテストでのPlaywright intercept使用方法

**決定の基準**:
- テストの実行速度
- フィクスチャの保守性
- 既存テストへの影響最小化

#### 2. キャッシュ実装戦略

**疑問**: メモリキャッシュの実装方法とライフサイクル

**調査タスク**:
- SvelteKit環境でのシングルトンキャッシュ実装パターン
- キャッシュのライフサイクル（セッション単位 vs ページ単位）
- キャッシュクリア戦略

**決定の基準**:
- 実装のシンプルさ
- YGOPRODeck APIへのリクエスト削減効果
- メモリ使用量

#### 3. 型定義の移行パス

**疑問**: 既存コードの段階的移行方法

**調査タスク**:
- 2つの`CardData`型の共存期間中の命名規則
- 型エイリアスを使用した段階的移行パターン
- TypeScriptコンパイラエラーの対処方法

**決定の基準**:
- 移行中のコンパイルエラー最小化
- 既存テストの継続的なパス
- 最終的な型定義の明確さ

---

## Phase 1: Design & Contracts

**Prerequisites**: Phase 0 research.md完了後に実施

### 生成物

1. **data-model.md**: Domain Layer / Presentation Layer型定義の詳細設計
2. **contracts/domain-types.ts**: Domain Layer型定義のTypeScriptコントラクト
3. **quickstart.md**: 開発者向けクイックスタートガイド
4. **CLAUDE.md更新**: agent context更新スクリプト実行

---

## Next Steps

Phase 0の調査タスクを完了後、Phase 1のデザインドキュメント生成に進みます。

**実行コマンド**: `/speckit.tasks` でタスク分解を行い、実装フェーズに進む準備が整います。
