/**
 * ActionOverride Library - Override ライブラリ
 *
 * Override の登録とエクスポートを行う。
 *
 * @module domain/dsl/overrides
 */

import { ActionOverrideRegistry } from "./ActionOverrideRegistry";
import { OVERRIDE_NAMES, type OverrideName } from "./OverrideNames";

// Handler 実装
import { createFieldDepartureDestinationHandler } from "./handlers/fieldDepartureDestination";

// ===========================
// エクスポート
// ===========================

export { ActionOverrideRegistry };
export { OVERRIDE_NAMES, type OverrideName };
export const createHandler = ActionOverrideRegistry.create.bind(ActionOverrideRegistry);

// ===========================
// Override 登録
// ===========================

const O = OVERRIDE_NAMES;

ActionOverrideRegistry.register(O.FIELD_DEPARTURE_DESTINATION, createFieldDepartureDestinationHandler);
