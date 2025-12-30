# Notification Level Control Implementation Quickstart

**Date**: 2025-12-30
**Related**: [plan.md](./plan.md), [data-model.md](./data-model.md)

---

## Overview

このドキュメントは、Notification Level Control機能の実装手順を簡潔にまとめたクイックスタートガイドです。

---

## Prerequisites

- Node.js 18+
- npm
- TypeScript 5.0
- Svelte 5 (Runes mode)

---

## Setup

```bash
cd skeleton-app
npm install
```

---

## Implementation Steps

### Step 1: Add NotificationLevel to EffectResolutionStep (Domain Layer)

**File**: `skeleton-app/src/lib/domain/models/EffectResolutionStep.ts`

**Modification**:

```typescript
// 型定義を追加
export type NotificationLevel = "silent" | "info" | "interactive";

// EffectResolutionStepインターフェースを拡張
export interface EffectResolutionStep {
  readonly id: string;
  readonly title: string;
  readonly message: string;

  /**
   * 通知レベル（オプショナル）
   * 未指定の場合は "info" として扱う
   */
  readonly notificationLevel?: NotificationLevel; // NEW

  readonly cardSelectionConfig?: CardSelectionConfig;
  action: (state: GameState, selectedInstanceIds?: string[]) => GameStateUpdateResult;
  readonly showCancel?: boolean;
}
```

**Checklist**:
- [ ] NotificationLevel型を定義
- [ ] EffectResolutionStepにnotificationLevelプロパティを追加（オプショナル）
- [ ] JSDコメントで各レベルの説明を追加

---

### Step 2: Add NotificationHandler Interface (Application Layer)

**File**: `skeleton-app/src/lib/application/stores/effectResolutionStore.ts`

**Modification**:

```typescript
/**
 * NotificationHandler - 通知ハンドラ（Application層）
 */
export interface NotificationHandler {
  showInfo(title: string, message: string): void;
  showInteractive(
    step: EffectResolutionStep,
    onConfirm: () => void,
    onCancel?: () => void
  ): void;
}

interface EffectResolutionState {
  // ... 既存フィールド
  notificationHandler: NotificationHandler | null; // NEW
}
```

**Checklist**:
- [ ] NotificationHandlerインターフェースを定義
- [ ] EffectResolutionStateにnotificationHandlerフィールドを追加

---

### Step 3: Implement NotificationHandler Registration (Application Layer)

**File**: `skeleton-app/src/lib/application/stores/effectResolutionStore.ts`

**Modification**:

```typescript
function createEffectResolutionStore() {
  const { subscribe, update } = writable<EffectResolutionState>({
    isActive: false,
    currentStep: null,
    steps: [],
    currentIndex: -1,
    cardSelectionHandler: null,
    notificationHandler: null, // NEW
  });

  return {
    subscribe,

    // ... 既存メソッド

    /**
     * NotificationHandlerを登録（Dependency Injection）
     */
    registerNotificationHandler: (handler: NotificationHandler) => {
      update((state) => ({
        ...state,
        notificationHandler: handler,
      }));
    },

    // ... 既存メソッド
  };
}
```

**Checklist**:
- [ ] 初期化時にnotificationHandler: nullを設定
- [ ] registerNotificationHandler()メソッドを追加

---

### Step 4: Modify confirmCurrentStep() (Application Layer)

**File**: `skeleton-app/src/lib/application/stores/effectResolutionStore.ts`

**Modification**:

