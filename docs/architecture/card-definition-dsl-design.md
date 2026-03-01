# カード定義 DSL 設計

## 概要

YGO Solitaire は、カードデータ定義に DSL (Domain Specific Language) を導入する。
DSLにより、カードごとに固有のクラスを量産するのではなく、データ定義（DSL）から、カードデータ・効果を一元的に生成・登録する。

この設計により、以下を実現する：

- **SSOT**: 1 枚のカードの全情報を 1 箇所で管理
- **実装コストの削減**: 定型処理（ドロー、捨て、サーチ等）をコード記述なしで定義可能
- **レガシー再現**: 同じカード名で効果・ルールが異なる「エラッタ前」バージョンの容易な量産
- **既存資産の継承**: 現在の AtomicStep や BaseSpellActivation 等のロジックをエンジンとして再利用

ドメイン知識（カードデータ、効果等）については [カードモデル](../domain/card-model.md) および [効果モデル](../domain/effect-model.md) を参照。

---

## DSLの例

- 通常魔法（カードの発動）

```yaml
id: 79571449
data:
  jaName: "天使の施し"
  edition: "latest"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effect-chainable-actions:
  activations:
    conditions:
      - step: "CAN_DRAW"
        args: { count: 3 }
    activations:
    resolutions:
      - step: "DRAW"
        args: { count: 3 }
      - step: "THEN"
      - step: "SELECT_AND_DISCARD"
        args: { count: 2 }
```

- 効果モンスター（起動効果）

```yaml
id: 95400001
data:
  jaName: "カタパルト・タートル"
  type: "monster"
  frameType: "effect"
  edition: "regacy"

effect-chainable-actions:
  ignitions:
    - conditions:
      activations:
        - step: "SELECT_AND_RELEASE_MONSTER"
          args: { count: 1 }
      resolutions:
        - step: "DAMAGE"
          args:
            target: "Opponent"
            value: { ref: "RELEASED_MONSTER_ATK", multiplier: 0.5 }
```

- 効果モンスター（永続効果・起動効果）

```yaml
id: 70791313
data:
  jaName: "王立魔法図書館"
  type: "monster"
  frameType: "effect"
  race: "spellcaster"
  attribute: "light"
  level: 4

effect-aditional-rules:
  continuous:
    - category: "TriggerRule"
      triggers: ["SPELL_ACTIVATED"]
      resolutions:
        - step: "PLACE_COUNTER"
          args: { count: 1, counterType: "SPELL_COUNTER" }

effect-chainable-actions:
  ignition:
    - conditions:
        - step: "HAS_COUNTER"
          args: { count: 3, counterType: "SPELL_COUNTER" }
      activations:
        - step: "REMOVE_COUNTER"
          args: { count: 3, counterType: "SPELL_COUNTER" }
      resolutions:
        - step: "DRAW"
          args: { count: 1 }
```

---

## 登録フロー

- CardDataRegistry をハブとし、効果レジストリ（ChainableActionRegistry と AdditionalRuleRegistry）にも連携させる
- 条件を満たした効果を抽出したい場合は、効果レジストリ内を探索する
- 定義済み AtomicCondition や AtomicStep とマッピングし、Generic な Effectクラス（GenericNormalSpellActivation 等）に注入して効果インスタンスを生成する
- 複雑な効果も、専用の AtomicCondition や AtomicStep を実装することで再現できる

---

## 利用フロー

1. **ゲーム起動時**: `loadAllDSLDefinitions()` が呼ばれ、YAMLファイルを読み込み
2. **カード情報参照**: `CardDataRegistry.get(cardId)` でカードデータ取得
3. **発動可能判定**: `ChainableActionRegistry.getActivation(cardId)` で ChainableAction 取得
4. **起動効果判定**: `ChainableActionRegistry.getIgnitionEffects(cardId)` で起動効果取得
5. **永続効果適用**: `AdditionalRuleRegistry.get(cardId)` で AdditionalRule 取得

---

## 実装構造

