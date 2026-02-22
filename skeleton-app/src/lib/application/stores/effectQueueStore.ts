/**
 * effectQueueStore - 効果処理ステップキューストア
 *
 * 効果処理ステップキューの Single Source of Truth (SSOT)。
 * 蓄積された AtomicStep を順次実行し、通知・カード選択を プレゼン層 に委譲する。
 *
 * @architecture レイヤー間依存ルール - アプリ層 (Store)
 * - ROLE: ゲーム進行制御、プレゼン層 へのデータ提供
 * - ALLOWED: ドメイン層 への依存
 * - FORBIDDEN: インフラ層 への依存、プレゼン層 への依存
 *
 * @remark ユーザーインタラクティブ操作のレイヤー間役割分担
 * - ドメイン層: ゲームルールとしての設定（ユーザーが何を決める必要があるか）
 * - アプリ層: ユーザの操作制御の設定（ユーザーの選択をどう扱うか）
 * - プレゼン層: ユーザ操作のUI実装（ユーザーにどう見せるか）
 *
 * @remark 効果処理の設計思想
 * - 効果処理は複数の AtomicStep から構成されるシーケンス
 * - effectQueueStore が効果処理の状態を一元管理（SSOT）
 * - プレゼン層は状態を監視し、configがnullでなければUIを表示
 * - ユーザー操作時にconfig内のコールバックを実行
 *
 * ============================================================================
 * @design イベントトリガーシステム（実装済み）
 * ============================================================================
 *
 * ## 概要
 * AtomicStep 実行時に発行されるイベントを検出し、トリガールールを自動挿入する機構。
 * これにより、ActivateSpellCommand などから直接トリガー収集する必要がなくなった。
 *
 * ## 実装済み機能
 *
 * ### AtomicStep の責務（実装済み）
 * - step.action() 実行時に GameStateUpdateResult.emittedEvents でイベントを発行
 * - 例: emitSpellActivatedEventStep() が spellActivated イベントを発行
 *
 * ### effectQueueStore の責務（実装済み）
 * - EventTimeline を内部状態として管理（GameState には含めない）
 * - AtomicStep からのイベント通知を受け取り、EventTimeline に記録
 * - AdditionalRuleRegistry.collectTriggerSteps() でトリガールールを収集
 * - 収集したトリガーステップをステップキューに挿入
 *
 * ## 処理フロー（実装済み）
 * ```
 * effectQueueStore.startProcessing(steps)
 *   ↓ EventTimeline を初期化
 * step.action() 実行
 *   ↓ GameState 更新 + emittedEvents を返す
 * effectQueueStore がイベントを EventTimeline に記録
 *   ↓ AdditionalRuleRegistry からトリガールールを収集
 *   ↓ トリガーステップをキューに挿入
 * 次のステップへ
 *   ↓ 全ステップ完了
 * 最終的な GameState を確定
 * ```
 *
 * ============================================================================
 * @design 将来の拡張アイデア: タイミング管理（THEN マーカー）
 * ============================================================================
 *
 * ## 概要（未実装）
 * - 「その後」に相当する THEN ステップを効果定義に挿入
 * - effectQueueStore が THEN を検出したらタイミングを進める
 * - THEN の前後で別タイミングとして扱う
 * - 任意効果の「タイミングを逃す」判定に使用
 *
 * ```typescript
 * // 効果定義例: 「3枚ドローする。その後、手札を2枚捨てる」
 * return [drawStep(3), THEN, selectAndDiscardStep(2)];
 * ```
 *
 * ## 将来対応予定
 * - THEN フラグ検出によるタイムスタンプインクリメント
 * - 強制効果 vs 任意効果の区別
 * - 任意効果の「タイミングを逃す」判定
 *
 * ============================================================================
 * @design 将来の拡張アイデア: チェーンシステムとの関係
 * ============================================================================
 *
 * ## 前提: ChainableAction の構造
 * ```typescript
 * interface ChainableAction {
 *   conditions: () => boolean;      // 発動条件
 *   activation: () => AtomicStep[]; // コスト支払い、対象選択等（即座に処理）
 *   resolution: () => AtomicStep[]; // 狭義の「効果」（チェーン解決時に処理）
 * }
 * ```
 *
 * ## チェーンシステム（chainStackStore）の責務
 * - ChainableAction 発動をフックに起動
 * - ACTIVATION → 即座に effectQueueStore に渡して処理
 * - RESOLUTION → チェーンスタックに積む（LIFO）
 * - 次のチェーンの有無を確認（スペルスピード管理）
 * - チェーン解決時 → スタックした RESOLUTION を LIFO 順で effectQueueStore に渡す
 *
 * ## effectQueueStore の責務
 * - 渡された AtomicStep を順番に処理（FIFO）
 * - イベントトリガーと THEN フラグを監視
 * - 適切な割り込み処理（強制効果 or 任意効果）を実行
 * - UI との連携（通知、カード選択）
 *
 * ## AtomicStep の責務
 * - 「イベントトリガーの発生」を effectQueueStore に通知
 * - 「タイミングを次に進める（THEN フラグ）」を effectQueueStore に通知
 *
 * ## 処理フロー
 * ```
 * ChainableAction 発動
 *   ↓
 * chainStackStore 起動
 *   ├─→ activation() を effectQueueStore で即座に処理
 *   └─→ resolution() をチェーンスタックにプッシュ
 *   ↓
 * チェーン確認（次のチェーンあり？）
 *   ├─→ あり: 次の ChainableAction へ
 *   └─→ なし: チェーン解決開始
 *   ↓
 * チェーン解決（LIFO 順）
 *   ↓ resolution を effectQueueStore で処理
 *   ↓ イベント発生 → eventTimeline に記録
 *   ↓ 強制効果トリガー → 新しいチェーンを形成可能
 *   ↓ 任意効果 → 「タイミングを逃す」判定
 * ```
 *
 * ## 注意事項
 * - 現時点ではチェーンシステムは未実装
 * - このアイデアと大きく乖離する実装を避けること
 *
 * ============================================================================
 *
 * @module application/stores/effectQueueStore
 */

