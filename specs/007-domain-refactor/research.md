# Research: Domain Layer Refactoring

**Date**: 2025-12-22
**Researchers**: Claude Code Agent
**Context**: リファクタリングパターンと既存コード構造の調査

## Overview

このresearchでは、既存コードベースを分析し、ドメインドキュメントとの差分を特定し、リファクタリングパターンを決定する。

## Research Questions

1. 型命名の変更パターンは？ TypeScript全体でどう一貫させるか？
2. Immer削除時、不変性を保つspread構文のパターンは？
3. Commands移動時、import文の更新は自動化できるか？
4. 効果システムのPresentation層依存をどう扱うか？

---

## Q1: 型命名の変更パターン

### Decision: `DomainCardData` → `CardData`、ドキュメント用語と完全一致

**Rationale**:
- ドメインドキュメントでは「Card Data (カードデータ)」という用語を使用
- コードでは`DomainCardData`という名前で定義されている
- `Domain`プレフィックスは冗長（既にdomain/models/配下にある）
- シンプルな`CardData`にすることで、ドキュメントとコードの対応が明確になる

**Alternatives considered**:
1. `DomainCardData`のまま維持 → ドキュメントとの乖離が残る
2. `GameCardData` → ドメインドキュメントに存在しない用語
3. `CardData` →  ドキュメント用語と完全一致（採用）

**Implementation plan**:
```typescript
// Before
export interface DomainCardData { ... }

// After
export interface CardData { ... }
```

影響範囲:
- `domain/models/Card.ts`: 型定義
- `domain/data/cardDatabase.ts`: 使用箇所
- All import statements: `import type { DomainCardData }` → `import type { CardData }`

---

## Q2: Immer削除とspread構文パターン

### Decision: Zone.tsの純粋関数パターンを踏襲、全Commandsで採用

**Rationale**:
- Zone.tsは既にspread構文で実装済み（`moveCard`, `sendToGraveyard`等）
- GameStateのネストは浅い（zones, lp, phase, turn, chainStack, result）
- 95%のケースはトップレベルプロパティの更新のみ
- Immerは必須ではなく、外部依存を減らせる

**Alternatives considered**:
1. Immerを維持 → 外部依存が残る、学習コスト
2. spread構文に統一 → 一貫性、依存削減（採用）
3. Immutable.jsを導入 → 新たな依存追加、過剰

**Implementation patterns**:

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

**Validation**: 既存テストでCommandsの不変性を検証済み。Immer削除後もテストが100%パスすることを確認。

---

## Q3: Commands移動とimport文の更新

### Decision: git mvで移動、TypeScriptコンパイラで自動検出、手動修正

**Rationale**:
- `git mv`でファイル履歴を保持
- TypeScriptコンパイラがimport エラーを検出
- VSCodeの"Organize Imports"機能でパス更新可能
- 影響範囲は限定的（~30ファイル）

**Alternatives considered**:
1. jscodeshift等の自動リファクタリングツール → セットアップコスト高
2. 手動での移動とimport更新 → 確実だが時間がかかる
3. git mv + TypeScript エラー検出 → バランスが良い（採用）

**Implementation plan**:
```bash
# Step 1: ディレクトリ作成
mkdir -p skeleton-app/src/lib/domain/commands

# Step 2: ファイル移動（履歴保持）
cd skeleton-app/src/lib
git mv application/commands/GameCommand.ts domain/commands/
git mv application/commands/DrawCardCommand.ts domain/commands/
git mv application/commands/DiscardCardsCommand.ts domain/commands/
git mv application/commands/ActivateSpellCommand.ts domain/commands/
git mv application/commands/AdvancePhaseCommand.ts domain/commands/
git mv application/commands/ShuffleDeckCommand.ts domain/commands/

# Step 3: テストファイル移動
cd ../../../tests/unit
git mv application/commands domain/

# Step 4: CardEffectRegistry移動
cd ../../skeleton-app/src/lib
git mv application/effects/CardEffectRegistry.ts domain/effects/
git mv application/effects/index.ts domain/effects/  # Re-export用

# Step 5: TypeScriptビルドでimport エラー検出
cd ../../../
npm run check

# Step 6: import文を手動修正（VSCode Organize Imports使用）
# 例: GameFacade.ts
# Before: import { DrawCardCommand } from './commands/DrawCardCommand';
# After:  import { DrawCardCommand } from '$lib/domain/commands/DrawCardCommand';
```

**Validation**: `npm run build`と`npm run test:run`で検証。すべてのimportが解決され、テストがパスすることを確認。

---

## Q4: 効果システムのPresentation層依存

### Decision: 現状維持、次のSpecに延期

**Rationale**:
- `EffectResolutionStep`の`action`がSvelte storeを直接操作
- これを解消するには、効果システム全体の再設計が必要
- 本Specのスコープ外（型名変更、Immer削除、Commands移動）
- リスク管理: 大規模変更を分離し、段階的に進める

**Alternatives considered**:
1. 効果システムも含めて完全にDomain層に移管 → スコープ拡大、リスク増
2. 現状維持、次のSpecで扱う → 段階的、リスク低（採用）
3. EffectResolutionStepをApplication層に残す → 中途半端な状態

**Next steps** (次のSpecで扱う):
- EffectResolutionStepからSvelte store依存を削除
- Effect実行をDomain層の純粋関数に変更
- GameFacadeがEffect結果を受け取り、storeを更新

**Current architecture**:
```typescript
// domain/effects/EffectResolutionStep.ts
export interface EffectResolutionStep {
  id: string;
  title: string;
  message: string;
  action: () => void;  // ← Svelte storeを操作（Presentation層依存）
}

// application/effects/CardEffectRegistry.ts
// CardEffect.createSteps() が EffectResolutionStep を返す
```

**Target architecture** (次のSpec):
```typescript
// domain/effects/EffectResolutionStep.ts
export interface EffectResolutionStep {
  id: string;
  title: string;
  message: string;
  execute: (state: GameState) => CommandResult;  // ← 純粋関数に変更
}

// application/GameFacade.ts
// Effect結果を受け取り、Svelte storeを更新
```

---

## Constraints and Risk Mitigation

### Constraints
1. **既存テストの100%パス**: リファクタリング中も動作を保証
2. **段階的な実行**: 各フェーズで動作確認
3. **ドキュメント優先**: コードをドキュメントに合わせる（逆ではない）

### Risk Mitigation
1. **型名変更**: TypeScriptコンパイラで検出、テストで検証
2. **Immer削除**: 既存テストで不変性を検証
3. **Commands移動**: git mvで履歴保持、段階的にimport更新
4. **効果システム**: 次のSpecに延期、リスク分離

---

## Tools and Technologies

| Tool | Purpose | Version |
|------|---------|---------|
| TypeScript | 型チェック、import検出 | 5.x |
| Vitest | 単体テスト実行 | 1.x |
| ESLint | コード品質チェック | 8.x |
| Prettier | コードフォーマット | 3.x |
| git mv | ファイル移動（履歴保持） | - |

---

## Success Criteria (Research Phase)

- [x] 型命名パターンの決定
- [x] Immer削除パターンの決定
- [x] Commands移動手順の決定
- [x] 効果システムの扱いを決定（現状維持）
- [x] リスク軽減策の策定

---

## Next Steps

1. **Phase 1**: data-model.md作成（型定義の整理）
2. **Phase 1**: quickstart.md作成（リファクタリング手順）
3. **Phase 1**: agent context更新
4. **Phase 2**: tasks.md作成（タスク分解）
