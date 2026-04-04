/**
 * effectQueueStore - 効果処理ステップキューストア
 *
 * 効果処理ステップキューの Single Source of Truth (SSOT)。
 * 蓄積された AtomicStep を順次実行し、通知・カード選択を プレゼン層 に委譲する。
 *
 * @architecture レイヤー間依存ルール - アプリ層 (Store)
 * - ROLE: ゲーム進行制御、プレゼン層へのデータ提供
 * - ALLOWED: ドメイン層への依存
 * - FORBIDDEN: インフラ層への依存、プレゼン層への依存
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
 * @module application/stores/effectQueueStore
 * @see {@link docs/domain/effect-model.md}
 * @see {@link docs/domain/chain-system.md}
 * @see {@link docs/architecture/effect-model-design.md}
 */

import { writable, get as getStoreValue } from "svelte/store";
import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep, GameEvent, EventTimeline } from "$lib/domain/models/GameProcessing";
import type { ChainableAction } from "$lib/domain/models/Effect";
import type { ChainBlockParams } from "$lib/domain/models/Chain/ChainBlock";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { AdditionalRuleRegistry } from "$lib/domain/effects/rules";
import { ChainableActionRegistry } from "$lib/domain/effects/actions";
import { CardDataRegistry } from "$lib/domain/cards/CardDataRegistry";
import { placeCardForActivation } from "$lib/domain/rules/ActivationRule";
import { isThenMarker } from "$lib/domain/dsl/steps/builders/timing";
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
  message?: string;
}

// 1ステップ分のアクションを実行する（共通処理）
function executeStepAction(step: AtomicStep, gameState: GameSnapshot, selectedIds?: string[]): StepActionResult {
  const result = step.action(gameState, selectedIds);
  if (result.success) {
    gameStateStore.set(result.updatedState);
    return {
      updatedState: result.updatedState,
      emittedEvents: result.emittedEvents || [],
      message: result.message,
    };
  }
  console.error("[executeStepAction] Step action failed:", step.id, result.message);
  return { updatedState: gameState, emittedEvents: [] };
}

// Strategy: "silent"レベル - 通知なし、即座に実行
const silentStrategy: NotificationStrategy = async (step, gameState) => {
  const result = executeStepAction(step, gameState);
  return { shouldContinue: true, emittedEvents: result.emittedEvents };
};

// Strategy: "static"レベル - 静的メッセージをトースト通知、自動で次へ進む
const staticStrategy: NotificationStrategy = async (step, gameState, handlers) => {
  const result = executeStepAction(step, gameState);

  if (handlers.notification) {
    handlers.notification.showInfo(step.summary, step.description);
  }

  return { shouldContinue: true, delay: 300, emittedEvents: result.emittedEvents };
};

