# Feature Specification: Domain Layer Refactoring

**Feature Branch**: `007-domain-refactor`
**Created**: 2025-12-22
**Status**: Draft
**Input**: User description: "効果システムとチェーンシステムを除き、ドメインのドキュメント一式を描き直した。刷新した docs/domain を正として、コードの設計・実装を見直す。型命名の統一、Immer依存削除、ゲーム操作のDomain層への移管を行う。"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - 型命名の統一 (Priority: P1)

開発者がドメインドキュメントとコードを照らし合わせる際、命名の不一致により混乱が生じている。`DomainCardData`と`CardData`、`SimpleCardType`と`CardType`など、同じ概念を指す複数の命名が存在する。これを統一することで、ドメインドキュメントとコードの対応関係が明確になり、新規参加者の理解が容易になる。

**Why this priority**: 型命名の統一はすべてのリファクタリングの基盤となる。この変更により、以降の作業でコードの意図が明確になり、バグの混入リスクが減少する。

**Independent Test**: ドキュメントの「Card Data (カードデータ)」を検索し、コード内で対応する型名が一貫して`CardData`であることを確認できる。型定義とドキュメントの用語が1対1で対応していることを検証できる。

**Acceptance Scenarios**:

1. **Given** ドメインドキュメントで「Card Data (カードデータ)」という用語が使われている、**When** コードベースを検索する、**Then** `DomainCardData`という命名は存在せず、すべて`CardData`に統一されている
2. **Given** Application層のDTO型が存在する、**When** その型名を確認する、**Then** Domain層の型と明確に区別できる命名（`CardDisplayData`など）になっている
3. **Given** 新規開発者がドキュメントを読む、**When** コード内で対応する型を探す、**Then** ドキュメントの用語とコードの型名が直接対応しており、迷わず見つけられる

---

### User Story 2 - Immer依存の削除 (Priority: P2)

現在のDomain層のCommandsでは、状態の不変性を保つためにImmer.jsの`produce()`を使用している。しかし、Domain層の純粋関数（Zone.tsなど）は既にspread構文で実装されており、Immerは必須ではない。Immerを削除することで、依存関係が減り、コードの理解が容易になり、ビルドサイズも削減できる。

**Why this priority**: Immerの削除は型命名の統一後に行うべき作業。Domain層の純粋性を保ちながら、外部依存を減らすことでメンテナンス性が向上する。

**Independent Test**: すべてのCommandの`execute()`メソッドを実行し、状態の不変性が保たれていることをテストで検証できる。Immerをuninstallしてもすべてのテストがパスすることを確認できる。

**Acceptance Scenarios**:

1. **Given** Commandが状態を更新する、**When** `execute()`を実行する、**Then** 元の`GameState`オブジェクトは変更されず、新しい`GameState`インスタンスが返される
2. **Given** `package.json`を確認する、**When** 依存関係リストを見る、**Then** `immer`パッケージが削除されている
3. **Given** すべてのテストを実行する、**When** Immerが削除された状態でテストを実行する、**Then** すべてのテストがパスする

---

### User Story 3 - ゲーム操作のDomain層への移管 (Priority: P3)

現在、ゲームの状態を変更するCommands（DrawCard, ActivateSpell等）とCardEffectRegistryがApplication層に配置されている。Clean Architectureの原則に従えば、これらはドメイン知識であり、Domain層に配置すべきである。移管により、ドメインロジックがDomain層に集約され、アーキテクチャの整合性が向上する。

**Why this priority**: 型命名とImmer削除が完了した後に行うべき大規模な構造変更。効果システムとの連携が複雑な場合は、この作業を次のSpecに延期する判断も可能。

**Independent Test**: Domain層のCommandsを単体で実行し、GameStateの変更が正しく行われることを検証できる。Application層のGameFacadeがDomain層のCommandsを呼び出すことを確認できる。

**Acceptance Scenarios**:

1. **Given** Commandクラスが存在する、**When** そのファイルパスを確認する、**Then** `src/lib/domain/commands/`配下に配置されている
2. **Given** CardEffectRegistryが存在する、**When** そのファイルパスを確認する、**Then** `src/lib/domain/effects/`配下に配置されている
3. **Given** GameFacadeが存在する、**When** その実装を確認する、**Then** Domain層のCommandsを呼び出すブリッジとしてApplication層に残っている
4. **Given** 効果システムとの連携を確認する、**When** 複雑化が確認される、**Then** この作業を次のSpecに延期する判断が記録されている

---

### Edge Cases

