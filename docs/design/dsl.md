# カード定義 DSL 設計

**カード 1 種類＝ YAML 1 ファイル** に宣言し、そこから `CardData` と効果インスタンスを生成・登録する **DSL（Domain Specific Language）** の設計を扱う。

> 効果分類ごとの基底クラスは [effect-model.md](./effect-model.md)、カードデータは [card-model.md](./card-model.md)、レイヤー構成は [architecture.md](./architecture.md) を参照。

---

## 骨組み × 部品によるカード定義

カード 1 枚の効果は、効果分類ごとの基底クラスの継承を**骨組み**として、その効果がいつ・何をするかの固有処理を**部品**として合成して表す。  
扱えるカードの幅は、この **骨組み × 部品の掛け算** で決まる。

DSL は、その指定を YAML に宣言するだけの仕組みにする。  
骨組みは後述の **Generic ファクトリ**、部品は **語彙レジストリ** が供給する。  
カードごとに固有クラスを量産せず、データから効果を組み立てることで、以下を狙う。

- **SSOT**: 1 種類のカードの情報（データ・効果）を一元管理する
- **実装コストの削減**: 定型処理はコードを書かず、既存の語彙の組み合わせで定義する
- **レガシー再現**: 同名でも効果・ルールが異なる「エラッタ前」バージョンを容易に量産する

---

## データ読み込みフロー

YAML 定義は、パース・バリデーションを経て各レジストリへ登録される。  
効果処理の本体は書かず、**どの語彙をどう組み合わせるか** だけを宣言する点が要点である。

**関連ファイル**: `domain/dsl/core/`（`parsers.ts` / `loader.ts`）、定義ファイルは `domain/cards/definitions/`

```
YAML 定義ファイル（cards/definitions/*.yaml）
  │
  ▼ dsl/core/parsers.ts : js-yaml でパース → Zod で検証
CardDSLDefinition（型安全・検証済み）
  │
  ▼ dsl/core/loader.ts : セクションごとに各レジストリへ登録
  │
  ├─► CardDataRegistry           … data → CardData（カード基本情報）
  │
  ├─► ChainableActionRegistry    … effectChainableActions
  │     ├─ activations → Generic{Normal,QuickPlay,Continuous,Equip}SpellActivation
  │     ├─ ignitions   → GenericIgnitionEffect
  │     └─ triggers    → GenericTriggerEffect
  │
  └─► AdditionalRuleRegistry     … effectAdditionalRules
        ├─ continuous   → GenericContinuousTriggerRule
        └─ unclassified → GenericUnclassifiedActionOverride
```

ローダーには 2 つの入口がある。  
レシピ表示などゲームを開始しない用途では `loadCardDataFromYaml`（`CardData` のみ登録）、ゲーム開始時のレジストリ初期化では `loadCardDataWithEffectsFromYaml`（効果まで登録）を使う。

---

## Generic ファクトリ : YAML から効果インスタンスを組み立てる

[effect-model.md](./effect-model.md) の効果は、本来カードごとに基底クラスを継承したクラスとして書く。  
DSL では、その代わりに **Generic ファクトリ** が YAML 定義を受け取り、基底クラスをベースに効果インスタンスを組み立てる。カード 1 枚ごとのクラスは書かない。

**関連ファイル**: `domain/dsl/factories/`

- ファクトリは効果種別（魔法サブタイプ・起動・誘発・永続・分類されない）ごとに用意する
- DSL 定義中の各ステップ名を、後述の **語彙レジストリ**（条件／ステップ／処理置換）から引いて解決し、基底クラスの `canActivate` / `createActivationSteps` / `createResolutionSteps` 等に流し込む
- 組み立てたインスタンスを `ChainableActionRegistry` / `AdditionalRuleRegistry` に登録する

魔法の `activations` は `spellType`（normal / quick-play / continuous / equip / field）に応じて対応するファクトリを選ぶ。永続・フィールド・装備魔法は `activations` が無くても NoOp 発動として登録される。

---

## DSL の語彙 : 条件・ステップ・処理置換

YAML が参照するのは、あらかじめ登録された 3 種類の **名前付き部品**（語彙）である。  
カードはこの語彙を組み合わせるだけで書け、語彙自体は純粋関数／ハンドラとしてカードをまたいで再利用される。

