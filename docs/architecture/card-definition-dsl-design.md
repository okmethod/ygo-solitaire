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

### ConditionChecker と StepBuilder

効果については、「条件チェック」「実行ステップ」を抽象化し、組み合わせにより個別カードの効果を定義している。  
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

#### Generic ファクトリ

ファクトリは DSL 定義を受け取り、レジストリから ConditionChecker / StepBuilder を取得して、効果種別ごとの効果クラスをベースに具体効果インスタンスを組み立てる。

### 拡張のポイント

新しいカード・効果を実装する際は、**既存の ConditionChecker / StepBuilder の組み合わせ** で実現できるかをまず検討する。
組み合わせで表現できない場合は、新しい ConditionChecker / StepBuilder を追加する。

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
        └─ continuous  → GenericContinuousTriggerRule
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
