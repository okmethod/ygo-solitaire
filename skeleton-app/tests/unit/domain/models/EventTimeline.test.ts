/**
 * EventTimeline Tests
 *
 * ゲームイベントの時間軸管理機能のテスト。
 * イベントの記録、タイミング進行、履歴管理を検証する。
 *
 * @module tests/unit/domain/models/EventTimeline
 */

import { describe, it, expect } from "vitest";
import {
  createEmptyTimeline,
  createEmptySnapshot,
  recordEvent,
  advanceTime,
  hasCurrentEvents,
  getCurrentEvents,
  hasEventOfType,
  clearHistory,
} from "$lib/domain/models/GameProcessing/EventTimeline";
import { createGameEvent } from "../../../__testUtils__";

describe("EventTimeline", () => {
  describe("createEmptyTimeline", () => {
    it("初期値を持つ空のタイムラインを生成する", () => {
      // Act
      const timeline = createEmptyTimeline();

      // Assert
      expect(timeline.current.timestamp).toBe(0);
      expect(timeline.current.events).toEqual([]);
      expect(timeline.history).toEqual([]);
      expect(timeline.nextTimestamp).toBe(1);
    });
  });

  describe("createEmptySnapshot", () => {
    it("指定タイムスタンプを持つ空のスナップショットを生成する", () => {
      // Act
      const snapshot = createEmptySnapshot(5);

      // Assert
      expect(snapshot.timestamp).toBe(5);
      expect(snapshot.events).toEqual([]);
    });
  });

  describe("recordEvent", () => {
    it("現在のスナップショットにイベントを追加する", () => {
      // Arrange
      const timeline = createEmptyTimeline();
      const event = createGameEvent("spellActivated");

      // Act
      const result = recordEvent(timeline, event);

      // Assert
      expect(result.current.events).toHaveLength(1);
      expect(result.current.events[0]).toEqual(event);
    });

    it("同じスナップショットに複数イベントを追加する", () => {
      // Arrange
      let timeline = createEmptyTimeline();
      const event1 = createGameEvent("spellActivated", "card-1");
      const event2 = createGameEvent("spellActivated", "card-2");

      // Act
      timeline = recordEvent(timeline, event1);
      timeline = recordEvent(timeline, event2);

      // Assert
      expect(timeline.current.events).toHaveLength(2);
      expect(timeline.current.events[0]).toEqual(event1);
      expect(timeline.current.events[1]).toEqual(event2);
    });

    it("元のタイムラインを変更しない", () => {
      // Arrange
      const timeline = createEmptyTimeline();
      const event = createGameEvent("spellActivated");

      // Act
      recordEvent(timeline, event);

      // Assert - 元のタイムラインが変更されていないこと
      expect(timeline.current.events).toEqual([]);
    });
  });

  describe("advanceTime", () => {
    it("現在のスナップショットを履歴へ移動し、新しいスナップショットを生成する", () => {
      // Arrange
      let timeline = createEmptyTimeline();
      const event = createGameEvent("spellActivated");
      timeline = recordEvent(timeline, event);

      // Act
      const result = advanceTime(timeline);

      // Assert
      expect(result.current.timestamp).toBe(1);
      expect(result.current.events).toEqual([]);
      expect(result.history).toHaveLength(1);
      expect(result.history[0].events[0]).toEqual(event);
      expect(result.nextTimestamp).toBe(2);
    });

    it("現在のスナップショットにイベントがない場合は進めない", () => {
      // Arrange
      const timeline = createEmptyTimeline();

      // Act
      const result = advanceTime(timeline);

      // Assert - 同じタイムラインが返ること
      expect(result).toBe(timeline);
      expect(result.current.timestamp).toBe(0);
      expect(result.history).toEqual([]);
    });

    it("複数回の進行で履歴を正しく保持する", () => {
      // Arrange
      let timeline = createEmptyTimeline();

      // 1回目のイベント記録と進行
      timeline = recordEvent(timeline, createGameEvent("spellActivated", "card-1"));
      timeline = advanceTime(timeline);

      // 2回目のイベント記録と進行
      timeline = recordEvent(timeline, createGameEvent("normalSummoned", "card-2"));
      timeline = advanceTime(timeline);

      // Assert
      expect(timeline.history).toHaveLength(2);
      expect(timeline.history[0].events[0].type).toBe("spellActivated");
      expect(timeline.history[1].events[0].type).toBe("normalSummoned");
      expect(timeline.nextTimestamp).toBe(3);
    });
  });

  describe("hasCurrentEvents", () => {
    it("空のタイムラインでは false を返す", () => {
      // Arrange
      const timeline = createEmptyTimeline();

      // Act & Assert
      expect(hasCurrentEvents(timeline)).toBe(false);
    });

    it("現在のスナップショットにイベントがある場合は true を返す", () => {
      // Arrange
      let timeline = createEmptyTimeline();
      timeline = recordEvent(timeline, createGameEvent("spellActivated"));

      // Act & Assert
      expect(hasCurrentEvents(timeline)).toBe(true);
    });
  });

  describe("getCurrentEvents", () => {
    it("空のタイムラインでは空配列を返す", () => {
      // Arrange
      const timeline = createEmptyTimeline();

      // Act
      const events = getCurrentEvents(timeline);

      // Assert
      expect(events).toEqual([]);
    });

    it("現在のイベントを返す", () => {
      // Arrange
      let timeline = createEmptyTimeline();
      const event = createGameEvent("spellActivated");
      timeline = recordEvent(timeline, event);

      // Act
      const events = getCurrentEvents(timeline);

      // Assert
      expect(events).toHaveLength(1);
      expect(events[0]).toEqual(event);
    });
  });

  describe("hasEventOfType", () => {
    it("指定イベント種別が存在しない場合は false を返す", () => {
      // Arrange
      const timeline = createEmptyTimeline();

      // Act & Assert
      expect(hasEventOfType(timeline, "spellActivated")).toBe(false);
    });

    it("指定イベント種別が存在する場合は true を返す", () => {
      // Arrange
      let timeline = createEmptyTimeline();
      timeline = recordEvent(timeline, createGameEvent("spellActivated"));

      // Act & Assert
      expect(hasEventOfType(timeline, "spellActivated")).toBe(true);
    });

    it("履歴ではなく現在のスナップショットのみを対象とする", () => {
      // Arrange
      let timeline = createEmptyTimeline();
      timeline = recordEvent(timeline, createGameEvent("spellActivated"));
      timeline = advanceTime(timeline);

      // Act & Assert - spellActivated は履歴にあり、現在には存在しない
      expect(hasEventOfType(timeline, "spellActivated")).toBe(false);
    });
  });

  describe("clearHistory", () => {
    it("現在のスナップショットを保持したまま履歴を削除する", () => {
      // Arrange
      let timeline = createEmptyTimeline();
      timeline = recordEvent(timeline, createGameEvent("spellActivated", "card-1"));
      timeline = advanceTime(timeline);
      timeline = recordEvent(timeline, createGameEvent("normalSummoned", "card-2"));

      // Act
      const result = clearHistory(timeline);

      // Assert
      expect(result.history).toEqual([]);
      expect(result.current.events).toHaveLength(1);
      expect(result.current.events[0].type).toBe("normalSummoned");
    });

    it("元のタイムラインを変更しない", () => {
      // Arrange
      let timeline = createEmptyTimeline();
      timeline = recordEvent(timeline, createGameEvent("spellActivated"));
      timeline = advanceTime(timeline);

      // Act
      clearHistory(timeline);

      // Assert - 元のタイムラインが変更されていないこと
      expect(timeline.history).toHaveLength(1);
    });
  });
});
