# Feature Specification: Spell Card Action Abstraction Refactoring

**Feature Branch**: `012-spell-action-refactor`
**Created**: 2025-12-31
**Status**: Draft
**Input**: User description: "魔法カード効果の抽象化リファクタリング - 現在10枚の魔法カードを実装済み。各カードのActionクラスで大量の重複コードが発生している（約356行、17%が重複）。共通部分を抽象化して、コードの重複を削減し、新規カード追加時の実装コストを下げる。"

## User Scenarios & Testing

### User Story 1 - Core Spell Card Abstraction (Priority: P1)

開発者が既存の7枚の通常魔法カード（Pot of Greed, Graceful Charity, One Day of Peace, Magical Mallet, Upstart Goblin, Dark Factory, Terraforming）のActionクラスを、新しい抽象基底クラス（BaseSpellAction, NormalSpellAction）を使用してリファクタリングする。各カードの実装は、カード固有のロジックのみを含む15-30行程度のコードになる。

**Why this priority**: P1である理由は、これが最も多くの重複を削減する部分（通常魔法7枚）であり、この抽象化が成功すれば他の魔法カードタイプ（速攻魔法、フィールド魔法）の抽象化の基盤になるため。

**Independent Test**: 既存の通常魔法カードのすべてのユニットテストが引き続きパスすることで、リファクタリングが正しく機能していることを確認できる。新しい抽象クラスを使用して1枚のカード（例：Pot of Greed）を書き換え、全テストがパスすることを確認する。

**Acceptance Scenarios**:

1. **Given** 既存のPot of GreedActionクラス、**When** NormalSpellActionを継承してリファクタリングする、**Then** すべてのPot of Greedのユニットテストがパスし、実装コードが元の187行から約20行に削減される
2. **Given** 既存のGraceful CharityActionクラス、**When** NormalSpellActionを継承してリファクタリングする、**Then** すべてのGraceful Charityのユニットテストがパスし、カード選択ロジックが正しく動作する
3. **Given** リファクタリングされた7枚の通常魔法カード、**When** アプリケーションを実行してカードを発動する、**Then** すべてのカードが元の実装と同じ動作をする

---

### User Story 2 - Primitive Step Builder Functions (Priority: P1)

開発者が、カード効果の共通処理（ドロー、墓地送り、手札破棄、シャッフル等）を再利用可能なヘルパー関数（createDrawStep, createSendToGraveyardStep等）として実装する。これらの関数は、EffectResolutionStepを生成し、各カードのcreateResolutionStepsメソッドから呼び出される。

**Why this priority**: P1である理由は、これらのヘルパー関数がUser Story 1の抽象化を支える基盤であり、最も重複の多い処理（ドロー150行、墓地送り96行、カード選択110行）を削減するため。

**Independent Test**: 各ヘルパー関数のユニットテストを作成し、様々なパラメータで正しいEffectResolutionStepが生成されることを確認する。例：createDrawStep(2)を呼び出すと、2枚ドローするステップが返され、デッキ枚数不足時はエラーを返すことを確認。

**Acceptance Scenarios**:

1. **Given** createDrawStep(2)を呼び出す、**When** デッキに2枚以上のカードがある状態で実行する、**Then** 2枚のカードが手札に追加され、勝利条件がチェックされる
2. **Given** createSendToGraveyardStep(instanceId, "Pot of Greed", "強欲な壺")を呼び出す、**When** フィールドにそのカードがある状態で実行する、**Then** カードが墓地に移動する
3. **Given** createCardSelectionStep(config)を呼び出す、**When** 手札から2枚選択するconfigで実行する、**Then** ユーザーがカードを選択でき、選択されたカードのインスタンスIDが返される

---

### User Story 3 - Quick-Play and Field Spell Abstraction (Priority: P2)

開発者が、速攻魔法カード（Card Destruction）とフィールド魔法カード（Chicken Game Activation/Ignition Effect）のActionクラスを、QuickPlaySpellActionとFieldSpellActionを継承してリファクタリングする。

**Why this priority**: P2である理由は、これらのカードタイプは数が少ない（速攻魔法1枚、フィールド魔法2枚）ため、削減できるコード量がP1より少ないが、将来の拡張性のために抽象化が必要。

