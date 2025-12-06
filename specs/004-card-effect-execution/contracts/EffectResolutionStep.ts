/**
 * Effect Resolution Step Contract
 *
 * 効果解決の1ステップを表すインターフェース
 * Feature: 004-card-effect-execution
 *
 * 既存の effectResolutionStore.ts で定義されているインターフェースと同一
 * このファイルは設計ドキュメントとしての役割
 */

/**
 * 効果解決の1ステップ
 *
 * effectResolutionStore.startResolution(steps) に渡される
 * 各ステップはタイトル、メッセージ、実行するアクション、キャンセル可否を含む
 */
export interface EffectResolutionStep {
  /**
   * ステップID（一意）
   * 例: "pot-of-greed-draw", "graceful-charity-select"
   */
  readonly id: string;

  /**
   * ステップのタイトル
   * 例: "カードをドローします", "手札から2枚選択してください"
   */
  readonly title: string;

  /**
   * ユーザーへの詳細メッセージ
   * 例: "デッキから3枚ドローします"
   */
  readonly message: string;

  /**
   * ステップで実行するアクション
   *
   * 同期・非同期どちらも可能
   * 例:
   * - DrawCardCommand実行
   * - cardSelectionStore.startSelection()
   */
  readonly action: () => Promise<void> | void;

  /**
   * キャンセルボタンを表示するか（オプション）
   *
   * デフォルト: false
   * 現時点では未実装（将来の拡張用）
   */
  readonly showCancel?: boolean;
}

/**
 * 効果解決フローの状態
 *
 * effectResolutionStore内部で管理される状態
 */
export interface EffectResolutionState {
  /**
   * 解決中かどうか
   */
  readonly isResolving: boolean;

  /**
   * 解決ステップの配列
   */
  readonly steps: EffectResolutionStep[];

  /**
   * 現在のステップインデックス
   */
  readonly currentStepIndex: number;
}
