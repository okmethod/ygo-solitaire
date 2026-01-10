# Feature Specification: コードベース品質改善

**Feature Branch**: `015-code-quality-improvement`
**Created**: 2026-01-10
**Status**: Draft
**Input**: User description: "品質チェックで発見された問題（アーキテクチャ違反、冗長性、テスト重複、コメント不足）を段階的に改善する"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - アーキテクチャ境界の修正と再発防止策 (Priority: P1)

開発者として、Presentation Layer が Domain Layer に直接依存している問題を修正し、Clean Architecture の設計原則に準拠したコードベースを維持したい。さらに、ドキュメントに明記しているにも関わらずたびたび発生する依存方向の違反を、低コストで再発防止したい。これにより、レイヤー間の責務が明確になり、テスト性と保守性が向上する。

**Why this priority**: アーキテクチャ違反は設計の一貫性を損ない、将来の変更コストを増大させる。最も重要な構造的問題であり、他の改善の基盤となる。また、ドキュメントだけでは再発防止できないため、コード内での簡潔なガイド追加が必要。

**Independent Test**: DuelField.svelte と Hands.svelte から Domain Layer の import を削除し、GameFacade を経由してカード発動可能性チェックができることを確認する。Application Layer のユニットテストで GameFacade の新メソッドが正しく動作することを検証する。各レイヤーのハブファイルにアーキテクチャルールの簡潔なコメントが追加されていることを確認する。

**Acceptance Scenarios**:

1. **Given** DuelField.svelte に ActivateSpellCommand 等の Domain import が存在する状態で、**When** GameFacade に canActivateSetSpell()等のメソッドを追加し、Presentation Layer から Domain import を削除する、**Then** アプリケーションが正常に動作し、カード発動可能性チェックが GameFacade 経由で実行される
2. **Given** CardSelectionModal.svelte が YGOProDeckRepository を直接インスタンス化している状態で、**When** Application Layer 経由でカードデータを取得するように修正する、**Then** Infrastructure Layer への直接依存がなくなり、Port/Adapter Pattern が正しく機能する
3. **Given** 修正後のコードベースで、**When** 全てのレイヤー間の依存関係を検証する、**Then** Presentation → Application → Domain の依存方向が正しく保たれている
4. **Given** レイヤー境界のハブファイル（GameFacade.ts、各層の index.ts 等）で、**When** import 文付近に依存ルールを 1 行コメントで追加する、**Then** 新規開発時にコードを見るだけでアーキテクチャルールが把握でき、違反を未然に防げる

---

### User Story 2 - 冗長コードのリファクタリング（TerraformingActivation のみ） (Priority: P2)

開発者として、基底クラスを活用せず冗長に実装されている TerraformingActivation.ts をリファクタリングし、保守性を向上させたい。これにより、コード行数を大幅に削減し、変更時の影響範囲を最小化できる。

**Why this priority**: 冗長なコードは保守コストを増大させ、バグの温床となる。P1 のアーキテクチャ修正後に実施することで、安定した基盤の上でリファクタリングできる。

**ChickenGameIgnitionEffect について（スコープ外）**: ChickenGameIgnitionEffect.ts の冗長性は、① 起動効果の実装例が少ないこと、②ChainableActionRegistry が 1ID につき 1 つの効果しか登録できない設計に由来する。フィールド魔法や永続魔法では「カードの発動」「起動効果の発動」を複数登録する必要があり、Registry 設計の見直しが先決のため、本 spec ではスコープ外とする。

**Independent Test**: TerraformingActivation.ts を NormalSpellAction で書き直し、既存のテストが全てパスすることを確認する。統合テストで Terraforming カードの発動が正常に動作することを検証する。

**Acceptance Scenarios**:

1. **Given** TerraformingActivation.ts が 197 行で基底クラスを使用していない状態で、**When** NormalSpellAction を継承する形式に書き直す、**Then** コード行数が約 50 行に削減され、全テストがパスする
2. **Given** リファクタリング後のコードで、**When** カード効果の動作を統合テストで検証する、**Then** Terraforming の効果が正しく発動し、ゲームロジックが保たれている
3. **Given** 基底クラス活用後のコードで、**When** 他の通常魔法カードと比較する、**Then** 実装パターンが統一され、新規カード追加時の参考例として適切である