**Independent Test**: Card DestructionとChicken Gameの既存のユニットテストがすべてパスすることで、リファクタリングが正しく機能していることを確認できる。

**Acceptance Scenarios**:

1. **Given** Card Destruction（速攻魔法）、**When** QuickPlaySpellActionを継承してリファクタリングする、**Then** すべてのCard Destructionのユニットテストがパスし、spellSpeed=2が正しく設定される
2. **Given** Chicken Game Activation（フィールド魔法）、**When** FieldSpellActionを継承してリファクタリングする、**Then** すべてのChicken Gameのユニットテストがパスし、フィールド魔法固有のロジックが動作する

---

### User Story 4 - Test Code Abstraction (Priority: P3)

開発者が、各カードのユニットテストで共通する部分（canActivateのテスト、createActivationStepsのテスト、不変性チェック等）を共通テストヘルパー関数として抽出する。これにより、テストコードの重複が削減され、メンテナンス性が向上する。

**Why this priority**: P3である理由は、テストコードの抽象化は本番コードの抽象化（P1, P2）が完了した後に行う方が効率的であり、本番コードの動作に直接影響しないため。

**Independent Test**: 共通テストヘルパーを使用して1つのカード（例：Pot of Greed）のテストを書き換え、すべてのテストがパスすることを確認する。

**Acceptance Scenarios**:

1. **Given** 共通テストヘルパー関数（testCanActivate, testImmutability等）、**When** Pot of Greedのテストで使用する、**Then** テストコードが元の200行から約50行に削減される
2. **Given** リファクタリングされたテストコード、**When** すべてのカードのテストを実行する、**Then** すべてのテストがパスし、カバレッジが維持される

---

### Edge Cases

- 抽象化後も、各カードのカード固有のロジック（例：Magical Malletのmetadataを使った状態管理、Graceful Charityのカード選択）が正しく動作すること
- リファクタリング中に既存のテストが一時的に失敗する場合、段階的に移行する方法（古い実装と新しい実装を並行して動作させる等）を検討すること
- 新しい抽象クラスが、将来のモンスターカードやトラップカードの実装時にも再利用可能であること

## Requirements

### Functional Requirements

- **FR-001**: システムは、BaseSpellAction抽象基底クラスを提供しなければならない。このクラスは、ChainableActionインターフェースを実装し、すべての魔法カードActionクラスの共通ロジック（isCardActivation, spellSpeedの管理）を含む
- **FR-002**: システムは、NormalSpellAction抽象クラスを提供しなければならない。このクラスは、BaseSpellActionを継承し、通常魔法固有のロジック（canActivate内のMain Phaseチェック、共通のcreateActivationSteps実装）を含む
- **FR-003**: システムは、QuickPlaySpellAction抽象クラスを提供しなければならない。このクラスは、BaseSpellActionを継承し、速攻魔法固有のロジック（spellSpeed=2、フェーズチェックなし）を含む
- **FR-004**: システムは、FieldSpellAction抽象クラスを提供しなければならない。このクラスは、BaseSpellActionを継承し、フィールド魔法固有のロジックを含む
- **FR-005**: システムは、以下のプリミティブ処理ヘルパー関数を提供しなければならない：createDrawStep(count), createDiscardStep(count), createSendToGraveyardStep(instanceId, cardName, jaName), createDamageStep(amount), createGainLifeStep(amount), createShuffleStep(), createCardSelectionStep(config)
- **FR-006**: 既存の10枚の魔法カード（Pot of Greed, Graceful Charity, Chicken Game Activation/Ignition Effect, Upstart Goblin, One Day of Peace, Magical Mallet, Card Destruction, Dark Factory, Terraforming）は、新しい抽象クラスを使用してリファクタリングされなければならない
- **FR-007**: リファクタリング後も、すべての既存のユニットテスト（545テスト）がパスしなければならない
- **FR-008**: 各カードのActionクラスの実装コードは、カード固有のロジックのみを含み、15-30行程度に削減されなければならない
- **FR-009**: 新しいディレクトリ構造は、抽象クラスとヘルパー関数を適切に分離し、将来の拡張（モンスター/トラップカード）を考慮したものでなければならない
- **FR-010**: リファクタリング後のコードは、lint/formatチェックに合格しなければならない

