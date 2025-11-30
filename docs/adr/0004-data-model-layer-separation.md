# ADR 0004: データモデルのレイヤー分離戦略

## ステータス

Accepted

## コンテキスト

遊戯王シミュレーターアプリケーションでは、カードデータを複数のレイヤーで扱う必要がある：

1. **Domain Layer（ゲームロジック）**: ルール処理、勝利判定、カード移動などの純粋なゲームロジック
2. **Presentation Layer（UI表示）**: カード画像、詳細情報、デッキレシピの表示
3. **API Integration（外部データ取得）**: YGOPRODeck APIからのカードデータ取得

当初の実装では、すべてのレイヤーで単一の`Card`型を使用していたが、以下の問題が発生していた：

- UIコンポーネントがゲームロジックに不要な表示データ（画像URL、説明文など）を含む肥大化した型に依存
- テスト時にYGOPRODeck APIへのネットワークアクセスが必要（ユニットテストの独立性欠如）
- カードID形式がstring/number混在で型安全性が低い
- レイヤー間の責務が不明確

## 決定事項

### 1. 3層のカード型定義

#### Domain Layer: `DomainCardData`

```typescript
export interface DomainCardData {
  readonly id: number; // YGOPRODeck API互換の数値ID
  readonly type: SimpleCardType; // "monster" | "spell" | "trap"
  readonly frameType?: string; // "normal" | "effect" など
}
```

**用途**: ゲームロジック（GameState, Rule implementations）
**利点**:
- 最小限のプロパティでテストが容易
- ネットワーク不要でユニットテスト可能
- 純粋な関数型ロジックの実装を促進

#### Presentation Layer: `CardDisplayData`

```typescript
export interface CardDisplayData {
  id: number;
  name: string;
  type: CardType;
  description: string;
  frameType?: string;
  archetype?: string;
  monsterAttributes?: MonsterAttributes;
  images?: CardImages;
}
```

**用途**: UIコンポーネント、デッキレシピ表示
**利点**:
- UI表示に必要な全情報を含む
- 画像とモンスター属性を明示的な型で提供
- YGOPRODeck API形式と互換性あり

#### Type Alias: `Card`

```typescript
export type Card = CardDisplayData;
```

**用途**: 既存コードとの後方互換性維持
**移行戦略**: 新規コードでは`CardDisplayData`を直接使用、既存コードは`Card`エイリアスで継続動作

### 2. レイヤー間の変換規則

- **API → Presentation**: `convertToCardDisplayData()` を使用
- **Presentation → Domain**: 必要なプロパティ（id, type, frameType）のみ抽出
- **Domain内部**: `DomainCardData`のみを使用し、外部依存を排除

### 3. 段階的移行アプローチ

1. ✅ Phase 1-2: 基盤整備（型定義、API互換性確認）
2. ✅ Phase 3-4: Domain LayerとAPI統合の移行
3. ✅ Phase 5: Presentation Layerの移行（CardLike互換型経由）
4. ✅ Phase 7: 旧型定義の削除（Card型をエイリアスに変更）
5. ⏳ Phase 8: Polish（ドキュメント、JSDoc、ADR）

## 結果

### 達成された改善

1. **テスト独立性**: Domain Layerのユニットテストがネットワーク不要に（239テスト全て通過）
2. **型安全性**: カードIDを数値型に統一（YGOPRODeck API互換）
3. **責務分離**: 各レイヤーが必要最小限のデータのみ保持
4. **パフォーマンス**: メモリキャッシュでAPI呼び出しを最小化
5. **後方互換性**: `Card`型エイリアスで既存18ファイルが無変更で動作

### トレードオフ

- **追加の変換処理**: レイヤー間でデータ変換が必要
  - 対策: 変換関数を一箇所に集約（`ygoprodeck.ts`）
- **型定義の複雑化**: 3種類のカード型が存在
  - 対策: 明確な命名規則とJSDocドキュメント
- **移行コスト**: 全レイヤーの段階的更新が必要
  - 対策: CardLike互換型とCard型エイリアスで段階的移行

## 関連ドキュメント

- [データモデル設計書](../architecture/data-model-design.md)
- [Feature Spec](../../specs/002-data-model-refactoring/spec.md)
- [Tasks](../../specs/002-data-model-refactoring/tasks.md)

## 改訂履歴

- 2025-01-30: 初版作成（T070）
