# Quickstart: Card Effect Execution System

**Feature**: 004-card-effect-execution
**Created**: 2025-12-06
**Purpose**: 実装者が最速でキャッチアップするための最小限のドキュメント

## 1分要約

「強欲な壺」と「天使の施し」の効果処理を、Clean Architectureの3層（Domain/Application/Presentation）に分離して実装します。

**強欲な壺（カードID: 55144522）**:
- 効果: デッキから2枚ドロー（自動実行）
- 実装: `ActivateSpellCommand` 内でカードID判定 → `DrawCardCommand(2)` 実行

**天使の施し（カードID: 79571449）**:
- 効果: デッキから3枚ドロー → 手札から2枚選択して捨てる
- 実装: `effectResolutionStore` で2ステップフロー → `cardSelectionStore` で選択UI → `DiscardCardsCommand` で破棄

## 実装する新規コンポーネント

### 1. DiscardCardsCommand (Application Layer)
```typescript
// skeleton-app/src/lib/application/commands/DiscardCardsCommand.ts
export class DiscardCardsCommand implements GameCommand {
  constructor(private readonly cardInstanceIds: string[]) {}

  execute(state: GameState): CommandResult {
    let updatedZones = state.zones;
    for (const cardId of this.cardInstanceIds) {
      updatedZones = sendToGraveyard(updatedZones, cardId);
    }
    return createSuccessResult(
      produce(state, draft => { draft.zones = updatedZones })
    );
  }
}
```

### 2. cardSelectionStore (Application Layer)
```typescript
// skeleton-app/src/lib/stores/cardSelectionStore.ts
interface CardSelectionState {
  isActive: boolean;
  selectedCards: string[];
  maxSelection: number;
}

- startSelection(maxCount: number)
- toggleSelection(cardId: string)
- getSelectedCards(): string[]
- reset()
```

### 3. CardSelectionModal.svelte (Presentation Layer)
```svelte
<!-- skeleton-app/src/lib/components/CardSelectionModal.svelte -->
<script lang="ts">
  import { cardSelectionStore } from "$lib/stores/cardSelectionStore";
  import { DiscardCardsCommand } from "$lib/application/commands/DiscardCardsCommand";

  // 手札のカード一覧を表示
  // クリックで選択/解除（ハイライト）
  // 2枚選択 → 確定ボタン有効化 → DiscardCardsCommand実行
</script>
```

## 修正する既存コンポーネント

### 1. ActivateSpellCommand (Application Layer)
```typescript
// skeleton-app/src/lib/application/commands/ActivateSpellCommand.ts (行73-75)
// 現在: TODO: Integrate with Effect system
// 修正後: カードID判定ロジック追加

if (cardMaster.id === 55144522) {  // 強欲な壺
  const steps: EffectResolutionStep[] = [
    {
      id: "pot-of-greed-draw",
      title: "カードをドローします",
      message: "デッキから2枚ドローします",
      action: () => {
        const drawCmd = new DrawCardCommand(2);
        const result = drawCmd.execute(get(gameStateStore));
        if (result.success) gameStateStore.set(result.newState);
      },
    },
  ];
  effectResolutionStore.startResolution(steps);
} else if (cardMaster.id === 79571449) {  // 天使の施し
  const steps: EffectResolutionStep[] = [
    {
      id: "graceful-charity-draw",
      title: "カードをドローします",
      message: "デッキから3枚ドローします",
      action: () => {
        const drawCmd = new DrawCardCommand(3);
        const result = drawCmd.execute(get(gameStateStore));
        if (result.success) gameStateStore.set(result.newState);
      },
    },
    {
      id: "graceful-charity-select",
      title: "手札から2枚選択してください",
      message: "手札から2枚選択して捨ててください",
      action: () => {
        cardSelectionStore.startSelection(2);
      },
    },
  ];
  effectResolutionStore.startResolution(steps);
}
```

### 2. GameFacade (Application Layer)
```typescript
// skeleton-app/src/lib/application/GameFacade.ts
// 新規メソッド追加

export function discardCards(cardInstanceIds: string[]): void {
  const command = new DiscardCardsCommand(cardInstanceIds);
  const result = command.execute(get(gameStateStore));
  if (result.success) {
    gameStateStore.set(result.newState);
  } else {
    console.error("Failed to discard cards:", result.error);
  }
}
```