---

### User Story 3 - Repository 管理の最適化 (Priority: P2)

開発者として、複数箇所で Repository が個別にインスタンス化されている問題を修正し、キャッシュ機能を効果的に活用したい。これにより、API 呼び出しの重複を防ぎ、パフォーマンスを向上させる。

**Why this priority**: キャッシュ効率の低下はパフォーマンスに影響するが、機能的な問題ではない。P1、P2 の改善後に実施することで、アーキテクチャが整理された状態で最適化できる。

**Independent Test**: Repository Singleton Pattern またはファクトリーパターンを導入し、cardDisplayStore.ts と deckLoader.ts で同一の Repository インスタンスが使用されることを確認する。キャッシュヒット率をテストで検証する。

**Acceptance Scenarios**:

1. **Given** cardDisplayStore.ts と deckLoader.ts が個別に YGOProDeckCardRepository をインスタンス化している状態で、**When** Singleton Pattern または Factory Pattern を導入する、**Then** 同一の Repository インスタンスが共有され、キャッシュが正しく機能する
2. **Given** Repository 統一後のコードで、**When** 同一カード ID への複数回のアクセスが発生する、**Then** 2 回目以降はキャッシュから取得され、API 呼び出しが削減される
3. **Given** 統一された Repository 管理で、**When** アプリケーションを起動してデッキをロードする、**Then** カード画像の読み込みが高速化され、重複した API リクエストが発生しない

---

### User Story 4 - テストの重複削減と再発防止策 (Priority: P3)

開発者として、Base Class テストと Subclass テストで重複しているテストケース（フェーズチェック等）を削減し、テスト実行時間と保守コストを削減したい。さらに、ドキュメント（architecture/testing-strategy.md）に明記しているにも関わらずたびたび実装されてしまう「実装の裏返しテスト」等の意味の薄いテストを、低コストで再発防止したい。

**Why this priority**: テストの重複は保守コストを増やすが、機能やアーキテクチャには影響しない。他の改善後に実施することで、コードベースが整理された状態でテストを最適化できる。また、US1 同様、ドキュメントだけでは再発防止できないため、テストファイル内での簡潔なガイド追加が必要。

**Independent Test**: NormalSpellAction.test.ts、QuickPlaySpellAction.test.ts、FieldSpellAction.test.ts から共通フェーズチェックテストを削除し、BaseSpellAction.test.ts に集約する。全テストスイートを実行して、カバレッジが維持されることを確認する。テスト戦略をまとめたコメントがテストファイルに追加されていることを確認する。

**Acceptance Scenarios**:

1. **Given** 各 Subclass（NormalSpellAction 等）でフェーズチェックテストが重複している状態で、**When** 共通テストを BaseSpellAction.test.ts に集約し、Subclass では追加条件のみテストする、**Then** テストケース数が 20-30 削減され、テスト実行時間が短縮される
2. **Given** Card.test.ts で型ガード関数に 25 個のテストがある状態で、**When** 実装の裏返しテストを削除し、重要なケースのみに絞る、**Then** テストケース数が 8-10 に削減され、保守性が向上する
3. **Given** テスト削減後のテストスイートで、**When** カバレッジレポートを確認する、**Then** Domain Layer のカバレッジが 80%以上を維持している
4. **Given** 代表的なテストファイル（BaseSpellAction.test.ts 等）で、**When** ファイル冒頭にテスト戦略のコメント（「Base Class で共通ルールをテスト、Subclass は追加条件のみ」等）を追加する、**Then** 新規テスト追加時にコメントを見るだけで適切なテスト範囲が把握でき、重複や裏返しテストを未然に防げる

---

### User Story 5 - コメント品質の向上（厳選された改善） (Priority: P3)

