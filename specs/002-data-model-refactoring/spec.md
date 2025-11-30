# Feature Specification: データモデルのYGOPRODeck API互換化とレイヤー分離

**Feature Branch**: `002-data-model-refactoring`
**Created**: 2025-11-24
**Status**: Draft
**Input**: User description: "データモデルをYGOPRODeck API互換に整理し、Domain LayerとPresentation Layerのデータ責務を明確に分離する"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - ゲームロジックの保守性向上 (Priority: P1)

開発者がゲームロジック（Domain Layer）を修正する際、表示用データ（カード名、画像URL等）に依存せず、カードIDとカードタイプのみで実装できる。

**Why this priority**: Clean Architectureの核心原則であり、ゲームロジックの独立性とテスタビリティを保証する最重要要件。

**Independent Test**: Domain Layerのユニットテストが、YGOPRODeck APIへのネットワーク接続なしで完全に実行可能であることを確認。

**Acceptance Scenarios**:

1. **Given** Domain Layerのゲームロジック実装、**When** YGOPRODeck APIが停止している状態でユニットテストを実行、**Then** すべてのテストがパスする
2. **Given** カードの表示名やテキストが変更された、**When** Domain Layerのコードを確認、**Then** 変更が不要である
3. **Given** 新しいカード効果を実装する、**When** Domain Layerにコードを追加、**Then** カードIDとカードタイプのみで実装完了できる

---

### User Story 2 - UI表示データの柔軟性向上 (Priority: P2)

開発者がUI（Presentation Layer）でカード情報を表示する際、YGOPRODeck APIから最新のカード名・画像・テキストを動的に取得できる。

**Why this priority**: ユーザーに正確で最新のカード情報を提供し、保守コストを削減する。Domain Layerが確立された後に実装可能。

**Independent Test**: Presentation LayerのコンポーネントがYGOPRODeck APIから取得したデータを正しく表示することを、E2Eテストで確認。

**Acceptance Scenarios**:

1. **Given** カードIDが分かっている、**When** UIコンポーネントがカード表示を要求、**Then** YGOPRODeck APIからカード名・画像・テキストを取得して表示
2. **Given** YGOPRODeck APIでカード情報が更新された、**When** アプリケーションを再起動、**Then** 最新のカード情報が自動的に反映される
3. **Given** YGOPRODeck APIがエラーを返す、**When** UIがカード表示を試みる、**Then** フォールバック表示（カードIDのみ）を提供

---

### User Story 3 - YGOPRODeck API互換性の保証 (Priority: P1)

開発者がデッキレシピやゲーム状態でカードIDを扱う際、YGOPRODeck APIの数値ID（例: 33396948）をそのまま使用できる。

**Why this priority**: 外部APIとの互換性を保つことで、将来的なデータ移行や外部ツール連携を容易にする基盤要件。P1と並列で実装可能。

**Independent Test**: 既存のデッキレシピのカードIDが、YGOPRODeck APIで正しく解決できることを統合テストで確認。

**Acceptance Scenarios**:

1. **Given** デッキレシピに `id: 33396948` が含まれる、**When** YGOPRODeck APIに問い合わせ、**Then** "Exodia the Forbidden One" のデータが返る
2. **Given** Domain Layerで `cardId: number` を扱う、**When** Presentation Layerに渡す、**Then** 型変換なしで直接YGOPRODeck API呼び出しに使用可能
3. **Given** 外部ツールがYGOPRODeck形式のデッキデータを出力、**When** このアプリにインポート、**Then** 変換なしでそのまま使用可能

---

### User Story 4 - YGOPRODeck API負荷軽減 (Priority: P2)

開発者がテストを繰り返し実行する際、YGOPRODeck APIへの過剰なリクエストを防ぎ、外部サービスへの配慮とテスト実行速度の両立を実現できる。

**Why this priority**: 無料公共サービスへの配慮と、開発効率向上の両方を実現する。Domain/Presentation Layerの分離後に実装可能。

**Independent Test**: E2Eテストを10回連続実行した際、YGOPRODeck APIへの実リクエストが初回のみに限定されることを確認。

**Acceptance Scenarios**:

1. **Given** E2Eテストスイートが実行される、**When** 同じカードデータが複数回要求される、**Then** モックまたはキャッシュから取得され、実APIリクエストは1回のみ
2. **Given** 開発環境でアプリケーションをリロードする、**When** 同一セッション内で同じデッキを再度開く、**Then** メモリキャッシュからカードデータを取得し、APIリクエストなし
3. **Given** デッキレシピに20枚のカードが含まれる、**When** デッキをロードする、**Then** `getCardsByIds([id1, id2, ...])` で1回のバッチリクエストで全カード取得

---

### Edge Cases

