# Feature Specification: Effect Model Implementation

**Feature Branch**: `008-effect-model`
**Created**: 2025-01-28
**Status**: Draft
**Input**: User description: "Implement effect model (ChainableAction and AdditionalRule) with Chicken Game as validation example. Chain system is out of scope."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Developer implements ChainableAction model (Priority: P1)

新しい効果モデル（ChainableAction）を実装し、既存のCardEffectから移行できるようにする。これにより、遊戯王OCG公式ルールに準拠したCONDITIONS/ACTIVATION/RESOLUTIONの3ステップ構成が可能になる。

**Why this priority**: 効果システムの基盤であり、すべての後続作業が依存する。ADR-0008の根幹部分。

**Independent Test**: ChainableActionインターフェースを定義し、既存のPotOfGreedEffectを移行することで、他の機能に影響を与えずに単独でテスト可能。

**Acceptance Scenarios**:

1. **Given** ChainableActionインターフェースが定義されている, **When** PotOfGreedEffectをChainableActionとして実装する, **Then** canActivate/createActivationSteps/createResolutionStepsの3メソッドが正しく動作する
2. **Given** ChainableActionRegistryが実装されている, **When** カードIDで効果を登録・取得する, **Then** O(1)で高速にルックアップできる
3. **Given** 既存のCardEffectとChainableActionが共存している, **When** 両方のシステムで同じカードを実行する, **Then** 同じゲーム状態の変化が発生する

---

### User Story 2 - Developer implements AdditionalRule model (Priority: P1)

追加ルール（AdditionalRule）モデルを実装し、永続効果やルール効果を体系的に扱えるようにする。チキンレースの永続効果を実装例として使用する。

**Why this priority**: ChainableActionと同様に基盤モデルであり、P1と同時並行で進められる独立した作業。

**Independent Test**: AdditionalRuleインターフェースを定義し、チキンレースの「ライフポイント差分によるダメージ無効化」ルールを実装することで単独テスト可能。

**Acceptance Scenarios**:

1. **Given** AdditionalRuleインターフェースが定義されている, **When** チキンレースのダメージ無効化ルールを実装する, **Then** canApply/checkPermissionメソッドが正しく動作する
2. **Given** AdditionalRuleRegistryが実装されている, **When** カードIDで複数のルールを登録・取得する, **Then** カテゴリ別フィルタとcollectActiveRulesが正しく機能する
3. **Given** フィールドにチキンレースが存在し、プレイヤーのLPが相手より少ない, **When** ダメージを受ける処理が実行される, **Then** ダメージが0になる

---

### User Story 3 - Developer refactors ActivateSpellCommand to return effectSteps (Priority: P2)

ActivateSpellCommandをリファクタリングし、effectStepsを返すだけの設計に変更する。これによりDomain LayerがApplication Layerに依存しないClean Architectureを実現する。

**Why this priority**: P1の基盤モデルが完成した後に実施することで、既存システムとの統合をスムーズに行える。

**Independent Test**: ActivateSpellCommandのexecute()がeffectStepsを含むGameStateUpdateResultを返すことで、単体テストで検証可能。

**Acceptance Scenarios**:

1. **Given** ActivateSpellCommandがeffectStepsを返す実装になっている, **When** execute()を呼ぶ, **Then** GameStateUpdateResult.effectStepsに効果解決ステップが含まれる
2. **Given** GameFacadeがeffectStepsを受け取る実装になっている, **When** activateSpell()を呼ぶ, **Then** effectResolutionStore.startResolution()が正しく呼ばれる
3. **Given** IEffectResolutionServiceが削除されている, **When** ActivateSpellCommandをインスタンス化する, **Then** DIなしでコンストラクタが動作する

---

### User Story 4 - User activates Chicken Game and uses its effects (Priority: P2)

ユーザーがチキンレースを発動し、その効果（1000LP支払いでドロー/破壊/相手回復）を使用できる。これにより効果モデルの実用性を検証する。

**Why this priority**: P1/P2の基盤モデルを使った実用例として、効果モデルの動作を包括的に検証できる。

**Independent Test**: チキンレースのカード発動と効果発動をE2Eテストで確認可能。

**Acceptance Scenarios**:

1. **Given** 手札にチキンレースがある, **When** チキンレースを発動する, **Then** フィールドゾーンに配置され、永続効果が適用される
2. **Given** フィールドにチキンレースが存在する, **When** メインフェイズに1000LP支払ってドロー効果を選択する, **Then** デッキから1枚ドローしてLPが1000減る
3. **Given** フィールドにチキンレースが存在し、自分のLPが相手より少ない, **When** ダメージを受ける処理が実行される, **Then** ダメージが0になる

---

### User Story 5 - Developer removes legacy CardEffectRegistry (Priority: P3)

