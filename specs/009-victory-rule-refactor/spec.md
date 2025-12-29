# Feature Specification: Victory Rule Refactoring

**Feature Branch**: `009-victory-rule-refactor`
**Created**: 2025-01-29
**Status**: Draft
**Input**: User description: "Refactor VictoryRule to use AdditionalRule model for special victory conditions like Exodia"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Exodia Victory Uses AdditionalRule Model (Priority: P1)

エクゾディアの特殊勝利条件を、AdditionalRuleモデルを使って実装する。これにより、「効果外テキスト」として明示的に扱われ、アーキテクチャの一貫性が向上する。

**Why this priority**: 特殊勝利条件の基盤リファクタリングであり、他の特殊勝利条件（最終列車、エクゾード・ネクロス等）の追加を容易にする。

**Independent Test**: ExodiaVictoryRuleクラスを実装し、AdditionalRuleRegistryに登録することで、既存のVictoryRule.tsと並行して動作確認が可能。

**Acceptance Scenarios**:

1. **Given** ExodiaVictoryRuleがAdditionalRuleとして実装されている, **When** 手札にエクゾディア5パーツが揃う, **Then** canApply()がtrueを返し、checkPermission()が勝利を示す
2. **Given** ExodiaVictoryRuleがAdditionalRuleRegistryに登録されている, **When** VictoryConditionカテゴリのルールを取得する, **Then** ExodiaVictoryRuleが含まれる
3. **Given** ExodiaVictoryRuleのisEffectがfalseに設定されている, **When** 効果無効化処理が実装される（将来）, **Then** エクゾディア勝利は無効化されない

---

### User Story 2 - VictoryRule.ts is Generalized to Use AdditionalRuleRegistry (Priority: P2)

VictoryRule.tsをリファクタリングし、特殊勝利条件をAdditionalRuleRegistryから動的に取得するように変更する。これにより、新しい特殊勝利条件の追加が容易になる。

**Why this priority**: P1のExodiaVictoryRule実装後に、既存システムとの統合を行う。

**Independent Test**: checkVictoryConditions()がAdditionalRuleRegistryを参照し、特殊勝利条件を判定することを単体テストで確認可能。

**Acceptance Scenarios**:

1. **Given** checkVictoryConditions()がAdditionalRuleRegistryを使用している, **When** 特殊勝利条件が満たされる, **Then** 正しいGameResultが返される
2. **Given** AdditionalRuleRegistryに複数の特殊勝利条件が登録されている, **When** checkVictoryConditions()を呼ぶ, **Then** すべての条件が順次チェックされる
3. **Given** VictoryRule.tsがリファクタリングされている, **When** 既存のテストスイートを実行する, **Then** すべてのテストがパスする

---

### User Story 3 - Basic Victory Conditions Remain Hardcoded (Priority: P2)

基本勝利条件（LP0、デッキアウト）は、VictoryRule.ts内にハードコードされたまま維持する。これらは遊戯王の基本ルールであり、カード固有の効果ではない。

**Why this priority**: P1/P2のリファクタリング後、基本勝利条件が正しく動作することを確認する。

**Independent Test**: LP0とデッキアウトの判定が既存と同じ動作をすることを、既存テストで確認可能。

**Acceptance Scenarios**:

1. **Given** プレイヤーのLPが0になる, **When** checkVictoryConditions()を呼ぶ, **Then** LP0敗北のGameResultが返される
2. **Given** デッキが空でDrawフェーズになる, **When** checkVictoryConditions()を呼ぶ, **Then** デッキアウト敗北のGameResultが返される
3. **Given** 相手のLPが0になる, **When** checkVictoryConditions()を呼ぶ, **Then** LP0勝利のGameResultが返される

---

### Edge Cases

