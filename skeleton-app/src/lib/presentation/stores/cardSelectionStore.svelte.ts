/**
 * cardSelectionStore - カード選択ストア (Svelte 5 Runes)
 *
 * プレイヤーによるカード選択状態を管理する。
 * CardSelectionModal と連携し、カード効果に必要なカード選択を追跡する。
 *
 * 主要メソッド:
 * - startSelection(config): カード選択を開始（選択条件を指定）
 * - toggleCard(instanceId): カードの選択状態を切り替え
 * - confirmSelection(): 選択を確定してコールバック実行
 * - cancelSelection(): 選択をキャンセル（コールバック実行なし）
 *
 * @module presentation/stores/cardSelectionStore
 */

import type { CardInstance } from "$lib/presentation/types";

/**
 * カード選択設定（Presentation Layer用）
 *
 * Domain Layer の CardSelectionConfig に Presentation 固有のコールバックを追加。
 */
export interface CardSelectionConfig {
  /** 選択対象のカード一覧 */
  availableCards: readonly CardInstance[];
  /** 最小選択枚数 */
  minCards: number;
  /** 最大選択枚数 */
  maxCards: number;
  /** 選択UIに表示するタイトル */
  summary: string;
  /** 選択UIに表示する説明文 */
  description: string;
  /** キャンセル可能かどうか（デフォルト: true） */
  cancelable?: boolean;
  /** 選択確定時に実行されるコールバック */
  onConfirm: (selectedInstanceIds: string[]) => void;
  /** キャンセル時に実行されるコールバック（オプション） */
  onCancel?: () => void;
}

/**
 * カード選択状態
 */
interface CardSelectionState {
  /** 選択が有効かどうか */
  isActive: boolean;
  /** 現在の選択設定 */
  config: CardSelectionConfig | null;
  /** 選択されたカードインスタンスIDのセット */
  selectedInstanceIds: Set<string>;
}

/**
 * 初期状態を生成する
 */
function createInitialState(): CardSelectionState {
  return {
    isActive: false,
    config: null,
    selectedInstanceIds: new Set(),
  };
}

/**
 * カード選択ストアクラス（Svelte 5 Runes API）
 */
class CardSelectionStore {
  private state = $state<CardSelectionState>(createInitialState());

  /**
   * 選択が有効かどうかを取得
   */
  get isActive(): boolean {
    return this.state.isActive;
  }

  /**
   * 現在の選択設定を取得
   */
  get config(): CardSelectionConfig | null {
    return this.state.config;
  }

  /**
   * 選択されたインスタンスIDを配列で取得
   */
  get selectedInstanceIds(): string[] {
    return Array.from(this.state.selectedInstanceIds);
  }

  /**
   * 選択枚数を取得
   */
  get selectedCount(): number {
    return this.state.selectedInstanceIds.size;
  }

  /**
   * カードが選択されているかチェック
   */
  isSelected(instanceId: string): boolean {
    return this.state.selectedInstanceIds.has(instanceId);
  }

  /**
   * 選択が有効か判定（最小・最大枚数制約を満たすか）
   */
  get isValidSelection(): boolean {
    if (!this.state.config) return false;

    const count = this.state.selectedInstanceIds.size;
    return count >= this.state.config.minCards && count <= this.state.config.maxCards;
  }

  /**
   * カードの選択状態を切り替え可能かチェック（最大枚数制約を考慮）
   */
  canToggleCard(instanceId: string): boolean {
    if (!this.state.config) return false;

    // 既に選択されていれば、常に選択解除可能
    if (this.state.selectedInstanceIds.has(instanceId)) {
      return true;
    }

    // 未選択の場合、最大枚数に達していないかチェック
    return this.state.selectedInstanceIds.size < this.state.config.maxCards;
  }

  /**
   * カード選択を開始する
   */
  startSelection(config: CardSelectionConfig): void {
    this.state = {
      isActive: true,
      config,
      selectedInstanceIds: new Set(),
    };
  }

  /**
   * カードの選択状態を切り替える
   */
  toggleCard(instanceId: string): void {
    if (!this.state.config) return;

    // 選択対象のカードかチェック
    const isAvailable = this.state.config.availableCards.some((card) => card.instanceId === instanceId);
    if (!isAvailable) return;

    const newSelectedIds = new Set(this.state.selectedInstanceIds);

    if (newSelectedIds.has(instanceId)) {
      // 選択解除
      newSelectedIds.delete(instanceId);
    } else {
      // 選択（最大枚数未満の場合のみ）
      if (newSelectedIds.size < this.state.config.maxCards) {
        newSelectedIds.add(instanceId);
      }
    }

    this.state.selectedInstanceIds = newSelectedIds;
  }

  /**
   * 選択を確定してコールバックを実行する
   */
  confirmSelection(): void {
    if (!this.state.config || !this.isValidSelection) return;

    const selectedIds = Array.from(this.state.selectedInstanceIds);
    const callback = this.state.config.onConfirm;

    // コールバック実行前に状態をリセット
    this.reset();

    // コールバック実行
    callback(selectedIds);
  }

  /**
   * 選択をキャンセルする（コールバック実行なし）
   */
  cancelSelection(): void {
    const cancelCallback = this.state.config?.onCancel;

    // コールバック実行前に状態をリセット
    this.reset();

    // キャンセルコールバックが指定されていれば実行
    if (cancelCallback) {
      cancelCallback();
    }
  }

  /**
   * 選択状態をリセットする
   */
  reset(): void {
    this.state = createInitialState();
  }
}

/**
 * シングルトンインスタンスをエクスポート
 */
export const cardSelectionStore = new CardSelectionStore();