開発者として、既存のコメントを適切に日本語化し、複雑または長い処理でコメントが不足している箇所を補いたい。ただし、コアでないユーティリティへの過剰なコメント追加や、自明なコードへのコメント追加は避け、ファイルサイズと保守コストのバランスを保ちたい。

**Why this priority**: コメント不足は理解を妨げるが、機能には影響しない。他の改善後に実施することで、整理されたコードに対して適切なドキュメントを追加できる。過剰なコメントはノイズとなるため、「書き換え」と「追記」のバランスが重要。

**スコープ外とする対象**: audio.ts、melody.ts、transitions.ts、request.ts は複雑なことをしておらず、アプリケーションのコアでもないため対応不要。

**Independent Test**: deckLoader.ts と stepBuilders.ts の複雑なロジックに日本語コメントを追加し、コードレビューで理解しやすさが向上したことを確認する。既存の英文コメントで日本語化が適切な箇所が変換されていることを確認する。

**Acceptance Scenarios**:

1. **Given** deckLoader.ts（calculateDeckStats 等）と stepBuilders.ts（createDrawStep 等）の複雑なロジックに説明がない状態で、**When** 処理ステップの目的を日本語で簡潔に説明するコメントを追加する、**Then** 新規開発者がコードを読んで意図を理解できる
2. **Given** 既存の英文コメントのうち docstring 以外の説明的コメントが存在する状態で、**When** 慣習的に英語が適切な部分（docstring 等）を除き日本語に書き換える、**Then** コメントの言語使用が統一され、理解しやすくなる
3. **Given** GameState.ts に複数の TODO コメントが残っている状態で、**When** TODO を実装予定か継続検討かを明確化する、**Then** 将来の作業計画が明確になる
4. **Given** コメント追加・修正後のコードで、**When** 自明な処理（変数代入、単純な型変換等）を確認する、**Then** これらには新規コメントが追加されておらず、ファイルサイズが必要以上に増加していない

---

### User Story 6 - Application Layer の細かな改善 (Priority: P3)

開発者として、effectResolutionStore.ts の独自 get()実装を Svelte の標準 getStoreValue に統一し、cardDisplayStore.ts の Race Condition 対策を全 derived store に適用したい。

**Why this priority**: これらは局所的な改善であり、影響範囲が限定的。他の改善後に実施することで、安定したコードベース上で細部を最適化できる。

**Independent Test**: effectResolutionStore.ts の get() helper を削除し、全箇所で getStoreValue を使用することを確認する。cardDisplayStore.ts の handCards、graveyardCards、banishedCards に isCancelled フラグを追加し、Race Condition が発生しないことをテストで検証する。

**Acceptance Scenarios**:

1. **Given** effectResolutionStore.ts で独自の get()関数が実装されている状態で、**When** 全箇所を Svelte の getStoreValue に置き換える、**Then** 型安全性が向上し、non-null assertion が不要になる
2. **Given** cardDisplayStore.ts の fieldCards でのみ Race Condition 対策がある状態で、**When** handCards、graveyardCards、banishedCards にも同様の isCancelled フラグを追加する、**Then** 複数の非同期呼び出しが競合しても正しいデータが表示される
3. **Given** Application Layer の改善後のコードで、**When** 統合テストを実行する、**Then** Store の動作が安定し、全テストがパスする

---

### Edge Cases

- **アーキテクチャ修正時**: GameFacade に新メソッドを追加した際、既存の呼び出し箇所が全て更新されなかった場合、コンパイルエラーまたはランタイムエラーが発生する可能性がある
- **リファクタリング時**: 基底クラスを変更した際、継承クラスの動作が変わる可能性があるため、全統合テストを実行して確認が必要
- **Repository 統一時**: Singleton Pattern と Factory Pattern のどちらを採用するか、テストでのモック注入のしやすさを考慮して決定する必要がある
- **テスト削減時**: 重複テストを削除した際、重要なエッジケースが失われていないか、カバレッジレポートで確認が必要
- **コメント追加時**: 日本語コメントと docstring の使い分け（ユーティリティ的なインターフェースは英語、理解を助ける説明は日本語）を一貫させる必要がある

