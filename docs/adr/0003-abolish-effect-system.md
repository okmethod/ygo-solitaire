# ADR-0003: Effect System廃止とCommand Pattern統一

## Status
✅ Accepted (2024-11-24)

## Context

Clean Architectureリファクタリング（specs/001）のPhase 4において、旧Effect Systemの移行方針を決定する必要がありました：

### 旧Effect Systemの構造

```typescript
// 旧システム: DuelState（mutableクラス）に依存
abstract class BaseEffect implements Effect {
  abstract canActivate(state: DuelState): boolean;
  abstract execute(state: DuelState): Promise<EffectResult>;
}

class PotOfGreedEffect extends BaseEffect {
  execute(state: DuelState): Promise<EffectResult> {
    // DuelStateのメソッドを直接呼び出し
    state.drawCard();
    state.drawCard();
    return Promise.resolve({ success: true });
  }
}
```

### 問題点

1. **新アーキテクチャとの不整合**:
   - 新GameState: 不変（immutable interface）
   - 旧DuelState: 可変（mutable class）
   - 両者は根本的に互換性がない

2. **重複した責務**:
   - Command Pattern: `DrawCardCommand`, `ActivateSpellCommand`
   - Effect System: `PotOfGreedEffect`, `GracefulCharityEffect`
   - 同じ処理を2つの方法で実装している

3. **複雑性の増加**:
   - 15ファイル、約2,000行のEffect System
   - 継承階層: `BaseEffect` → `BaseMagicEffect` → `DrawEffect` → `PotOfGreedEffect`
   - 保守コストが高い

## Decision

**Effect Systemを完全に廃止し、Command Patternに統一する**

### Phase 4をスキップする理由

当初の計画ではPhase 4で「Effect SystemをGameStateに移行」する予定でしたが、以下の理由でスキップを決定：

1. **ユーザー要求**: "後方互換性は考えなくても良い。出来上がるコードが最もシンプルになるようにしてほしい"
2. **Command Patternで十分**: 既に実装済みのCommandで全機能をカバー可能
3. **コード削減**: 3,839行削除によるメンテナンス負荷軽減

### 新しい実装方法

```typescript
// ✅ 新システム: Commandパターンのみ
class ActivateSpellCommand extends GameCommand {
  constructor(private cardId: string) {}

  execute(state: GameState): GameState {
    return produce(state, draft => {
      // カード固有のロジックはここに直接実装
      if (cardId === 'pot-of-greed') {
        // 2枚ドロー
        for (let i = 0; i < 2; i++) {
          const card = draft.zones.deck.shift();
          if (card) draft.zones.hand.push(card);
        }
      }
      // 墓地送り
      moveCardToGraveyard(draft, cardId);
    });
  }
}
```

## Consequences

### Positive

✅ **大幅なコード削減**
- 削除: 24ファイル、3,839行
  - DuelState.ts + tests (3ファイル)
  - Effect System全体 (15ファイル)
  - 旧simulator UI (2ファイル)
  - GameStateAdapter + test (2ファイル)
  - 旧型定義 (2ファイル)

✅ **設計のシンプル化**
- 単一の責任モデル（Commandのみ）
- 継承階層の排除
- 学習コストの削減

✅ **テスト数の最適化**
- 319 tests → 204 tests
- 削除された115テストは旧Effect Systemのもの
- 新アーキテクチャのテストは100%維持

✅ **拡張性の維持**
- 新しいカード追加時: 新しいCommandを追加
- 既存コードへの影響: ゼロ

### Negative

❌ **カード固有ロジックの分散**
- 効果ロジックがCommand内に埋め込まれる
- 将来的にカード数が増えると、`ActivateSpellCommand`が肥大化する可能性

**対策**: 将来的にカード種類が大幅に増えた場合は、以下を検討：
- Strategy Patternの導入
- カード効果を外部モジュール化

❌ **旧Effect Systemの知見喪失**
- 15ファイル分の実装パターンを完全削除
- 将来同様のシステムが必要になった場合、再設計が必要

**対策**:
- このADRで設計判断を記録
- Git履歴で旧実装を参照可能

### Neutral

⚖️ **パフォーマンスへの影響**
- 旧システム: クラス継承によるメソッド呼び出し
- 新システム: 直接実装
- 実測: 体感差なし

## Alternatives Considered

### Alternative 1: Effect SystemをGameStateに移行（当初計画）

```typescript
// 却下された案
abstract class BaseEffect {
  abstract execute(state: GameState): GameState;
}

class PotOfGreedEffect extends BaseEffect {
  execute(state: GameState): GameState {
    return produce(state, draft => {
      // ドロー処理
    });
  }
}
```

**却下理由**:
- Command Patternと責務が重複
- 15ファイルを移行する工数 vs 削除する判断
- ユーザー要求（シンプルさ優先）

### Alternative 2: HybridアプローチComman + Effect併用）

```typescript
class ActivateSpellCommand extends GameCommand {
  execute(state: GameState): GameState {
    const effect = EffectRegistry.get(this.cardId);
    return effect.execute(state);
  }
}
```

