# カード定義 DSL 設計

## 概要

YGO Solitaire は、カードデータ定義に DSL (Domain Specific Language) を導入する。  
DSL により、カードごとに固有のクラスを量産するのではなく、データ定義（YAML）から、カードデータ・効果を一元的に生成・登録する。

この設計により、以下を実現する：

- **SSOT**: 1 枚のカードの全情報を 1 箇所で管理
- **実装コストの削減**: 定型処理（ドロー、捨て、サーチ等）をコード記述なしで定義可能
- **レガシー再現**: 同じカード名で効果・ルールが異なる「エラッタ前」バージョンの容易な量産
- **既存資産の継承**: 現在の AtomicStep や BaseSpellActivation 等のロジックをエンジンとして再利用

ドメイン知識（カードデータ、効果等）については [カードモデル](../domain/card-model.md) および [効果モデル](../domain/effect-model.md) を参照。

---

## コアコンセプト

### CardData

カードモデルの CardData は静的な定義データなので、素直に定義する。

### 効果実装

効果については、「条件チェック」「実行ステップ」「処理置換」を抽象化し、組み合わせにより個別カードの効果を定義している。  
効果の種別に応じた Generic ファクトリがこれらの定義を読み込み、効果インスタンスを組み立てる。

#### ConditionChecker

発動条件を判定する関数。ゲーム状態とカードインスタンスから条件の成否を ValidationResult として返す。

```typescript
type ConditionChecker = (
  state: GameSnapshot,
  sourceInstance: CardInstance,
  args: Record<string, unknown>,
) => ValidationResult;
```

- 定義: `effects/conditions/index.ts`, `effects/conditions/checkers/*`
- 登録: `AtomicConditionRegistry.register(name, checker)`
- 使用: `AtomicConditionRegistry.check(name, state, instance, args)`

#### StepBuilder

効果処理の 1 ステップを生成する関数。引数とコンテキストからゲーム状態を更新する AtomicStep を返す。

```typescript
type StepBuilder = (
  args: Record<string, unknown>,
  context: { cardId: number; sourceInstanceId?: string },
) => AtomicStep;
```

- 定義: `effects/steps/index.ts`, `effects/steps/builders/*`
- 登録: `AtomicStepRegistry.register(name, builder)`
- 使用: `AtomicStepRegistry.build(name, args, context)`

#### ActionOverrideHandler

処理置換のロジックを定義するインターフェース。ゲームエンジンの既存処理を上書きするためのメカニズムを提供する。

```typescript
interface ActionOverrideHandler {
  /** このオーバーライドが適用されるべきか判定 */
  shouldApply(state: GameSnapshot, card: CardInstance, args: DSLArgs): boolean;

  /** オーバーライド値を取得（戻り値の型はハンドラごとに異なる） */
  getOverrideValue(args: DSLArgs): unknown;
}
```

- 定義: `dsl/overrides/handlers/*`
- 登録: `ActionOverrideRegistry.register(name, factory)`
- 使用: `ActionOverrideRegistry.createHandler(name, cardId)`

#### Generic ファクトリ

ファクトリは DSL 定義を受け取り、レジストリから ConditionChecker / StepBuilder / ActionOverride を取得して、効果種別ごとの効果クラスをベースに具体効果インスタンスを組み立てる。

### 拡張のポイント

新しいカード・効果を実装する際は、**既存の ConditionChecker / StepBuilder / ActionOverride の組み合わせ** で実現できるかをまず検討する。
組み合わせで表現できない場合は、新しい ConditionChecker / StepBuilder / ActionOverrideHandler を追加する。

---

## データ読み込みフロー

```
YAML定義ファイル
  │
  ▼ dsl/parsers.ts
CardDSLDefinition (Zodバリデーション済み)
  │
  ▼ dsl/loader.ts
  │
  ├─► CardDataRegistry.register()
  │     カード基本情報（名前、タイプ等）
  │
  ├─► ChainableActionRegistry.register()
  │     ├─ activations → GenericNormalSpellActivation 等
  │     ├─ ignitions   → GenericIgnitionEffect
  │     └─ triggers    → GenericTriggerEffect
  │
  └─► AdditionalRuleRegistry.register()
        ├─ continuous    → GenericContinuousTriggerRule
        └─ unclassified  → GenericUnclassifiedActionOverride
```

