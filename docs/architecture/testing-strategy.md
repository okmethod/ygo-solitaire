# テスト戦略

## 基本方針

テストピラミッドを意識し、低コストかつ効果的なテストを目指す。

| テストレイヤ | テスト対象                  | ツール     | 方針                               |
| ------------ | --------------------------- | ---------- | ---------------------------------- |
| Unit         | Domain, Utils               | Vitest     | コード網羅・多数・ダミーカード使用 |
| Integration  | Application + Domain, Store | Vitest     | シナリオ・適量・実カード使用       |
| E2E          | UI + Application + Domain   | Playwright | 厳選・少数・UIの振る舞いのみ       |

---

## ディレクトリ構造

```
tests/
├── __testUtils__/        # テスト用ユーティリティ
│
├── unit/                 # Unit Tests（src/lib配下の構成に準拠）
│   ├── domain/           # ドメイン層のテスト
│   ├── application/      # アプリ層のテスト
│   ├── infrastructure/   # インフラ層のテスト
│   └── presentation/     # プレゼン層のテスト
│
├── integration/          # Integration Tests
│   ├── basic-flows/      # 基本動作の統合テスト
│   └── scenarios/        # ゲーム進行管理の統合テスト
│
└── e2e/                  # E2E Tests
```

**メリット**:

- テストの目的が一目で区別できる
- `npx vitest run tests/unit/` のように個別実行可能
- 別々のカバレッジ設定が可能
- src/lib 配下の構成と一致するため、テスト対象が明確

---

## Vitest テスト (Unit + Integration)

**設定**: [vitest.config.ts](../../skeleton-app/vitest.config.ts)

**実行コマンド**:

```bash
npm test              # Unit + Integration (ウォッチモード)
npm run test:run      # 一回実行
npm run test:coverage # カバレッジ付き
npm run test:ui       # Vitest UI
```

### Unit Tests (コード網羅・多数)

**検証するもの**:

- 純粋関数のロジック（入力 → 出力）
- ドメインルール・共通基底クラスのバリエーション
- 状態不変性（GameState 更新後の整合性）

**検証しないもの**:

- レイヤー間の連携（→ Integration Test で検証）
- 副作用（Store 更新、API 呼び出し）（→ Integration Test で検証）
- カード固有の発動シナリオ（→ Integration Test で検証）

### Integration Tests (シナリオ・適量)

**検証するもの**:

- レイヤー間の連携（Application → Domain）
- カード発動シナリオ（Command 実行 → Effect 解決 → Store 更新）
- 副作用の発生（effectQueueStore.beginSequence 呼び出し）
- 基本的なゲームフロー（ドロー → 発動 → 墓地送り）
- カード固有シナリオ（ドローカードでエクゾディアが揃い勝利判定、等）

**検証しないもの**:

- 個別関数のエッジケース（→ Unit Test で検証）
- UI 操作・ブラウザ動作（→ E2E Test で検証）

---

## Playwright テスト (E2E)

**設定**: [playwright.config.ts](../../skeleton-app/playwright.config.ts)

**実行コマンド**:

```bash
npm run test:e2e        # E2E (Headlessモード)
npm run test:e2e:ui     # E2E UIモード
```

### E2E Tests (厳選・少数)

**検証するもの**:

- ユーザーの実際の操作フロー
- UI 表示・インタラクション
- ブラウザ固有の動作

**検証しないもの**:

- ドメインロジックの詳細（→ Unit Test で検証）
- 内部処理の分岐（→ Unit/Integration Test で検証）

---

## 関連ドキュメント

- [アーキテクチャ概要](./overview.md)
