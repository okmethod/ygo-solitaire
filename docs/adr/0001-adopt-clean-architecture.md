# ADR-0001: Clean Architecture の採用

## Status

✅ Accepted (2024-11-23)

## Context

遊戯王 1 ターンキルシミュレーターの開発において、以下の課題がありました：

1. **複雑なゲームロジック**: カードゲームのルールは複雑で、バグが発生しやすい
2. **テストの困難さ**: UI とロジックが密結合していると、単体テストが書きにくい
3. **拡張性の必要性**: 将来的に新しいデッキやカードを追加する際、既存コードへの影響を最小化したい
4. **フレームワーク依存**: Svelte に依存したコードは、ロジックの再利用が困難

## Decision

**Clean Architecture（3 層構造）を採用する**

### レイヤー構成

1. **Domain Layer**:

   - 純粋な TypeScript（フレームワーク非依存）
   - 不変な GameState と Rule クラス
   - 単体テスト可能

2. **Application Layer**:

   - Command パターンでユースケースをカプセル化
   - GameFacade で UI からの窓口を一本化
   - Svelte Stores で状態管理

3. **Presentation Layer**:
   - Svelte 5 Runes で宣言的 UI
   - Store を購読して自動更新
   - 表示ロジックのみを担当

### 依存関係の方向

```
Presentation → Application → Domain
    (UI)         (Commands)    (Rules)
```

**重要**: 依存は外側から内側への一方向のみ

## Consequences

### Positive

✅ **テスト容易性向上**

- Domain Layer を単体テスト可能（204 tests passing）
- UI なしでロジックを検証できる

✅ **変更への強さ**

- UI フレームワーク変更時も Domain Layer は影響なし
- カード追加時は新しい Command を追加するだけ

✅ **責任の明確化**

- 各レイヤーの役割が明確
- コードの可読性・保守性が向上

✅ **並行開発可能**

- Domain/Application/Presentation を別々に開発可能

### Negative

❌ **初期コスト増加**

- レイヤー分離のための初期設計コスト
- ボイラープレートコード増加

❌ **学習コスト**

- チームメンバーが Clean Architecture を理解する必要
- Command Pattern などの設計パターンの学習

### Neutral

⚖️ **ファイル数増加**

- 1 機能あたり 3 ファイル（Domain/Application/Presentation）
- トレードオフ: 検索性は向上、ディレクトリ構造は複雑化

## Alternatives Considered

### Alternative 1: MVC パターン

- **却下理由**: UI とロジックの分離が不十分
- **問題**: テストが困難、変更に弱い

### Alternative 2: フラットな構造

- **却下理由**: ファイル数増加に伴い管理困難
- **問題**: 責任の境界が不明確

### Alternative 3: Redux-like Store 中心設計

- **却下理由**: Svelte Stores で十分
- **問題**: 過度な抽象化によるオーバーヘッド

## Implementation Notes

### ディレクトリ構造

```
src/lib/
├── domain/         # Domain Layer
├── application/    # Application Layer
└── components/     # Presentation Layer
```

### 主要パターン

- **Command Pattern**: すべての操作をコマンド化
- **Strategy Pattern**: カード効果の交換可能な実装（将来拡張用）
- **Observer Pattern**: Svelte Stores による状態監視

## Related Documents

- [アーキテクチャ概要](../architecture/overview.md)
- [ADR-0002: Immer.js による不変性保証](./0002-use-immer-for-immutability.md)
- [ADR-0003: Effect System 廃止](./0003-abolish-effect-system.md)

## References

- Clean Architecture (Robert C. Martin)
- [specs/001-architecture-refactoring/plan.md](../../specs/001-architecture-refactoring/plan.md)
