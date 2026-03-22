# Feature Specification: Domain Layer Test Improvement

**Feature Branch**: `020-test-improvement`
**Created**: 2026-03-22
**Status**: Draft
**Input**: domain層のテスト改善。vitestのテストカバレッジツール導入を最初に含む。

## User Scenarios & Testing _(mandatory)_

### User Story 1 - テストカバレッジの可視化 (Priority: P1)

開発者として、ドメイン層のテストカバレッジを数値で把握したい。これにより、テストが不足している領域を特定し、優先順位をつけて改善できる。

**Why this priority**: カバレッジツールがなければ、どこにテストが不足しているか客観的に判断できない。改善の出発点として必須。

**Independent Test**: `npm run test:coverage` を実行してカバレッジレポートが生成され、数値が確認できれば完了。

**Acceptance Scenarios**:

1. **Given** vitestが設定済み, **When** カバレッジコマンドを実行, **Then** ドメイン層のカバレッジ率がパーセンテージで表示される
2. **Given** カバレッジレポートが生成済み, **When** HTMLレポートを開く, **Then** ファイル単位・行単位でカバレッジ状況が確認できる

---

### User Story 2 - GameState/GameProcessing層のテスト追加 (Priority: P2)

開発者として、ゲームの中核データ構造（GameState/GameProcessing）のテストを追加したい。これにより、ゲーム状態管理のリグレッションを防止できる。

**Why this priority**: GameState/GameProcessingはゲーム全体の基盤。ここにバグが入ると全機能に影響する。現在カバレッジ0%で最もリスクが高い。

**Independent Test**: GameSnapshot, ActivationContext, GameEvent等の主要モデルに対するユニットテストが実行でき、すべてパスすれば完了。

**Acceptance Scenarios**:

1. **Given** GameSnapshotモデル, **When** 状態を更新, **Then** 不変性が保持され新しいスナップショットが返される
2. **Given** ActivationContext, **When** 効果発動コンテキストを作成, **Then** 必要な情報（発動カード、対象等）が正しく保持される
3. **Given** GameEvent, **When** イベントを作成, **Then** タイプ・データ・タイムスタンプが正しく設定される

---

### User Story 3 - Effect基盤クラスのテスト追加 (Priority: P3)

開発者として、Effect基盤クラス（BaseIgnitionEffect, BaseTriggerEffect, BaseContinuousEffect）のテストを追加したい。これにより、すべてのカード効果の基礎となる挙動を保証できる。

**Why this priority**: すべてのカード効果はこれらの基盤クラスを継承している。基盤の安定性が全効果の品質に直結する。

**Independent Test**: 各基盤クラスの共通メソッド（canActivate, execute等）のテストが実行でき、すべてパスすれば完了。

**Acceptance Scenarios**:

1. **Given** BaseIgnitionEffectを継承したクラス, **When** 発動条件をチェック, **Then** 条件に応じてtrue/falseが返される
2. **Given** BaseTriggerEffectを継承したクラス, **When** トリガーイベントが発生, **Then** 適切に効果が呼び出される
3. **Given** BaseContinuousEffectを継承したクラス, **When** 効果が適用中, **Then** 状態変更が永続的に反映される

---

### User Story 4 - 残りのCommands/Rules層テスト追加 (Priority: P4)

開発者として、未テストのCommand（SynchroSummonCommand）とRule（SynchroSummonRule, ActivationRule）のテストを追加したい。

**Why this priority**: Commands層は83.3%と高いカバレッジだが、SynchroSummonCommandが欠けている。一貫性のため追加する。

**Independent Test**: SynchroSummonCommand, SynchroSummonRule, ActivationRuleのテストが実行でき、すべてパスすれば完了。

**Acceptance Scenarios**:

1. **Given** シンクロ素材が揃っている, **When** SynchroSummonCommandを実行, **Then** シンクロモンスターが召喚される
2. **Given** シンクロ召喚条件, **When** SynchroSummonRuleで検証, **Then** レベル合計が正しいか判定される

---

### Edge Cases

- カバレッジツールが既存のテスト実行に影響を与えないこと
- テスト追加により既存テストが破壊されないこと
- 非同期処理を含むテストが正しくタイムアウトを扱えること

## Requirements _(mandatory)_

### Functional Requirements

#### Phase 1: カバレッジツール導入

- **FR-001**: Vitestのカバレッジ機能を有効化し、`npm run test:coverage`コマンドでカバレッジレポートを生成できるようにする
- **FR-002**: カバレッジレポートはHTMLおよびテキスト形式で出力する
- **FR-003**: カバレッジ対象はドメイン層（`src/lib/domain/`）に限定する
- **FR-004**: カバレッジレポートの出力先は`coverage/`ディレクトリとし、.gitignoreに追加する

#### Phase 2: GameState/GameProcessing層テスト

- **FR-005**: GameSnapshotモデルのユニットテストを作成する（作成・更新・不変性検証）
- **FR-006**: ActivationContextモデルのユニットテストを作成する
- **FR-007**: GameEventモデルのユニットテストを作成する
- **FR-008**: EventTimelineモデルのユニットテストを作成する
- **FR-009**: UpdateValidationユーティリティのユニットテストを作成する

#### Phase 3: Effect基盤クラステスト

- **FR-010**: BaseIgnitionEffectのユニットテストを作成する
- **FR-011**: BaseTriggerEffectのユニットテストを作成する
- **FR-012**: BaseContinuousEffectのユニットテストを作成する

#### Phase 4: Commands/Rules層補完

- **FR-013**: SynchroSummonCommandのユニットテストを作成する
- **FR-014**: SynchroSummonRuleのユニットテストを作成する
- **FR-015**: ActivationRuleのユニットテストを作成する

### Key Entities

- **GameSnapshot**: ゲーム状態の不変スナップショット。フィールド、手札、デッキ等の状態を保持
- **ActivationContext**: 効果発動時のコンテキスト情報（発動カード、対象、コスト等）
- **GameEvent**: ゲーム内で発生したイベント（召喚、効果発動、ダメージ等）
- **Effect基盤クラス**: BaseIgnitionEffect（起動効果）、BaseTriggerEffect（誘発効果）、BaseContinuousEffect（永続効果）

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: カバレッジツール導入後、`npm run test:coverage`でドメイン層のカバレッジ率が数値として確認できる
- **SC-002**: Phase 2完了後、models/GameState/とmodels/GameProcessing/のカバレッジ率が50%以上になる
- **SC-003**: Phase 3完了後、effects/actions/ignitions/、effects/actions/triggers/、effects/rules/continuouses/のカバレッジ率が50%以上になる
- **SC-004**: Phase 4完了後、commands/とrules/のカバレッジ率が80%以上になる
- **SC-005**: 全フェーズ完了後、ドメイン層全体のカバレッジ率が現状の22%から40%以上に向上する
- **SC-006**: 追加したテストはすべてパスし、既存テストに影響を与えない

## Assumptions

- Vitestは既にプロジェクトにインストール済み
- テストは既存のディレクトリ構造（`tests/unit/domain/`）に配置する
- 各テストはモックやスタブを適切に使用し、外部依存を持たない
- カバレッジ50%は最低ラインであり、重要なロジックは100%カバーすることを目指す

## Out of Scope

- E2Eテストの改善（本仕様はユニットテストに限定）
- DSL層のテスト追加（量が多いため別仕様で対応）
- カード定義ファイルのテスト（定義データのためテスト不要）
- CI/CDパイプラインへのカバレッジ閾値設定（将来の改善として検討）