import { writable, get as getStoreValue } from "svelte/store";
import type { CardInstance } from "$lib/domain/models/Card";
import { Card } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep, GameEvent, EventTimeline } from "$lib/domain/models/GameProcessing";
import type { ChainableAction } from "$lib/domain/models/Effect";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { AdditionalRuleRegistry } from "$lib/domain/effects/rules";
import { ChainableActionRegistry } from "$lib/domain/effects/actions";
import { isThenMarker } from "$lib/domain/effects/steps/timing";
import type {
  ConfirmationConfig,
  ResolvedCardSelectionConfig,
  ChainConfirmationConfig,
} from "$lib/application/types/game";
import { gameStateStore } from "$lib/application/stores/gameStateStore";
import { chainStackStore } from "$lib/application/stores/chainStackStore";

// 通知ハンドラのインターフェース
interface NotificationHandler {
  showInfo(summary: string, description: string): void;
}

// 効果処理ステップキューストアの状態インターフェース
interface EffectQueueState {
  isActive: boolean;
  currentStep: AtomicStep | null;
  steps: AtomicStep[];
  currentIndex: number;
  notificationHandler: NotificationHandler | null;
  // ユーザー確認用の設定（null = 非表示）
  confirmationConfig: ConfirmationConfig | null;
  // カード選択用の設定（null = 非表示）
  cardSelectionConfig: ResolvedCardSelectionConfig | null;
  // チェーン確認用の設定（null = 非表示）
  chainConfirmationConfig: ChainConfirmationConfig | null;
  // イベント時間軸（effectQueueStore の内部状態として管理）
  eventTimeline: EventTimeline;
}

// ステップ実行の共通結果
type StepExecutionResult = {
  shouldContinue: boolean;
  delay?: number;
  emittedEvents?: GameEvent[];
};

