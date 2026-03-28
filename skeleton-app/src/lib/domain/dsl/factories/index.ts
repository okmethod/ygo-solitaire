/**
 * DSL Factories - 効果インスタンス生成関連のエクスポート
 *
 * ファクトリ一覧を兼ねるため、コメントも記載している。
 */

// カードの発動: 通常魔法
export { GenericNormalSpellActivation, createGenericNormalSpellActivation } from "./GenericNormalSpellActivation";

// カードの発動: 速攻魔法
export {
  GenericQuickPlaySpellActivation,
  createGenericQuickPlaySpellActivation,
} from "./GenericQuickPlaySpellActivation";

// カードの発動: 永続魔法
export {
  GenericContinuousSpellActivation,
  createGenericContinuousSpellActivation,
} from "./GenericContinuousSpellActivation";

// カードの発動: フィールド魔法
export { GenericIgnitionEffect, createGenericIgnitionEffect } from "./GenericIgnitionEffect";

// カードの発動: 装備魔法
export { GenericEquipSpellActivation, createGenericEquipSpellActivation } from "./GenericEquipSpellActivation";

// 誘発効果
export { GenericTriggerEffect, createGenericTriggerEffect } from "./GenericTriggerEffect";

// 永続効果（トリガールール）
export { GenericContinuousTriggerRule } from "./GenericContinuousTriggerRule";