**関連ファイル**: `domain/dsl/conditions/`・`domain/dsl/steps/`・`domain/dsl/overrides/`

| 語彙                      | 役割                                                     | 型                      | レジストリ                | 名前定義            | 生成物             |
| ------------------------- | -------------------------------------------------------- | ----------------------- | ------------------------- | ------------------- | ------------------ |
| **ConditionChecker**      | 発動条件の判定（`requirements`）                         | `ConditionCheckerFn`    | `AtomicConditionRegistry` | `ConditionNames.ts` | `ValidationResult` |
| **StepBuilder**           | 効果処理 1 ステップの生成（`activations`/`resolutions`） | `StepBuilderFn`         | `AtomicStepRegistry`      | `StepNames.ts`      | `AtomicStep`       |
| **ActionOverrideHandler** | 基本ルール処理の置換（`unclassified`）                   | `ActionOverrideHandler` | `ActionOverrideRegistry`  | `OverrideNames.ts`  | オーバーライド値   |

### ConditionChecker

ゲーム状態とカードインスタンスから発動条件の成否を判定する純粋関数。

```typescript
type ConditionCheckerFn = (state: GameSnapshot, sourceInstance: CardInstance, args: DSLArgs) => ValidationResult;
```

- 定義: `conditions/checkers/*`（`createConditionChecker` ファクトリで引数検証＋判定を合成する）
- 登録: `AtomicConditionRegistry.register(name, checker)`
- 使用: `AtomicConditionRegistry.check(name, state, instance, args)`

### StepBuilder

引数とコンテキスト（`cardId` / `sourceInstanceId` 等）から、ゲーム状態を更新する `AtomicStep` を 1 つ返す関数。  
`AtomicStep` の位置づけは [effect-model.md](./effect-model.md)（効果＝ステップの合成）を参照。

```typescript
type StepBuilderFn = (args: DSLArgs, context: StepBuildContext) => AtomicStep;
```

- 定義: `steps/builders/*`（ドロー・捨て・サーチ・リリース・バーン等、操作種別ごと）
- 登録: `AtomicStepRegistry.register(name, builder)`
- 使用: `AtomicStepRegistry.build(name, args, context)`

### ActionOverrideHandler

基本ルールの処理（例: フィールド離脱時の行き先）を上書きするハンドラ。  
`AdditionalRule` の `ActionOverride` カテゴリ（[effect-model.md](./effect-model.md)）の実体を供給する。

```typescript
interface ActionOverrideHandler {
  /** このオーバーライドを適用すべきか判定する */
  shouldApply(state: GameSnapshot, sourceInstance: CardInstance, args: DSLArgs): boolean;
  /** オーバーライド値を取得する（戻り値の型はハンドラごとに異なる） */
  getOverrideValue(args: DSLArgs): unknown;
}
```

- 定義: `overrides/handlers/*`
- 登録: `ActionOverrideRegistry.register(name, factory)`（`factory: (cardId) => ActionOverrideHandler`）
- 使用: `ActionOverrideRegistry.createHandler(name, cardId)`

### 名前定義が二重防御になる

3 種の名前定義（`ConditionNames.ts` / `StepNames.ts` / `OverrideNames.ts`）は、**型検証と実行時検証の共通の出どころ** になっている。

- **型検証（コーディング時）**: 名前は `StepName` 等の Union 型を生み、builder 登録や参照のタイプミスを型エラーで弾く
- **実行時検証（YAML 読込時）**: 同じ名前一覧から Zod スキーマ（`z.enum`）を動的生成するため、YAML に書ける `step` 名は登録済みの語彙だけに制限される

```typescript
// dsl/types/DSLSchemas.ts : YAML に書ける step 名は「登録済みの語彙」だけ
const stepValues = Object.values(STEP_NAMES) as [StepName, ...StepName[]];
const StepDSLSchema = z.object({ step: z.enum(stepValues), args: ArgsSchema });
```

この結果、`DROW` のようなタイプミスは **カードを動かすまでもなく YAML 検証の時点で落ちる**。

---

## YAML 定義の書き方

スキーマは Zod で定義する（`dsl/types/DSLSchemas.ts`）。  
トップレベルは `id` / `data` / `effectChainableActions` / `effectAdditionalRules` の 4 つ。効果の 2 セクションは、それぞれ [effect-model.md](./effect-model.md) の **発動する効果 / 適用する効果** に対応する。