既存のCardEffectRegistryを削除し、すべての効果をChainableActionRegistryに移行する。コードベースを整理する。

**Why this priority**: システムが正しく動作することを確認した後に実施する整理作業。機能追加ではない。

**Independent Test**: CardEffectRegistryへの参照がゼロであることをgrep検索で確認可能。

**Acceptance Scenarios**:

1. **Given** すべての効果がChainableActionRegistryに移行済み, **When** CardEffectRegistry.tsを削除する, **Then** すべてのテストがパスする
2. **Given** CardEffectRegistryが削除されている, **When** プロジェクト全体をgrepする, **Then** CardEffectRegistryへの参照が存在しない
3. **Given** 旧CardEffect.tsが削除またはエイリアス化されている, **When** ビルドを実行する, **Then** TypeScriptコンパイルエラーが発生しない

---

### Edge Cases

- **チキンレースが複数枚フィールドに存在する場合**: ルール上、フィールド魔法は1枚のみなので、この状況は発生しない（仕様上考慮不要）
- **1000LP未満の状態でチキンレースの効果を発動しようとする場合**: canActivate()がfalseを返し、発動できないことを明示する
- **チキンレースの効果発動中にチキンレースが破壊された場合**: 効果解決ステップは独立しているため、破壊されても効果は正しく解決される
- **AdditionalRuleのカテゴリが存在しない場合**: getByCategory()は空配列を返し、エラーにならない
- **ChainableActionがregistryに未登録の場合**: get()はundefinedを返し、ActivateSpellCommandがエラーハンドリングする

## Requirements _(mandatory)_

### Functional Requirements

**Phase 1: モデル定義とRegistry実装**

- **FR-001**: システムはChainableActionインターフェースを提供しなければならない（isCardActivation, spellSpeed, canActivate, createActivationSteps, createResolutionStepsを含む）
- **FR-002**: システムはAdditionalRuleインターフェースを提供しなければならない（isEffect, category, canApply, apply, checkPermission, replaceを含む）
- **FR-003**: システムはChainableActionRegistryを提供し、カードIDで効果を登録・取得できなければならない
- **FR-004**: システムはAdditionalRuleRegistryを提供し、カードIDで複数のルールを登録・取得できなければならない
- **FR-005**: AdditionalRuleRegistryはカテゴリ別フィルタ（getByCategory）を提供しなければならない
- **FR-006**: AdditionalRuleRegistryはフィールド全体から適用可能なルールを収集する（collectActiveRules）を提供しなければならない
- **FR-007**: GameStateUpdateResultインターフェースはeffectStepsフィールド（オプショナル）を持たなければならない

**Phase 2: ChainableActionへの移行**

- **FR-008**: 既存のPotOfGreedEffectはChainableActionとして再実装されなければならない
- **FR-009**: 既存のGracefulCharityEffectはChainableActionとして再実装されなければならない
- **FR-010**: ChainableActionとして実装された効果はChainableActionRegistryに登録されなければならない
- **FR-011**: 既存のCardEffectとChainableActionは移行期間中に共存できなければならない

**Phase 3: ActivateSpellCommandのリファクタリング**

- **FR-012**: ActivateSpellCommandのコンストラクタはIEffectResolutionServiceパラメータを持たないこと
- **FR-013**: ActivateSpellCommandのexecute()はGameStateUpdateResultを返し、effectStepsフィールドに効果解決ステップを含めなければならない
- **FR-014**: GameFacade.activateSpell()はeffectStepsを受け取り、effectResolutionStore.startResolution()を呼ばなければならない
- **FR-015**: IEffectResolutionService.tsとEffectResolutionServiceImpl.tsは削除されなければならない

**Phase 4: チキンレースの実装**

- **FR-016**: チキンレースのカードデータ（id: 67616300）はCardDataRegistryに登録されなければならない
- **FR-017**: チキンレースの発動処理はChainableActionとして実装されなければならない
- **FR-018**: チキンレースの永続効果（ダメージ無効化）はAdditionalRuleとして実装されなければならない
- **FR-019**: チキンレースの起動効果（1000LP支払いで3つの選択肢）はChainableActionとして実装されなければならない
- **FR-020**: チキンレースの起動効果は、デッキドロー・カード破壊・相手回復の3つの選択肢を提供しなければならない
- **FR-021**: チキンレースの起動効果は1ターンに1度の制限を持たなければならない
- **FR-022**: チキンレースの起動効果発動に対して、相手は魔法・罠・モンスターの効果を発動できない（チェーンシステムは本specのスコープ外のため、実装不要）

**Phase 5: 既存CardEffectRegistryの削除**

- **FR-023**: すべての効果がChainableActionRegistryに移行済みであること
- **FR-024**: CardEffectRegistry.tsは削除されること
- **FR-025**: 旧CardEffect.tsは削除またはChainableActionへのエイリアスとして残ること

### Key Entities

