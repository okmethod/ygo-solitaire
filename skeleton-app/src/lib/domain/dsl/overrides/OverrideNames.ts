/**
 * OverrideNames - Override名の定数定義
 *
 * 型安全な Override 名を提供する。
 * DSL の "effectAdditionalRules.unclassified" セクションで使用する。
 *
 * @module domain/dsl/overrides/OverrideNames
 */

export const OVERRIDE_NAMES = {
  /** フィールド離脱時の移動先オーバーライド */
  FIELD_DEPARTURE_DESTINATION: "FIELD_DEPARTURE_DESTINATION",
} as const;

/** 登録済み Override 名の Union 型 */
export type OverrideName = (typeof OVERRIDE_NAMES)[keyof typeof OVERRIDE_NAMES];