```
skeleton-app/src/lib/domain/dsl/
├── types/
│   ├── CardDSLDefinition.ts    # DSL型定義
│   └── DSLErrors.ts            # エラー型（カードID・フィールドパス含む）
├── parsers/
│   ├── CardDSLParser.ts        # YAMLパーサー + Zodバリデーション
│   └── schemas/
│       └── CardDSLSchema.ts    # Zodスキーマ定義
├── registries/
│   ├── StepRegistry.ts         # ステップ名 → AtomicStepビルダー
│   └── ConditionRegistry.ts    # 条件名 → ValidationResult
├── factories/
│   ├── GenericNormalSpellActivation.ts  # 汎用通常魔法
│   ├── GenericIgnitionEffect.ts         # 汎用起動効果
│   └── GenericTriggerRule.ts            # 汎用トリガールール
└── loader.ts                   # YAML読み込み・レジストリ登録
```

---

## 利用可能なステップ（StepRegistry）

| ステップ名 | 説明 | args |
|-----------|------|------|
| `DRAW` | 指定枚数ドロー | `{ count: number }` |
| `SELECT_AND_DISCARD` | 手札から選択して捨てる | `{ count: number, cancelable?: boolean }` |
| `FILL_HANDS` | 手札が指定枚数になるまでドロー | `{ count: number }` |
| `THEN` | タイミング進行マーカー | なし |
| `GAIN_LP` | LP回復 | `{ amount: number, target: "player" \| "opponent" }` |
| `SEARCH_FROM_DECK` | デッキからサーチ | `{ filterType: string, filterSpellType?: string, count: number }` |
| `SALVAGE_FROM_GRAVEYARD` | 墓地からサルベージ | `{ filterType: string, filterFrameType?: string, count: number }` |
| `PLACE_COUNTER` | カウンター配置 | `{ counterType: string, count: number, limit?: number }` |
| `REMOVE_COUNTER` | カウンター除去 | `{ counterType: string, count: number }` |
| `DISCARD_ALL_HAND_END_PHASE` | エンドフェイズに手札全捨て | なし |

---

## 利用可能な条件（ConditionRegistry）

| 条件名 | 説明 | args |
|-------|------|------|
| `CAN_DRAW` | デッキに指定枚数以上あるか | `{ count: number }` |
| `HAND_COUNT` | 手札が指定枚数以上あるか | `{ minCount: number }` |
| `HAND_COUNT_EXCLUDING_SELF` | 自身を除く手札が指定枚数以上あるか | `{ minCount: number }` |
| `GRAVEYARD_HAS_SPELL` | 墓地に魔法カードがあるか | `{ minCount?: number }` |
| `GRAVEYARD_HAS_MONSTER` | 墓地にモンスターがあるか | `{ minCount?: number, frameType?: string }` |
| `DECK_HAS_CARD` | デッキに条件に合うカードがあるか | `{ filterType: string, filterSpellType?: string, minCount?: number }` |
| `HAS_COUNTER` | カウンターが指定数以上あるか | `{ counterType: string, minCount: number }` |
| `ONCE_PER_TURN` | このターン未発動か | `{ cardId?: number }` |

---

## DSL化済みカード一覧

### 通常魔法

| カード名 | ID | DSL |
|---------|-----|-----|
| 強欲な壺 | 55144522 | ✓ |
| 天使の施し | 79571449 | ✓ |
| 成金ゴブリン | 70368879 | ✓ |
| 魔法石の採掘 | 98494543 | ✓ |
| テラ・フォーミング | 73628505 | ✓ |
| 無の煉獄 | 93946239 | ✓ |
| 命削りの宝札 | 59750328 | ✓ |
| 闇の量産工場 | 90928333 | ✓ |

### 効果モンスター

| カード名 | ID | DSL |
|---------|-----|-----|
| 王立魔法図書館 | 70791313 | ✓ |

---

## 拡張方法

### 新しいステップの追加

1. `StepRegistry.ts` の `registeredSteps` にエントリを追加
2. 対応するAtomicStepビルダー関数をインポートまたは作成

### 新しい条件の追加

1. `ConditionRegistry.ts` の `registeredConditions` にエントリを追加
2. `(state, sourceInstance, args) => ValidationResult` 形式で実装

### 新しいカードタイプのサポート

1. `factories/` に新しいGenericクラスを作成（例: `GenericQuickPlaySpellActivation`）
2. `loader.ts` で新しいファクトリを呼び出すロジックを追加
3. `CardDSLSchema.ts` で新しいスキーマ要素を定義