### Key Entities

- **BaseSpellAction**: すべての魔法カードActionクラスの抽象基底クラス。ChainableActionインターフェースを実装し、共通プロパティ（isCardActivation, spellSpeed）と共通メソッドのデフォルト実装を提供する
- **NormalSpellAction**: 通常魔法カード用の抽象クラス。BaseSpellActionを継承し、通常魔法固有のcanActivate実装（Main Phaseチェック）とcreateActivationSteps実装（発動通知のみ）を提供する
- **QuickPlaySpellAction**: 速攻魔法カード用の抽象クラス。BaseSpellActionを継承し、速攻魔法固有のspellSpeed=2を設定する
- **FieldSpellAction**: フィールド魔法カード用の抽象クラス。BaseSpellActionを継承し、フィールド魔法固有のロジックを提供する
- **EffectStepBuilder**: プリミティブ処理（ドロー、墓地送り等）のEffectResolutionStepを生成するヘルパー関数群を提供するモジュール

## Success Criteria

### Measurable Outcomes

- **SC-001**: 既存の10枚の魔法カードの実装コードが、平均で150行から25行に削減される（83%削減）
- **SC-002**: リファクタリング後も、すべての既存のユニットテスト（545テスト）が100%パスする
- **SC-003**: 新規カードを追加する際の実装時間が、平均で2時間から30分に短縮される（75%削減）
- **SC-004**: コードの重複率が、現在の17%から5%以下に削減される
- **SC-005**: テストコードの重複率が、平均で50%削減される
- **SC-006**: リファクタリング完了後、lint/formatチェックがすべてパスする
- **SC-007**: 開発者が新しい抽象クラスとヘルパー関数を使用して、1枚の新規カードを30分以内に実装できる（ドキュメント参照含む）

## Scope

### In Scope

- 既存の10枚の魔法カードのActionクラスのリファクタリング
- BaseSpellAction, NormalSpellAction, QuickPlaySpellAction, FieldSpellActionの実装
- プリミティブ処理ヘルパー関数（createDrawStep, createSendToGraveyardStep等）の実装
- ディレクトリ構造の見直しと整理
- テストコードの共通化（テストヘルパー関数の作成）
- 既存のすべてのユニットテストの動作確認

### Out of Scope

- 新しい魔法カードの追加（リファクタリングのみ、新規カードは別のfeatureで追加）
- モンスターカードやトラップカードの抽象化（将来のfeatureで実施）
- AdditionalRuleやChainSystemの抽象化（別のfeatureで実施）
- パフォーマンスの最適化（リファクタリングの主目的ではない）
- UIコンポーネントの変更（Domain Layerのリファクタリングのみ）

## Assumptions

- 既存の10枚の魔法カードの動作は正しく、すべてのユニットテストがパスしている状態からスタートする
- 抽象化により、コードの可読性と保守性が向上するが、実行時のパフォーマンスは大きく変わらない（許容範囲内）
- 新しいディレクトリ構造は、以下のようになる：
  - `skeleton-app/src/lib/domain/effects/base/` - 抽象基底クラス（BaseSpellAction, NormalSpellAction等）
  - `skeleton-app/src/lib/domain/effects/builders/` - ヘルパー関数（EffectStepBuilders）
  - `skeleton-app/src/lib/domain/effects/chainable/` - 具体的なカード実装（既存）
- 開発者は、TypeScript、Clean Architecture、既存のChainableActionパターンに精通している
- リファクタリングは、段階的に実施し、各段階でテストを実行して動作を確認する（一度にすべてを変更しない）

## Dependencies

- 既存のChainableActionインターフェース（`skeleton-app/src/lib/domain/models/ChainableAction.ts`）
- 既存のEffectResolutionStepモデル（`skeleton-app/src/lib/domain/models/EffectResolutionStep.ts`）
- 既存のZoneモジュール（drawCards, sendToGraveyard等の関数）
- 既存のVictoryRuleモジュール（checkVictoryConditions関数）
- 既存のChainableActionRegistry（リファクタリング後も同じレジストリを使用）
- すべての既存のユニットテスト（リファクタリング後も同じテストを使用）
