import type { CardInstance, CardSelectionConfig as DomainCardSelectionConfig } from "$lib/presentation/types";

/**
 * カード選択モーダル設定（Presentation Layer用）
 *
 * Domain層の CardSelectionConfig を拡張し、UIコールバックを追加。
 */
export interface CardSelectionModalConfig
  extends Omit<DomainCardSelectionConfig, "availableCards" | "_sourceZone" | "_filter"> {
  /** 選択対象のカード一覧（Application層で解決済み） */
  availableCards: readonly CardInstance[];
  /** 選択確定時に実行されるコールバック */
  onConfirm: (selectedInstanceIds: string[]) => void;
  /** キャンセル時に実行されるコールバック（オプション） */
  onCancel?: () => void;
}
