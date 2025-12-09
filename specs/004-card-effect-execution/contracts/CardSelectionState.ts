/**
 * Card Selection State Contract
 *
 * カード選択UIの状態を表すインターフェース
 * Feature: 004-card-effect-execution
 */

/**
 * カード選択の状態
 *
 * 新規作成予定の cardSelectionStore で管理される状態
 * 手札からカードを選択するUIの状態を管理
 */
export interface CardSelectionState {
  /**
   * 選択モードが有効か
   *
   * true: CardSelectionModalが表示され、ユーザーがカードを選択中
   * false: 選択モードが無効、モーダルが閉じている
   */
  isActive: boolean;

  /**
   * 選択中のカードインスタンスID配列
   *
   * 例: ["instance-id-1", "instance-id-2"]
   * ユーザーがクリックするたびに追加/削除される
   */
  selectedCards: string[];

  /**
   * 最大選択枚数
   *
   * 例: 天使の施し=2
   * selectedCards.length === maxSelection になるまで確定ボタンが無効化される
   */
  maxSelection: number;
}

/**
 * カード選択Storeのアクション
 *
 * cardSelectionStore で提供される関数群
 */
export interface CardSelectionStore {
  /**
   * 選択モードを開始
   *
   * @param maxCount - 最大選択枚数
   *
   * 例: cardSelectionStore.startSelection(2)
   * → isActive=true, maxSelection=2, selectedCards=[] に初期化
   */
  startSelection(maxCount: number): void;

  /**
   * カードの選択/解除をトグル
   *
   * @param cardInstanceId - カードインスタンスID
   *
   * 既に選択されている場合は解除、未選択の場合は追加
   * ただし、maxSelectionに達している場合は追加不可
   */
  toggleSelection(cardInstanceId: string): void;

  /**
   * 現在選択中のカードIDを取得
   *
   * @returns 選択中のカードインスタンスID配列
   */
  getSelectedCards(): string[];

  /**
   * 選択状態をリセット
   *
   * isActive=false, selectedCards=[], maxSelection=0 に戻る
   * モーダルを閉じるときに呼び出される
   */
  reset(): void;
}

/**
 * カード選択の状態遷移
 *
 * 1. Inactive:
 *    isActive=false, selectedCards=[]
 *
 * 2. Active (selecting):
 *    isActive=true, selectedCards=["id1", "id2"]
 *    ユーザーがカードをクリック中
 *
 * 3. Confirmed:
 *    DiscardCardsCommand(selectedCards).execute() 実行
 *
 * 4. Inactive (reset):
 *    reset() → isActive=false に戻る
 */