// 通知レベル別の実行戦略（Strategy Pattern で分離）
type NotificationStrategy = (
  step: AtomicStep,
  gameState: GameSnapshot,
  handlers: {
    notification: NotificationHandler | null;
  },
  updateState: (updater: (state: EffectQueueState) => EffectQueueState) => void,
) => Promise<StepExecutionResult>;

// ステップ実行結果（イベント情報を含む）
interface StepActionResult {
  updatedState: GameSnapshot;
  emittedEvents: GameEvent[];
}

// 1ステップ分のアクションを実行する（共通処理）
function executeStepAction(step: AtomicStep, gameState: GameSnapshot, selectedIds?: string[]): StepActionResult {
  const result = step.action(gameState, selectedIds);
  if (result.success) {
    gameStateStore.set(result.updatedState);
    return {
      updatedState: result.updatedState,
      emittedEvents: result.emittedEvents || [],
    };
  }
  return { updatedState: gameState, emittedEvents: [] };
}

// イベントに対するトリガールールを収集してステップキューに挿入する
function processTriggerEvents(
  events: GameEvent[],
  currentState: GameSnapshot,
  currentSteps: AtomicStep[],
  currentIndex: number,
): AtomicStep[] {
  const triggerSteps: AtomicStep[] = [];

  for (const event of events) {
    // AdditionalRuleRegistry からトリガールールを収集
    const steps = AdditionalRuleRegistry.collectTriggerSteps(currentState, event.type);
    triggerSteps.push(...steps);
  }

  if (triggerSteps.length === 0) {
    return currentSteps;
  }

  // 現在位置の次にトリガーステップを挿入
  return [...currentSteps.slice(0, currentIndex + 1), ...triggerSteps, ...currentSteps.slice(currentIndex + 1)];
}

// 次ステップに遷移する（共通処理）
function transitionToNextStep(
  state: EffectQueueState,
  update: (updater: (state: EffectQueueState) => EffectQueueState) => void,
): boolean {
  const nextIndex = state.currentIndex + 1;

  if (nextIndex < state.steps.length) {
    update((s) => ({
      ...s,
      currentIndex: nextIndex,
      currentStep: s.steps[nextIndex],
    }));
    return true;
  } else {
    finalizeProcessing(update);
    return false;
  }
}

/**
 * チェーン発動時のカード移動処理
 *
 * ActivateSpellCommand.moveActivatedSpellCard() と同等の処理を行う。
 * - 手札から発動: 魔法・罠ゾーン or フィールドゾーンに表向きで配置
 * - セットから発動: 同じゾーンで表向きにする
 */
function moveCardForChainActivation(gameState: GameSnapshot, instance: CardInstance): GameSnapshot {
  let updatedState = gameState;

  if (Card.Instance.inHand(instance)) {
    if (Card.isFieldSpell(instance)) {
      const sweepedSpace = GameState.Space.sendExistingFieldSpellToGraveyard(updatedState.space);
      updatedState = {
        ...updatedState,
        space: GameState.Space.moveCard(sweepedSpace, instance, "fieldZone", { position: "faceUp" }),
      };
    } else {
      updatedState = {
        ...updatedState,
        space: GameState.Space.moveCard(updatedState.space, instance, "spellTrapZone", { position: "faceUp" }),
      };
    }
  } else if (Card.Instance.isFaceDown(instance)) {
    updatedState = {
      ...updatedState,
      space: GameState.Space.updateCardStateInPlace(updatedState.space, instance, { position: "faceUp" }),
    };
  }

  // 発動済みカードIDを記録
  const updatedActivatedCards = new Set(updatedState.activatedCardIds);
  updatedActivatedCards.add(instance.id);

  return { ...updatedState, activatedCardIds: updatedActivatedCards };
}