```typescript
confirmCurrentStep: async () => {
  const state = get(effectResolutionStore);
  if (!state.currentStep) return;

  const currentGameState = get(gameStateStore);
  const notificationLevel = state.currentStep.notificationLevel ?? "info"; // NEW

  // Helper functions
  const executeAction = (selectedInstanceIds?: string[]) => {
    const result = state.currentStep!.action(currentGameState, selectedInstanceIds);
    if (result.success) {
      gameStateStore.set(result.newState);
    }
  };

  const moveToNextStep = () => {
    const nextIndex = state.currentIndex + 1;
    if (nextIndex < state.steps.length) {
      update((s) => ({
        ...s,
        currentIndex: nextIndex,
        currentStep: s.steps[nextIndex],
      }));
    } else {
      update((s) => ({
        ...s,
        isActive: false,
        currentStep: null,
        steps: [],
        currentIndex: -1,
      }));
    }
  };

  // 1. silent: 通知なし、即座に実行
  if (notificationLevel === "silent") {
    executeAction();
    moveToNextStep();
    return;
  }

  // 2. info: トースト表示、自動進行
  if (notificationLevel === "info") {
    state.notificationHandler?.showInfo(
      state.currentStep.title,
      state.currentStep.message
    );

    // Wait 300ms for toast visibility
    await new Promise(resolve => setTimeout(resolve, 300));

    executeAction();
    moveToNextStep();
    return;
  }

  // 3. interactive: モーダル表示、ユーザー入力待ち
  if (notificationLevel === "interactive") {
    if (state.currentStep.cardSelectionConfig) {
      // 既存のCardSelectionModal処理（変更なし）
      return new Promise<void>((resolve) => {
        state.cardSelectionHandler!({
          ...state.currentStep!.cardSelectionConfig!,
          availableCards: currentGameState.zones.hand,
          onConfirm: (selectedInstanceIds: string[]) => {
            executeAction(selectedInstanceIds);
            moveToNextStep();
            resolve();
          },
          onCancel: () => {
            update((s) => ({
              ...s,
              isActive: false,
              currentStep: null,
              steps: [],
              currentIndex: -1,
            }));
            resolve();
          },
        });
      });
    } else {
      // cardSelectionConfigなしの場合、通常のモーダル表示
      state.notificationHandler?.showInteractive(
        state.currentStep,
        () => {
          executeAction();
          moveToNextStep();
        },
        state.currentStep.showCancel ? () => {
          update((s) => ({
            ...s,
            isActive: false,
            currentStep: null,
            steps: [],
            currentIndex: -1,
          }));
        } : undefined
      );
    }
    return;
  }
},
```

**Checklist**:
- [ ] notificationLevelを取得（デフォルト"info"）
- [ ] silent/info/interactiveの分岐処理を追加
- [ ] 既存のcardSelectionConfig処理を統合

---

### Step 5: Implement NotificationHandler in Presentation Layer

**File**: `skeleton-app/src/routes/+page.svelte`（または適切なPresentation層ファイル）

**Modification**:

```typescript
import { onMount } from "svelte";
import { effectResolutionStore } from "$lib/application/stores/effectResolutionStore";
import { toaster } from "$lib/presentation/utils/toaster";

onMount(() => {
  // NotificationHandler登録
  effectResolutionStore.registerNotificationHandler({
    showInfo: (title, message) => {
      toaster.success({
        title,
        message,
      });
    },
    showInteractive: (step, onConfirm, onCancel) => {
      // 既存のEffectResolutionModal表示ロジック
      // 例: effectResolutionModalStoreを使用
      effectResolutionModalStore.set({
        isOpen: true,
        step,
        onConfirm,
        onCancel,
      });
    }
  });
});
```

**Checklist**:
- [ ] onMount内でregisterNotificationHandler()を呼び出し
- [ ] showInfo()でtoaster.success()を呼び出し
- [ ] showInteractive()で既存のモーダル表示ロジックを統合

---

### Step 6: Update Existing Card Effects

**File**: `skeleton-app/src/lib/domain/effects/chainable/PotOfGreedAction.ts`

**Modification**:

```typescript
createResolutionSteps(state: GameState, activatedCardInstanceId: string): EffectResolutionStep[] {
  return [
    {
      id: "pot-of-greed-draw",
      title: "カードをドローします",
      message: "デッキから2枚ドローします",
      notificationLevel: "info", // NEW
      action: (currentState: GameState) => {
        // ... 既存の処理
      },
    },
    {
      id: "pot-of-greed-graveyard",
      title: "カードを墓地に送ります",
      message: "強欲な壺を墓地に送ります",
      notificationLevel: "info", // NEW
      action: (currentState: GameState) => {
        // ... 既存の処理
      },
    },
  ];
}
```