## Requirements _(mandatory)_

### Functional Requirements

#### アーキテクチャ改善

- **FR-001**: GameFacade に以下のメソッドを追加し、Presentation Layer が Domain Command を直接使用しないようにする
  - canActivateSetSpell(instanceId: string): boolean
  - canActivateIgnitionEffect(instanceId: string): boolean
  - canSummonMonster(instanceId: string): boolean
  - canSetMonster(instanceId: string): boolean
  - canSetSpellTrap(instanceId: string): boolean
- **FR-002**: DuelField.svelte と Hands.svelte から Domain Layer（ActivateSpellCommand 等）の import を削除する
- **FR-003**: CardSelectionModal.svelte から Infrastructure Layer（YGOProDeckCardRepository）の直接インスタンス化を削除し、Application Layer 経由でデータを取得する
- **FR-004**: レイヤー境界のハブファイル（GameFacade.ts、各層の index.ts 等）の import 文付近に、依存方向ルールを 1 行コメントで追加する（例: `// ARCH: Presentation → Application → Domain の依存方向を守る`）

#### コード冗長性の削減

- **FR-005**: TerraformingActivation.ts を NormalSpellAction を継承する形式に書き直し、行数を 197 行から約 50 行に削減する
- （ChickenGameIgnitionEffect.ts は Registry 設計の見直しが先決のため、スコープ外とする）

#### Repository 管理

- **FR-006**: YGOProDeckCardRepository のインスタンス化を Singleton Pattern または Factory Pattern で一元管理する
- **FR-007**: cardDisplayStore.ts と deckLoader.ts で同一の Repository インスタンスを共有し、キャッシュ効率を向上させる

#### テスト最適化

- **FR-008**: NormalSpellAction.test.ts、QuickPlaySpellAction.test.ts、FieldSpellAction.test.ts から共通フェーズチェックテストを削除し、BaseSpellAction.test.ts に集約する
- **FR-009**: Card.test.ts の型ガード関数テストを 25 個から 8-10 個に削減し、実装の裏返しテストを排除する
- **FR-010**: テスト削減後も Domain Layer のカバレッジ 80%以上を維持する
- **FR-011**: 代表的なテストファイル（BaseSpellAction.test.ts 等）のファイル冒頭に、テスト戦略のコメントを追加する（例: `// TEST: Base Classで共通ルールをテスト、Subclassは追加条件のみ`）

#### コメント・ドキュメント

- **FR-012**: deckLoader.ts（calculateDeckStats 等）と stepBuilders.ts（createDrawStep 等）の複雑な処理ステップに、目的を説明する日本語コメントを簡潔に追加する
- **FR-013**: 既存の英文コメントのうち、docstring 等の慣習的に英語が適切な部分を除き、説明的コメントを日本語に書き換える
- **FR-014**: GameState.ts の TODO コメントを整理し、実装予定か継続検討かを明確化する
- **FR-015**: 自明な処理（変数代入、単純な型変換等）には新規コメントを追加しない（ファイルサイズ抑制）
- （audio.ts、melody.ts、transitions.ts、request.ts は対応不要 - コアでないユーティリティのため）

#### Application Layer の細かな改善

- **FR-016**: effectResolutionStore.ts の独自 get()実装を削除し、Svelte の標準 getStoreValue に統一する
- **FR-017**: cardDisplayStore.ts の handCards、graveyardCards、banishedCards に isCancelled フラグを追加し、Race Condition 対策を統一する

### Key Entities

