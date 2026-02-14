/**
 * GameEvent - 各種イベント
 *
 * 特定のタイミングで反応する効果等、フックするためのイベントを定義する。
 */

/** イベント種別 */
export type EventType =
  | "spellActivated" // 魔法カード発動時
  | "monsterSummoned" // モンスター召喚時
  | "cardDestroyed"; // カード破壊時

/**
 * イベントのコンテキスト情報
 *
 * 対象に取ったカードなど、イベントの詳細情報を保持。
 */
export interface EventContext {
  /** 対象に取られたカードインスタンスID群 */
  readonly targetInstanceIds?: readonly string[];

  /** その他の汎用パラメータ */
  readonly [key: string]: unknown;
}

/**
 * ゲームイベント
 *
 * ゲーム中に発生した個別のイベントを表現する。
 * Command や AtomicStep がイベントを記録する際に使用。
 */
export interface GameEvent {
  /** イベントの種類 */
  readonly type: EventType;

  /** イベント発生源のカードID */
  readonly sourceCardId: number;

  /** イベント発生源のカードインスタンスID */
  readonly sourceInstanceId: string;

  /** イベントのコンテキスト情報（オプション） */
  readonly context?: EventContext;
}