発動条件（PSCT の「:」の前）は `conditions` にまとめ、2 つの要素を持つ。

- `conditions.trigger`: いつ発動するか（誘発効果・永続効果のイベント購読）。`events` / `timing`（`when`/`if`）/ `isMandatory` / `selfOnly` / `excludeSelf` / `sourceZones`
- `conditions.requirements`: 状態ベースの条件チェック（`ConditionChecker` の列）

処理は PSCT の 2 部に対応する。`activations`（「;」の前＝コスト・対象選択）と `resolutions`（「.」で終わる効果処理）で、どちらも `StepBuilder` の列。

### 通常魔法（カードの発動）

```yaml
id: 70828912
data:
  jaName: "早すぎた埋葬"
  type: "spell"
  frameType: "spell"
  spellType: "equip"

effectChainableActions:
  activations:
    conditions:
      requirements:
        - step: "GRAVEYARD_HAS_MONSTER"
        - step: "LP_AT_LEAST"
          args: { amount: 800 }
    activations:
      - step: "PAY_LP"
        args: { amount: 800 }
      - step: "SELECT_TARGETS_FROM_GRAVEYARD"
    resolutions:
      - step: "SPECIAL_SUMMON_FROM_CONTEXT"
        args: { clearContext: false }
      - step: "ESTABLISH_EQUIP"
```

### 効果モンスター（永続効果 ＋ 起動効果）

```yaml
id: 70791313
data:
  jaName: "王立魔法図書館"
  type: "monster"
  frameType: "effect"
  monsterTypeList: ["effect"]
  attribute: "LIGHT"
  race: "Spellcaster"
  level: 4
  attack: 0
  defense: 2000

effectAdditionalRules:
  continuous:
    - category: "TriggerRule"
      conditions:
        trigger:
          events: ["spellActivated"]
          timing: "if"
          isMandatory: true
      resolutions:
        - step: "PLACE_COUNTER"
          args: { counterType: "spell", count: 1, limit: 3 }

effectChainableActions:
  ignitions:
    - conditions:
        requirements:
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

## 拡張ヒューリスティック : まず YAML 1 枚で書けるか

新しいカードを実装するとき、判断の順序は常に **「既存の語彙で書けるか」から** 始める。

- **既存の ConditionChecker / StepBuilder / ActionOverride の組み合わせで表現できるなら、YAML を 1 枚書くだけ**で済む（コード追加ゼロ）。
- **新しい挙動が必要なときだけ** 語彙（純粋関数／ハンドラ）を 1 つ追加し、名前を登録する。追加した語彙は以降のカードから再利用できる。

カードが増えても語彙は飽和に向かい、ほとんどのカードが YAML だけで足りる状態に収束していく。これが「カードごとにクラスを書かない」ことの実利である。

### 実装フロー

既存の `implement-card` スキルがこの流れを支援する。

**計画フェーズ** — YAML 定義（WIP）を把握し、必要な語彙とファクトリを棚卸しする。

1. カード ID・カードタイプ・条件／効果を確認する
2. 既存の Generic ファクトリとパーサー／ローダーで実装可能か確認する。不可なら参考にすべき既存ファクトリを探し、明確でなければ設計案をユーザーと合意する
3. 既存の ConditionChecker / StepBuilder / ActionOverride で実装可能か確認する。不可なら追加実装の方針を立て、明確でなければ設計案を合意する

**実装フェーズ** — 不足する語彙・ファクトリを下から順に埋め、最後にカードを登録する（各ステップでテスト・Lint を実行）。

1. 不足があれば Generic ファクトリを追加（パーサー／ローダーを更新し `dsl/index.ts` に公開）
2. 不足があれば ConditionChecker を追加（純粋関数を実装 → `ConditionNames.ts` に名前登録 → `conditions/index.ts` に登録）
3. 不足があれば StepBuilder を追加（純粋関数を実装 → `StepNames.ts` に名前登録 → `steps/index.ts` に登録）
4. 処理置換が要るなら ActionOverrideHandler を追加（ハンドラを実装 → `OverrideNames.ts` に名前登録 → `overrides/index.ts` に登録）
5. YAML 定義を書き、`cards/definitions/index.ts` に登録する
6. ブラウザで動作確認する