- YGOPRODeck APIがダウンしている場合、Domain Layerは正常動作するが、Presentation Layerはフォールバック表示（カードID表示）を提供する
- カードIDが存在しないか無効な場合、Domain Layerでバリデーションエラーとして扱う
- Domain LayerのカードデータとYGOPRODeck APIのデータに矛盾がある場合（カードタイプが異なる等）、起動時に検証して警告を出す
- テスト実行（特にE2Eテスト）が繰り返し実施される場合、YGOPRODeck APIへの実リクエストではなく、モックまたはキャッシュされたデータを使用する
- 短時間に大量のカードデータを要求する場合、バッチリクエスト（複数IDをカンマ区切りで一度に取得）を活用してリクエスト数を最小化する

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Domain LayerのカードデータはカードID（YGOPRODeck互換の数値）とカードタイプ（"monster", "spell", "trap"）のみを保持しなければならない
- **FR-002**: Domain LayerのCardData型は、カード名・説明文・画像URL等の表示用データを含んではならない
- **FR-003**: Presentation LayerはカードIDを元にYGOPRODeck APIから表示用データ（名前、テキスト、画像）を取得しなければならない
- **FR-004**: カードIDの型は `number` 型でなければならず、YGOPRODeck APIのID形式と完全互換でなければならない
- **FR-005**: 既存のデッキレシピ（`RecipeCardEntry`）のカードIDは変更してはならない（後方互換性維持）
- **FR-006**: Domain Layerのユニットテストは、YGOPRODeck APIに依存せず実行可能でなければならない
- **FR-007**: Presentation Layerは、YGOPRODeck APIエラー時にフォールバック表示を提供しなければならない
- **FR-008**: `types/card.ts` と `domain/models/Card.ts` の2つのCardData型定義を統合・整理しなければならない
- **FR-009**: テスト実行時は、YGOPRODeck APIへの過剰なリクエストを防ぐ仕組みを導入しなければならない（モック、キャッシュ、またはフィクスチャの使用）
- **FR-010**: 本番環境では、同一カードデータへの重複リクエストを防ぐため、適切なキャッシュ戦略を実装しなければならない

### Key Entities

- **DomainCardData**: Domain Layer用の最小限カードデータ（id: number, type: "monster"|"spell"|"trap", frameType?: string）
- **CardDisplayData**: Presentation Layer用の表示データ（YGOPRODeck APIから取得：name, description, images, monster attributes等）
- **RecipeCardEntry**: デッキレシピ保存用（id: number, quantity: number, effectClass?: string）- 既存形式を維持
- **YGOProDeckCard**: YGOPRODeck API応答形式 - 既存の型定義を維持

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Domain Layerの全ユニットテスト（204 tests）が、ネットワーク接続なしで実行完了できる
- **SC-002**: Presentation Layerの全E2Eテスト（16 tests）が、YGOPRODeck APIから動的にデータ取得して正常動作する
- **SC-003**: 既存のデッキレシピが、変更なしで新しいデータモデルで読み込み可能である
- **SC-004**: Domain LayerのCardData型から、表示用プロパティ（name, description, images等）が完全に削除されている
- **SC-005**: docs/architecture/ に、データモデル設計方針とYGOPRODeck API統合パターンが文書化されている
- **SC-006**: E2Eテスト実行時、YGOPRODeck APIへの実リクエスト数が最小化されている（モック/キャッシュ使用）

## Assumptions

- YGOPRODeck APIは安定しており、カードIDの形式は変更されない
- カードの基本タイプ（monster/spell/trap）とframeType（fusion/synchro/xyz等）は、ゲームロジックに必要な最小限の情報である
- Domain Layerは、カードの効果テキストや名前を解析する必要がない（効果はCommand Patternで実装済み）
- 既存の204 testsは、主にDomain Layerのテストである
- 既存の16 E2E testsは、Presentation Layerとの統合をカバーしている
- **既存のUIコンポーネント**（Card.svelte, CardDetailDisplay.svelte）は、カード表示機能を既に実装しており、最小限の修正で新しいデータモデルに対応可能である
- **UI改善**（ローディング表示、エラー画面等）は今回のスコープ外とし、既存のシンプルな表示を維持する

## Dependencies

- YGOPRODeck API (https://db.ygoprodeck.com/api/v7) の可用性
- 既存のClean Architecture実装（specs/001-architecture-refactoring完了済み）
- 既存のCommand Pattern実装（ADR-0003）
- Immer.jsによる不変性保証（ADR-0002）

## Non-Functional Requirements

### Performance & API Usage

- **NFR-001**: YGOPRODeck APIへのリクエストは、既存の `getCardsByIds()` API（複数IDをカンマ区切りで一度に取得）を活用し、リクエスト数を最小化すること
- **NFR-002**: テスト環境（Unit/E2E）では、YGOPRODeck APIへの実リクエストを極力避け、モックデータまたはフィクスチャを使用すること
- **NFR-003**: 本番環境では、短時間（例：1セッション内）での同一カードへの重複リクエストを防ぐため、メモリキャッシュを実装すること

### API Rate Limiting Consideration

YGOPRODeck APIは無料の公共サービスであるため、以下の配慮を行うこと：

- **テスト実行**: モック/フィクスチャを優先使用し、実APIへの負荷を最小化
- **バッチ取得**: 既存の `getCardsByIds([id1, id2, ...])` を活用し、1リクエストで複数カード取得
- **開発時の配慮**: 頻繁なリロードやテスト実行が実APIを叩かないよう、開発環境でのキャッシュ戦略を考慮

## Out of Scope

- カード効果の実装変更（既存のCommand Patternを維持）
- 新しいカードの追加（データモデル整理のみ）
- YGOPRODeck API以外のデータソース対応
- 永続化キャッシュ（localStorage/IndexedDB）の実装（将来的な拡張として検討）
- オフラインモード対応（将来的な拡張として検討）
- **UI/UXの大幅な改善**（将来的な拡張: 003-ui-card-display で対応予定）
  - カード画像の動的ローディング表示
  - APIエラー時の専用エラー画面
  - カード情報取得中のスケルトンUI
  - 画像遅延読み込みの最適化
  - レスポンシブ画像対応