**File**: `skeleton-app/src/lib/domain/effects/chainable/GracefulCharityAction.ts`

**Modification**:

```typescript
createResolutionSteps(state: GameState, activatedCardInstanceId: string): EffectResolutionStep[] {
  return [
    {
      id: "graceful-charity-draw",
      title: "カードをドローします",
      message: "デッキから3枚ドローします",
      notificationLevel: "info", // NEW
      action: (currentState: GameState) => {
        // ... 既存の処理
      },
    },
    {
      id: "graceful-charity-discard",
      title: "カードを破棄します",
      message: "手札から2枚選んで破棄してください",
      notificationLevel: "interactive", // NEW
      cardSelectionConfig: {
        // ... 既存の設定
      },
      action: (currentState: GameState, selectedInstanceIds?: string[]) => {
        // ... 既存の処理
      },
    },
    {
      id: "graceful-charity-graveyard",
      title: "カードを墓地に送ります",
      message: "天使の施しを墓地に送ります",
      notificationLevel: "info", // NEW
      action: (currentState: GameState) => {
        // ... 既存の処理
      },
    },
  ];
}
```

**Checklist**:
- [ ] PotOfGreedActionの2ステップに`notificationLevel: "info"`を追加
- [ ] GracefulCharityActionの3ステップに適切なnotificationLevelを追加
  - [ ] drawステップ: "info"
  - [ ] discardステップ: "interactive"
  - [ ] graveyardステップ: "info"

---

### Step 7: Extend toaster.ts (Presentation Layer)

**File**: `skeleton-app/src/lib/presentation/utils/toaster.ts`

**Modification**:

```typescript
import { createToaster } from "@skeletonlabs/skeleton-svelte";

export const toaster = createToaster({
  placement: "top-end",
});

export function showSuccessToast(title: string) {
  toaster.success({
    title: title,
  });
}

export function showErrorToast(title: string) {
  toaster.error({
    title: title,
  });
}

// NEW: showInfoToast for NotificationHandler
export function showInfoToast(title: string, message?: string) {
  toaster.success({
    title,
    message,
  });
}
```

**Checklist**:
- [ ] showInfoToast()関数を追加
- [ ] messageパラメータをオプショナルで受け取る

---

## Testing

### Run Unit Tests

```bash
cd skeleton-app
npm run test:run
```

**Target Test File**: `tests/unit/application/stores/effectResolutionStore.test.ts`

**Test Cases**:
- [ ] NotificationHandler登録のテスト
- [ ] silent levelのテスト（通知なし）
- [ ] info levelのテスト（showInfo呼び出し）
- [ ] interactive levelのテスト（showInteractive呼び出し）
- [ ] デフォルト値（notificationLevel未指定 → "info"）のテスト

### Run Integration Tests

```bash
cd skeleton-app
npm run test:run
```

**Target Test File**: `tests/integration/notification-level-control.test.ts`（新規作成）

**Test Cases**:
- [ ] Pot of Greed効果解決（トースト2回表示）
- [ ] Graceful Charity効果解決（トースト2回 + モーダル1回）
- [ ] 混合通知レベルの効果チェーン

### Run E2E Tests

```bash
cd skeleton-app
npm run test:e2e
```

**Test Cases**:
- [ ] Pot of Greedをブラウザで発動し、トースト表示を確認
- [ ] Graceful Charityをブラウザで発動し、トースト→モーダル→トーストの流れを確認

---

## Linting & Formatting

```bash
cd skeleton-app
npm run lint
npm run format
```

**Checklist**:
- [ ] ESLintエラーゼロ
- [ ] Prettierフォーマット適用

---

## Manual Testing Checklist

### Pot of Greed (強欲な壺)

