/**
 * GameEvent - 各種イベント
 *
 * 特定のタイミングで反応する効果等、フックするためのイベントを定義する。
 */

import type { LocationName } from "$lib/domain/models/Location";
import type { CardInstance } from "$lib/domain/models/Card";

/** イベント種別 */
export const EVENT_TYPES = [
  "spellActivated", // 魔法カードが発動された
  "normalSummoned", // モンスターが通常召喚された
  "specialSummoned", // モンスターが特殊召喚された
  "synchroSummoned", // シンクロ召喚に成功した
  "cardDestroyed", // カードが破壊された
  "sentToGraveyard", // 墓地へ送られた
  "monsterSentToGraveyard", // モンスターが墓地へ送られた
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

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

  /** イベント発生時点での発生源カードのゾーン（オプション） */
  readonly sourceInstanceLocation?: LocationName;

  /** イベントのコンテキスト情報（オプション） */
  readonly context?: EventContext;
}

/**
 * ゲームイベントビルダー
 *
 * イベントオブジェクトの構築を統一するヘルパー。
 * インライン発行・専用ステップどちらでも同じ書き方でイベントを生成できる。
 */
export const GameEvents = {
  /** 墓地送りイベントを生成（モンスターの場合は monsterSentToGraveyard も含む） */
  sentToGraveyard(card: CardInstance): GameEvent[] {
    const base = { sourceCardId: card.id, sourceInstanceId: card.instanceId, sourceInstanceLocation: card.location };
    const events: GameEvent[] = [{ type: "sentToGraveyard", ...base }];
    if (card.type === "monster") {
      events.push({ type: "monsterSentToGraveyard", ...base });
    }
    return events;
  },

  /** 特殊召喚イベントを生成 */
  specialSummoned(card: CardInstance): GameEvent {
    return { type: "specialSummoned", sourceCardId: card.id, sourceInstanceId: card.instanceId };
  },

  /** 通常召喚イベントを生成 */
  normalSummoned(card: CardInstance): GameEvent {
    return { type: "normalSummoned", sourceCardId: card.id, sourceInstanceId: card.instanceId };
  },

  /** 魔法発動イベントを生成 */
  spellActivated(card: CardInstance): GameEvent {
    return { type: "spellActivated", sourceCardId: card.id, sourceInstanceId: card.instanceId };
  },

  /** シンクロ召喚イベントを生成 */
  synchroSummoned(card: CardInstance): GameEvent {
    return { type: "synchroSummoned", sourceCardId: card.id, sourceInstanceId: card.instanceId };
  },
};
