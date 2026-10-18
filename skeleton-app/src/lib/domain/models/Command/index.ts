/**
 * Command モデル
 *
 * ユーザーによるゲーム操作基盤。
 * ユーザーは、この仕組みを通してゲーム状態を更新する。
 *
 * @module domain/models/Command
 * @see {@link docs/design/game-state-model.md}
 * @see {@link docs/game-rules/command.md}
 */

export type { GameCommand, GameCommandResult } from "./GameCommand";

import * as GameCommandFuncs from "./GameCommand";

export const Command = {
  Result: {
    success: GameCommandFuncs.successCommandResult,
    failure: GameCommandFuncs.failureCommandResult,
  },
};
