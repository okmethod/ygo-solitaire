/**
 * SetSpellTrapCommand - 魔法・罠セットコマンド
 *
 * 手札から魔法・罠カードをセットする Command パターン実装。
 *
 * @module domain/commands/SetSpellTrapCommand
 */

import type { CardInstance } from "$lib/domain/models/Card";
import { Card } from "$lib/domain/models/Card";
import type { GameSnapshot, CardSpace } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { ValidationResult } from "$lib/domain/models/GameProcessing";
import type { GameCommand, GameCommandResult } from "$lib/domain/models/Command";
import { Command } from "$lib/domain/models/Command";
import { GameProcessing } from "$lib/domain/models/GameProcessing";

/** 魔法・罠セットコマンドクラス */
export class SetSpellTrapCommand implements GameCommand {
  readonly description: string;

  constructor(private readonly cardInstanceId: string) {
    this.description = `Set spell/trap ${cardInstanceId}`;
  }

  /**
   * 指定カードをセット可能か判定する
   *
   * チェック項目:
   * 1. ゲーム終了状態でないこと
   * 2. メインフェイズであること
   * 3. 指定カードが魔法カードまたは罠カードであること
   * 4. 手札に存在すること
   * 5. 魔法・罠ゾーンに空きがあること（フィールド魔法は除く）
   */
  canExecute(state: GameSnapshot): ValidationResult {
    // 1. ゲーム終了状態でないこと
    if (state.result.isGameOver) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.GAME_OVER);
    }

    // 2. メインフェイズであること
    if (!GameState.Phase.isMain(state.phase)) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.NOT_MAIN_PHASE);
    }

    // 3. 指定カードが魔法カードまたは罠カードであること
    const cardInstance = GameState.Space.findCard(state.space, this.cardInstanceId);
    if (!cardInstance) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.CARD_NOT_FOUND);
    }
    if (!Card.isSpell(cardInstance) && !Card.isTrap(cardInstance)) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.NOT_SPELL_OR_TRAP_CARD);
    }

    // 4. 手札に存在すること
    if (!Card.Instance.inHand(cardInstance)) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.CARD_NOT_IN_HAND);
    }

    // 5. 魔法・罠ゾーンに空きがあること（フィールド魔法は除く）
    if (!Card.isFieldSpell(cardInstance) && GameState.Space.isSpellTrapZoneFull(state.space)) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.SPELL_TRAP_ZONE_FULL);
    }

    return GameProcessing.Validation.success();
  }

  /**
   * 指定カードをセットする
   *
   * 処理フロー:
   * 1. 実行可能性判定
   * 2. 更新後状態の構築
   * 3. 戻り値の構築
   */
  execute(state: GameSnapshot): GameCommandResult {
    // 1. 実行可能性判定
    const validationResult = this.canExecute(state);
    if (!validationResult.isValid) {
      return Command.Result.failure(state, GameProcessing.Validation.errorMessage(validationResult));
    }
    // cardInstance は canExecute で存在が保証されている
    const cardInstance = GameState.Space.findCard(state.space, this.cardInstanceId)!;

    // 2. 更新後状態の構築
    const updatedState: GameSnapshot = {
      ...state,
      space: this.moveSetSpellTrapCard(state.space, cardInstance),
    };

    // 3. 戻り値の構築
    return Command.Result.success(updatedState, `Card set: ${cardInstance.jaName}`);
  }

  // セットする魔法・罠カードを適切なゾーンに裏向きで配置する
  private moveSetSpellTrapCard(space: CardSpace, cardInstance: CardInstance): CardSpace {
    // フィールド魔法カードの場合
    if (Card.isFieldSpell(cardInstance)) {
      const sweepedFieldSpellSpace = GameState.Space.sendExistingFieldSpellToGraveyard(space);
      return GameState.Space.moveCard(sweepedFieldSpellSpace, cardInstance, "fieldZone", {
        position: "faceDown",
      });
    }

    return GameState.Space.moveCard(space, cardInstance, "spellTrapZone", {
      position: "faceDown",
    });
  }

  /** セット対象のカードインスタンスIDを取得する */
  getCardInstanceId(): string {
    return this.cardInstanceId;
  }
}
