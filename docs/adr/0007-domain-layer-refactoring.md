# ADR-0007: Domain Layer Refactoring（型命名統一・Immer削除・Commands移管）

## Status

✅ Accepted (2024-12-27)

🔄 **Supersedes**: [ADR-0002: Immer.js による不変性保証](./0002-use-immer-for-immutability.md)

## Context

ドメインドキュメント（`docs/domain/`）の刷新に伴い、コードベースとの整合性を見直しました：

1. **型命名の不一致**: ドキュメントでは「Card Data (カードデータ)」と記載されているが、コードでは`DomainCardData`という名前で定義されている
2. **不要な外部依存**: Immer.js を使用しているが、GameState のネスト構造は浅く、spread構文で十分対応可能
3. **アーキテクチャの不整合**: Commands と CardEffectRegistry が`application/`層に配置されているが、これらはドメインロジックであり、Clean Architecture的には`domain/`層に属すべき

### 従来の問題

```typescript
// 問題1: 型名がドキュメントと不一致
import type { DomainCardData } from "$lib/domain/models/Card";
// ドキュメント: "Card Data (カードデータ)" ← 接頭辞なし

// 問題2: Immer.jsへの不要な依存
import { produce } from "immer";
const newState = produce(state, (draft) => {
  draft.zones = newZones as typeof draft.zones;  // 型キャストが必要
});

// 問題3: Commandsがapplication層に配置
import { DrawCardCommand } from "$lib/application/commands/DrawCardCommand";
// ← ドメインロジックなのにApplication層
```

## Decision

以下の3つのリファクタリングを実施し、コードベースをドキュメントとClean Architectureに準拠させる：

### 1. 型命名の統一

**`DomainCardData` → `CardData`に変更**

```typescript
// Before
export interface DomainCardData {
  readonly id: number;
  readonly type: SimpleCardType;
  ...
}

// After
export interface CardData {
  readonly id: number;
  readonly type: SimpleCardType;
  ...
}
```

### 2. Immer依存の削除

**すべてのCommandsでImmer.jsの`produce()`を削除し、spread構文に統一**

```typescript
// Before
import { produce } from "immer";

execute(state: GameState): CommandResult {
  const newState = produce(state, (draft) => {
    draft.zones = newZones as typeof draft.zones;
  });
  return { success: true, newState };
}

// After
execute(state: GameState): CommandResult {
  const newState: GameState = {
    ...state,
    zones: newZones,
  };
  return { success: true, newState };
}
```

### 3. Commands/Effects のDomain層移管

**`application/commands/` → `domain/commands/`へファイル移動**

```bash
# 移動したファイル
- GameCommand.ts
- DrawCardCommand.ts
- DiscardCardsCommand.ts
- ActivateSpellCommand.ts
- AdvancePhaseCommand.ts
- ShuffleDeckCommand.ts
- CardEffectRegistry.ts (application/effects/ → domain/effects/)
```

## Consequences

### Positive

✅ **ドキュメントとコードの一貫性向上**

- 型名がドキュメント用語と完全一致（`CardData`）
- 開発者がドキュメントとコードを相互参照しやすい

✅ **外部依存の削減**

- `package.json`から`immer`を削除（約14KB削減）
- ビルドサイズの軽量化

✅ **コードの明確性向上**

- spread構文により、何が変更されるかが明示的
- Zone.ts の純粋関数パターンと統一

✅ **Clean Architecture準拠**

- Commands と CardEffectRegistry がDomain層に配置
- 層間の境界が明確化
- ドメインロジックがUI依存から完全に独立

✅ **保守性の向上**

- ファイル構造が論理的（ドメインロジック = Domain層）
- テストファイルも同様に再配置（`tests/unit/domain/commands/`）

### Negative

❌ **一時的な学習コスト**

- Immer.jsからspread構文へのパターン変更
- 既存コードのリファクタリング工数
- トレードオフ: 長期的な保守性向上と比較して許容範囲

### Neutral

⚖️ **GameStateのネスト構造の制約**

- spread構文が有効なのは、ネストが浅い（2-3層）場合のみ
- 現状: GameStateは最大2層（`state.zones.hand`等）で問題なし
- 将来的にネストが深くなる場合は再検討が必要

## Alternatives Considered

### Alternative 1: Immer.jsを維持

```typescript
// 現状維持
import { produce } from "immer";
```

