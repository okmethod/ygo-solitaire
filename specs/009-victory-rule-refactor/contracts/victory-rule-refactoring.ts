/**
 * VictoryRule Refactoring - Interface Contract
 *
 * このファイルは、VictoryRule.tsのリファクタリング後のインターフェースを定義します。
 * 実装は skeleton-app/src/lib/domain/rules/VictoryRule.ts で行われます。
 *
 * @see specs/009-victory-rule-refactor/data-model.md
 */

import type { GameState, GameResult } from "../../../../skeleton-app/src/lib/domain/models/GameState";

/**
 * VictoryRule - Refactored API Contract
 */
export interface VictoryRuleContract {
  /**
   * 勝利条件をチェックし、GameResultを返す
   *
   * 処理順序:
   * 1. 特殊勝利条件チェック（ExodiaVictoryRule等）
   * 2. 基本勝利条件チェック（LP0、デッキアウト）
   *
   * @param state - 現在のゲーム状態
   * @returns GameResult（勝敗情報）
   *
   * @example
   * ```typescript
   * const state = createExodiaVictoryState();
   * const result = checkVictoryConditions(state);
   * // result.isGameOver === true
   * // result.winner === "player"
   * // result.reason === "exodia"
   * ```
   */
  checkVictoryConditions(state: GameState): GameResult;

  /**
   * エクゾディア勝利判定（後方互換性のために維持）
   *
   * @param state - 現在のゲーム状態
   * @returns エクゾディア勝利の場合true
   */
  hasExodiaVictory(state: GameState): boolean;

  /**
   * LP0敗北判定（後方互換性のために維持）
   *
   * @param state - 現在のゲーム状態
   * @returns プレイヤーのLPが0以下の場合true
   */
  hasLPDefeat(state: GameState): boolean;

  /**
   * LP0勝利判定（後方互換性のために維持）
   *
   * @param state - 現在のゲーム状態
   * @returns 相手のLPが0以下の場合true
   */
  hasLPVictory(state: GameState): boolean;

  /**
   * デッキアウト敗北判定（後方互換性のために維持）
   *
   * @param state - 現在のゲーム状態
   * @returns デッキが空でDrawフェーズの場合true
   */
  hasDeckOutDefeat(state: GameState): boolean;

  /**
   * 不足エクゾディアパーツ取得（後方互換性のために維持）
   *
   * @param state - 現在のゲーム状態
   * @returns 不足しているエクゾディアパーツのカードID配列
   */
  getMissingExodiaPieces(state: GameState): string[];

  /**
   * 手札のエクゾディアパーツ数（後方互換性のために維持）
   *
   * @param state - 現在のゲーム状態
   * @returns 手札にあるエクゾディアパーツの数（0-5）
   */
  countExodiaPiecesInHand(state: GameState): number;
}

/**
 * checkVictoryConditions() Implementation Requirements
 */
export interface CheckVictoryConditionsRequirements {
  /**
   * 処理順序
   */
  executionOrder: [
    "特殊勝利条件チェック（ExodiaVictoryRule等）",
    "基本勝利条件チェック（LP0プレイヤー敗北）",
    "基本勝利条件チェック（LP0相手勝利）",
    "基本勝利条件チェック（デッキアウト敗北）",
    "勝敗なし（ゲーム継続）"
  ];

  /**
   * 特殊勝利条件の実装方法
   */
  specialVictoryConditions: {
    implementation: "直接インスタンス化";
    pattern: "const exodiaRule = new ExodiaVictoryRule(); if (exodiaRule.canApply(state, {}) && exodiaRule.checkPermission(state, {})) { ... }";
    notUsed: "AdditionalRuleRegistry.collectActiveRules()";
    reason: "エクゾディアは特定カードの効果ではなく、5パーツが揃った状態を表す";
  };

  /**
   * 基本勝利条件の実装方法
   */
  basicVictoryConditions: {
    implementation: "ハードコード維持";
    checks: ["LP0プレイヤー敗北", "LP0相手勝利", "デッキアウト敗北"];
    reason: "基本ルールであり、パフォーマンスと可読性の観点からハードコード維持";
  };

  /**
   * 後方互換性
   */
  backwardCompatibility: {
    preservedFunctions: [
      "hasExodiaVictory()",
      "hasLPDefeat()",
      "hasLPVictory()",
      "hasDeckOutDefeat()",
      "getMissingExodiaPieces()",
      "countExodiaPiecesInHand()"
    ];
    reason: "UI層やテストで使用されているため維持";
  };
}

/**
 * GameResult Type Contract
 */
