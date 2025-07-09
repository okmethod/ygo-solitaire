import type { DuelState } from "$lib/classes/DuelState";
import type { Card } from "./card";

/**
 * 効果の種類を表す列挙型
 */
export enum EffectType {
  /** ドロー効果 */
  DRAW = "draw",
  /** サーチ効果 */
  SEARCH = "search",
  /** 勝利条件 */
  WIN_CONDITION = "win_condition",
  /** 一般的な発動効果 */
  ACTIVATE = "activate",
  /** 罠カード効果 */
  TRAP = "trap",
}

/**
 * 効果実行の結果
 */
export interface EffectResult {
  /** 実行が成功したかどうか */
  success: boolean;
  /** 実行結果のメッセージ */
  message: string;
  /** 実行によって影響を受けたカード */
  affectedCards?: Card[];
  /** ゲーム状態に変化があったかどうか */
  stateChanged: boolean;
  /** 勝利条件が満たされたかどうか */
  gameEnded?: boolean;
  /** 次に実行される効果のID（チェーン用） */
  nextEffectId?: string;
  /** ドローしたカード（ドロー効果用） */
  drawnCards?: Card[];
}

/**
 * 効果の基本インターフェース
 */
export interface Effect {
  /** 効果の一意識別子 */
  id: string;
  /** 効果の名前 */
  name: string;
  /** 効果の種類 */
  type: EffectType;
  /** 効果の説明 */
  description: string;
  /** この効果を持つカードのID */
  cardId: number;

  /**
   * 効果が発動可能かどうかを判定する
   * @param state 現在のデュエル状態
   * @returns 発動可能な場合はtrue
   */
  canActivate(state: DuelState): boolean;

  /**
   * 効果を実行する
   * @param state 現在のデュエル状態
   * @returns 実行結果
   */
  execute(state: DuelState): EffectResult;
}

/**
 * ユーザーの選択が必要な効果の結果
 */
export interface InteractiveEffectResult extends EffectResult {
  /** ユーザーに選択を求める場合のオプション */
  choices?: {
    id: string;
    label: string;
    value: unknown;
  }[];
  /** 選択が必要な場合のコールバック */
  onChoice?: (choiceId: string) => void;
}

/**
 * 効果実行コンテキスト
 * 効果実行時の追加情報を保持
 */
export interface EffectContext {
  /** 効果を発動したプレイヤー */
  player: "self" | "opponent";
  /** 効果発動のタイミング */
  timing: "main_phase" | "battle_phase" | "end_phase" | "any";
  /** チェーンブロック内での順序 */
  chainIndex?: number;
  /** 追加のコンテキストデータ */
  metadata?: Record<string, unknown>;
}