**却下理由**:
- 2つのパターンを維持する複雑さ
- 責務の境界が不明確
- シンプルさの喪失

## Implementation

### 削除されたファイル一覧

```
src/lib/classes/
├── DuelState.ts
├── __tests__/
│   ├── DuelState.test.ts
│   └── DuelState.effect.test.ts
└── effects/
    ├── EffectRepository.ts
    ├── CardEffectRegistrar.ts
    ├── bases/
    │   ├── BaseEffect.ts
    │   └── BaseMagicEffect.ts
    ├── primitives/
    │   ├── DrawEffect.ts
    │   └── DiscardEffect.ts
    ├── cards/
    │   ├── cardEffects.ts
    │   └── magic/normal/*.ts (10ファイル)
    └── __tests__/ (3ファイル)

src/lib/types/
├── effect.ts
└── duel.ts

src/routes/(auth)/simulator/ (2ファイル)

src/lib/presentation/adapters/
└── GameStateAdapter.ts + test
```

### 移行ステップ（実施済み）

1. ✅ T056: Effect System削除
2. ✅ T057: 旧simulator UI削除
3. ✅ T058: DuelState削除
4. ✅ T059: 旧型定義削除
5. ✅ T060: simulator-v2を公式simulatorにリネーム

## Validation

### テスト結果

```bash
# Unit Tests
npm run test:run
✓ 204 tests passing (down from 319)

# E2E Tests
npm run test:e2e
✓ 16 tests passing

# Linter
npm run lint
✓ All checks passed
```

### ブラウザ動作確認

```
http://localhost:5173/simulator/greedy-exodia-deck
✓ 正常動作確認済み
```

## Future Considerations

### カード数増加への対応

カードが50種類を超えた場合、以下を検討：

#### Option A: Strategy Pattern導入

```typescript
interface CardEffect {
  execute(state: GameState, card: Card): GameState;
}

class PotOfGreedEffect implements CardEffect {
  execute(state: GameState): GameState {
    return produce(state, draft => {
      // 2枚ドロー
    });
  }
}

// Registry
const CARD_EFFECTS: Record<string, CardEffect> = {
  'pot-of-greed': new PotOfGreedEffect(),
};
```

#### Option B: 関数ベース

```typescript
const CARD_EFFECTS: Record<string, (state: GameState) => GameState> = {
  'pot-of-greed': (state) => produce(state, draft => {
    // 2枚ドロー
  }),
};
```

**決定**: 必要になった時点で再検討（YAGNI原則）

## Update: Effect System の再導入 (2024-12-07)

### 現状

**ADR-0005により、Strategy Pattern based Effect Systemが再導入されました。**

- **参照**: [ADR-0005: Card Effect Strategy Pattern](./0005-card-effect-strategy-pattern.md)
- **理由**: カード数増加（ADR-0003の "Future Considerations" で予告）
- **実装**: PR #49 (spec/004-card-effect-execution)

### ADR-0003 vs ADR-0005 の違い

| 観点 | ADR-0003で廃止したEffect System | ADR-0005で再導入したEffect System |
|------|-------------------------------|--------------------------------|
| **基底状態モデル** | `DuelState` (mutable class) | `GameState` (immutable interface) |
| **アーキテクチャ適合** | ❌ Clean Architecture違反 | ✅ Clean Architecture遵守 |
| **責務の重複** | Command Patternと重複 | Strategy Pattern（Command内で使用） |
| **拡張性** | 継承階層複雑 | Open/Closed Principle遵守 |
| **実装コスト** | 15ファイル、2,000行 | 10ファイル、500行（効率化） |

### なぜ再導入したのか

1. **当初の予告どおり**: ADR-0003の "Future Considerations" でStrategy Patternを予告
2. **カード実装の増加**: 2カード実装時点でCommandの肥大化が顕在化
3. **Open/Closed Principle違反**: `ActivateSpellCommand`にif/else分岐が増加
4. **GameState対応**: 新Effect Systemは不変なGameStateに対応（旧システムの問題を解決）

### 結論

**ADR-0003の決定は正しかった。** 旧Effect System（DuelState依存）の削除により、GameState（immutable）への移行が可能になり、その基盤の上に新Effect System（Strategy Pattern）を構築できた。

**このADRは引き続き有効**: 「DuelState依存の旧Effect Systemを廃止した記録」として保存

## Related Documents

- [ADR-0001: Clean Architectureの採用](./0001-adopt-clean-architecture.md)
- [ADR-0002: Immer.jsによる不変性保証](./0002-use-immer-for-immutability.md)
- **[ADR-0005: Card Effect Strategy Pattern](./0005-card-effect-strategy-pattern.md)** ← 新Effect System
- [アーキテクチャ概要](../architecture/overview.md)
- [specs/001-architecture-refactoring/tasks.md](../../specs/001-architecture-refactoring/tasks.md)

## References

- Git commit: `db19f69` "refactor: 旧システム削除とClean Architecture完成"
- PR #46: Clean Architecture リファクタリング完了
- PR #49: Effect System再導入（Strategy Pattern）
- Discussion: Phase 4スキップの判断（セッション 2024-11-24）
