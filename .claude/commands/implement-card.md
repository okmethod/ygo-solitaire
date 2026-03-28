---
description: 遊戯王カードのDSL実装を支援する。遊戯王WikiのURLを入力として、カード情報取得からYAML定義・実装までを実行する。
---

# /implement-card

遊戯王カードのDSL実装を支援するコマンド。

## 入力

`$ARGUMENTS` に遊戯王WikiのカードページURLを渡す

例: `/implement-card https://yugioh-wiki.net/index.php?%A1%D4%A3%C2%A3%C6%A1%DD%BC%C0%C9%F7%A4%CE%A5%B2%A5%A4%A5%EB%A1%D5`

---

## 内部サブエージェント

| エージェント    | 配置                                | 役割                    |
| --------------- | ----------------------------------- | ----------------------- |
| fetch-card-info | `.claude/agents/fetch-card-info.md` | カード情報取得（haiku） |

---

## Phase 1: カード情報取得

**fetch-card-info サブエージェントを呼び出す**

```
Task tool を使用:
- subagent_type: "fetch-card-info"
- prompt: "$ARGUMENTS"（URLをそのまま渡す）
- model: haiku
```

**取得される情報**:

- カードID（YGOPRODECK API）
- 日本語名/英語名
- カード種別、属性、種族、レベル、ATK/DEF
- 日本語カードテキスト（遊戯王Wiki）
- 効果分類（誘発効果、起動効果など）

**エラー時**: URLが不正または取得失敗の場合、ユーザーに報告して終了

---

## Phase 2: YAML定義確認/作成

### 2.1 既存YAML検索

```
検索パス: skeleton-app/src/lib/domain/cards/definitions/
構造:
├── monsters/
│   ├── normals/      # 通常モンスター
│   ├── effects/      # 効果モンスター
│   ├── synchroes/    # シンクロモンスター
│   ├── fusions/      # 融合モンスター
│   └── tokens/       # トークン
└── spells/
    ├── normals/      # 通常魔法
    ├── quick-plays/  # 速攻魔法
    ├── continuouses/ # 永続魔法
    ├── equips/       # 装備魔法
    └── fields/       # フィールド魔法
```

カードIDまたは英語名で検索し、存在確認する。

### 2.2 結果に応じた分岐

- **存在する場合**: 既存YAMLを読み込み
- **存在しない場合**: テンプレートと類似カードのYAMLを参考に新規作成
  - テンプレート: `skeleton-app/src/lib/domain/cards/definitions/dsl-template.yaml`
  - 検索パス: `skeleton-app/src/lib/domain/cards/definitions/`

### 2.3 YAMLファイル作成

1. ファイル名: `{英語名のkebab-case}.yaml`
   - 例: `formula-synchron.yaml`, `graceful-charity.yaml`
2. 配置先: カード種別に応じたディレクトリ（2.1の構造を参照）
3. 内容:
   - `id`, `data` セクション: Phase 1で取得した静的データを記入
   - `effectChainableActions`, `effectAdditionalRules` セクション: WIPコメントまたは叩き台を記入

**Phase 2 完了確認**: YAMLファイルが作成/更新されていることを確認してから Phase 3 へ進む

---

## Phase 3: 計画フェーズ

**参照ドキュメント**: [docs/architecture/card-definition-dsl-design.md](docs/architecture/card-definition-dsl-design.md)

### 3.1 Genericファクトリ選定

カード種別に応じて適切なファクトリを選定する。

- ファクトリ一覧: `skeleton-app/src/lib/domain/dsl/factories/index.ts`
- 検索パス: `skeleton-app/src/lib/domain/dsl/factories/`

### 3.2 ConditionChecker選定

発動条件に必要なCheckerを選定する。

- 利用可能な条件名一覧: `skeleton-app/src/lib/domain/dsl/conditions/ConditionNames.ts`
- 各チェッカー実装パス: `skeleton-app/src/lib/domain/dsl/conditions/checkers/`

### 3.3 StepBuilder選定

効果処理に必要なBuilderを選定する。

- 利用可能なステップ名一覧: `skeleton-app/src/lib/domain/dsl/steps/StepNames.ts`
- 各ビルダー実装パス: `skeleton-app/src/lib/domain/dsl/steps/builders/`

### 3.4 不足要素の特定

既存のファクトリ/Checker/Builderで実装できるか判定する。

**既存要素で実装可能**: Phase 4へ進む
**新規実装が必要**: 以下を特定しユーザーに報告

- 必要な新規ファクトリ/Checker/Builder
- 参考になる既存実装
- 配置先の案（既存ファイルに追加実装 or 新規ファイルを作成して実装）
- 実装の複雑さの見積もり

※なお、新規ファクトリが必要な場合は、複雑度が数段増すため要個別対応とする。

---

## ⏸️ ユーザー確認ポイント1

Phase 3の結果をユーザーに報告し、実装方針の合意を取る。

報告内容:

1. 作成/更新したYAMLファイルのパス
2. 選定したファクトリ
3. 選定したConditionChecker一覧
4. 選定したStepBuilder一覧
5. 新規実装が必要な要素（あれば）

**ユーザー承認後、Phase 4へ進む**

---

## Phase 4: 実装フェーズ

### 4.1 新規Checker/Builder追加（必要な場合のみ）

ConditionChecker追加:

1. `dsl/conditions/checkers/` に関数実装
2. `dsl/conditions/ConditionNames.ts` に名前登録
3. `dsl/conditions/index.ts` でエクスポート

StepBuilder追加:

1. `dsl/steps/builders/` に関数実装
2. `dsl/steps/StepNames.ts` に名前登録
3. `dsl/steps/index.ts` でエクスポート

### 4.2 YAML定義完成

Phase 2 で作成したYAMLファイルを更新する。

### 4.3 カード登録

`skeleton-app/src/lib/domain/cards/index.ts` にYAMLパスを登録

### 4.4 テスト・Lint実行

```bash
cd skeleton-app && npm run test:run && npm run lint && npm run format
```

---

## ⏸️ ユーザー確認ポイント2

実装完了後、ユーザーに報告する。

報告内容:

1. 作成/更新したファイル一覧
2. テスト・Lint結果
3. ブラウザでの動作確認依頼（`npm run dev`）

---

## エラーハンドリング

| エラー             | 対応                             |
| ------------------ | -------------------------------- |
| URL取得失敗        | URLの確認を依頼、手動入力を提案  |
| API検索失敗        | 英語名のスペル確認を依頼         |
| 既存実装で対応不可 | 設計案を提示しユーザーと合意形成 |
| テスト失敗         | エラー内容を報告し修正           |