// 効果処理完了時の後処理を行う（共通処理）
function finalizeProcessing(update: (updater: (state: EffectQueueState) => EffectQueueState) => void): void {
  // ストアリセット
  update((s) => ({
    ...s,
    isActive: false,
    currentStep: null,
    steps: [],
    currentIndex: -1,
  }));

  const chainState = chainStackStore.getState();

  // チェーンスタックに残りがあれば処理を継続
  if (!chainStackStore.isEmpty()) {
    if (chainState.isBuilding) {
      // チェーン構築中: チェーン可能なカードを収集して確認UIを表示
      const requiredSpellSpeed = chainState.lastSpellSpeed ?? 1;
      const gameState = getStoreValue(gameStateStore);
      // 既にスタックに積まれているカードのinstanceIdを取得
      const stackedInstanceIds = new Set(chainState.stack.map((b) => b.sourceInstanceId));
      const chainableCards = ChainableActionRegistry.collectChainableActions(
        gameState,
        requiredSpellSpeed,
        stackedInstanceIds,
      );

      if (chainableCards.length > 0) {
        // チェーン可能なカードがある場合、確認UIを表示
        update((s) => ({
          ...s,
          chainConfirmationConfig: {
            chainableCards,
            onActivate: (instanceId: string) => {
              // 選択されたカードでチェーン発動
              const selected = chainableCards.find((c) => c.instance.instanceId === instanceId);
              if (selected) {
                effectQueueStore.activateChain(selected.instance, selected.action);
              }
            },
            onPass: () => {
              // チェーンをパス → 解決開始
              update((s) => ({ ...s, chainConfirmationConfig: null }));
              effectQueueStore.resolveChain();
            },
          },
        }));
        return;
      }

      // チェーン可能なカードがない場合、即座に解決開始
      setTimeout(() => {
        effectQueueStore.resolveChain();
      }, 0);
    } else {
      // チェーン解決中: 次のブロックを処理
      setTimeout(() => {
        effectQueueStore.continueChainResolution();
      }, 0);
    }
  } else {
    // チェーンスタックが空: 全処理完了、リセット
    chainStackStore.reset();
  }
}

// Strategy: "silent"レベル - 通知なし、即座に実行
const silentStrategy: NotificationStrategy = async (step, gameState) => {
  const result = executeStepAction(step, gameState);
  return { shouldContinue: true, emittedEvents: result.emittedEvents };
};

// Strategy: "info"レベル - トースト通知を表示、自動で次へ進む
const infoStrategy: NotificationStrategy = async (step, gameState, handlers) => {
  const result = executeStepAction(step, gameState);

  if (handlers.notification) {
    handlers.notification.showInfo(step.summary, step.description);
  }

  return { shouldContinue: true, delay: 300, emittedEvents: result.emittedEvents };
};

// Strategy: "interactive"レベル（カード選択あり） - モーダル表示、ユーザー入力待ち
const interactiveWithSelectionStrategy: NotificationStrategy = async (step, gameState, _handlers, updateState) => {
  const config = step.cardSelectionConfig!;

  // availableCardsの取得: 配列=直接指定, null=動的指定
  let availableCards: readonly CardInstance[];
  if (config.availableCards !== null) {
    // 直接指定: config.availableCards をそのまま使用
    availableCards = config.availableCards;
  } else {
    // 動的指定: _sourceZone から実行時に取得
    if (!config._sourceZone) {
      console.error("_sourceZone must be specified when availableCards is null");
      return { shouldContinue: false };
    }
    const sourceZone = gameState.space[config._sourceZone];
    availableCards = config._filter ? sourceZone.filter((card, index) => config._filter!(card, index)) : sourceZone;
  }

  // イベント情報をキャプチャするための変数
  let emittedEvents: GameEvent[] = [];

  // カード選択モーダル（Promise化）- 状態を更新してモーダルを表示
  await new Promise<void>((resolve) => {
    updateState((s) => ({
      ...s,
      cardSelectionConfig: {
        availableCards,
        minCards: config.minCards,
        maxCards: config.maxCards,
        summary: config.summary,
        description: config.description,
        cancelable: config.cancelable,
        onConfirm: (selectedInstanceIds: string[]) => {
          const result = executeStepAction(step, gameState, selectedInstanceIds);
          emittedEvents = result.emittedEvents;
          updateState((s) => ({ ...s, cardSelectionConfig: null }));
          resolve();
        },
        onCancel: () => {
          updateState((s) => ({ ...s, cardSelectionConfig: null }));
          resolve();
        },
      },
    }));
  });

  return { shouldContinue: true, emittedEvents };
};

