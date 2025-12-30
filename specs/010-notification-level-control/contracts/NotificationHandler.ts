/**
 * NotificationHandler Interface
 *
 * Application層で定義され、Presentation層が実装を提供する。
 * Dependency Injectionパターンにより、UI実装詳細をApplication層から分離。
 *
 * @module application/stores/effectResolutionStore
 */

import type { EffectResolutionStep } from "$lib/domain/models/EffectResolutionStep";

/**
 * NotificationHandler - 通知ハンドラインターフェース
 *
 * effectResolutionStoreがnotificationLevelに応じて呼び出すハンドラ。
 * Presentation層が具体的な実装（toast/modal表示）を提供し、
 * effectResolutionStore.registerNotificationHandler()で注入する。
 *
 * @example
 * ```typescript
 * // Presentation層での実装
 * import { toaster } from "$lib/presentation/utils/toaster";
 *
 * const notificationHandler: NotificationHandler = {
 *   showInfo: (title, message) => {
 *     toaster.success({ title, message });
 *   },
 *   showInteractive: (step, onConfirm, onCancel) => {
 *     // EffectResolutionModalを表示
 *     effectResolutionModalStore.set({
 *       isOpen: true,
 *       step,
 *       onConfirm,
 *       onCancel,
 *     });
 *   }
 * };
 *
 * // Application層への注入
 * effectResolutionStore.registerNotificationHandler(notificationHandler);
 * ```
 */
export interface NotificationHandler {
  /**
   * Show informational notification (non-blocking)
   *
   * 情報提供のみの通知を表示する。
   * 通常はトーストで実装され、自動的に消える。
   * 効果解決フローをブロックしない。
   *
   * @param title - 通知タイトル（例: "カードをドローします"）
   * @param message - 通知メッセージ（例: "デッキから2枚ドローします"）
   *
   * @example
   * ```typescript
   * showInfo("カードをドローします", "デッキから2枚ドローします");
   * // → トースト表示: "カードをドローします - デッキから2枚ドローします"
   * ```
   */
  showInfo(title: string, message: string): void;

  /**
   * Show interactive notification (blocking)
   *
   * ユーザー入力を要求する通知を表示する。
   * 通常はモーダルで実装され、ユーザーの確認またはキャンセルを待つ。
   * 効果解決フローはユーザーの入力までブロックされる。
   *
   * @param step - 効果解決ステップ全体（title, message, cardSelectionConfig等を含む）
   * @param onConfirm - 確認ボタン押下時のコールバック（action実行 → 次ステップ）
   * @param onCancel - キャンセルボタン押下時のコールバック（効果解決中止）（オプショナル）
   *
   * @remarks
   * - stepにcardSelectionConfigがある場合、CardSelectionModalを使用することが推奨される
   * - cardSelectionConfigがない場合、通常のEffectResolutionModalを使用する
   * - showCancel: falseの場合、onCancelはundefinedでもよい
   *
   * @example
   * ```typescript
   * showInteractive(
   *   step,
   *   () => {
   *     // onConfirm: ユーザーが確定ボタンを押した
   *     executeStepAction();
   *     moveToNextStep();
   *   },
   *   () => {
   *     // onCancel: ユーザーがキャンセルボタンを押した
   *     cancelEffectResolution();
   *   }
   * );
   * ```
   */
  showInteractive(
    step: EffectResolutionStep,
    onConfirm: () => void,
    onCancel?: () => void
  ): void;
}

/**
 * Mock NotificationHandler for testing
 *
 * テスト用のモックNotificationHandler。
 * vi.fn()でモック関数を作成し、呼び出しを検証できる。
 *
 * @example
 * ```typescript
 * import { vi } from "vitest";
 *
 * const mockHandler: NotificationHandler = {
 *   showInfo: vi.fn(),
 *   showInteractive: vi.fn(),
 * };
 *
 * effectResolutionStore.registerNotificationHandler(mockHandler);
 *
 * // テスト実行
 * await effectResolutionStore.confirmCurrentStep();
 *
 * // 検証
 * expect(mockHandler.showInfo).toHaveBeenCalledWith("Title", "Message");
 * ```
 */
export function createMockNotificationHandler(): NotificationHandler {
  return {
    showInfo: () => {},
    showInteractive: () => {},
  };
}