export interface GameResultContract {
  /**
   * ゲーム終了フラグ
   */
  isGameOver: boolean;

  /**
   * 勝者（ゲーム終了時のみ）
   */
  winner?: "player" | "opponent" | "draw";

  /**
   * 勝因・敗因（ゲーム終了時のみ）
   */
  reason?: "exodia" | "lp0" | "deckout" | "surrender";

  /**
   * 表示メッセージ（ゲーム終了時のみ）
   */
  message?: string;
}

/**
 * Refactoring Checklist
 */
export interface RefactoringChecklist {
  before: {
    exodiaCheck: "hasExodiaInHand(state)を直接チェック";
    pattern: "if (hasExodiaInHand(state)) { return { ... }; }";
  };

  after: {
    exodiaCheck: "ExodiaVictoryRuleをインスタンス化してチェック";
    pattern: "const exodiaRule = new ExodiaVictoryRule(); if (exodiaRule.canApply(state, {}) && exodiaRule.checkPermission(state, {})) { return { ... }; }";
  };

  changes: [
    "ExodiaVictoryRuleをimport",
    "checkVictoryConditions()の先頭でExodiaVictoryRuleをインスタンス化",
    "hasExodiaInHand()の直接チェックを削除",
    "既存のヘルパー関数は変更なし"
  ];

  verification: [
    "すべてのテストがパス",
    "Lintエラーゼロ",
    "Formatエラーゼロ",
    "手動テストでエクゾディア勝利が正しく動作"
  ];
}

/**
 * Performance Contract
 */
export interface PerformanceContract {
  target: {
    metric: "checkVictoryConditions()の平均実行時間";
    baseline: "リファクタリング前の実行時間 T ms";
    goal: "T * 1.1 ms 以内（10%以内の変動）";
  };

  overhead: {
    classInstantiation: "O(1)（軽量オブジェクト）";
    methodCalls: "2回（canApply, checkPermission）";
    totalOverhead: "< 1μs（無視できるレベル）";
  };

  conclusion: "パフォーマンス劣化なし";
}

/**
 * Usage Example - Before vs After
 */

/**
 * Before Refactoring
 *
 * @example
 * ```typescript
 * export function checkVictoryConditions(state: GameState): GameResult {
 *   // Exodia check (ハードコード)
 *   if (hasExodiaInHand(state)) {
 *     return {
 *       isGameOver: true,
 *       winner: "player",
 *       reason: "exodia",
 *       message: `エクゾディア揃った！...`,
 *     };
 *   }
 *
 *   // LP0 checks
 *   if (state.lp.player <= 0) { ... }
 *   if (state.lp.opponent <= 0) { ... }
 *
 *   // Deck out check
 *   if (state.zones.deck.length === 0 && state.phase === "Draw") { ... }
 *
 *   return { isGameOver: false };
 * }
 * ```
 */

/**
 * After Refactoring
 *
 * @example
 * ```typescript
 * import { ExodiaVictoryRule } from "../effects/additional/ExodiaVictoryRule";
 *
 * export function checkVictoryConditions(state: GameState): GameResult {
 *   // 1. 特殊勝利条件チェック（AdditionalRuleパターン）
 *   const exodiaRule = new ExodiaVictoryRule();
 *   if (exodiaRule.canApply(state, {}) && exodiaRule.checkPermission(state, {})) {
 *     return {
 *       isGameOver: true,
 *       winner: "player",
 *       reason: "exodia",
 *       message: `エクゾディア揃った！...`,
 *     };
 *   }
 *
 *   // 2. 基本勝利条件チェック（ハードコード維持）
 *   
 *   // LP0敗北（プレイヤー）
 *   if (state.lp.player <= 0) {
 *     return {
 *       isGameOver: true,
 *       winner: "opponent",
 *       reason: "lp0",
 *       message: `ライフポイントが0になりました。敗北です。`,
 *     };
 *   }
 *
 *   // LP0勝利（相手）
 *   if (state.lp.opponent <= 0) {
 *     return {
 *       isGameOver: true,
 *       winner: "player",
 *       reason: "lp0",
 *       message: `相手のライフポイントが0になりました。勝利です！`,
 *     };
 *   }
 *
 *   // デッキアウト敗北
 *   if (state.zones.deck.length === 0 && state.phase === "Draw") {
 *     return {
 *       isGameOver: true,
 *       winner: "opponent",
 *       reason: "deckout",
 *       message: `デッキが空でドローできません。デッキアウトで敗北です。`,
 *     };
 *   }
 *
 *   // 勝敗なし
 *   return {
 *     isGameOver: false,
 *   };
 * }
 * ```
 */