## 実装順序（User Story優先度順）

### Phase 1 (P1): 強欲な壺の実装
1. `ActivateSpellCommand.ts` にカードID判定追加（55144522）
2. 既存の`DrawCardCommand(2)` を活用
3. テスト: 強欲な壺で2枚ドロー

### Phase 2 (P2前半): 天使の施しの基盤
1. `DiscardCardsCommand.ts` 作成
2. `cardSelectionStore.ts` 作成
3. テスト: 破棄処理単体

### Phase 3 (P2後半): UI統合
1. `CardSelectionModal.svelte` 作成
2. `ActivateSpellCommand.ts` に天使の施し追加（79571449）
3. テスト: E2Eで全フロー

### Phase 4 (P3): 進行状況表示
1. `EffectResolutionModal` 活用（既存）
2. メッセージ表示
3. テスト: UI表示確認

## 重要な設計原則

### 1. Command Patternのみ使用（ADR-0003）
- Effect System廃止済み
- すべての状態変更はCommandクラス経由

### 2. YAGNI原則
- 現時点でカードは2種類のみ
- **if文でハードコード**（Strategy Patternは不要）
- 5種類を超えたらRecord型へリファクタリング

### 3. レイヤー境界の遵守
- Domain Layer: 純粋関数のみ（既存関数を再利用）
- Application Layer: CommandとStoreの調整
- Presentation Layer: Svelte 5コンポーネント

## テスト戦略

### Unit Tests
- `DiscardCardsCommand.test.ts`: 破棄処理の単体テスト
- `cardSelectionStore.test.ts`: 選択状態管理のテスト

### Integration Tests
- `ActivateSpellCommand.test.ts`: カードID判定ロジックのテスト
- `GameFacade.test.ts`: discardCards()のテスト

### E2E Tests
- `effect-activation-ui.spec.ts`: 強欲な壺の全フロー
- `effect-activation-ui.spec.ts`: 天使の施しの全フロー（カード選択含む）

## 参考ドキュメント

- **[spec.md](spec.md)**: 機能仕様とUser Stories
- **[plan.md](plan.md)**: 詳細な実装計画
- **[research.md](research.md)**: 技術的決定の根拠
- **[data-model.md](data-model.md)**: エンティティと状態遷移
- **[contracts/](contracts/)**: TypeScriptインターフェース

## よくある質問

**Q1: なぜStrategy Patternを使わないのか？**
A1: 現時点でカードは2種類のみ。YAGNI原則に従い、if文でシンプルに実装します。5種類を超えたらリファクタリングを検討します。（research.md - Decision 1）

**Q2: effectResolutionStoreとcardSelectionStoreの役割分担は？**
A2: effectResolutionStoreは効果フロー全体の管理、cardSelectionStoreはUI状態（選択中のカード）の管理です。関心の分離により、独立してテスト可能です。（research.md - Decision 2）

**Q3: 既存のDomain関数は変更する必要があるか？**
A3: **不要です**。既存の`drawCards()`、`sendToGraveyard()`をそのまま活用します。（research.md - Existing Architecture Review）

## 開発環境セットアップ

```bash
# ブランチ作成済み
git checkout feature/004-card-effect-execution

# 依存関係インストール
cd skeleton-app
npm install

# 開発サーバー起動
npm run dev

# テスト実行
npm run test:run

# E2Eテスト実行
npm run test:e2e
```

## 実装開始チェックリスト

- [ ] [spec.md](spec.md) を読み、User Stories（P1-P3）を理解した
- [ ] [research.md](research.md) を読み、技術的決定（Decision 1-3）を理解した
- [ ] 既存の`ActivateSpellCommand.ts`（行73-75）を確認した
- [ ] 既存の`effectResolutionStore.ts`のインターフェースを確認した
- [ ] Phase 1（強欲な壺）から実装を開始する準備ができた

---

**準備完了！** Phase 1の実装から始めてください。
