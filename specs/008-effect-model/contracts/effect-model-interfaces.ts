/**
 * Effect Model Interfaces - API Contracts
 * 
 * Domain層で定義される効果モデルの型定義を集約。
 * 実装者が参照すべき主要なインターフェースをエクスポート。
 * 
 * @module specs/008-effect-model/contracts
 */

// ===== Core Interfaces =====

/**
 * ChainableAction - チェーンブロックを作る処理のモデル
 * 
 * カードの発動と効果の発動を統一的に扱う。
 * 公式ルールのCONDITIONS/ACTIVATION/RESOLUTIONに対応。
 * 
 * Implementation: domain/models/ChainableAction.ts
 */
export interface ChainableAction {
  readonly isCardActivation: boolean;
  readonly spellSpeed: 1 | 2 | 3;
  
  canActivate(state: GameState): boolean;
  createActivationSteps(state: GameState): EffectResolutionStep[];
  createResolutionSteps(state: GameState, activatedCardInstanceId: string): EffectResolutionStep[];
}

/**
 * AdditionalRule - 追加ルールのモデル
 * 
 * 永続効果、ルール効果、効果外テキストを体系的に扱う。
 * 
 * Implementation: domain/models/AdditionalRule.ts
 */
export interface AdditionalRule {
  readonly isEffect: boolean;
  readonly category: RuleCategory;
  
  canApply(state: GameState, context: RuleContext): boolean;
  apply?(state: GameState, context: RuleContext): GameState;
  checkPermission?(state: GameState, context: RuleContext): boolean;
  replace?(state: GameState, context: RuleContext): GameState;
}

/**
 * RuleCategory - 追加ルールのカテゴリ
 */
export type RuleCategory =
  // データ書き換え系
  | "NameOverride"
  | "StatusModifier"
  // 判定追加・制限追加系
  | "SummonCondition"
  | "SummonPermission"
  | "ActionPermission"
  | "VictoryCondition"
  // 処理置換・処理フック系
  | "ActionReplacement"
  | "SelfDestruction";

/**
 * RuleContext - ルール適用時のコンテキスト
 */
export interface RuleContext {
  damageAmount?: number;
  damageTarget?: string;
  targetCardInstanceId?: string;
  [key: string]: unknown;
}

// ===== Supporting Types =====

/**
 * GameStateUpdateResult - ゲーム状態更新結果
 * 
 * effectStepsフィールドにより、Domain層からApplication層への効果解決委譲が可能。
 * 
 * Implementation: domain/models/GameStateUpdateResult.ts
 */
export interface GameStateUpdateResult {
  readonly success: boolean;
  readonly newState: GameState;
  readonly message?: string;
  readonly error?: string;
  readonly effectSteps?: EffectResolutionStep[];
}

/**
 * EffectResolutionStep - 効果解決ステップ
 * 
 * Implementation: domain/effects/EffectResolutionStep.ts
 */
export interface EffectResolutionStep {
  readonly id: string;
  readonly title: string;
  readonly message: string;
  action: (state: GameState, selectedInstanceIds?: string[]) => GameStateUpdateResult;
  readonly cardSelectionConfig?: {
    readonly minCards: number;
    readonly maxCards: number;
    readonly title: string;
    readonly message: string;
  };
}

/**
 * GameState - ゲーム状態
 * 
 * activatedIgnitionEffectsThisTurnフィールドで1ターンに1度制限を管理。
 * 
 * Implementation: domain/models/GameState.ts
 */
export interface GameState {
  readonly zones: Zones;
  readonly phase: GamePhase;
  readonly turn: number;
  readonly lp: LifePoints;
  readonly result: GameResult;
  readonly activatedIgnitionEffectsThisTurn: ReadonlySet<string>; // 新規追加
}

// ===== Registry Interfaces =====

/**
 * ChainableActionRegistry - チェーン可能な処理のレジストリ
 * 
 * Implementation: domain/registries/ChainableActionRegistry.ts
 */
export interface IChainableActionRegistry {
  register(cardId: number, action: ChainableAction): void;
  get(cardId: number): ChainableAction | undefined;
  clear(): void;
  getRegisteredCardIds(): number[];
}

