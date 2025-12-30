# Feature Specification: Effect Resolution Notification Control

**Feature Branch**: `010-notification-level-control`
**Created**: 2025-12-30
**Status**: Draft
**Input**: User description: "効果解決時の通知をトーストとモーダルで使い分ける。情報提供のみの通知（カードをドロー、墓地に送る）はトースト表示、ユーザー入力が必要な通知（天使の施しでカード選択）はモーダル表示。Clean Architectureの原則を守り、Domain層は通知レベルのみを表現し、Presentation層が表示方法を決定する。"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Informational notifications use non-blocking toast (Priority: P1)

When a card effect performs an automated action (drawing cards, sending cards to graveyard, adjusting life points), the user sees a brief toast notification that doesn't interrupt gameplay flow.

**Why this priority**: Core UX improvement - reduces modal fatigue for routine game actions while maintaining user awareness of what's happening.

**Independent Test**: Can be fully tested by activating "Pot of Greed" (draws 2 cards, sends spell to graveyard) and verifying that toast notifications appear instead of modal dialogs, and gameplay continues automatically.

**Acceptance Scenarios**:

1. **Given** user activates "Pot of Greed", **When** the "draw 2 cards" step executes, **Then** a toast notification appears showing "カードをドローします" and disappears automatically without requiring user confirmation
2. **Given** the draw step completes, **When** the "send to graveyard" step executes, **Then** a toast notification appears showing "カードを墓地に送ります" and the effect resolution continues automatically

---

### User Story 2 - Interactive notifications use blocking modal (Priority: P1)

When a card effect requires user input (selecting cards to discard, choosing targets), the user sees a modal dialog that waits for their decision before continuing.

**Why this priority**: Essential for game correctness - user decisions must block effect resolution until input is provided.

**Independent Test**: Can be fully tested by activating "Graceful Charity" (draw 3, then discard 2) and verifying that the card selection step shows a modal that blocks until the user selects 2 cards to discard.

**Acceptance Scenarios**:

1. **Given** user activates "Graceful Charity" and draws 3 cards, **When** the "discard 2 cards" step begins, **Then** a modal dialog appears requiring card selection
2. **Given** the discard modal is open, **When** user selects 2 cards and confirms, **Then** the selected cards are discarded and effect resolution continues
3. **Given** the discard modal is open, **When** user cancels (if allowed), **Then** the effect resolution is cancelled and game state remains unchanged

---

### User Story 3 - Silent notifications skip all UI (Priority: P2)

When a card effect involves internal state changes that don't need user awareness (applying permanent effect modifiers, updating hidden counters), no notification is shown and the effect proceeds silently.

**Why this priority**: Reduces notification noise for non-essential game state changes, improving UX for complex effect chains.

**Independent Test**: Can be fully tested by implementing a permanent effect (like "Chicken Game"'s draw effect) and verifying that the effect application shows no notification while still updating game state correctly.

**Acceptance Scenarios**:

1. **Given** a permanent effect is activated, **When** the effect modifier is applied to game state, **Then** no notification appears and effect resolution continues immediately
2. **Given** multiple silent effects execute in sequence, **When** all effects complete, **Then** the user sees no interruption and the game state reflects all changes

---

### Edge Cases

- What happens when a toast notification is shown while another toast is still visible? (Assumption: Toast library handles queuing)
- How does system handle rapid effect chains with mixed notification levels (silent → info → interactive)? (Assumption: Interactive modals always block, while info toasts accumulate)
- What happens when user closes browser/tab while a modal is waiting for input? (Out of scope: Session management is separate concern)

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST categorize each effect resolution step by notification importance level
- **FR-002**: System MUST support three notification levels: "silent" (no notification), "info" (non-blocking toast), and "interactive" (blocking modal requiring user input)
- **FR-003**: Effect steps marked as "info" level MUST display toast notifications that auto-dismiss without blocking effect resolution
- **FR-004**: Effect steps marked as "interactive" level MUST display modal dialogs that block effect resolution until user provides required input
- **FR-005**: Effect steps marked as "silent" level MUST execute without any notification UI
- **FR-006**: The notification level determination MUST occur in the domain/business logic layer without knowledge of specific UI implementation (toast vs modal)
- **FR-007**: The presentation layer MUST decide how to render each notification level (toast, modal, or silent) based on the level indicator
- **FR-008**: System MUST allow changing the notification display method for a given level (e.g., switching "info" from toast to modal) without modifying domain logic
- **FR-009**: Card effect definitions MUST specify notification level for each resolution step
- **FR-010**: System MUST preserve existing modal functionality for card selection steps (Graceful Charity, Card Destruction, etc.)

### Key Entities

- **NotificationLevel**: Enumeration representing notification importance (silent, info, interactive)
- **EffectResolutionStep**: Domain entity representing a single step in card effect resolution, now includes a notification level property
- **NotificationHandler**: Presentation layer component that receives notification level and content, and decides how to display it (via dependency injection)

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users experience zero modal interruptions when activating "Pot of Greed" (currently 2 modals → 0 modals)
- **SC-002**: Effect resolution for informational steps completes automatically within 500ms of step execution (no user interaction required)
- **SC-003**: Card selection steps (Graceful Charity, Card Destruction) continue to block with modal UI requiring explicit user confirmation
- **SC-004**: Notification level can be changed for any effect step by modifying a single configuration value, without touching domain logic code
- **SC-005**: All existing card effects continue to function correctly after migration to notification level system

## Assumptions

- Toast notification library is already available in the presentation layer
- Effect resolution store can be modified to support notification level handling
- Existing EffectResolutionStep interface can be extended with optional notification level property
- Default notification level for steps without explicit level is "info" (to maintain backward compatibility during migration)

## Dependencies

- Existing EffectResolutionStep model (Domain layer)
- Existing effectResolutionStore (Application layer)
- Existing toast notification system (Presentation layer: `toaster.ts`)
- Existing EffectResolutionModal component (Presentation layer)

## Out of Scope

- Customizable notification preferences (user settings to choose toast vs modal)
- Notification history or log
- Sound effects or haptic feedback for notifications
- Accessibility improvements for toast notifications (covered by existing toast library)
- Animation timing or visual design changes to toast/modal components
