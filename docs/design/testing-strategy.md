# テスト戦略

テストピラミッドを意識し、低コストかつ効果的なテストを目指す。  
テスト構成は [architecture.md](./architecture.md) の 4 層構造を写し、テストシナリオは遊戯王の裁定（公式 Q&A・Wiki）を写す。  
テストの重心はドメイン層・アプリ層に置き、プレゼン層は smoke に絞る。

---

## テストピラミッドと層割り当て

| テスト層          | テスト対象                          | ツール     | 方針                               |
| ----------------- | ----------------------------------- | ---------- | ---------------------------------- |
| 下層: Unit        | Domain, Utils                       | Vitest     | コード網羅・多数・ダミーカード使用 |
| 中層: Integration | Application + Domain                | Vitest     | シナリオ・適量・実カード使用       |
| 上層: E2E         | Presentation + Application + Domain | Playwright | 厳選・少数・UI の振る舞いのみ      |

### Unit Tests - コード網羅・多数

**検証するもの**:

- 純粋関数のロジック（入力 → 出力）
- ドメインルール・共通基底クラスのバリエーション
- 状態不変性（GameState 更新後の整合性）

**検証しないもの**:

- レイヤー間の連携（→ Integration Test で検証）
- 副作用（Store 更新、API 呼び出し）（→ Integration Test で検証）
- カード固有の発動シナリオ（→ Integration Test で検証）

### Integration Tests - シナリオ・適量

**検証するもの**:

- レイヤー間の連携（Application → Domain）
- カード発動シナリオ（Command 実行 → Effect 解決 → Store 更新）
- 副作用の発生（effectQueueStore.beginSequence 呼び出し）
- 基本的なゲームフロー（ドロー → 発動 → 墓地送り）
- カード固有シナリオ（ドローカードでエクゾディアが揃い勝利判定、等）

**検証しないもの**:

- 個別関数のエッジケース（→ Unit Test で検証）
- UI 操作・ブラウザ動作（→ E2E Test で検証）

### E2E Tests - 厳選・少数

**検証するもの**:

- ユーザーの実際の操作フロー
- UI 表示・インタラクション
- ブラウザ固有の動作

**検証しないもの**:

- ドメインロジックの詳細（→ Unit Test で検証）
- 内部処理の分岐（→ Unit/Integration Test で検証）

---

## ディレクトリ構造

`tests/` は二重構造を持つ。  
外側の `unit / integration / e2e` はピラミッドの 3 段（テスト層）、その内側の `domain / application / infrastructure / shared` は [architecture.md](./architecture.md) の 4 層。

```
tests/
├── __testUtils__/        # ダミーカード・factory・共通ヘルパー
│
├── unit/                 # 下層: 各層の純粋ロジック（src/lib 配下の構成に準拠）
│   ├── domain/           #   ドメイン層（models / commands / effects / rules / cards / dsl）
│   ├── application/      #   アプリ層
│   ├── infrastructure/   #   インフラ層
│   └── shared/           #   ユーティリティ
│
├── integration/          # 中層: 複数層の連携
│   ├── basic-flows/      #   機構ごと（normal-summon / chain-confirmation / ...）
│   └── scenarios/        #   デッキごと（exodia-victory / library-combo / ...）
│
└── e2e/                  # 上層: UI 越しの振る舞い
    └── fixtures/         #   外部カード DB のモックデータ
```

**設計意図**:

- テストの目的が一目で区別できる（`npx vitest run tests/unit/` のように個別実行も可能）
- 別々のカバレッジ設定が可能
- src/lib 配下の構成と一致するため、テスト対象が明確
- どの層に置くか迷うテストは、設計境界が曖昧なサイン

---

## テストダブル

### ダミーカードと実カード

テストでは、ダミーカードと実カードの両方を使う。  
これらは、テスト用のカード ID 定数で二分されている。

**関連ファイル**: `tests/__testUtils__/constants.ts`

| 種別         | 定数              | 用途                             | 主な使用層                          |
| ------------ | ----------------- | -------------------------------- | ----------------------------------- |
| ダミーカード | `DUMMY_CARD_IDS`  | 種別だけを持つ架空カード（代役） | Unit（ルールそのものを検証）        |
| 実カード     | `ACTUAL_CARD_IDS` | 実在カードの ID（本物）          | Integration scenarios（裁定を検証） |

- Unit 層はダミーカードで叩く。確かめたいのは個々のカードの再現ではなく **ドメインのルール**（山札 0 枚でのドロー・墓地送りの状態更新など）であり、実在カードの複雑な効果はむしろ邪魔になるため。
- ダミーカードは「表示用テキスト／処理用の裁定」の分離（[card-model.md](./card-model.md)）における裁定側、つまり種別とルールだけを抜き出したもの。
- 実カードは scenarios で「検証したい本物」として登場する。同じ「カード」が下層では代役、上層では本物という二つの顔を持つ。
- 実カードのテストでは、期待値を **裁定** で書く。個別裁定（公式 Q&A・Wiki）は「この盤面なら、この処理が正しい」の記録＝テスト仕様書なので、発明せずそのまま写す。コメントに裁定・次行をアサーションにすると「ルールの解説」と「テストケース」が地続きになる。

```typescript
// 裁定：カウンターは上限3個。3個ある状態でさらに魔法を発動しても超えない
facade.activateSpell("goblin-1");
await flushEffectQueue();
expect(Card.Counter.get(library.stateOnField?.counters ?? [], "spell")).toBe(3); // 4にはならない
```

> カードの種別・分類そのものの定義は [game-rules/card.md](../game-rules/card.md) を参照。

### ユーザー操作の差し替えヘルパー

テストでは、任意効果は「発動しますか？」、チェーンは「積みますか？」、効果によっては「どのカードを？」などのユーザー操作をヘルパーで差し替える。

**関連ファイル**: `tests/__testUtils__/integrationHelpers.ts`

| ヘルパー                   | 対応する問い             | 確認用述語               |
| -------------------------- | ------------------------ | ------------------------ |
| `resolveOptionalTrigger`   | 任意誘発効果を発動するか | `hasOptionalTrigger()`   |
| `resolveChainConfirmation` | チェーンを積むか         | `hasChainConfirmation()` |
| `resolveCardSelection`     | どのカードを選ぶか       | `hasCardSelection()`     |

- `flushEffectQueue()` は、演出のため非同期で少しずつ進む効果キューをフェイクタイマーで一気に最後まで回し、interactive ステップの手前で止める。非同期の演出はそのままに、テストは決定論的に速く回す。

```typescript
facade.synchroSummon("formula");
await flushEffectQueue(); // 自動処理を最後まで流し、"問い" の手前で止まる

expect(hasOptionalTrigger()).toBe(true);
await resolveOptionalTrigger(true); // 「発動する」と即答する

expect(getState().space.hand.length).toBe(2);
```

### 外部カード DB のフィクスチャ

E2E では、カードの静的情報（名前・画像）を取得する外部カード DBを `page.route` でフィクスチャに差し替える。  
[architecture.md](./architecture.md) でインフラ層からのアクセスパターンを規定しており、差し替え口が 1 箇所にまとまっている。

**関連ファイル**: `tests/e2e/fixtures/`

```typescript
await page.route("**/api.ygoprodeck.com/api/v7/**", async (route) => {
  // あらかじめ用意したフィクスチャを返す
});
```
