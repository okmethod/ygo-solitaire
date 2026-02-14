/**
 * ValidationResult - ゲーム状態更新の実行条件チェック結果モデル
 *
 * 条件チェックの戻り値型とエラーコード定数を定義。
 * エラーメッセージの一元管理と、将来的な多言語対応の基盤を提供。
 */

/** ゲーム状態更新エラーコード定数 */
export const ERROR_CODES = {
  // 共通エラー
  GAME_OVER: "GAME_OVER",
  NOT_MAIN_PHASE: "NOT_MAIN_PHASE",

  // カード関連
  CARD_NOT_FOUND: "CARD_NOT_FOUND",
  CARD_NOT_IN_HAND: "CARD_NOT_IN_HAND",
  CARD_NOT_IN_VALID_LOCATION: "CARD_NOT_IN_VALID_LOCATION",
  CARD_NOT_ON_FIELD: "CARD_NOT_ON_FIELD",
  CARD_NOT_FACE_UP: "CARD_NOT_FACE_UP",
  NOT_SPELL_CARD: "NOT_SPELL_CARD",
  NOT_SPELL_OR_TRAP_CARD: "NOT_SPELL_OR_TRAP_CARD",
  NOT_MONSTER_CARD: "NOT_MONSTER_CARD",

  // ゾーン関連
  SPELL_TRAP_ZONE_FULL: "SPELL_TRAP_ZONE_FULL",
  MONSTER_ZONE_FULL: "MONSTER_ZONE_FULL",

  // デッキ関連
  INSUFFICIENT_DECK: "INSUFFICIENT_DECK",

  // カウンター関連
  INSUFFICIENT_COUNTERS: "INSUFFICIENT_COUNTERS",

  // 召喚・発動制限
  SUMMON_LIMIT_REACHED: "SUMMON_LIMIT_REACHED",
  QUICK_PLAY_RESTRICTION: "QUICK_PLAY_RESTRICTION",
  ACTIVATION_CONDITIONS_NOT_MET: "ACTIVATION_CONDITIONS_NOT_MET",
  NO_IGNITION_EFFECT: "NO_IGNITION_EFFECT",

  // フェイズ関連
  PHASE_TRANSITION_NOT_ALLOWED: "PHASE_TRANSITION_NOT_ALLOWED",
} as const;

export type ValidationErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/** 実行条件チェック結果 */
export interface ValidationResult {
  readonly isValid: boolean;
  readonly errorCode?: ValidationErrorCode;
  readonly errorParams?: Record<string, unknown>; // 動的パラメータ（カード名、枚数等）
}

/** エラーメッセージマップ（日本語） */
const ERROR_MESSAGES: Record<ValidationErrorCode, string> = {
  // 共通エラー
  GAME_OVER: "ゲームは終了しています",
  NOT_MAIN_PHASE: "メインフェイズではありません",

  // カード関連
  CARD_NOT_FOUND: "カードが見つかりません",
  CARD_NOT_IN_HAND: "カードが手札にありません",
  CARD_NOT_IN_VALID_LOCATION: "カードが有効な場所にありません",
  CARD_NOT_ON_FIELD: "カードがフィールドにありません",
  CARD_NOT_FACE_UP: "カードが表側表示ではありません",
  NOT_SPELL_CARD: "魔法カードではありません",
  NOT_SPELL_OR_TRAP_CARD: "魔法または罠カードではありません",
  NOT_MONSTER_CARD: "モンスターカードではありません",

  // ゾーン関連
  SPELL_TRAP_ZONE_FULL: "魔法・罠ゾーンに空きがありません",
  MONSTER_ZONE_FULL: "モンスターゾーンに空きがありません",

  // デッキ関連
  INSUFFICIENT_DECK: "デッキのカードが不足しています",

  // カウンター関連
  INSUFFICIENT_COUNTERS: "カウンターが不足しています",

  // 召喚・発動制限
  SUMMON_LIMIT_REACHED: "召喚権がありません",
  QUICK_PLAY_RESTRICTION: "速攻魔法はセットしたターンに発動できません",
  ACTIVATION_CONDITIONS_NOT_MET: "発動条件を満たしていません",
  NO_IGNITION_EFFECT: "このカードには起動効果がありません",

  // フェイズ関連
  PHASE_TRANSITION_NOT_ALLOWED: "フェイズ遷移が許可されていません",
};

/** 成功した ValidationResult */
export const successValidationResult = (): ValidationResult => {
  return { isValid: true };
};

/** 失敗した ValidationResult */
export const failureValidationResult = (
  errorCode: ValidationErrorCode,
  errorParams?: Record<string, unknown>,
): ValidationResult => {
  return { isValid: false, errorCode, errorParams };
};

/**
 * エラーメッセージ（文字列）を取得する
 *
 * TODO: 将来的にはテンプレート変数の置換処理を実装予定。
 */
export const validationErrorMessage = (result: ValidationResult): string => {
  if (result.isValid || !result.errorCode) {
    return "";
  }

  const template = ERROR_MESSAGES[result.errorCode];

  // 例: "デッキに{required}枚必要ですが、{actual}枚しかありません"
  if (result.errorParams) {
    // 簡易的なテンプレート置換（後で拡張）
    return template;
  }

  return template;
};
