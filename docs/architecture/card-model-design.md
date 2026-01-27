# Card モデル設計

## 概要

YGO Solitaire の Card モデルは、Clean Architecture の 3 層構造で設計されている:

- **Domain Layer**: ゲームロジックに必要な定義をハードコード
  - **CardData**: ゲームロジック用カードデータのモデル化と具体実装とレジストリ
- **Application Layer**: データ変換と 外部 API 統合
  - **convertToCardDisplayData**: YGOPRODeck API で取得した情報を統合
- **Presentation Layer**: UI 表示用の完全なカードデータ
  - **CardDisplayData**: 画像等を結合したカードデータのモデル

この 3 層構造により、以下を実現している:

1. **明確な責務分離**: Domain/Application/Presentation の各層が独立
2. **API 互換性**: YGOPRODeck API とのシームレスな統合
3. **パフォーマンス**: バッチリクエストとキャッシング戦略

この設計により、保守性・拡張性・テスタビリティの高いコードベースを実現している。

---

## Domain Layer

### `CardData`

ゲーム状態管理に必要な最小限のカード情報のみを保持。

**主要プロパティ**:

- `id: number` - YGOPRODeck API 互換のカード ID
- `type: SimpleCardType` - カード種別 ("monster" | "spell" | "trap")
- `frameType?: string` - 効果判定用（例: "effect", "fusion"）
- `spellType?: SpellSubType` - 魔法カード詳細種別
- `trapType?: TrapSubType` - 罠カード詳細種別

**設計原則**:

- ゲームロジックに必要なプロパティのみ
- 数値 ID で API 互換性を確保
- 型安全性による厳密な型チェック

**ファイル**: `src/lib/domain/models/Card.ts`

---

## Presentation Layer

### `CardDisplayData`

UI 表示に必要な全情報を含むカードデータ。

**主要プロパティ**:

- 基本情報: `id`, `name`, `type`, `description`
- モンスター属性: `monsterAttributes` (攻撃力、守備力、レベル等)
- 画像: `images` (通常サイズ、小サイズ、クロップ)
- その他: `frameType`, `archetype`

**ファイル**: `src/lib/presentation/types/card.ts` (Application Layer の定義を、Presentation Layer で再エクスポート)

---

## Application Layer

### データ変換

**`convertToCardDisplayData()`**

YGOPRODeck API レスポンス → `CardDisplayData` への変換。

**処理内容**:

- API 型からアプリケーション型への変換
- モンスターカードの属性抽出
- 画像 URL 構造の整形
- デフォルト値の設定

### API 統合

**`getCardsByIds()`**

複数カード ID から一括でカードデータを取得。

**特徴**:

- バッチリクエスト対応（N 回 → 1 回の API リクエスト）
- メモリキャッシュ（セッション単位）
- エラーハンドリング

**実装**: `src/lib/infrastructure/api/ygoprodeck.ts`

### デッキローダー

**`loadDeck()`**

デッキレシピからカードデータを読み込み、CardData と CardDisplayData を生成。

**処理フロー**:

1. デッキレシピ取得
2. カード ID 一覧抽出
3. API 経由でカードデータ取得（バッチ+キャッシュ）
4. CardData 配列生成
5. CardDisplayData 配列生成

**実装**: `src/lib/application/utils/deckLoader.ts`

---

## YGOPRODeck API

### API 仕様

- **Base URL**: `https://db.ygoprodeck.com/api/v7`
- **Rate Limit**: 20 requests/second
- **Endpoint**: `cardinfo.php?id=<id1>,<id2>,...`
- **HomePage**: https://db.ygoprodeck.com/api-guide/

### キャッシング戦略

- **スコープ**: セッション単位（ページリロードまで）
- **実装**: メモリキャッシュ (`Map<number, YGOProDeckCard>`)
- **効果**: 重複 API リクエスト防止、レスポンス時間短縮