- **ChainableAction**: チェーンブロックを作る処理のモデル（カードの発動、効果の発動）
  - isCardActivation: boolean - カードの発動か効果の発動か
  - spellSpeed: 1 | 2 | 3 - スペルスピード
  - canActivate(state): boolean - 発動条件チェック
  - createActivationSteps(state): EffectResolutionStep[] - 発動時の処理
  - createResolutionSteps(state, instanceId): EffectResolutionStep[] - 効果解決時の処理

- **AdditionalRule**: 追加ルールのモデル（永続効果、ルール効果、効果外テキスト）
  - isEffect: boolean - ルール上「効果」にあたるか
  - category: RuleCategory - ルールのカテゴリ
  - canApply(state, context): boolean - 適用条件チェック
  - apply(state, context): GameState - データ書き換え系
  - checkPermission(state, context): boolean - 判定追加・制限系
  - replace(state, context): GameState - 処理置換・フック系

- **ChainableActionRegistry**: ChainableActionのレジストリ
  - register(cardId, action): void - 効果の登録
  - get(cardId): ChainableAction | undefined - 効果の取得
  - clear(): void - レジストリのクリア

- **AdditionalRuleRegistry**: AdditionalRuleのレジストリ
  - register(cardId, rule): void - ルールの登録
  - get(cardId): AdditionalRule[] - ルールの取得
  - getByCategory(cardId, category): AdditionalRule[] - カテゴリ別取得
  - collectActiveRules(state, category, context): AdditionalRule[] - フィールド全体から収集
  - clear(): void - レジストリのクリア

- **Chicken Game (チキンレース)**: フィールド魔法カード（id: 67616300）
  - 永続効果: 相手よりLPが少ないプレイヤーが受けるダメージは0になる
  - 起動効果: 1ターンに1度、1000LP支払って3つの選択肢から1つを選択
    - デッキから1枚ドロー
    - このカードを破壊
    - 相手は1000LP回復

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: すべての既存テスト（魔法カード発動、効果解決）が引き続きパスする
- **SC-002**: ChainableActionとAdditionalRuleのインターフェースが公式ルール（CONDITIONS/ACTIVATION/RESOLUTION）に準拠している
- **SC-003**: ActivateSpellCommandがIEffectResolutionServiceに依存せず、単体テストでモック不要になる
- **SC-004**: チキンレースのすべての効果（発動、永続効果、起動効果）が正しく動作し、E2Eテストでカバーされる
- **SC-005**: CardEffectRegistryへの参照がゼロになり、コードベースから完全に削除される
- **SC-006**: Phase 1〜5の各フェーズで、すべてのユニットテストがパスする（段階的検証）

### Non-Functional Success Criteria

- **SC-007**: Registry Pattern によるO(1)ルックアップが維持される（パフォーマンス）
- **SC-008**: 既存のカード効果（Pot of Greed, Graceful Charity）の動作が変わらない（後方互換性）
- **SC-009**: ドキュメント（ADR-0008, docs/domain/effect-model.md）とコードが一致する（一貫性）

## Assumptions

- チェーンシステムはスコープ外であり、チキンレースの「この効果の発動に対して、お互いは魔法・罠・モンスターの効果を発動できない」は実装しない
- フィールド魔法は1枚のみ配置可能なため、複数枚のチキンレースが同時に存在する状況は考慮不要
- チキンレースの「1ターンに1度」制限は、GameStateに発動履歴を記録する簡易的な実装で対応可能
- ダメージ処理は既存のGameCommandとして実装されており、AdditionalRuleのcheckPermission()で介入可能
- 既存のeffectResolutionStoreは引き続き使用し、効果解決フローの制御はApplication Layerが担当する

## Out of Scope

- チェーンシステムの実装（チェーンブロックの構築、LIFO解決、スペルスピードチェック）
- チキンレース以外の新規カードの実装
- AdditionalRuleの全カテゴリの実装（本specではダメージ無効化のみ実装）
- フィールド魔法ゾーンの実装（既存のfield zoneを使用）
- ライフポイント比較ロジックの拡張（既存のGameState.lpを使用）

## Dependencies

- ADR-0008: 効果モデルの導入とClean Architectureの完全実現
- 既存のCardEffect実装（PotOfGreedEffect, GracefulCharityEffect）
- 既存のGameStateUpdateResult型
- 既存のeffectResolutionStore（Application Layer）
- 既存のCardDataRegistry

## Related Documents

- [ADR-0008: 効果モデルの導入とClean Architectureの完全実現](../../docs/adr/0008-effect-model-and-clean-architecture.md)
- [効果モデル](../../docs/domain/effect-model.md)
- [アーキテクチャ概要](../../docs/architecture/overview.md)
- [ADR-0007: Domain Layer Refactoring](../../docs/adr/0007-domain-layer-refactoring.md)