// Strategy: "dynamic"レベル - actionが返す動的メッセージをトースト表示、自動で次へ進む
const dynamicStrategy: NotificationStrategy = async (step, gameState, handlers) => {
  const result = executeStepAction(step, gameState);

  if (handlers.notification && result.message) {
    // UI実装では description（第2引数）をトーストに表示するため、動的メッセージを第2引数に渡す
    handlers.notification.showInfo("", result.message);
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

    // EffectActivationContext を解決（_effectId が指定されている場合）
    const activationContext = config._effectId ? gameState.activationContexts[config._effectId] : undefined;

    availableCards = config._filter
      ? sourceZone.filter((card, index) => config._filter!(card, index, activationContext, sourceZone))
      : sourceZone;
  }

  // イベント情報をキャプチャするための変数
  let emittedEvents: GameEvent[] = [];

  // 発動元カード名を解決
  const sourceCardName = step.sourceCardId ? CardDataRegistry.getCardNameWithBrackets(step.sourceCardId) : undefined;

  // カード選択モーダル（Promise化）- 状態を更新してモーダルを表示
  await new Promise<void>((resolve) => {
    updateState((s) => ({
      ...s,
      cardSelectionConfig: {
        availableCards,
        sourceCardName,
        minCards: config.minCards,
        maxCards: config.maxCards,
        summary: config.summary,
        description: config.description,
        cancelable: config.cancelable,
        canConfirm: config.canConfirm,
        onConfirm: (selectedInstanceIds: string[]) => {
          // モーダル表示中に状態が変わっている可能性があるため、最新の状態を取得
          const latestGameState = getStoreValue(gameStateStore);
          const result = executeStepAction(step, latestGameState, selectedInstanceIds);
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
const interactiveWithoutSelectionStrategy: NotificationStrategy = async (step, _gameState, _handlers, updateState) => {
  // イベント情報をキャプチャするための変数
  let emittedEvents: GameEvent[] = [];

  // 発動元カード名を解決
  const sourceCardName = step.sourceCardId ? CardDataRegistry.getCardNameWithBrackets(step.sourceCardId) : undefined;

  // 効果確認モーダル（Promise化）- 状態を更新してモーダルを表示
  await new Promise<void>((resolve) => {
    updateState((s) => ({
      ...s,
      confirmationConfig: {
        sourceCardName,
        summary: step.summary,
        description: step.description,
        onConfirm: () => {
          // モーダル表示中に状態が変わっている可能性があるため、最新の状態を取得
          const latestGameState = getStoreValue(gameStateStore);
          const result = executeStepAction(step, latestGameState);
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
function selectInteractiveStrategy(step: AtomicStep): NotificationStrategy {
  const level = step.notificationLevel || "static";

  if (level === "silent") return silentStrategy;
  if (level === "static") return staticStrategy;
  if (level === "dynamic") return dynamicStrategy;

  return step.cardSelectionConfig ? interactiveWithSelectionStrategy : interactiveWithoutSelectionStrategy;
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
    // AdditionalRule の TriggerRule を収集
    const additionalRuleSteps = AdditionalRuleRegistry.collectTriggerSteps(currentState, event);
    // 即座に実行
    triggerSteps.push(...additionalRuleSteps);

    // ChainableAction の TriggerEffect を収集（強制効果のみ）
    const chainableActionSteps = ChainableActionRegistry.collectTriggerSteps(currentState, event, (chainBlock) => {
      // チェーンブロック作成してスタックに追加
      chainStackStore.pushChainBlock(chainBlock);
    });
    triggerSteps.push(...chainableActionSteps);

    // TODO: 任意効果のチェーン確認UI統合（将来拡張）
    // collectTriggerSteps の戻り値を { mandatorySteps, optionalEffects } に拡張し、
    // optionalEffects がある場合は既存のチェーン確認UIを表示する。
    //
    // 実装イメージ:
    // const result = ChainableActionRegistry.collectTriggerSteps(...);
    // triggerSteps.push(...result.mandatorySteps);
    //
    // if (result.optionalEffects.length > 0) {
    //   update((s) => ({
    //     ...s,
    //     chainConfirmationConfig: {
    //       chainableCards: result.optionalEffects,
    //       onActivate: (instanceId) => { effectQueueStore.activateChain(...); },
    //       onPass: () => { update((s) => ({ ...s, chainConfirmationConfig: null })); effectQueueStore.next(); },
    //     },
    //   }));
    //   return currentSteps; // UIが表示されるので待機
    // }
  }

  if (triggerSteps.length === 0) {
    return currentSteps;
  }

  // 現在位置の次にトリガーステップを挿入
  return [...currentSteps.slice(0, currentIndex + 1), ...triggerSteps, ...currentSteps.slice(currentIndex + 1)];
}

/** 効果処理ステップキューストアのインターフェース */
export interface EffectQueueStore {
  subscribe: (run: (value: EffectQueueState) => void) => () => void;

  /** 通知ハンドラを登録する（Dependency Injection） */
  registerNotificationHandler: (handler: NotificationHandler) => void;

  /** 効果処理ステップキューを処理する（GameFacade向けエンドポイント） */
  handleEffectQueues: (chainBlock: ChainBlockParams | undefined, activationSteps: AtomicStep[]) => void;

  /** チェーン発動する（チェーン確認UIからのコールバック用） */
  activateChain: (instance: CardInstance, action: ChainableAction) => void;
}

/**
 * 効果処理ステップキューストアを生成する
 *
 * 内部メソッド:
 * - beginSequence: 効果処理シーケンスを開始する
 * - processCurrentStep: 現在のステップの処理を確定して次に進む
 * - advanceToNextStep: 次ステップに遷移する
 * - finishCurrentSequence: 効果処理シーケンスの終了処理を行う（チェーン解決含む）
 * - startChainResolution: チェーン構築を終了し、解決を開始する
 * - processNextChainBlock: 次のチェーンブロックを取り出して解決する
 *
 * 公開API: EffectQueueStore インターフェースに準拠
 * - subscribe: Svelteストアの購読メソッド
 * - registerNotificationHandler: 通知ハンドラを登録する（Dependency Injection）
 * - handleEffectQueues: 効果処理ステップキューを処理する（GameFacade向けエンドポイント）
 * - activateChain: チェーン発動する（チェーン確認UIからのコールバック用）
 */
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

  // 効果処理シーケンスを開始する
  const beginSequence = (steps: AtomicStep[]) => {
    update((state) => ({
      ...state,
      isActive: true,
      steps,
      currentIndex: 0,
      currentStep: steps[0] || null,
    }));

    const firstStep = steps[0];
    if (firstStep) {
      // すべての notificationLevel で processCurrentStep() を呼ぶ
      // （interactiveの場合も cardSelectionConfig を設定するために必要）
      processCurrentStep();
    }
  };

  // 現在のステップの処理を確定して次に進む
  const processCurrentStep = async () => {
    let state = getStoreValue(self);
    if (!state.currentStep) return;

    // タイミング制御: THEN マーカーを検出した場合はタイミングを進めて次のステップへ
    if (isThenMarker(state.currentStep)) {
      update((s) => ({
        ...s,
        eventTimeline: GameProcessing.TimeLine.advanceTime(s.eventTimeline),
      }));
      const hasNext = advanceToNextStep(state, update);
      if (hasNext) {
        processCurrentStep();
      }
      return;
    }

    // インタラクティブステップ処理: Strategy Pattern で実行戦略を選択
    const currentGameState = getStoreValue(gameStateStore);
    const strategy = selectInteractiveStrategy(state.currentStep);
    const result = await strategy(
      state.currentStep,
      currentGameState,
      { notification: state.notificationHandler },
      update,
    );

    // イベントトリガー処理: emittedEvents がある場合はトリガールールを収集してキューに挿入
    if (result.emittedEvents && result.emittedEvents.length > 0) {
      // EventTimeline に記録（将来の拡張用）
      let updatedTimeline = state.eventTimeline;
      for (const event of result.emittedEvents) {
        updatedTimeline = GameProcessing.TimeLine.recordEvent(updatedTimeline, event);
      }

      // 最新の GameState を取得してトリガールールを収集
      const latestGameState = getStoreValue(gameStateStore);
      const updatedSteps = processTriggerEvents(result.emittedEvents, latestGameState, state.steps, state.currentIndex);

      // ステップキューと EventTimeline を更新
      update((s) => ({
        ...s,
        steps: updatedSteps,
        eventTimeline: updatedTimeline,
      }));

      // 状態を再取得
      state = getStoreValue(self);
    }

    // 遅延が必要なら待機
    if (result.delay) {
      await new Promise((resolve) => setTimeout(resolve, result.delay));
    }

    // 次ステップへ遷移
    if (result.shouldContinue) {
      const hasNext = advanceToNextStep(state, update);
      if (hasNext) {
        processCurrentStep();
      }
    }
  };

  // 次ステップに遷移する
  function advanceToNextStep(
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
      // 次ステップがなければシーケンス終了処理へ
      finishCurrentSequence(update);
      return false;
    }
  }

  // 効果処理シーケンスの終了処理を行う
  function finishCurrentSequence(update: (updater: (state: EffectQueueState) => EffectQueueState) => void): void {
    // ストアリセット
    update((s) => ({
      ...s,
      isActive: false,
      currentStep: null,
      steps: [],
      currentIndex: -1,
    }));

    // チェーンスタックに残りがあれば処理を継続
    const chainState = getStoreValue(chainStackStore);
    if (chainState.stack.length > 0) {
      if (chainState.isBuilding) {
        // チェーン構築中: チェーン可能なカードを収集して確認UIを表示
        const gameState = getStoreValue(gameStateStore);
        const requiredSpellSpeed = chainStackStore.getRequiredSpellSpeed();
        const stackedInstanceIds = chainStackStore.getStackedInstanceIds();
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
                  self.activateChain(selected.instance, selected.action);
                }
              },
              onPass: () => {
                // チェーンをパス → 解決開始
                update((s) => ({ ...s, chainConfirmationConfig: null }));
                startChainResolution();
              },
            },
          }));
          return;
        }

        // チェーン可能なカードがない場合、即座に解決開始
        setTimeout(() => {
          startChainResolution();
        }, 0);
      } else {
        // チェーン解決中: 次のブロックを処理
        setTimeout(() => {
          processNextChainBlock();
        }, 0);
      }
    } else {
      // チェーンスタックが空: 全処理完了、リセット
      chainStackStore.reset();
    }
  }

  // チェーン構築を終了し、チェーン解決を開始する
  const startChainResolution = () => {
    chainStackStore.endChainBuilding();
    processNextChainBlock();
  };

  // 次のチェーンブロックを取り出して解決する
  function processNextChainBlock() {
    // チェーンスタックから次のブロックを取り出して処理
    const block = chainStackStore.popChainBlock();

    if (!block) {
      // チェーン解決完了
      chainStackStore.reset();
      return;
    }

    // resolutionSteps を実行する
    if (!block.isNegated && block.resolutionSteps.length > 0) {
      update((state) => ({
        ...state,
        isActive: true,
        steps: block.resolutionSteps,
        currentIndex: 0,
        currentStep: block.resolutionSteps[0] || null,
      }));
      processCurrentStep();
    } else {
      // resolutionSteps がない、または無効化されている場合は次へ
      processNextChainBlock();
    }
  }

  // 公開APIの実装
  const self: EffectQueueStore = {
    subscribe,

    /** 通知ハンドラを登録する（Dependency Injection） */
    registerNotificationHandler: (handler: NotificationHandler) => {
      update((state) => ({ ...state, notificationHandler: handler }));
    },

    /** 効果処理キューを処理する */
    handleEffectQueues: (chainBlock, activationSteps) => {
      // チェーンブロックがある場合は chainStackStore に登録
      if (chainBlock) {
        const chainState = getStoreValue(chainStackStore);
        // まだ構築中でない場合、新しいチェーンを開始
        if (chainState.stack.length === 0) {
          chainStackStore.startChain();
        }
        chainStackStore.pushChainBlock(chainBlock);
      }

      // activationSteps（発動時処理）を即座に実行
      // チェーン解決は effectQueueStore 内で処理完了後に行われる
      if (activationSteps && activationSteps.length > 0) {
        beginSequence(activationSteps);
      } else if (chainBlock) {
        // 発動時処理がない場合は即座にチェーン解決を開始
        startChainResolution();
      }
    },

    /** チェーン発動する */
    activateChain: (instance: CardInstance, action: ChainableAction) => {
      if (!chainStackStore.canChain(action.spellSpeed)) {
        console.warn("Invalid chain attempt: Spell speed too low.");
        return;
      }

      // チェーン確認モーダルを閉じる
      update((s) => ({ ...s, chainConfirmationConfig: null }));

      // カードを移動してゲーム状態を更新
      const currentState = getStoreValue(gameStateStore);
      const gameState: GameSnapshot = {
        ...currentState,
        space: placeCardForActivation(currentState.space, instance),
        activatedCardIds: GameState.updatedActivatedCardIds(currentState.activatedCardIds, instance.id),
      };
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
        beginSequence(activationSteps);
      } else {
        // activationSteps がない場合、再度チェーン確認へ
        finishCurrentSequence(update);
      }
    },
  };

  return self;
}

export const effectQueueStore = createEffectQueueStore();