- **GameFacade**: Application Layer の単一窓口。Presentation Layer と Domain Layer の橋渡し役。新たにカード発動可能性チェック用のメソッドを追加する。
- **Repository**: Infrastructure Layer のデータアクセス抽象化。YGOProDeckCardRepository のインスタンス管理を一元化する。
- **Base Class（NormalSpellAction 等）**: Domain Layer の基底クラス。個別カード実装の共通ロジックを提供する。TerraformingActivation 等がこれを継承するように修正する。
- **Test Suite**: Unit/Integration/E2E テストの集合。重複テストを削減し、効率的なテスト構成にする。

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Presentation Layer から Domain Layer への直接 import が 0 件になる（現在: DuelField.svelte、Hands.svelte で複数 import）
- **SC-002**: Presentation Layer から Infrastructure Layer への直接 import が 0 件になる（現在: CardSelectionModal.svelte で 1 件）
- **SC-003**: TerraformingActivation.ts の行数が 197 行から 50 行以下に削減される（74%削減）
- **SC-004**: テストケース総数が 750-760 から 730 以下に削減される（20-30 ケース削減）
- **SC-005**: Domain Layer のテストカバレッジが 80%以上を維持する
- **SC-006**: 全テストスイートの実行時間が 5-10%短縮される（Base Class テスト削減による）
- **SC-007**: deckLoader.ts と stepBuilders.ts の複雑なロジックに日本語コメントが追加され、既存の英文説明コメントが日本語に書き換えられている（audio.ts 等のコアでないユーティリティは対象外）
- **SC-008**: アプリケーション起動時のカード画像ロード時間が改善される（Repository 統一によるキャッシュ効率向上）
- **SC-009**: 全改善実施後も、既存の全機能が正常に動作する（リグレッションなし）

## Assumptions

- **仮定 1**: 品質チェックで発見された問題は、現在のコードベースで最も優先度の高い改善項目である
- **仮定 2**: アーキテクチャ違反の修正は、他の改善の前提条件となるため、最優先で実施する
- **仮定 3**: 各改善は段階的に実施され、各段階で全テストがパスすることを確認する
- **仮定 4**: Repository 管理の最適化は、Singleton Pattern または Factory Pattern のいずれかを採用する（DI 容易性で選択）
- **仮定 5**: テストの削減は、カバレッジを維持しながら重複のみを削除する
- **仮定 6**: コメント追加は、既存のコメント規約（日本語/英語の使い分け）に従う
- **仮定 7**: 改善実施中も、新規機能開発は並行して進行可能である（ブランチ戦略で管理）

## Dependencies

- **依存 1**: 既存のテストスイートが全てパスしている状態
- **依存 2**: 品質チェックレポートの内容（本 spec の基盤）
- **依存 3**: 既存のアーキテクチャ設計ドキュメント（docs/architecture/overview.md 等）
- **依存 4**: Clean Architecture 原則と PSCT 設計への理解
- **依存 5**: Svelte 5 Runes とストア管理の知識

## Out of Scope

- **スコープ外 1**: 新機能の追加（本 spec は既存コードの品質改善のみ）
- **スコープ外 2**: パフォーマンス計測ツールの導入（改善効果の確認は既存テストで実施）
- **スコープ外 3**: 新規テストの追加（既存テストの最適化のみ）
- **スコープ外 4**: ドキュメント全体の見直し（コメント追加・修正のみ）
- **スコープ外 5**: Infrastructure Layer の API 統合方法の変更（Repository 管理の最適化のみ）
- **スコープ外 6**: ChickenGameIgnitionEffect.ts のリファクタリング（ChainableActionRegistry の 1ID 複数効果登録対応が先決）
- **スコープ外 7**: audio.ts、melody.ts、transitions.ts、request.ts へのコメント追加（コアでないユーティリティのため）

## Risks

- **リスク 1**: アーキテクチャ修正時に、既存の呼び出し箇所の更新漏れが発生する可能性（対策: 全テスト実行、型チェック）
- **リスク 2**: リファクタリング時に、微妙な動作の違いが発生する可能性（対策: 統合テストで動作確認）
- **リスク 3**: Repository 統一時に、既存のテストがモックを期待している場合、テスト修正が必要になる可能性（対策: テスト戦略の確認）
- **リスク 4**: テスト削減時に、重要なエッジケースが失われる可能性（対策: カバレッジレポートで確認）
- **リスク 5**: 改善作業中に、他の開発者による変更とコンフリクトが発生する可能性（対策: 小さな単位でコミット、頻繁なマージ）