// Strategy: "interactive"レベル（カード選択なし） - モーダル表示、ユーザー入力待ち
const interactiveWithoutSelectionStrategy: NotificationStrategy = async (step, gameState, _handlers, updateState) => {
  // イベント情報をキャプチャするための変数
  let emittedEvents: GameEvent[] = [];

  // 効果確認モーダル（Promise化）- 状態を更新してモーダルを表示
  await new Promise<void>((resolve) => {
    updateState((s) => ({
      ...s,
      confirmationConfig: {
        summary: step.summary,
        description: step.description,
        onConfirm: () => {
          const result = executeStepAction(step, gameState);
          emittedEvents = result.emittedEvents;
          updateState((s) => ({ ...s, confirmationConfig: null }));
          resolve();
        },
      },
    }));
  });

  return { shouldContinue: true, emittedEvents };
};

// 通知レベルに応じた Strategyを選択する
function selectStrategy(step: AtomicStep): NotificationStrategy {
  const level = step.notificationLevel || "info";

  if (level === "silent") return silentStrategy;
  if (level === "info") return infoStrategy;

  return step.cardSelectionConfig ? interactiveWithSelectionStrategy : interactiveWithoutSelectionStrategy;
}

/** 効果処理ステップキューストアのインターフェース */
export interface EffectQueueStore {
  subscribe: (run: (value: EffectQueueState) => void) => () => void;

  /** 通知ハンドラを登録する（Dependency Injection） */
  registerNotificationHandler: (handler: NotificationHandler) => void;

  /** 効果処理シーケンスを開始する */
  startProcessing: (steps: AtomicStep[]) => void;

  /** 現在のステップを確定して次に進む */
  confirmCurrentStep: () => Promise<void>;

  /** チェーン発動を行う（チェーン確認UIからのコールバック用） */
  activateChain: (instance: CardInstance, action: ChainableAction) => void;

  /** チェーン解決を開始する（chainStackStore から LIFO で取り出して処理） */
  resolveChain: () => void;

  /** チェーン解決を継続する（次のブロックを処理） */
  continueChainResolution: () => void;

  /** 効果処理をキャンセルする */
  cancelProcessing: () => void;

  /** ストアをリセットする */
  reset: () => void;
}