- **却下理由**:
  - GameStateのネストは浅く、Immerのメリットが限定的
  - 外部依存を減らすことで、ビルドサイズと学習コストを削減
  - Zone.ts は既にspread構文で実装済み（`moveCard`, `sendToGraveyard`等）

### Alternative 2: 型名を `GameCardData` に変更

- **却下理由**:
  - ドキュメントに存在しない用語
  - 目的は「ドキュメントとコードの一致」なので、ドキュメント用語に合わせる

### Alternative 3: Commands をApplication層に残す

- **却下理由**:
  - Commands はドメインロジック（ゲームルールの実装）
  - Clean Architecture では、ドメインロジックはDomain層に配置
  - Application層はユースケース（GameFacade）のみに限定すべき

### Alternative 4: 効果システムも完全にDomain層に移管

- **延期理由**:
  - `EffectResolutionStep.action`がSvelte storeを直接操作（Presentation層依存）
  - これを解消するには効果システム全体の再設計が必要
  - リスク管理: 大規模変更を分離し、次のSpecで扱う

## Implementation Notes

### 実装フェーズ

**Phase 1: 型命名の統一**
- `DomainCardData` → `CardData`
- すべてのimport文を更新
- 型ガード関数も更新（`isDomainCardData` → `isCardData`）

**Phase 2: Immer依存の削除**
- 各Commandで`produce()`をspread構文に置き換え
- `package.json`から`immer`をuninstall
- テストで不変性を検証

**Phase 3: Commands/Effects のDomain層移管**
- `git mv`でファイル移動（履歴保持）
- TypeScriptコンパイラでimportエラーを検出
- すべてのimport文を更新

### 影響範囲

- 変更ファイル数: 約30ファイル（import文の更新）
- 移動ファイル数: 7ファイル（Commands × 6 + CardEffectRegistry × 1）
- テスト: 既存テストがすべてパス（100%）

### パターン例

#### Spread構文による不変更新

```typescript
// Pattern 1: トップレベルプロパティ更新（最も頻繁）
const newState: GameState = {
  ...state,
  zones: newZones,  // Zone.tsの純粋関数で生成
};

// Pattern 2: ネストされたオブジェクト更新（稀）
const newState: GameState = {
  ...state,
  lp: {
    ...state.lp,
    player: state.lp.player - damage,
  },
};

// Pattern 3: 配列要素の追加/削除（Chain stackなど）
const newState: GameState = {
  ...state,
  chainStack: [...state.chainStack, newChainBlock],
};
```

## Validation

### テストケース

すべての既存テストがパスすることを確認：

```bash
npm run test:run      # すべてのテスト実行
npm run check         # TypeScriptコンパイル
npm run lint          # ESLint
npm run build         # ビルド確認
```

### 不変性の検証

```typescript
describe("Immutability without Immer", () => {
  it("should not mutate original state", () => {
    const originalState = createInitialState();
    const command = new DrawCardCommand(1);

    const result = command.execute(originalState);

    expect(originalState.zones.hand.length).toBe(0); // 元の状態は不変
    expect(result.newState.zones.hand.length).toBe(1);
    expect(result.newState).not.toBe(originalState); // 参照が異なる
  });
});
```

## Related Documents

- [ADR-0001: Clean Architecture の採用](./0001-adopt-clean-architecture.md)
- [ADR-0002: Immer.js による不変性保証](./0002-use-immer-for-immutability.md) ← **Superseded by this ADR**
- [ADR-0006: 4層Clean Architectureの確立](./0006-four-layer-clean-architecture.md)
- [アーキテクチャ概要](../architecture/overview.md)
- [ドメインドキュメント](../domain/overview.md)

## References

- [specs/007-domain-refactor/spec.md](../../specs/007-domain-refactor/spec.md)
- [specs/007-domain-refactor/tasks.md](../../specs/007-domain-refactor/tasks.md)
- [specs/007-domain-refactor/research.md](../../specs/007-domain-refactor/research.md)

## Future Work

次のSpecで対応予定：

1. **効果システムのPresentation層依存削除**
   - `EffectResolutionStep.action`をDomain層の純粋関数に変更
   - GameFacadeがEffect結果を受け取り、Svelte storeを更新

2. **ドメインドキュメントの継続的な更新**
   - コードとドキュメントの一貫性を保つプロセスの確立
