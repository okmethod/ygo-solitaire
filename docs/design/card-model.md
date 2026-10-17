# Card モデル設計

遊戯王の「カード」は、ルール裁定に使う値・表示用のテキストや画像・ゲーム内に実在する 1 枚と、用途によって必要な情報が異なる。  
これらを 1 つのオブジェクトに混ぜず、用途ごとに別のモデルへ分けて表現する。

---

## 2 つの軸と 4 つのモデル

カードモデルは直交する 2 つの軸で構成される。

- **定義 ↔ 実体**（横軸）: 1 カード種の定義を、ゲーム内の N 枚（実体）が共有する。定義／実体の概念そのものは [カードの種類](../game-rules/card.md) を参照。
- **裁定 ↔ 表示**（縦軸）: ゲームロジックが参照する裁定データと、ゲーム進行に影響しない表示用 DTO（Data Transfer Object）。これは [architecture.md](./architecture.md) の「内側（ゲームロジック）と外側の境界」をカードに適用したもの。

交点に 4 つのモデルが並ぶ。

|                            | **定義**（カード 1 種）          | **実体**（ゲーム内 1 枚）             |
| -------------------------- | -------------------------------- | ------------------------------------- |
| **裁定**（ゲームロジック） | `CardData`（ドメイン層）         | `CardInstance`（ドメイン層）             |
| **表示**（DTO）            | `DisplayCardData`（アプリ層）    | `DisplayCardInstance`（プレゼン層）      |

この分離により、ゲームロジック（`CardData` / `CardInstance`）は表示に依存しない。
表示データの供給元（YGOPRODeck API）や UI を変更しても影響を受けず、ゲームロジック単体でテストできる。

---

## データフロー

デッキ選択から描画までの流れで、各モデルの生成と担当する層を示す。

1. **アプリ層** の `deckLoader` が、**ドメイン層** の `CardDataRegistry` から `CardData`（定義）を取得する
2. **アプリ層** の `gameStateStore` が、`CardData` から `CardInstance`（実体）を生成し、保持する
3. **プレゼン層** の `displayDataCache` が、**インフラ層** 経由で外部カードDB の表示データを取得する
4. **アプリ層** の `displayDataFactory` が、`CardData`（定義）と外部データを統合して `DisplayCardData`（表示用定義）を生成する
5. **プレゼン層** の `displayInstanceAdapter` が、`CardInstanceOnFieldRef`（実体の参照）に `DisplayCardData` を結合して `DisplayCardInstance`（表示用実体）を生成する
6. **プレゼン層** の `Card.svelte` が `DisplayCardInstance` を描画する

裁定データの経路（ドメイン層・アプリ層）と表示データの経路（インフラ層→アプリ層）は独立しており、プレゼン層で初めて合流する。

---

## CardData（定義）

ゲームロジックに必要なデータだけを持つ、「1 種類のカード」の定義を表す。  
カード ID・カードタイプ・各種ステータス（ATK/DEF・属性・種族など）を持つ。  
保持するプロパティの意味は [カードの種類](../game-rules/card.md) に従う。

- **`CardDataRegistry`**（ドメイン層）: Card ID → `CardData` のマッピングを一元管理するレジストリ
  - **設計意図**: Registry パターンで定義を一元管理し、`Map` で O(1) ルックアップする。ゲームロジックをインフラ層（外部カードDB）から切り離す起点となる
- **`deckLoader`**（アプリ層）: プリセットデッキのレシピを選択し、`CardDataRegistry` からデッキのカードデータを構築する

---

## CardInstance（実体）

ゲームロジックに必要なデータだけを持つ、「1 枚のカード実体」を表す。  
`CardData` の参照に加え、インスタンス ID・カードの位置・表示形式（表裏／攻守）を持つ。  
同じ種類のカードでも、別インスタンスとして個別に識別する。

- **参照 DTO**（アプリ層）: 層をまたいでインスタンスを指すための軽量な参照形式
  - **`CardInstanceRef`**: カード参照の基本形（カード ID + インスタンス ID）
  - **`CardInstanceOnFieldRef`**: フィールド上のカード参照。`CardInstanceRef` にフィールド上の状態を加える
- **`cardRefFactory`**（アプリ層）: `CardInstance` を参照 DTO へ変換するファクトリ

---

## DisplayCardData（表示用定義）

UI 表示用に、ドメイン層の裁定データ（`CardData`）とインフラ層の表示データ（`ExternalCardData`）を統合した DTO。  
カード ID・カード名（日本語／英語）・各種ステータス・カードテキスト（英語）・カード画像 URL を持つ。  
ドメイン層の `CardData` とは区別する。

- **`displayDataFactory`**（アプリ層）: `CardData`（裁定データ）と `ExternalCardData`（表示データ）を統合して `DisplayCardData` を生成するファクトリ

### 外部データの取得（Port / Adapter）

表示データの取得は Port/Adapter で抽象化し、ゲームロジックを供給元から隔離する。

- **`ICardDataRepository`**（アプリ層）: カード情報取得の抽象インターフェース（**Port**）
- **`ExternalCardData`**（アプリ層）: Port 経由で取得する外部由来データの型。カード ID・カード名（英語）・カードテキスト（英語）・カード画像 URL を持つ
- **`YGOProDeckCardDataRepository`**（インフラ層）: `ICardDataRepository` の具象実装（**Adapter**）。Singleton で単一インスタンスを共有し、内部で API クライアントを利用する
- **YGOPRODeck API クライアント**（インフラ層）: 外部 API との HTTP 通信。Zod でレスポンスを検証し、取得結果をメモリにキャッシュする（`YGOProDeckCardInfo` がレスポンススキーマ）
  - Base URL: `https://db.ygoprodeck.com/api/v7`
  - Endpoint: `cardinfo.php?id=<id1>,<id2>,...`
  - Rate Limit: 20 requests/second
  - API ガイド: https://db.ygoprodeck.com/api-guide/
- **`displayDataCache`**（プレゼン層）: `DisplayCardData` のキャッシュサービス。インフラ層の利用をこの 1 箇所に局所化する

---

## DisplayCardInstance（表示用実体）

`CardInstance` の表示版。  
`DisplayCardData` にインスタンス ID を組み合わせ、UI の表示単位とする。

- **`DisplayCardInstanceOnField`**（プレゼン層）: フィールド表示用。`DisplayCardInstance` にフィールド上の状態を加える
- **`DisplayCardInstanceAggregated`**（プレゼン層）: 集約表示用。`DisplayCardInstance` に枚数を加える（同種カードをまとめて表示する際に使う）
- **`displayInstanceAdapter`**（プレゼン層）: `CardInstanceOnFieldRef` を `DisplayCardInstanceOnField` へ変換するアダプタ
