# Quickstart: Domain Layer Refactoring

**Date**: 2025-12-22
**Purpose**: リファクタリング手順のステップバイステップガイド

## Prerequisites

- [x] ブランチ `007-domain-refactor` がチェックアウトされている
- [x] すべてのテストがパスしている (`npm run test:run`)
- [x] Lint/Formatエラーがない (`npm run lint`)
- [x] ドメインドキュメント (docs/domain/) が最新

## Overview

このリファクタリングは3つのフェーズに分けて実行します:

1. **Phase 1: 型命名の統一** (`DomainCardData` → `CardData`)
2. **Phase 2: Immer依存の削除** (spread構文への置き換え)
3. **Phase 3: Commands/Effects のDomain層移管** (ファイル移動)

各フェーズの後、必ずテストを実行して動作確認します。

---

## Phase 1: 型命名の統一

### 目的

ドメインドキュメントの用語とコードの型名を完全に一致させる。

### 手順

#### 1.1. Card.tsの型定義を変更

```bash
cd skeleton-app/src/lib/domain/models
```

**ファイル**: `Card.ts`

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

#### 1.2. すべてのimport文を更新

TypeScriptコンパイラでエラーを検出:

```bash
cd ../../../..  # プロジェクトルートに戻る
npm run check
```

エラーが出た箇所を順次修正:

```typescript
// Before
import type { DomainCardData } from "$lib/domain/models/Card";

// After
import type { CardData } from "$lib/domain/models/Card";
```

影響を受けるファイル:
- `domain/data/cardDatabase.ts`
- `domain/models/Card.ts` (type guards)
- その他、`DomainCardData`を参照しているすべてのファイル

#### 1.3. 型ガード関数の更新

**ファイル**: `domain/models/Card.ts`

```typescript
// Before
export function isDomainCardData(obj: unknown): obj is DomainCardData { ... }

// After
export function isCardData(obj: unknown): obj is CardData { ... }
```

#### 1.4. 動作確認

```bash
npm run check          # TypeScriptコンパイル
npm run lint           # ESLint
npm run test:run       # すべてのテスト実行
```

すべてパスすることを確認。

#### 1.5. Phase 1 コミット

```bash
git add -A
git commit -m "refactor: rename DomainCardData to CardData

- Align type names with domain documentation
- Update all import statements
- Rename type guards: isDomainCardData → isCardData

Relates to #007-domain-refactor"
```

---

## Phase 2: Immer依存の削除

### 目的

CommandsからImmer.jsを削除し、spread構文に統一する。

### 手順

#### 2.1. DrawCardCommandの更新

**ファイル**: `application/commands/DrawCardCommand.ts`

```typescript
// Before
import { produce } from "immer";

execute(state: GameState): CommandResult {
  ...
  const newState = produce(state, (draft) => {
    draft.zones = newZones as typeof draft.zones;
  });
  ...
}

// After
// import { produce } from "immer"; を削除

execute(state: GameState): CommandResult {
  ...
  const newState: GameState = {
    ...state,
    zones: newZones,
  };
  ...
}
```

#### 2.2. 他のCommandsも同様に更新

以下のファイルで同じパターンを適用:
- `DiscardCardsCommand.ts`
- `ActivateSpellCommand.ts`
- `AdvancePhaseCommand.ts`
- `ShuffleDeckCommand.ts`

#### 2.3. package.jsonからimmer削除

```bash
cd skeleton-app
npm uninstall immer
```

#### 2.4. すべてのimport文を検索

```bash
cd ..
grep -r "from \"immer\"" skeleton-app/src/
```

残っているimport文がないことを確認。

#### 2.5. 動作確認

```bash
npm run check          # TypeScriptコンパイル
npm run test:run       # すべてのテスト実行（不変性の検証含む）
npm run lint           # ESLint
```

#### 2.6. Phase 2 コミット

```bash
git add -A
git commit -m "refactor: remove Immer dependency, use spread syntax

- Replace produce() with spread syntax in all Commands
- Uninstall immer package
- Follow Zone.ts pure function pattern
- All tests pass, immutability preserved

Relates to #007-domain-refactor"
```

---

## Phase 3: Commands/Effects のDomain層移管

### 目的

Commands と CardEffectRegistry をDomain層に移動し、Clean Architectureに準拠させる。

### 手順

#### 3.1. domain/commands/ ディレクトリ作成

```bash
mkdir -p skeleton-app/src/lib/domain/commands
```

#### 3.2. Commandファイルの移動（履歴保持）

```bash
cd skeleton-app/src/lib

# GameCommand インターフェース
git mv application/commands/GameCommand.ts domain/commands/

# 各Command実装
git mv application/commands/DrawCardCommand.ts domain/commands/
git mv application/commands/DiscardCardsCommand.ts domain/commands/
git mv application/commands/ActivateSpellCommand.ts domain/commands/
git mv application/commands/AdvancePhaseCommand.ts domain/commands/
git mv application/commands/ShuffleDeckCommand.ts domain/commands/
```

#### 3.3. テストファイルの移動

```bash
cd ../../../tests/unit

# commands ディレクトリごと移動
git mv application/commands domain/
```

#### 3.4. CardEffectRegistryの移動

```bash
cd ../../skeleton-app/src/lib

git mv application/effects/CardEffectRegistry.ts domain/effects/
git mv application/effects/index.ts domain/effects/  # Re-export用
```

#### 3.5. application/commands/ と application/effects/ の削除

