import type { DuelState } from "$lib/classes/DuelState";
import { BaseEffect } from "$lib/classes/effects/bases/BaseEffect";
import type { MagicSubType, EffectResult, InteractiveEffectResult } from "$lib/types/effect";

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
    super(id, name, description, cardId);
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
   * 魔法カードの基本発動処理
   * 1. 手札から魔法・罠ゾーンに移動
   * 2. 効果解決（サブクラスで実装）
   * 3. ゾーンから墓地に送る（継続系以外）
   */
  async execute(state: DuelState): Promise<EffectResult> {
    console.log(`[${this.name}] 魔法カードの発動処理を開始します`);

    // 発動条件の確認
    if (!this.canActivate(state)) {
      return this.createErrorResult(`${this.name}は発動できません`);
    }

    // 1. 手札から魔法・罠ゾーンに移動
    const activationResult = this.activateToField(state);
    if (!activationResult.success) {
      return activationResult;
    }

    // 2. 効果解決（サブクラスで実装）
    console.log(`[${this.name}] 効果解決を実行します`);
    const effectResult = await this.resolveMagicEffect(state);

    // 3. インタラクティブな効果の場合、後処理コールバックを設定
    if (effectResult.success && this.isInteractiveEffect(effectResult)) {
      this.setupInteractiveEffectCallback(effectResult as InteractiveEffectResult, state);
    }
    // 4. 通常効果の場合、継続系でない魔法カードは即座に墓地に送る
    else if (effectResult.success && this.shouldSendToGraveyardAfterResolution()) {
      this.sendToGraveyardAfterResolution(state);
    }

    return effectResult;
  }

  /**
   * 手札から魔法・罠ゾーンにカードを発動
   */
  protected activateToField(state: DuelState): EffectResult {
    // このeffectのcardIdに一致する最初のカードを手札から探す
    const cardInHandIndex = state.hands.findIndex((card) => card.id === this.cardId);
    if (cardInHandIndex === -1) {
      return this.createErrorResult(`手札に${this.name}が見つかりません`);
    }

    const cardInHand = state.hands[cardInHandIndex];

    // 魔法・罠ゾーンに空きがあるかチェック
    const emptyZoneIndex = state.field.spellTrapZones.findIndex((zone) => zone === null);
    if (emptyZoneIndex === -1) {
      return this.createErrorResult("魔法・罠ゾーンに空きがありません");
    }

    // 手札から魔法・罠ゾーンに移動
    const newHands = [...state.hands];
    newHands.splice(cardInHandIndex, 1); // 該当するカードを削除
    const newSpellTrapZones = [...state.field.spellTrapZones];
    newSpellTrapZones[emptyZoneIndex] = cardInHand;

    state.hands = newHands;
    state.field.spellTrapZones = newSpellTrapZones;

    console.log(`[${this.name}] 手札から魔法・罠ゾーン${emptyZoneIndex}に発動しました (${cardInHand.name})`);
    return this.createSuccessResult("魔法カードを発動しました", true);
  }

  /**
   * 魔法効果の解決（サブクラスで実装）
   */
  protected abstract resolveMagicEffect(state: DuelState): Promise<EffectResult>;

  /**
   * インタラクティブな効果かどうかを判定
   */
  protected isInteractiveEffect(result: EffectResult): result is InteractiveEffectResult {
    return "requiresCardSelection" in result;
  }

  /**
   * インタラクティブ効果の後処理コールバックを設定
   */
  protected setupInteractiveEffectCallback(result: InteractiveEffectResult, state: DuelState): void {
    if (result.requiresCardSelection) {
      const originalCallback = result.requiresCardSelection.onSelection;

      // 元のコールバックをラップして、完了後に墓地送りを実行
      result.requiresCardSelection.onSelection = (selectedCards) => {
        console.log(`[${this.name}] インタラクティブ効果のコールバック実行`);

        // 元の処理を実行
        originalCallback(selectedCards);

        // 効果解決完了後、魔法カードを墓地に送る
        if (this.shouldSendToGraveyardAfterResolution()) {
          console.log(`[${this.name}] インタラクティブ効果完了後、魔法カードを墓地に送ります`);
          this.sendToGraveyardAfterResolution(state);
        }
      };
    }
  }

  /**
   * 効果解決後に墓地に送るかどうか
   */
  protected shouldSendToGraveyardAfterResolution(): boolean {
    switch (this.magicSubType) {
      case "normal":
      case "ritual":
        return true; // 通常魔法・儀式魔法は墓地に送る
      case "field":
      case "equip":
        return false; // フィールド魔法・装備魔法は場に残る
      case "quick-play":
      case "effect":
        return true; // 速攻魔法・効果魔法は墓地に送る
      default:
        return true;
    }
  }

  /**
   * 効果解決後に墓地に送る
   */
  protected sendToGraveyardAfterResolution(state: DuelState): void {
    // 魔法・罠ゾーンからこのカードを探して墓地に送る
    for (let i = 0; i < state.field.spellTrapZones.length; i++) {
      if (state.field.spellTrapZones[i]?.id === this.cardId) {
        const card = state.field.spellTrapZones[i]!;
        const newSpellTrapZones = [...state.field.spellTrapZones];
        const newGraveyard = [...state.graveyard];

        newSpellTrapZones[i] = null;
        newGraveyard.push(card);

        state.field.spellTrapZones = newSpellTrapZones;
        state.graveyard = newGraveyard;

        console.log(`[${this.name}] 効果解決後、魔法・罠ゾーンから墓地に送りました`);
        return;
      }
    }
    console.warn(`[${this.name}] 魔法・罠ゾーンにカードが見つかりませんでした`);
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
