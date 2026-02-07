/**
 * EventTimeline - ゲームイベントの時間軸管理
 *
 * 同時イベントのグループ化とタイミング管理を行うモデル。
 *
 * 責務:
 * - 同時に発生したイベントを1つの TimeSnapshot にグループ化
 * - イベント履歴の保持（将来の「タイミングを逃す」判定用）
 * - イベントの順序管理
 *
 * @module domain/models/EventTimeline
 */

import type { TriggerEvent } from "$lib/domain/models/RuleContext";

/**
 * ゲームイベント
 *
 * ゲーム中に発生した個別のイベントを表現する。
 * Command や AtomicStep がイベントを記録する際に使用。
 */
export interface GameEvent {
  /** イベントの種類 */
  readonly type: TriggerEvent;

  /** イベント発生源のカードID */
  readonly sourceCardId: number;

  /** イベント発生源のカードインスタンスID */
  readonly sourceInstanceId: string;

  /**
   * イベントのコンテキスト情報（オプション）
   *
   * 効果発動のコンテキストを追跡するための追加情報。
   * - activatingCardId: 効果を発動したカード
   * - targetInstanceIds: 対象に取られたカード
   */
  readonly context?: GameEventContext;
}

/**
 * ゲームイベントのコンテキスト情報
 *
 * 効果の発動元や対象カードなど、イベントの詳細情報を保持。
 */
export interface GameEventContext {
  /** 効果を発動したカードID（効果による移動等の場合） */
  readonly activatingCardId?: number;

  /** 効果を発動したカードインスタンスID */
  readonly activatingInstanceId?: string;

  /** 対象に取られたカードインスタンスID群 */
  readonly targetInstanceIds?: readonly string[];

  /** その他の汎用パラメータ */
  readonly [key: string]: unknown;
}

/**
 * 同時発生イベントのスナップショット
 *
 * 同じタイミングで発生したイベントをグループ化する。
 * 1つの TimeSnapshot 内のイベントは「同時」として扱われる。
 */
export interface TimeSnapshot {
  /** タイムスタンプ（順序管理用、インクリメンタル） */
  readonly timestamp: number;

  /** このタイミングで発生したイベント群 */
  readonly events: readonly GameEvent[];
}

/**
 * イベント時間軸
 *
 * ゲーム中のイベント発生履歴を時間軸で管理する。
 */
export interface EventTimeline {
  /** 現在処理中のタイミング */
  readonly current: TimeSnapshot;

  /** 過去のタイミング履歴（将来の「タイミングを逃す」判定用） */
  readonly history: readonly TimeSnapshot[];

  /** 次に使用するタイムスタンプ */
  readonly nextTimestamp: number;
}

// ============================================================
// ファクトリ関数
// ============================================================

/** 空の EventTimeline を生成する */
export function createEmptyTimeline(): EventTimeline {
  return {
    current: { timestamp: 0, events: [] },
    history: [],
    nextTimestamp: 1,
  };
}

/** 空の TimeSnapshot を生成する */
export function createEmptySnapshot(timestamp: number): TimeSnapshot {
  return {
    timestamp,
    events: [],
  };
}

// ============================================================
// イミュータブル更新関数
// ============================================================

/**
 * イベントを現在のタイミングに記録する
 *
 * 同じタイミング内に複数のイベントを追加できる。
 * これらは「同時に発生した」として扱われる。
 *
 * @param timeline - 現在の EventTimeline
 * @param event - 記録するイベント
 * @returns 更新後の EventTimeline
 */
export function recordEvent(timeline: EventTimeline, event: GameEvent): EventTimeline {
  return {
    ...timeline,
    current: {
      ...timeline.current,
      events: [...timeline.current.events, event],
    },
  };
}

/**
 * タイミングを進める（新しい TimeSnapshot を開始）
 *
 * 現在のスナップショットを履歴に追加し、新しいスナップショットを開始する。
 * チェーン解決後や、一連の処理完了後に呼び出す。
 *
 * @param timeline - 現在の EventTimeline
 * @returns 更新後の EventTimeline
 */
export function advanceTime(timeline: EventTimeline): EventTimeline {
  // 現在のスナップショットにイベントがなければ進めない
  if (timeline.current.events.length === 0) {
    return timeline;
  }

  return {
    current: createEmptySnapshot(timeline.nextTimestamp),
    history: [...timeline.history, timeline.current],
    nextTimestamp: timeline.nextTimestamp + 1,
  };
}

/**
 * 現在のタイミングにイベントがあるかチェックする
 *
 * @param timeline - EventTimeline
 * @returns イベントが1つ以上あれば true
 */
export function hasCurrentEvents(timeline: EventTimeline): boolean {
  return timeline.current.events.length > 0;
}

/**
 * 現在のタイミングのイベントを取得する
 *
 * @param timeline - EventTimeline
 * @returns 現在のイベント配列
 */
export function getCurrentEvents(timeline: EventTimeline): readonly GameEvent[] {
  return timeline.current.events;
}

/**
 * 指定タイプのイベントが現在のタイミングにあるかチェックする
 *
 * @param timeline - EventTimeline
 * @param eventType - チェックするイベントタイプ
 * @returns 該当イベントがあれば true
 */
export function hasEventOfType(timeline: EventTimeline, eventType: TriggerEvent): boolean {
  return timeline.current.events.some((e) => e.type === eventType);
}

/**
 * イベント履歴をクリアする（ターン開始時等）
 *
 * @param timeline - EventTimeline
 * @returns クリア後の EventTimeline
 */
export function clearHistory(timeline: EventTimeline): EventTimeline {
  return {
    ...timeline,
    history: [],
  };
}