```bash
# 空になったディレクトリを削除
rmdir application/commands
rmdir application/effects
```

#### 3.6. import文の一括更新

TypeScriptコンパイラでエラー検出:

```bash
cd ../../../..  # プロジェクトルートに戻る
npm run check
```

エラーが出た箇所を修正:

```typescript
// Before
import { DrawCardCommand } from "$lib/application/commands/DrawCardCommand";
import { CardEffectRegistry } from "$lib/application/effects/CardEffectRegistry";

// After
import { DrawCardCommand } from "$lib/domain/commands/DrawCardCommand";
import { CardEffectRegistry } from "$lib/domain/effects/CardEffectRegistry";
```

主な影響箇所:
- `application/GameFacade.ts`
- `domain/effects/cards/*.ts` (個別カード効果)
- `presentation/components/*.svelte`

#### 3.7. domain/effects/index.ts の作成

**ファイル**: `skeleton-app/src/lib/domain/effects/index.ts`

```typescript
// Re-export all effect-related types
export * from "./CardEffect";
export * from "./CardEffectRegistry";
export * from "./EffectResolutionStep";
```

#### 3.8. 動作確認

```bash
npm run check          # TypeScriptコンパイル
npm run build          # ビルド成功確認
npm run test:run       # すべてのテスト実行
npm run lint           # ESLint
npx playwright test    # E2Eテスト（任意）
```

#### 3.9. Phase 3 コミット

```bash
git add -A
git commit -m "refactor: move Commands and CardEffectRegistry to domain layer

- Move application/commands/ → domain/commands/
- Move application/effects/CardEffectRegistry → domain/effects/
- Move test files to domain/commands/
- Update all import paths
- GameFacade remains in application layer (UI-Domain bridge)
- Clean Architecture compliance achieved

Relates to #007-domain-refactor"
```

---

## Final Validation

### すべてのチェック項目

```bash
# 1. TypeScript コンパイル
npm run check

# 2. ビルド
npm run build

# 3. Lint/Format
npm run lint
npm run format

# 4. 単体テスト
npm run test:run

# 5. E2Eテスト（任意）
npx playwright test

# 6. 開発サーバー起動確認
npm run dev
# ブラウザで http://localhost:5173 を開き、動作確認
```

### 確認事項

- [ ] すべてのテストがパス（100%）
- [ ] TypeScriptコンパイルエラーゼロ
- [ ] ESLint/Prettierエラーゼロ
- [ ] ビルド成功
- [ ] アプリが正常に起動・動作する
- [ ] git status がクリーン（コミット済み）

---

## Next Steps

### ADR0007の作成

設計判断を記録します:

```bash
# ADR0007のテンプレートを作成
touch docs/adr/ADR0007-domain-layer-refactoring.md
```

**内容**:
- Context: ドメインドキュメント刷新に伴うコード見直し
- Decision: 型名統一、Immer削除、Commands/EffectsのDomain層移管
- Consequences: アーキテクチャの整合性向上、保守性向上
- Alternatives: 現状維持、段階的移管
- Scope: 効果システムは次のSpecに延期

### Pull Request作成

```bash
git push origin 007-domain-refactor
gh pr create \
  --title "refactor: Domain Layer Refactoring (型名統一・Immer削除・Commands移管)" \
  --body "$(cat specs/007-domain-refactor/spec.md)"
```

### tasks.mdの生成（任意）

```bash
# /speckit.tasks コマンドで自動生成
# または手動でタスク分解
```

---

## Troubleshooting

### Q: TypeScriptエラーが大量に出る

**A**: import文の更新漏れが原因。以下のコマンドでエラー箇所を特定:

```bash
npm run check 2>&1 | grep "Cannot find module"
```

### Q: テストが失敗する

**A**: import文の更新漏れか、型名の変更漏れ。テストファイルのimport文を確認:

```bash
grep -r "DomainCardData" tests/
grep -r "application/commands" tests/
```

### Q: Immer削除後、状態が変更されてしまう

**A**: spread構文の適用漏れ。以下のパターンで統一:

```typescript
const newState: GameState = {
  ...state,
  zones: newZones,  // Zone.tsの純粋関数で生成済み
};
```

### Q: E2Eテストが失敗する

**A**: import pathの更新漏れ。Svelteコンポーネントのimport文を確認:

```bash
grep -r "application/commands" skeleton-app/src/lib/presentation/
```

---

## Rollback Plan

何か問題が発生した場合:

```bash
# 特定のPhaseまで戻る
git reset --hard <commit-hash>

# または、ブランチ全体を破棄して再スタート
git checkout main
git branch -D 007-domain-refactor
git checkout -b 007-domain-refactor
```

---

## Success Criteria Checklist

- [ ] Phase 1: 型名が`CardData`に統一され、ドキュメントと一致
- [ ] Phase 2: `package.json`から`immer`が削除され、spread構文のみ使用
- [ ] Phase 3: `domain/commands/`と`domain/effects/CardEffectRegistry`が存在
- [ ] すべてのテストが100%パス
- [ ] TypeScript/ESLint/Prettierエラーゼロ
- [ ] ADR0007が作成され、設計判断が記録されている
- [ ] PRが作成され、レビュー準備完了

---

## Estimated Time

- Phase 1 (型名変更): 30-60分
- Phase 2 (Immer削除): 30-45分
- Phase 3 (ファイル移動): 45-90分
- ADR0007作成: 30分
- PR作成・最終確認: 30分

**Total**: 約3-4時間