1. [ ] ゲームを起動
2. [ ] Pot of Greedを手札から発動
3. [ ] **Expected**: ドローステップでトースト表示「カードをドローします - デッキから2枚ドローします」
4. [ ] **Expected**: 墓地送りステップでトースト表示「カードを墓地に送ります - 強欲な壺を墓地に送ります」
5. [ ] **Expected**: モーダル表示なし（0回）
6. [ ] **Expected**: カードが2枚ドローされ、Pot of Greedが墓地に送られる

### Graceful Charity (天使の施し)

1. [ ] ゲームを起動
2. [ ] Graceful Charityを手札から発動
3. [ ] **Expected**: ドローステップでトースト表示「カードをドローします - デッキから3枚ドローします」
4. [ ] **Expected**: カード選択ステップでモーダル表示「カードを破棄します - 手札から2枚選んで破棄してください」
5. [ ] カードを2枚選択して確定
6. [ ] **Expected**: 墓地送りステップでトースト表示「カードを墓地に送ります - 天使の施しを墓地に送ります」
7. [ ] **Expected**: カードが3枚ドローされ、2枚破棄され、Graceful Charityが墓地に送られる

---

## Common Issues & Troubleshooting

### Issue 1: NotificationHandler not registered

**Symptom**: effectResolutionStore.confirmCurrentStep()で通知が表示されない

**Solution**: Presentation層（+page.svelte等）のonMount内でregisterNotificationHandler()が呼ばれているか確認

```typescript
onMount(() => {
  effectResolutionStore.registerNotificationHandler({ ... });
});
```

### Issue 2: Toast not displaying

**Symptom**: info levelのステップでトーストが表示されない

**Solution**: toaster.tsのshowInfoToast()が正しく呼ばれているか確認

```typescript
showInfo: (title, message) => {
  console.log("showInfo called:", title, message); // デバッグ用
  toaster.success({ title, message });
}
```

### Issue 3: Modal still showing for info level steps

**Symptom**: notificationLevel: "info"を指定しても、モーダルが表示される

**Solution**: effectResolutionStore.confirmCurrentStep()のnotificationLevel判定が正しいか確認

```typescript
const notificationLevel = state.currentStep.notificationLevel ?? "info";
console.log("notificationLevel:", notificationLevel); // デバッグ用
```

### Issue 4: Backward compatibility broken

**Symptom**: notificationLevel未指定の既存ステップが動作しない

**Solution**: デフォルト値`?? "info"`が適用されているか確認

```typescript
const notificationLevel = state.currentStep.notificationLevel ?? "info";
// notificationLevelがundefinedの場合、"info"になる
```

---

## Implementation Checklist Summary

- [ ] Step 1: NotificationLevel型をEffectResolutionStepに追加（Domain層）
- [ ] Step 2: NotificationHandlerインターフェースを定義（Application層）
- [ ] Step 3: registerNotificationHandler()を実装（Application層）
- [ ] Step 4: confirmCurrentStep()を修正（Application層）
- [ ] Step 5: NotificationHandlerを実装・登録（Presentation層）
- [ ] Step 6: 既存カード効果にnotificationLevelを追加（Domain層）
- [ ] Step 7: toaster.tsを拡張（Presentation層）
- [ ] テスト実装（Unit/Integration/E2E）
- [ ] Lint/Format実行
- [ ] Manual Testing実施

---

## Next Steps

実装完了後:

1. **tasks.md更新**: 完了したタスクを`[x]`にマーク
2. **Lint/Format実行**: `npm run lint && npm run format`
3. **テスト実行**: `npm run test:run`
4. **コミット**: `git add . && git commit -m "feat: implement notification level control"`
5. **PR作成**: GitHub PRを作成し、レビュー依頼

---

## References

- [plan.md](./plan.md)
- [data-model.md](./data-model.md)
- [research.md](./research.md)
- [contracts/NotificationLevel.ts](./contracts/NotificationLevel.ts)
- [contracts/NotificationHandler.ts](./contracts/NotificationHandler.ts)
- [Skeleton UI Toast Documentation](https://skeleton.dev/components/toaster)