- 型名変更時に、import文の更新漏れが発生した場合、コンパイルエラーで検出できるか？
- Immer削除後、ネストされたオブジェクトの更新で不変性が破られるケースはないか？
- Commands移管時、循環参照が発生するケースはないか？
- 効果システムがPresentation層（Svelte store）に依存している場合、Domain層への移管は可能か？

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: 型命名をドメインドキュメントと一致させる。`DomainCardData` → `CardData`、Application層のDTOは明確に区別できる命名にする
- **FR-002**: すべてのCommandから`immer`の`produce()`を削除し、spread構文で状態更新を実装する
- **FR-003**: `package.json`から`immer`依存を削除する
- **FR-004**: `application/commands/`配下のすべてのCommandファイルを`domain/commands/`に移動する
- **FR-005**: `application/effects/CardEffectRegistry.ts`を`domain/effects/`に移動する
- **FR-006**: 移動後もすべてのimport文が正しく解決されることを保証する
- **FR-007**: テストファイルも対応するDomain層ディレクトリに移動する
- **FR-008**: GameFacadeはApplication層に残し、UIとDomain層のブリッジとして機能させる
- **FR-009**: ADR0007を作成し、これらの設計判断を記録する
- **FR-010**: 効果システムとの連携が複雑化する場合、現状維持とし次のSpecに延期する判断を記録する

### Key Entities

- **CardData**: ゲームロジックに必要な最小限のカード情報（ID、タイプ、サブタイプ）。旧`DomainCardData`
- **CardInstance**: ゲーム内の1枚のカード実体（instanceId、cardId、location、position）
- **CardDisplayData**: UI表示用のカード情報（名前、説明、画像URL等）。Application層のDTO
- **GameState**: ゲームの状態を表す不変オブジェクト（zones、lp、phase、turn、chainStack、result）
- **GameCommand**: ゲーム操作を表すCommandパターンのインターフェース（canExecute、execute）
- **CardEffectRegistry**: カードIDと効果実装のマッピングを管理するレジストリ

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: ドキュメントの用語とコードの型名が100%一致し、grep検索で対応関係を即座に確認できる
- **SC-002**: `immer`依存を削除後も、すべての既存テストが変更なしでパスする
- **SC-003**: Commands移管後、Domain層のテストカバレッジが80%以上を維持する
- **SC-004**: 型名変更によるコンパイルエラーがゼロになり、ビルドが成功する
- **SC-005**: リファクタリング後もアプリケーションの動作が変わらず、E2Eテストが100%パスする
- **SC-006**: ADR0007が作成され、設計判断の理由が明確に記録されている
- **SC-007**: 効果システムの扱いについて、「現状維持」または「再設計」の判断が明記されている

## Assumptions & Constraints _(if applicable)_

### Assumptions

- Domain層の純粋関数（Zone.ts）は既にspread構文で実装されており、Immerは不要である
- GameStateはネストが浅く、spread構文で十分に不変性を保てる構造である
- 既存のテストが十分なカバレッジを持ち、リファクタリング時の回帰検出が可能である
- 効果システム（CardEffect、EffectResolutionStep）はDomain層に配置されているが、EffectResolutionStepの`action`がSvelte storeに依存している可能性がある

### Constraints

- 効果システムがPresentation層に依存している場合、Domain層への完全な移管は次のSpecに延期する
- リファクタリング中もアプリケーションの動作を変更してはならない（振る舞いの保持）
- すべての既存テストがパスすることを確認しながら段階的に進める
- ドメインドキュメントとコードの不一致が発見された場合、ユーザーと相談して調整する

## Dependencies _(if applicable)_

- 刷新されたドメインドキュメント（docs/domain/）が完成していること
- 既存のテストスイートが正常に動作していること
- Immer削除前に、すべてのCommandがテストでカバーされていること
- Commands移管前に、import文の依存関係を整理しておくこと

## Out of Scope _(if applicable)_

以下は本Specの対象外とし、次のSpecで扱う:

- 効果システム（CardEffect、EffectResolutionStep）の再設計
- チェーンシステムのドキュメント整備とコード見直し
- EffectResolutionStepのPresentation層依存の解消
- 新しいカード効果の実装

## Success Metrics _(optional)_

- コードレビューでの指摘事項が従来比50%減少する（型名の明確化による）
- 新規参加者がドメイン層のコードを理解するまでの時間が30%短縮される
- ビルドサイズが`immer`削除により約5KB削減される
- Domain層のテスト実行時間が外部依存削減により10%短縮される
