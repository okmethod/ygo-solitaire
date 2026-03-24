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
import type { GameEvent } from "$lib/domain/models/GameProcessing/GameEvent";

describe("EventTimeline", () => {
  describe("createEmptyTimeline", () => {
    it("should create an empty timeline with initial values", () => {
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
    it("should create an empty snapshot with given timestamp", () => {
      // Act
      const snapshot = createEmptySnapshot(5);

      // Assert
      expect(snapshot.timestamp).toBe(5);
      expect(snapshot.events).toEqual([]);
    });
  });

  describe("recordEvent", () => {
    it("should add event to current snapshot", () => {
      // Arrange
      const timeline = createEmptyTimeline();
      const event: GameEvent = { type: "spellActivated", sourceCardId: 12345678, sourceInstanceId: "card-1" };

      // Act
      const result = recordEvent(timeline, event);

      // Assert
      expect(result.current.events).toHaveLength(1);
      expect(result.current.events[0]).toEqual(event);
    });

    it("should add multiple events to the same snapshot", () => {
      // Arrange
      let timeline = createEmptyTimeline();
      const event1: GameEvent = { type: "spellActivated", sourceCardId: 12345678, sourceInstanceId: "card-1" };
      const event2: GameEvent = { type: "spellActivated", sourceCardId: 12345678, sourceInstanceId: "card-2" };

      // Act
      timeline = recordEvent(timeline, event1);
      timeline = recordEvent(timeline, event2);

      // Assert
      expect(timeline.current.events).toHaveLength(2);
      expect(timeline.current.events[0]).toEqual(event1);
      expect(timeline.current.events[1]).toEqual(event2);
    });

    it("should not mutate original timeline", () => {
      // Arrange
      const timeline = createEmptyTimeline();
      const event: GameEvent = { type: "spellActivated", sourceCardId: 12345678, sourceInstanceId: "card-1" };

      // Act
      recordEvent(timeline, event);

      // Assert - original should be unchanged
      expect(timeline.current.events).toEqual([]);
    });
  });

  describe("advanceTime", () => {
    it("should move current snapshot to history and create new snapshot", () => {
      // Arrange
      let timeline = createEmptyTimeline();
      const event: GameEvent = { type: "spellActivated", sourceCardId: 12345678, sourceInstanceId: "card-1" };
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

    it("should not advance if current snapshot has no events", () => {
      // Arrange
      const timeline = createEmptyTimeline();

      // Act
      const result = advanceTime(timeline);

      // Assert - should return same timeline
      expect(result).toBe(timeline);
      expect(result.current.timestamp).toBe(0);
      expect(result.history).toEqual([]);
    });

    it("should preserve history across multiple advances", () => {
      // Arrange
      let timeline = createEmptyTimeline();

      // First event and advance
      timeline = recordEvent(timeline, { type: "spellActivated", sourceCardId: 12345678, sourceInstanceId: "card-1" });
      timeline = advanceTime(timeline);

      // Second event and advance
      timeline = recordEvent(timeline, { type: "monsterSummoned", sourceCardId: 87654321, sourceInstanceId: "card-2" });
      timeline = advanceTime(timeline);

      // Assert
      expect(timeline.history).toHaveLength(2);
      expect(timeline.history[0].events[0].type).toBe("spellActivated");
      expect(timeline.history[1].events[0].type).toBe("monsterSummoned");
      expect(timeline.nextTimestamp).toBe(3);
    });
  });

  describe("hasCurrentEvents", () => {
    it("should return false for empty timeline", () => {
      // Arrange
      const timeline = createEmptyTimeline();

      // Act & Assert
      expect(hasCurrentEvents(timeline)).toBe(false);
    });

    it("should return true when current snapshot has events", () => {
      // Arrange
      let timeline = createEmptyTimeline();
      timeline = recordEvent(timeline, { type: "spellActivated", sourceCardId: 12345678, sourceInstanceId: "card-1" });

      // Act & Assert
      expect(hasCurrentEvents(timeline)).toBe(true);
    });
  });

  describe("getCurrentEvents", () => {
    it("should return empty array for empty timeline", () => {
      // Arrange
      const timeline = createEmptyTimeline();

      // Act
      const events = getCurrentEvents(timeline);

      // Assert
      expect(events).toEqual([]);
    });

    it("should return current events", () => {
      // Arrange
      let timeline = createEmptyTimeline();
      const event: GameEvent = { type: "spellActivated", sourceCardId: 12345678, sourceInstanceId: "card-1" };
      timeline = recordEvent(timeline, event);

      // Act
      const events = getCurrentEvents(timeline);

      // Assert
      expect(events).toHaveLength(1);
      expect(events[0]).toEqual(event);
    });
  });

  describe("hasEventOfType", () => {
    it("should return false when event type is not present", () => {
      // Arrange
      const timeline = createEmptyTimeline();

      // Act & Assert
      expect(hasEventOfType(timeline, "spellActivated")).toBe(false);
    });

    it("should return true when event type is present", () => {
      // Arrange
      let timeline = createEmptyTimeline();
      timeline = recordEvent(timeline, { type: "spellActivated", sourceCardId: 12345678, sourceInstanceId: "card-1" });

      // Act & Assert
      expect(hasEventOfType(timeline, "spellActivated")).toBe(true);
    });

    it("should check only current snapshot, not history", () => {
      // Arrange
      let timeline = createEmptyTimeline();
      timeline = recordEvent(timeline, { type: "spellActivated", sourceCardId: 12345678, sourceInstanceId: "card-1" });
      timeline = advanceTime(timeline);

      // Act & Assert - spellActivated is in history, not current
      expect(hasEventOfType(timeline, "spellActivated")).toBe(false);
    });
  });

  describe("clearHistory", () => {
    it("should clear history while preserving current snapshot", () => {
      // Arrange
      let timeline = createEmptyTimeline();
      timeline = recordEvent(timeline, { type: "spellActivated", sourceCardId: 12345678, sourceInstanceId: "card-1" });
      timeline = advanceTime(timeline);
      timeline = recordEvent(timeline, { type: "monsterSummoned", sourceCardId: 87654321, sourceInstanceId: "card-2" });

      // Act
      const result = clearHistory(timeline);

      // Assert
      expect(result.history).toEqual([]);
      expect(result.current.events).toHaveLength(1);
      expect(result.current.events[0].type).toBe("monsterSummoned");
    });

    it("should not mutate original timeline", () => {
      // Arrange
      let timeline = createEmptyTimeline();
      timeline = recordEvent(timeline, { type: "spellActivated", sourceCardId: 12345678, sourceInstanceId: "card-1" });
      timeline = advanceTime(timeline);

      // Act
      clearHistory(timeline);

      // Assert - original should be unchanged
      expect(timeline.history).toHaveLength(1);
    });
  });
});
