# Implementation Plan: Effect Activation UI with Card Illustrations

**Branch**: `003-effect-activation-ui` | **Date**: 2025-11-30 | **Spec**: [spec.md](./spec.md)

## Summary

V2シミュレーターにDuelFieldコンポーネントを統合し、カードイラスト表示と効果発動UIを実装する。現在、V2シミュレーターはGameStateと連携してコマンドを実行できるが、カードをIDのみで表示している。既存のDuelFieldコンポーネントはカードイラストを表示できるが、GameStateと接続されていない。

**技術アプローチ**:
1. CardInstance（Domain Layer）からCardDisplayData（Presentation Layer）へのマッピングストアを作成
2. DuelFieldコンポーネントをGameStateとGameFacadeに接続
3. V2シミュレーターページにDuelFieldを統合し、既存のカードID表示を置き換え

## Technical Context

**Language/Version**: TypeScript 5.x (SvelteKit環境)
**Primary Dependencies**:
- Svelte 5.0 (ルーン: `$state`, `$derived`, `$effect`)
- SvelteKit 2.16
- Skeleton UI 3.1.3
- Immer.js 11.0 (不変状態管理)
- YGOPRODeck API v7 (カードデータ取得)

**Storage**: メモリキャッシュ（セッション単位、YGOPRODeck APIレスポンス）
**Testing**: Vitest 3.2.4 (ユニット) + Playwright 1.56.1 (E2E)
**Target Platform**: Web (SPA, GitHub Pages デプロイ)
**Project Type**: Web (フロントエンドのみ)
**Performance Goals**:
- カードイラスト表示レスポンス: 1秒以内
- 40枚同時表示でフレームレート: 30fps以上維持
- YGOPRODeck APIバッチ取得: 最大20カード/リクエスト

**Constraints**:
- YGOPRODeck API Rate Limit (20 req/sec)
- メモリキャッシュのみ（永続化なし）
- オフライン動作不可（API依存）

**Scale/Scope**:
- 同時表示最大カード数: 40枚 (手札5 + フィールド11 + 墓地など)
- ユーザーストーリー: 3つ (P1-P3優先度付き)
- 影響コンポーネント数: 約5ファイル

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Planning Principles

✅ **I. 目的と手段の分離**
- 目的: ユーザーが視覚的にカードを識別し、効果を発動できる
- 手段: DuelFieldコンポーネント統合、CardDisplayDataマッピング
- 判断: 既存コンポーネントを再利用し、新規実装は最小限（適切）

✅ **II. 段階的な理解の深化**
- Phase 0で技術調査により既存実装を理解
- Phase 1でデータモデルとコントラクトを明確化
- 優先度P1→P2→P3で段階的に実装可能（適切）

### Architecture Principles

✅ **III. 最適解の選択と記録**
- 既存の3層アーキテクチャを維持
- DuelFieldとCard.svelteの再利用を選択（新規作成より効率的）
- トレードオフ: 既存コンポーネントのAPI制約を受け入れる
- 判断根拠: 本planにて記録

✅ **IV. 関心の分離**
- Domain Layer (CardInstance) ← 変更なし
- Application Layer (新cardDisplayStore) ← 変換ロジック追加
- Presentation Layer (DuelField統合) ← UI更新のみ
- 依存方向: UI → Application → Domain（適切）

✅ **V. 変更に対応できる設計**
- cardDisplayStoreは独立したストア（他の機能に影響なし）
- DuelFieldのpropsは既存インターフェース維持
- 段階的実装: P1/P2/P3が独立（適切）

### Coding Principles

✅ **VI. 理解しやすさ最優先**
- CardInstance → CardDisplayDataの変換は明示的な関数で実装
- derivedストアで自動更新ロジックを分離
- コメントで「なぜこの変換が必要か」を説明

✅ **VII. シンプルに問題を解決する**
- YAGNI原則: カード詳細モーダル（P3）は後回し
- 既存コンポーネント再利用（新規作成しない）
- 抽象化は必要最小限（1つのマッピングストアのみ）

✅ **VIII. テスト可能性を意識する**
- cardDisplayStore単体でテスト可能（UIなし）
- 変換ロジックは純粋関数として実装
- ストアのテストはVitest, UIはPlaywrightで分離

### Project-Specific Principles

✅ **IX. 技術スタック**
- TypeScript + Svelte 5 + TailwindCSS（既存と一致）
- 新規依存追加なし（既存のImmer.js, Skeleton UI活用）

### Development Workflow

✅ **ブランチ戦略**:
- ブランチ `003-effect-activation-ui` で作業中
- mainへの直接コミット禁止（遵守）
- PR作成・レビュー後マージ（計画済み）

✅ **コミット前品質保証**:
- 動作確認: 各ユーザーストーリー完了時にテスト
- Linter実行: `npm run lint` + `npm run format`
- テスト実行: `npm run test:run` でエラーゼロ確認

### Testing Strategy

✅ **テストレベル**:
- 単体テスト: cardDisplayStoreの変換ロジック
- 統合テスト: DuelField + GameState連携
- E2Eテスト: シミュレーターページでカード表示・効果発動

**合格判定**: すべての原則に準拠。憲法違反なし。

## Project Structure

### Documentation (this feature)

```text
specs/003-effect-activation-ui/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (Svelte component contracts)
└── tasks.md             # Phase 2 output (NOT created by this command)
```

### Source Code (repository root)

```text
skeleton-app/
├── src/
│   ├── lib/
│   │   ├── domain/
│   │   │   └── models/
│   │   │       ├── Card.ts              # CardInstance (既存)
│   │   │       └── GameState.ts         # GameState (既存)
│   │   ├── application/
│   │   │   ├── stores/
│   │   │   │   ├── gameStateStore.ts    # 既存
│   │   │   │   ├── derivedStores.ts     # 既存
│   │   │   │   └── cardDisplayStore.ts  # 新規 - CardInstance→CardDisplayDataマッピング
│   │   │   └── GameFacade.ts            # 既存 - 変更なし
│   │   ├── api/
│   │   │   └── ygoprodeck.ts            # 既存 - getCardsByIds()使用
│   │   ├── types/
│   │   │   ├── card.ts                  # CardDisplayData (既存)
│   │   │   └── ygoprodeck.ts            # 変換関数 (既存)
│   │   └── components/
│   │       ├── atoms/
│   │       │   └── Card.svelte          # 既存 - 変更なし
│   │       └── organisms/
│   │           └── board/
│   │               ├── DuelField.svelte # 既存 - propsインターフェース変更
│   │               ├── Graveyard.svelte # 既存
│   │               ├── ExtraDeck.svelte # 既存
│   │               └── MainDeck.svelte  # 既存
│   └── routes/
│       └── (auth)/
│           └── simulator/
│               └── [deckId]/
│                   └── +page.svelte     # V2シミュレーター - DuelField統合
└── tests/
    ├── unit/
    │   └── cardDisplayStore.test.ts     # 新規 - ストアテスト
    └── e2e/
        └── effect-activation-ui.test.ts # 新規 - E2Eテスト
```

**Structure Decision**:
既存のSvelteKitプロジェクト構造を維持。`skeleton-app/src/lib/`がメインのソースディレクトリで、3層アーキテクチャ（domain/application/presentation）に分離されている。新規追加は`cardDisplayStore.ts`のみで、他は既存コンポーネントの統合・修正となる。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

本機能には憲法違反なし。この表は使用しない。
