# Card モデル設計

## 概要

YGO Solitaire の Card モデルは、Clean Architecture の 4 層構造で設計されている:

- **Domain Layer**: ゲームロジックに必要なカード定義（ハードコード）とインスタンス
- **Application Layer**: DTO、ポート定義
- **Infrastructure Layer**: 外部 API との通信
- **Presentation Layer**: UI 表示用のデータとコンポーネント

この 4 層構造により、以下を実現している:

1. **明確な責務分離**: 各層が独立し単方向依存
2. **API 互換性**: YGOPRODeck API とのシームレスな統合
3. **テスタビリティ**: ポートによる DI でモック実装が容易

ドメイン知識（カードタイプ、プロパティ等）については [カードモデル](../domain/card-model.md) を参照。

---

## データフロー

```
[デッキ選択]
    ↓
[deckLoader] → CardDataRegistry から CardData 取得
    ↓
[gameStateStore] → CardInstance 生成・状態管理
    ↓
[cardDisplayDataCache] → YGOPRODeck API で表示データ取得
    ↓
[Card.svelte] → UI コンポーネント表示
```

---

## Domain Layer

### 型・インターフェース

- **`CardData`**: 「カード1種類」を表現するモデル
  - 主要プロパティ:
    - カードID
    - カード名（日本語版）
    - カードタイプ
    - 各種ステータス（ATK/DEF、属性、種族、等）
  - 実装コード: `domain/models/Card/CardData.ts`
- **`CardInstance`**: 「カード1枚」を表現するモデル
  - 主要プロパティ:
    - CardData継承
    - インスタンスID
    - カード位置
    - フィールド上での状態
  - 実装コード: `domain/models/Card/CardInstance.ts`

### 機能・クラス

- **`CardDataRegistry`**: CardID → CardData のマッピングを一元管理するレジストリ
  - 設計意図:
    - Registry Pattern による一元管理
    - Map による O(1) 高速ルックアップ
    - ドメイン層をインフラ層（YGOPRODeck API）から分離
  - 実装コード: `domain/cards/CardDataRegistry.ts`

---

## Application Layer

### 型・インターフェース

- **Port**: インフラ層が実装すべき抽象インターフェース（契約）の定義
  - **`ExternalCardData`** : 外部APIにより取得するデータの型
    - 主要プロパティ:
      - カードID
      - カード名（英語版）
      - カードテキスト（英語版）
      - カード画像URL
  - **ICardDataRepository**: カード情報取得クラスの抽象インターフェース
    - 設計意図:
      - Port/Adapter パターンの Port (抽象/契約定義)
  - 実装コード: `application/ports/ICardDataRepository.ts`
- **DTO（Data Transfer Object）** : 各層のデータをつなぐデータ形式
  - **`CardDisplayData`**: UI 表示用（ドメイン層 + インフラ層の統合）
    - 主要プロパティ:
      - カードID
      - カード名（日本語版）
      - カード名（英語版）
      - 各種ステータス（ATK/DEF、属性、種族、等）
      - カードテキスト（英語版）
      - カード画像URL
  - **`CardInstanceRef`**: カード参照（全般）
    - 主要プロパティ:
      - カードID
      - インスタンスID
  - **`CardDisplayStateOnField`**: カード参照（フィールド上用）
    - 主要プロパティ:
      - CardInstanceRef継承
      - フィールド上での状態
  - 実装コード: `application/types/card.ts`

### 機能・クラス

- **`CardDisplayDataFactory`**: CardData を DTO に変換するファクトリ
  - 実装コード: `application/factories/CardDisplayDataFactory.ts`
- **`CardInstanceFactory`**: CardInstance を DTO に変換するファクトリ
  - 実装コード: `application/factories/CardInstanceFactory.ts`
- **`deckLoader`**: プリセットデッキ一覧からデッキレシピを選択し、デッキデータを構築する関数
  - 実装コード: `application/decks/deckLoader.ts`
- **`gameStateStore`**: ゲーム状態を Svelte writable store で管理するストア
  - 実装コード: `application/stores/gameStateStore.ts`

---

## Infrastructure Layer

### 型・インターフェース

- **`YGOProDeckCardInfo`**: YGOProDeck APIレスポンスのスキーマ定義
  - 実装コード: `infrastructure/api/ygoprodeck.ts`

### 機能・クラス

- **`YGOProDeckCardDataRepository`**: YGOPRODeck API によるカード情報取得クラスの具象実装
  - 設計意図:
    - Port/Adapter パターンの Adapter (具象実装)
    - Singleton パターンによる単一インスタンス共有
    - 後述の YGOPRODeck APIクライアントを内部利用
  - 実装コード: `infrastructure/adapters/YGOProDeckCardDataRepository.ts`
- **YGOPRODeck API クライアント**: YGOPRODeck API v7 との HTTP 通信
  - 設計意図:
    - Zod によるレスポンス検証
    - メモリキャッシュ（キャッシュヒット/ミスを分離）
  - API 仕様:
    - Base URL: `https://db.ygoprodeck.com/api/v7`
    - Rate Limit: 20 requests/second
    - Endpoint: `cardinfo.php?id=<id1>,<id2>,...`
    - HomePage: https://db.ygoprodeck.com/api-guide/
  - 実装コード: `infrastructure/api/ygoprodeck.ts`

---

## Presentation Layer

### 型・インターフェース

- **`CardInstanceDisplayInfo`**: 表示用カードインスタンス
  - 主要プロパティ:
    - instanceId
    - CardDisplayData
- **`FieldCardDisplayInfo`**: 表示用カードインスタンス（フィールド用）
  - 主要プロパティ:
    - CardInstanceDisplayInfo継承
    - フィールド用
- **`AggregatedCard`**: 表示用カードインスタンス（集約表示用）
  - 主要プロパティ:
    - CardInstanceDisplayInfo継承
    - 枚数
- 実装コード: `presentation/types/card.ts`

### 機能・クラス

- **`cardDisplayDataCache`**: CardDisplayData のキャッシュサービス
  - 設計意図:
    - インフラ層の使用を局所化
  - 実装コード: `presentation/services/cardDisplayDataCache.ts`
- **`fieldCardAdapter`**: CardDisplayStateOnField を FieldCardDisplayInfo への変換するアダプタ
  - 実装コード: `presentation/services/fieldCardAdapter.ts`