---

## DSL の例

定義: `cards/definitions/*`

### 通常魔法（カードの発動）

```yaml
id: 79571449
data:
  jaName: "天使の施し"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effectChainableActions:
  activations:
    conditions:
      - step: "CAN_DRAW"
        args: { count: 3 }
    resolutions:
      - step: "DRAW"
        args: { count: 3 }
      - step: "THEN"
      - step: "SELECT_AND_DISCARD"
        args: { count: 2 }
```

### 効果モンスター（永続効果 + 起動効果）

```yaml
id: 70791313
data:
  jaName: "王立魔法図書館"
  type: "monster"
  frameType: "effect"
  attribute: "LIGHT"
  race: "Spellcaster"
  level: 4

effectAdditionalRules:
  continuous:
    - category: "TriggerRule"
      triggers: ["spellActivated"]
      triggerTiming: "if"
      isMandatory: true
      resolutions:
        - step: "PLACE_COUNTER"
          args: { counterType: "spell", count: 1, limit: 3 }

effectChainableActions:
  ignitions:
    - conditions:
        - step: "HAS_COUNTER"
          args: { counterType: "spell", minCount: 3 }
      activations:
        - step: "REMOVE_COUNTER"
          args: { counterType: "spell", count: 3 }
      resolutions:
        - step: "DRAW"
          args: { count: 1 }
```

### 分類されない効果（ActionOverride）

```yaml
id: 40737112
data:
  jaName: "混沌の黒魔術師"
  type: "monster"
  frameType: "effect"
  # ... 略

effectAdditionalRules:
  unclassified:
    - category: "ActionOverride"
      override: "FIELD_DEPARTURE_DESTINATION"
      args: { destination: "banished" }
```

---

## DSL によるカード実装フロー

### 計画フェーズ

1. YAML定義(WIP)を確認し内容を把握する
   - id
   - カードタイプ
   - 条件・効果等
2. Generic ファクトリを選定する
   - 既存のファクトリと yaml パーサー/ローダーで実装可能か確認する
   - できない場合、参考にするべき既存のファクトリがあるかを確認する
   - 明確でない場合、設計案を検討してユーザーと合意形成する
3. ConditionChecker / StepBuilder / ActionOverride を選定する
   - 既存の条件/ステップ/処理置換で実装可能か確認する
   - できない場合、参考にするべき既存機能があるかを確認する
   - 既存機能から実装方針が明確な場合、追加実装する
   - 明確でない場合、設計案を検討してユーザーと合意形成する

### 実装フェーズ

1. Generic ファクトリを追加実装する
   - ファクトリを実装する
   - yaml パーサー/ローダーを実装する
   - `lib/domain/dsl/index.ts` に登録する
   - テスト・Lint実行
2. ConditionChecker を追加実装する
   - 純粋関数を実装する（既存関数の流用もOK）
   - `ConditionNames.ts` に名前を登録する
   - `lib/domain/effects/conditions/index.ts` に登録する
   - テスト・Lint実行
3. StepBuilder を追加実装する
   - 純粋関数を実装する（既存関数の流用もOK）
   - `StepNames.ts` に名前を登録する
   - `lib/domain/effects/steps/index.ts` に登録する
   - テスト・Lint実行
4. ActionOverrideHandler を追加実装する（処理置換が必要な場合）
   - ハンドラ関数を実装する（既存関数の流用もOK）
   - `OverrideNames.ts` に名前を登録する
   - `lib/domain/dsl/overrides/index.ts` に登録する
   - テスト・Lint実行
5. カード実装する
   - YAML定義を更新する
   - `lib/domain/cards/index.ts` に登録する
   - テスト・Lint実行
6. ブラウザで動作確認する
