# データモデル設計

## 概要

YGO Solitaire のデータモデルは、Clean Architecture の3層構造で設計されています。

- **Domain Layer**: ゲームロジック用の最小限のカードデータ
- **Application Layer**: データ変換とAPI統合
- **Presentation Layer**: UI表示用の完全なカードデータ

---

## Domain Layer

### `DomainCardData`

ゲーム状態管理に必要な最小限のカード情報のみを保持。

**主要プロパティ**:
- `id: number` - YGOPRODeck API互換のカードID
- `type: SimpleCardType` - カード種別 ("monster" | "spell" | "trap")
- `frameType?: string` - 効果判定用（例: "effect", "fusion"）
- `spellType?: SpellSubType` - 魔法カード詳細種別
- `trapType?: TrapSubType` - 罠カード詳細種別

**設計原則**:
- ゲームロジックに必要なプロパティのみ
- 数値IDでAPI互換性を確保
- 型安全性による厳密な型チェック

**ファイル**: `src/lib/domain/models/Card.ts`

---

## Presentation Layer

### `CardDisplayData`

UI表示に必要な全情報を含むカードデータ。

**主要プロパティ**:
- 基本情報: `id`, `name`, `type`, `description`
- モンスター属性: `monsterAttributes` (攻撃力、守備力、レベル等)
- 画像: `images` (通常サイズ、小サイズ、クロップ)
- その他: `frameType`, `archetype`

**ファイル**: `src/lib/application/types/card.ts` (Application Layerで定義し、Presentation Layerで再エクスポート)

---

## Application Layer

### データ変換

**`convertToCardDisplayData()`**

YGOPRODeck APIレスポンス → `CardDisplayData` への変換。

**処理内容**:
- API型からアプリケーション型への変換
- モンスターカードの属性抽出
- 画像URL構造の整形
- デフォルト値の設定

### API統合

**`getCardsByIds()`**

複数カードIDから一括でカードデータを取得。

**特徴**:
- バッチリクエスト対応（N回 → 1回のAPIリクエスト）
- メモリキャッシュ（セッション単位）
- エラーハンドリング

**実装**: `src/lib/infrastructure/api/ygoprodeck.ts`

### デッキローダー

**`loadDeckData()`**

デッキレシピからカードデータを読み込み、DomainCardDataとCardDisplayDataを生成。

**処理フロー**:
1. デッキレシピ取得
2. カードID一覧抽出
3. API経由でカードデータ取得（バッチ+キャッシュ）
4. DomainCardData配列生成
5. CardDisplayData配列生成

**実装**: `src/lib/application/utils/deckLoader.ts`

---

## YGOPRODeck API

### API仕様

- **Base URL**: `https://db.ygoprodeck.com/api/v7`
- **Rate Limit**: 20 requests/second
- **Endpoint**: `cardinfo.php?id=<id1>,<id2>,...`

### キャッシング戦略

- **スコープ**: セッション単位（ページリロードまで）
- **実装**: メモリキャッシュ (`Map<number, YGOProDeckCard>`)
- **効果**: 重複APIリクエスト防止、レスポンス時間短縮

---

## 型の互換性と移行戦略

### 段階的移行

プロジェクトは以下の3フェーズで型を移行しました。

**Phase 1: Domain Layer** (T023-T025)
- GameState/Rules を DomainCardData に移行
- 文字列ID → 数値IDへの変換

**Phase 2: UI/Application Layer** (T043-T046)
- 全UIコンポーネントを CardDisplayData に移行

**Phase 3: 旧型削除** (T059-T060)
- 非推奨型のクリーンアップ

### 後方互換性

移行期間中は型エイリアスで後方互換性を維持:

```typescript
/**
 * @deprecated Use DomainCardData instead
 */
export type Card = DomainCardData;
```

---

## テスト戦略

### 単体テスト

- **Domain Layer**: 型ガード関数 (`isDomainCardData`, `isDomainMonsterCard`)
- **Application Layer**: データ変換関数、デッキローダー
- **Presentation Layer**: CardDisplayDataの型検証

### E2Eテスト

- デッキローディング
- カード表示
- API統合

### カバレッジ

- **単体テスト**: 239テスト（全パス）
- **型チェック**: TypeScript strict mode
- **リンター**: ESLint + Prettier

---

## 参考資料

### 関連ドキュメント

- **アーキテクチャ概要**: [docs/architecture/overview.md](./overview.md)
- **仕様書**: `specs/002-data-model-refactoring/spec.md`
- **実装計画**: `specs/002-data-model-refactoring/plan.md`

### 外部API

- **YGOPRODeck API**: https://db.ygoprodeck.com/api-guide/

### コードベース

- **Domain Layer**: `src/lib/domain/models/Card.ts`
- **Application Layer**: `src/lib/application/types/`, `src/lib/application/utils/`
- **Infrastructure Layer**: `src/lib/infrastructure/api/ygoprodeck.ts`
- **Presentation Layer**: `src/lib/presentation/types/`

---

## まとめ

YGO Solitaire のデータモデルは、Clean Architecture の3層構造により以下を実現しています:

1. **明確な責務分離**: Domain/Application/Presentation の各層が独立
2. **型安全性**: TypeScript による厳密な型チェック
3. **API互換性**: YGOPRODeck API とのシームレスな統合
4. **段階的移行**: 既存コードへの影響を最小化
5. **パフォーマンス**: バッチリクエストとキャッシング戦略

この設計により、保守性・拡張性・テスタビリティの高いコードベースを実現しています。
