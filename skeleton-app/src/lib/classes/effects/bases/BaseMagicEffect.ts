import type { DuelState } from "$lib/classes/DuelState";
import { BaseEffect } from "$lib/classes/effects/bases/BaseEffect";
import { EffectType } from "$lib/types/effect";
import type { MagicSubType } from "$lib/types/effect";

/**
 * 魔法カード効果の基底クラス
 *
 * 設計思想:
 * - 魔法カード共通の処理を抽象化
 * - フェイズ別発動条件の管理
 * - 魔法カードタイプ別の特殊処理
 */
export abstract class BaseMagicEffect extends BaseEffect {
  protected readonly magicSubType: MagicSubType;

  constructor(id: string, name: string, description: string, cardId: number, magicSubType: MagicSubType) {
    super(id, name, EffectType.ACTIVATE, description, cardId);
    this.magicSubType = magicSubType;
  }

  /**
   * 魔法カードの基本発動条件をチェック
   * サブクラスで必要に応じてオーバーライド
   */
  canActivate(state: DuelState): boolean {
    // ゲームが継続中かチェック
    if (!this.isGameOngoing(state)) {
      return false;
    }

    // 魔法カードタイプ別の発動条件チェック
    return this.canActivateByMagicType(state);
  }

  /**
   * 魔法カードタイプ別の発動条件
   */
  protected canActivateByMagicType(state: DuelState): boolean {
    switch (this.magicSubType) {
      case "normal":
      case "ritual":
      case "field":
      case "equip":
        // 通常魔法、儀式魔法、フィールド魔法、装備魔法
        // メインフェイズでのみ発動可能
        return this.isValidSpellPhase(state);

      case "quick-play":
        // 速攻魔法
        // 任意のタイミングで発動可能（相手ターンでも可）
        return true;

      case "effect":
        // 効果魔法（カード個別に条件が異なる）
        // サブクラスでオーバーライドすることを想定
        return this.isValidSpellPhase(state);

      default:
        console.warn(`[BaseMagicEffect] 未対応の魔法タイプ: ${this.magicSubType}`);
        return false;
    }
  }

  /**
   * 魔法カードタイプを取得
   */
  getMagicSubType(): MagicSubType {
    return this.magicSubType;
  }

  /**
   * フィールド魔法特有の処理
   */
  protected isFieldMagic(): boolean {
    return this.magicSubType === "field";
  }

  /**
   * 装備魔法特有の処理
   */
  protected isEquipMagic(): boolean {
    return this.magicSubType === "equip";
  }

  /**
   * 速攻魔法特有の処理
   */
  protected isQuickPlayMagic(): boolean {
    return this.magicSubType === "quick-play";
  }

  /**
   * 魔法カード共通の後処理
   * 必要に応じてサブクラスでオーバーライド
   */
  protected postMagicActivation(): void {
    // フィールド魔法の場合、フィールドゾーンに配置
    if (this.isFieldMagic()) {
      this.activateFieldMagic();
    }

    // 装備魔法の場合、装備処理
    if (this.isEquipMagic()) {
      this.activateEquipMagic();
    }
  }

  /**
   * フィールド魔法の発動処理
   * フィールド魔法のサブクラスでオーバーライド
   */
  protected activateFieldMagic(): void {
    console.log(`[${this.name}] フィールド魔法が発動されました`);
    // 実装は具体的なフィールド魔法クラスで行う
  }

  /**
   * 装備魔法の発動処理
   * 装備魔法のサブクラスでオーバーライド
   */
  protected activateEquipMagic(): void {
    console.log(`[${this.name}] 装備魔法が発動されました`);
    // 実装は具体的な装備魔法クラスで行う
  }
}