// 効果処理ステップキューストアを生成する
function createEffectQueueStore(): EffectQueueStore {
  const { subscribe, update } = writable<EffectQueueState>({
    isActive: false,
    currentStep: null,
    steps: [],
    currentIndex: -1,
    notificationHandler: null,
    confirmationConfig: null,
    cardSelectionConfig: null,
    chainConfirmationConfig: null,
    eventTimeline: GameProcessing.TimeLine.createEmptyTimeline(),
  });

  return {
    subscribe,

    registerNotificationHandler: (handler: NotificationHandler) => {
      update((state) => ({ ...state, notificationHandler: handler }));
    },

    startProcessing: (steps: AtomicStep[]) => {
      update((state) => ({
        ...state,
        isActive: true,
        steps,
        currentIndex: 0,
        currentStep: steps[0] || null,
      }));

      const firstStep = steps[0];
      if (firstStep) {
        const level = firstStep.notificationLevel || "info";
        if (level === "info" || level === "silent") {
          effectQueueStore.confirmCurrentStep();
        }
      }
    },

    confirmCurrentStep: async () => {
      let state = getStoreValue(effectQueueStore);
      if (!state.currentStep) return;

      // THEN マーカー検出: タイミングを進めて次のステップへ
      if (isThenMarker(state.currentStep)) {
        update((s) => ({
          ...s,
          eventTimeline: GameProcessing.TimeLine.advanceTime(s.eventTimeline),
        }));
        const hasNext = transitionToNextStep(state, update);
        if (hasNext) {
          effectQueueStore.confirmCurrentStep();
        }
        return;
      }

      const currentGameState = getStoreValue(gameStateStore);
      const strategy = selectStrategy(state.currentStep);

      // Strategy実行
      const result = await strategy(
        state.currentStep,
        currentGameState,
        { notification: state.notificationHandler },
        update,
      );

      // イベント処理: emittedEvents がある場合はトリガールールを収集してキューに挿入
      if (result.emittedEvents && result.emittedEvents.length > 0) {
        // EventTimeline に記録（将来の拡張用）
        let updatedTimeline = state.eventTimeline;
        for (const event of result.emittedEvents) {
          updatedTimeline = GameProcessing.TimeLine.recordEvent(updatedTimeline, event);
        }

        // 最新の GameState を取得してトリガールールを収集
        const latestGameState = getStoreValue(gameStateStore);
        const updatedSteps = processTriggerEvents(
          result.emittedEvents,
          latestGameState,
          state.steps,
          state.currentIndex,
        );

        // ステップキューと EventTimeline を更新
        update((s) => ({
          ...s,
          steps: updatedSteps,
          eventTimeline: updatedTimeline,
        }));

        // 状態を再取得
        state = getStoreValue(effectQueueStore);
      }

      // 遅延が必要なら待機
      if (result.delay) {
        await new Promise((resolve) => setTimeout(resolve, result.delay));
      }

      // 次ステップへ遷移
      if (result.shouldContinue) {
        const hasNext = transitionToNextStep(state, update);
        if (hasNext) {
          effectQueueStore.confirmCurrentStep();
        }
      } else {
        finalizeProcessing(update);
      }
    },

    activateChain: (instance: CardInstance, action: ChainableAction) => {
      // チェーン確認モーダルを閉じる
      update((s) => ({ ...s, chainConfirmationConfig: null }));

      // カードを移動してゲーム状態を更新
      const currentState = getStoreValue(gameStateStore);
      const gameState = moveCardForChainActivation(currentState, instance);
      gameStateStore.set(gameState);

      // activationSteps と resolutionSteps を生成（カード移動後の状態で）
      const activationSteps = action.createActivationSteps(gameState, instance);
      const resolutionSteps = action.createResolutionSteps(gameState, instance);

      // チェーンブロックをスタックに追加
      chainStackStore.pushChainBlock({
        sourceInstanceId: instance.instanceId,
        sourceCardId: instance.id,
        effectId: action.effectId,
        spellSpeed: action.spellSpeed,
        resolutionSteps,
        isNegated: false,
      });

      // activationSteps を処理
      if (activationSteps.length > 0) {
        effectQueueStore.startProcessing(activationSteps);
      } else {
        // activationSteps がない場合、再度チェーン確認へ
        finalizeProcessing(update);
      }
    },

    resolveChain: () => {
      // チェーン構築を終了し、解決を開始
      chainStackStore.endChainBuilding();
      effectQueueStore.continueChainResolution();
    },

    continueChainResolution: () => {
      // チェーンスタックから次のブロックを取り出して処理
      const block = chainStackStore.popChainBlock();

      if (!block) {
        // チェーン解決完了
        chainStackStore.reset();
        return;
      }

      // 無効化されていない場合のみ resolutionSteps を実行
      if (!block.isNegated && block.resolutionSteps.length > 0) {
        update((state) => ({
          ...state,
          isActive: true,
          steps: block.resolutionSteps,
          currentIndex: 0,
          currentStep: block.resolutionSteps[0] || null,
        }));

        // 最初のステップの処理を開始
        // interactive ステップも含めて常に confirmCurrentStep() を呼ぶ
        effectQueueStore.confirmCurrentStep();
      } else {
        // resolutionSteps がない、または無効化されている場合は次へ
        effectQueueStore.continueChainResolution();
      }
    },

    cancelProcessing: () => {
      update((state) => ({
        ...state,
        isActive: false,
        currentStep: null,
        steps: [],
        currentIndex: -1,
      }));
    },

    reset: () => {
      update((state) => ({
        ...state,
        isActive: false,
        currentStep: null,
        steps: [],
        currentIndex: -1,
      }));
    },
  };
}

export const effectQueueStore = createEffectQueueStore();