/**
 * AdditionalRuleRegistry - 追加ルールのレジストリ
 * 
 * Implementation: domain/registries/AdditionalRuleRegistry.ts
 */
export interface IAdditionalRuleRegistry {
  register(cardId: number, rule: AdditionalRule): void;
  get(cardId: number): AdditionalRule[];
  getByCategory(cardId: number, category: RuleCategory): AdditionalRule[];
  collectActiveRules(state: GameState, category: RuleCategory, context?: RuleContext): AdditionalRule[];
  clear(): void;
  getRegisteredCardIds(): number[];
}

// ===== Usage Examples (TypeScript Documentation) =====

/**
 * Example: ChainableAction Implementation
 * 
 * ```typescript
 * export class PotOfGreedAction implements ChainableAction {
 *   readonly isCardActivation = true;
 *   readonly spellSpeed = 1 as const;
 * 
 *   canActivate(state: GameState): boolean {
 *     return state.phase === "Main1" && state.zones.deck.length >= 2;
 *   }
 * 
 *   createActivationSteps(state: GameState): EffectResolutionStep[] {
 *     return []; // 通常魔法は即座に実行するステップなし
 *   }
 * 
 *   createResolutionSteps(state: GameState, instanceId: string): EffectResolutionStep[] {
 *     return [
 *       {
 *         id: "pot-of-greed-draw",
 *         title: "カードをドローします",
 *         message: "デッキから2枚ドローします",
 *         action: (state) => {
 *           const newZones = drawCards(state.zones, 2);
 *           return { success: true, newState: { ...state, zones: newZones } };
 *         }
 *       }
 *     ];
 *   }
 * }
 * 
 * // Registry に登録
 * ChainableActionRegistry.register(55144522, new PotOfGreedAction());
 * ```
 */

/**
 * Example: AdditionalRule Implementation
 * 
 * ```typescript
 * export class ChickenGameContinuousRule implements AdditionalRule {
 *   readonly isEffect = true;
 *   readonly category: RuleCategory = "ActionPermission";
 * 
 *   canApply(state: GameState, context: RuleContext): boolean {
 *     const chickenGameOnField = state.zones.field.some(
 *       card => card.id === 67616300 && card.position === "faceUp"
 *     );
 *     if (!chickenGameOnField) return false;
 * 
 *     const damageTarget = context.damageTarget || "player";
 *     return damageTarget === "player"
 *       ? state.lp.player < state.lp.opponent
 *       : state.lp.opponent < state.lp.player;
 *   }
 * 
 *   checkPermission(state: GameState, context: RuleContext): boolean {
 *     return false; // ダメージ禁止
 *   }
 * }
 * 
 * // Registry に登録
 * AdditionalRuleRegistry.register(67616300, new ChickenGameContinuousRule());
 * ```
 */

/**
 * Example: ActivateSpellCommand with effectSteps
 * 
 * ```typescript
 * export class ActivateSpellCommand implements GameCommand {
 *   constructor(private readonly cardInstanceId: string) {} // DI不要
 * 
 *   execute(state: GameState): GameStateUpdateResult {
 *     const cardId = cardInstance.id;
 *     const action = ChainableActionRegistry.get(cardId);
 * 
 *     if (action && action.canActivate(state)) {
 *       const activationSteps = action.createActivationSteps(state);
 *       // activationSteps を即座に実行...
 * 
 *       const resolutionSteps = action.createResolutionSteps(state, this.cardInstanceId);
 *       return {
 *         success: true,
 *         newState: state,
 *         effectSteps: resolutionSteps, // Application層に委譲
 *       };
 *     }
 * 
 *     return createFailureResult(state, "Cannot activate");
 *   }
 * }
 * ```
 */

// ===== Type Guards =====

/**
 * Type guard for ChainableAction
 */
export function isChainableAction(obj: unknown): obj is ChainableAction {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "isCardActivation" in obj &&
    "spellSpeed" in obj &&
    "canActivate" in obj &&
    "createActivationSteps" in obj &&
    "createResolutionSteps" in obj
  );
}

/**
 * Type guard for AdditionalRule
 */
export function isAdditionalRule(obj: unknown): obj is AdditionalRule {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "isEffect" in obj &&
    "category" in obj &&
    "canApply" in obj
  );
}