- **複数の特殊勝利条件が同時に満たされる場合**: AdditionalRuleRegistry内の登録順序に従い、最初にマッチしたルールの勝利条件を適用する（現実的には発生しにくい）
- **AdditionalRuleRegistryに特殊勝利条件が未登録の場合**: checkVictoryConditions()は基本勝利条件（LP0、デッキアウト）のみをチェックする
- **ExodiaVictoryRuleのcanApply()中にゲーム状態が変化する場合**: canApply()は純粋関数であり、副作用がないため問題なし

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: ExodiaVictoryRuleはAdditionalRuleインターフェースを実装しなければならない
- **FR-002**: ExodiaVictoryRuleのisEffectはfalseに設定されなければならない（効果外テキスト）
- **FR-003**: ExodiaVictoryRuleのcategoryは"VictoryCondition"でなければならない
- **FR-004**: ExodiaVictoryRuleのcanApply()は、手札にエクゾディア5パーツが揃っている場合にtrueを返さなければならない
- **FR-005**: ExodiaVictoryRuleのcheckPermission()は、canApply()がtrueの場合に勝利を示すtrueを返さなければならない
- **FR-006**: checkVictoryConditions()は、ExodiaVictoryRuleを直接インスタンス化してチェックしなければならない
- **FR-007**: checkVictoryConditions()は、特殊勝利条件を確認した後、基本勝利条件（LP0、デッキアウト）を確認しなければならない
- **FR-008**: VictoryRule.tsのレガシーヘルパー関数（hasExodiaVictory, getMissingExodiaPieces, countExodiaPiecesInHand等）は削除しなければならない

### Key Entities

- **ExodiaVictoryRule**: エクゾディアの特殊勝利条件を表すAdditionalRule実装クラス
  - isEffect: false（効果外テキスト）
  - category: "VictoryCondition"
  - canApply(): 手札にエクゾディア5パーツが揃っているかを判定
  - checkPermission(): 勝利条件を満たしているかを確認（常にtrue）

- **VictoryCondition RuleCategory**: AdditionalRuleのカテゴリとして既に定義済み
  - 特殊勝利条件を分類するために使用

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: ExodiaVictoryRuleを実装し、すべての単体テストがパスする（100%のテストカバレッジ）
- **SC-002**: 既存のVictoryRule.tsのテストスイートを実行し、すべてのテストがパスする（後方互換性の保証）
- **SC-003**: 新しい特殊勝利条件（例: 最終列車）の追加が、20行以下のコードで実装可能になる（拡張性の向上）
- **SC-004**: checkVictoryConditions()の実行時間が、リファクタリング前と比較して10%以内の変動に収まる（パフォーマンス維持）

## Design Decisions _(optional)_

### Why Refactor to AdditionalRule?

1. **アーキテクチャの一貫性**: 他の特殊ルール（ChickenGameContinuousRule等）はAdditionalRuleで実装されているため、勝利条件も同じパターンで統一する
2. **効果外テキストの明示**: isEffect: falseにより、エクゾディアの勝利条件が「効果を無効にする効果」によって無効化されないことを型レベルで保証する
3. **拡張性の向上**: 新しい特殊勝利条件（最終列車、エクゾード・ネクロス等）を追加する際、AdditionalRuleRegistryへの登録だけで済む

### Why Keep Basic Victory Conditions Hardcoded?

1. **基本ルールの明示**: LP0とデッキアウトは遊戯王の基本ルールであり、カード固有の効果ではないため、VictoryRule.ts内にハードコードすることで明確にする
2. **パフォーマンス**: 基本勝利条件は毎回チェックされるため、Registry参照のオーバーヘッドを避ける
3. **可読性**: 基本ルールがVictoryRule.ts内に明示的に記述されることで、コードの可読性が向上する

## Assumptions _(optional)_

- AdditionalRuleモデルは既に実装されており、VictoryConditionカテゴリが定義されている（specs/008-effect-modelで完了済み）
- AdditionalRuleRegistryはO(1)でルックアップ可能なMap実装である
- エクゾディアの5パーツのカードIDは、CardDataRegistryに登録されている
- 将来的に効果無効化処理が実装される際、isEffect: falseのルールは無効化されない設計になる

## Out of Scope _(optional)_

- 新しい特殊勝利条件（最終列車、エクゾード・ネクロス等）の実装は、このspecには含まれない
- 基本勝利条件（LP0、デッキアウト）のAdditionalRule化は、パフォーマンスと可読性の観点から実施しない
- 効果無効化処理の実装は、別のspecで対応する
- VictoryConditionルールの優先順位制御は、現時点では登録順序に従う（将来的な拡張として検討）

## Dependencies _(optional)_

- **specs/008-effect-model**: AdditionalRuleモデルとAdditionalRuleRegistryが実装済みであること
- **CardDataRegistry**: エクゾディア5パーツのカードIDが登録されていること
- **GameState.hasExodiaInHand()**: 既存のヘルパー関数が正しく動作していること
