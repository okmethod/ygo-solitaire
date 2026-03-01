# Feature Specification: Card Definition DSL

**Feature Branch**: `018-card-definition-dsl`
**Created**: 2026-02-28
**Status**: Draft
**Input**: カード定義と効果クラスをDSL（YAML形式）で宣言的に定義し、個別クラスの量産を不要にする

## User Scenarios & Testing _(mandatory)_

### User Story 1 - 単純な通常魔法カードをDSLで定義する (Priority: P1)

開発者として、「天使の施し」のような単純な通常魔法カードをYAML形式のDSLで定義したい。これにより、個別のTypeScriptクラスを作成せずにカードを追加できるようになる。

**Why this priority**: 最も一般的なカードパターン（ドロー、捨てる等の組み合わせ）をカバーし、DSLの基盤を確立する。現在13個ある個別Activationクラスの大半がこのパターンに該当する。

**Independent Test**: 「天使の施し」をDSLで定義し、既存のクラス実装と同等の動作をすることを確認できる。

**Acceptance Scenarios**:

1. **Given** YAML形式でカードが定義されている, **When** ゲーム開始時にカードレジストリが初期化される, **Then** DSL定義からカードデータと効果が自動生成され登録される
2. **Given** DSL定義の「天使の施し」がデッキにある, **When** 手札から発動する, **Then** 3枚ドローし、2枚選んで捨てる効果が正しく実行される
3. **Given** デッキが3枚未満, **When** 「天使の施し」の発動を試みる, **Then** 発動条件を満たさないと判定される

---

### User Story 2 - コストを伴う魔法カードをDSLで定義する (Priority: P2)

開発者として、「魔法石の採掘」のようにコスト（手札を捨てる）を伴うカードをDSLで定義したい。

**Why this priority**: コスト支払いはカード効果の重要な要素であり、DSLでの表現力を拡張する。

**Independent Test**: 「魔法石の採掘」をDSLで定義し、コスト支払いと効果解決が正しく分離されることを確認できる。

**Acceptance Scenarios**:

1. **Given** DSL定義で「activations」セクションにコストが記述されている, **When** カードを発動する, **Then** コスト支払い（手札を2枚捨てる）が効果解決前に実行される
2. **Given** DSL定義の「魔法石の採掘」を発動, **When** 効果が解決される, **Then** 墓地から魔法カード1枚を手札に加えられる

---

### User Story 3 - 永続効果を持つモンスターをDSLで定義する (Priority: P3)

開発者として、「王立魔法図書館」のような永続効果（トリガールール）を持つモンスターをDSLで定義したい。

**Why this priority**: ChainableActionだけでなくAdditionalRule（永続効果）もDSLでカバーすることで、DSLの適用範囲を広げる。

**Independent Test**: 「王立魔法図書館」の永続効果をDSLで定義し、魔法発動時にカウンターが乗ることを確認できる。

**Acceptance Scenarios**:

1. **Given** DSL定義で「effect-additional-rules」セクションにトリガールールが記述されている, **When** カードがフィールドに存在する状態で魔法が発動される, **Then** トリガールールに基づきカウンターが置かれる
2. **Given** 王立魔法図書館に魔力カウンターが3つある, **When** 起動効果を発動する, **Then** カウンターを3つ取り除き1枚ドローできる

---

### Edge Cases

- DSL定義に構文エラーがある場合、どのようにエラーを報告するか？ → パース時にエラーメッセージとファイル位置を出力
- 存在しないステップ名が指定された場合は？ → 登録時にエラーを出力し、該当カードの効果は登録しない
- DSLで表現できない複雑な効果がある場合は？ → 従来通り個別クラスで実装可能（DSLと共存）

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: システムはYAML形式のDSLファイルからカードデータを読み込みCardDataRegistryに登録できなければならない
- **FR-002**: システムはDSL定義から通常魔法の発動効果（NormalSpellActivation相当）を生成できなければならない
- **FR-003**: システムはDSL定義から永続魔法・フィールド魔法の発動効果を生成できなければならない
- **FR-004**: システムはDSL定義からモンスターの起動効果（IgnitionEffect相当）を生成できなければならない
- **FR-005**: システムはDSL定義からトリガールール（AdditionalRule相当）を生成できなければならない
- **FR-006**: DSLの「step」キーワードは既存のAtomicStepビルダー関数（drawStep, selectAndDiscardStep等）にマッピングされなければならない
- **FR-007**: DSLの「conditions」セクションは発動条件のチェックロジックを生成しなければならない
- **FR-008**: DSLとクラスベースの効果定義は共存でき、どちらの方式でもカードを定義できなければならない
- **FR-009**: DSL定義に構文エラーがある場合、開発者にわかりやすいエラーメッセージを提供しなければならない

### Key Entities

- **CardDSLDefinition**: YAML形式のカード定義全体を表す。カードデータ（id, name, type等）と効果定義を含む
- **StepRegistry**: DSLのステップ名（"DRAW", "SELECT_AND_DISCARD"等）をAtomicStepビルダー関数にマッピングする
- **ConditionRegistry**: DSLの条件名（"CAN_DRAW", "HAS_COUNTER"等）を条件チェック関数にマッピングする
- **GenericSpellActivation**: DSL定義を注入して動作する汎用的な魔法カード発動効果クラス
- **GenericTriggerRule**: DSL定義を注入して動作する汎用的なトリガールールクラス

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 現在クラスで実装されている13個のSpell Activationのうち、少なくとも80%（10個以上）をDSLで再実装できる
- **SC-002**: 新規カードの追加時、DSL定義のみで完結する場合は実装行数が従来の1/4以下になる
- **SC-003**: DSL定義のカードと既存クラス定義のカードが混在した状態で、全ての既存テストがパスする
- **SC-004**: DSL構文エラー時に、エラー箇所（ファイル名・行番号相当の情報）が特定できるエラーメッセージが出力される

## Assumptions

- DSLフォーマットはYAMLを採用する（docs/architecture/card-definition-dsl-design.mdの設計に準拠）
- DSLファイルは静的にインポートされ、実行時にパースされる（外部ファイル読み込みではない）
- 複雑な効果（動的フィルタ、条件分岐等）は引き続き個別クラスで実装可能とし、DSL化を強制しない
- 既存のAtomicStepビルダーとベースクラス（NormalSpellActivation等）は変更せず、DSLエンジンから利用する
