# テスト戦略

## 基本方針

テストピラミッドを意識し、低コストかつ効果的なテストを目指す。

### Unit Tests (コード網羅・多数)

**ツール**: Vitest (`tests/unit/`)

**検証するもの**:

- 純粋関数のロジック（入力 → 出力）
- 共通基底クラスのバリデーション（SpellEffect, NormalSpellEffect）
- ドメインルール（VictoryRule, PhaseRule）
- 状態不変性（GameState 更新後の整合性）

**検証しないもの**:

- レイヤー間の連携（→ Integration Test で検証）
- 副作用（Store 更新、API 呼び出し）（→ Integration Test で検証）
- カード固有の発動シナリオ（→ Integration Test で検証）

### Integration Tests (シナリオ・適量)

**ツール**: Vitest (`tests/integration/`)

**検証するもの**:

- レイヤー間の連携（Application → Domain）
- カード発動シナリオ（Command 実行 → Effect 解決 → Store 更新）
- 副作用の発生（effectQueueStore.startProcessing 呼び出し）
- 実際のゲームフロー（ドロー → 発動 → 墓地送り）

**検証しないもの**:

- 個別関数のエッジケース（→ Unit Test で検証）
- UI 操作・ブラウザ動作（→ E2E Test で検証）

### E2E Tests (厳選・少数)

**ツール**: Playwright (`tests/e2e/`)

**検証するもの**:

- ユーザーの実際の操作フロー
- UI 表示・インタラクション
- ブラウザ固有の動作

**検証しないもの**:

- ドメインロジックの詳細（→ Unit Test で検証）
- 内部処理の分岐（→ Unit/Integration Test で検証）

---

## ディレクトリ構造

```
tests/
├── unit/                 # Unit Tests（src/lib配下の構成に準拠）
│   ├── domain/           # ドメイン層のテスト
│   ├── application/      # アプリ層のテスト
│   ├── infrastructure/   # インフラ層のテスト
│   └── presentation/     # プレゼン層のテスト
│
├── integration/          # Integration Tests
│   ├── card-effects/     # 固有カード効果のシナリオテスト
│   └── game-processing/  # ゲーム進行管理の統合テスト
│
└── e2e/                  # E2E Tests
    └── *.spec.ts         # Playwright E2E tests
```

**メリット**:

- テストの目的が一目で区別できる
- `npx vitest run tests/unit/` のように個別実行可能
- 別々のカバレッジ設定が可能
- src/lib 配下の構成と一致するため、テスト対象が明確

---

## Vitest テスト (Unit + Integration)

### 対象

- Domain Layer: Rules, Effects, Commands, Models
- Application Layer: Stores, Facade, Utils
- Presentation Layer: Stores, Components
- Infrastructure: API Client, Utilities

### カバレッジ目標

**Domain Layer**: 80%以上必須

設定: [vitest.config.ts](../../skeleton-app/vitest.config.ts)

### カード効果テストの責務分離

**Unit Tests**: 共通基底クラスを中心に検証

配置: `tests/unit/domain/effects/`

- **BaseSpellAction.test.ts**: ゲーム終了時の発動不可チェック、デフォルトの発動ステップ
- **NormalSpellAction.test.ts**: Main1 フェーズチェック (spellSpeed=1)
- **QuickPlaySpellAction.test.ts**: spellSpeed=2、Main1 フェーズチェック
- **FieldSpellAction.test.ts**: spellSpeed=1、Main1 フェーズチェック、空の発動ステップ
- **stepBuilders.test.ts**: プリミティブ処理のヘルパー関数（ドロー、墓地送り等）

**Integration Tests**: カード固有シナリオを検証

配置: `tests/integration/card-effects/`

- **NormalSpells.test.ts**: 各種通常魔法カードのシナリオテスト
- **QuickPlaySpells.test.ts**: 各種速攻魔法カードのシナリオテスト
- **FieldSpells.test.ts**: 各種フィールド魔法カードのシナリオテスト

**理由**:

- カード固有の`canActivate()`（例: `deck.length >= 2`）は実装の裏返しで価値が薄い
- 共通ルール（フェーズ制約、ゲームオーバーチェック）は抽象クラスのテストで保証
- シナリオベースのテストの方が実際のバグを検出しやすい
- カードタイプごとにファイル分割することで、1 ファイルあたりのテスト数を適切に保つ
- 新規カード追加時は統合テストにシナリオを追加するだけで完結

### モック戦略

- **Domain Layer**: モック不要（純粋関数のため実オブジェクトでテスト）
- **Application Layer**: `vi.spyOn()` で store をスパイ、`get(store)` で同期的に値取得
- **Presentation Layer**: Playwright の `route` で API/Toast 動作を検証

---

## E2E Tests (Playwright)

### 対象

- ブラウザ上での動作検証
- ユーザーの実際の操作フロー

### テストスイート構成

- **Phase Transition Flow**: フェーズ遷移の検証
- **Card Activation Flow**: カード発動フローの検証
- **Exodia Victory Flow**: 勝利条件判定の検証

設定: [playwright.config.ts](../../skeleton-app/playwright.config.ts)

---

## 実行コマンド

### 開発時

```bash
npm test              # Unit + Integration (ウォッチモード)
npm run test:run      # 一回実行
npm run test:coverage # カバレッジ付き
npm run test:ui       # Vitest UI

npm run test:e2e        # E2E (Headlessモード)
npm run test:e2e:ui     # E2E UIモード
```

### CI/CD

```bash
npm run test:run      # Unit + Integration
npm run test:e2e      # E2E
npm run test:coverage # カバレッジレポート生成
```

---

## 今後の課題

- [ ] Visual Regression Testing (Playwright スクリーンショット比較)
- [ ] Performance Testing (Lighthouse CI)
- [ ] Mutation Testing (Stryker)

## 関連ドキュメント

- [アーキテクチャ概要](./overview.md)
