import { vi } from "vitest";
import { CardDataRegistry } from "$lib/domain/cards";
import { ChainableActionRegistry } from "$lib/domain/effects/actions";
import { registerCardDataWithEffectsByIds } from "$lib/domain/cards";
import { NormalSpellActivation } from "$lib/domain/effects/actions/activations/NormalSpellActivation";
import { QuickPlaySpellActivation } from "$lib/domain/effects/actions/activations/QuickPlaySpellActivation";
import { ContinuousSpellActivation } from "$lib/domain/effects/actions/activations/ContinuousSpellActivation";
import { FieldSpellActivation } from "$lib/domain/effects/actions/activations/FieldSpellActivation";
import { EquipSpellActivation } from "$lib/domain/effects/actions/activations/EquipSpellActivation";
import { GenericTriggerEffect } from "$lib/domain/dsl/factories";

// =============================================================================
// テスト向けカード登録
// =============================================================================

const _CARD_IDS = [
  33396948, // 封印されしエクゾディア
  70903634, // 封印されし者の右腕
  7902349, // 封印されし者の左腕
  8124921, // 封印されし者の右足
  44519536, // 封印されし者の左足
  70791313, // 王立魔法図書館
  90953320, // ＴＧ ハイパー・ライブラリアン
  50091196, // フォーミュラ・シンクロン
  70368879, // 成金ゴブリン
  55144522, // 強欲な壺
  79571449, // 天使の施し
  73628505, // テラ・フォーミング
  67616300, // チキンレース
  24874631, // メタルデビル・トークン
];

// 各種レジストリを初期化（CardData + 効果一括、DSL優先）
registerCardDataWithEffectsByIds(_CARD_IDS);

// =============================================================================
// ダミーカード登録
// =============================================================================

// 通常モンスター
CardDataRegistry.register(1001, {
  jaName: "Dummy Normal Monster",
  type: "monster",
  frameType: "normal",
  edition: "latest",
});

// 効果モンスター
CardDataRegistry.register(1002, {
  jaName: "Dummy Effect Monster",
  type: "monster",
  frameType: "effect",
  monsterTypeList: ["effect"],
  edition: "latest",
});

// 効果モンスター（任意誘発効果）
CardDataRegistry.register(1003, {
  jaName: "Dummy Optional Trigger Monster",
  type: "monster",
  frameType: "effect",
  monsterTypeList: ["effect"],
  edition: "latest",
});
ChainableActionRegistry.registerTrigger(
  1003,
  new GenericTriggerEffect(1003, 1, {
    conditions: {
      trigger: {
        events: ["normalSummoned"],
        timing: "when",
        isMandatory: false,
        selfOnly: true,
      },
    },
  }),
);

// 融合モンスター
CardDataRegistry.register(2001, {
  jaName: "Dummy Fusion Monster",
  type: "monster",
  frameType: "fusion",
  edition: "latest",
});

// シンクロモンスター
CardDataRegistry.register(2002, {
  jaName: "Dummy Synchro Monster",
  type: "monster",
  frameType: "synchro",
  edition: "latest",
});

// エクシーズモンスター
CardDataRegistry.register(2003, {
  jaName: "Dummy Xyz Monster",
  type: "monster",
  frameType: "xyz",
  edition: "latest",
});

// モンスタートークン
CardDataRegistry.register(3001, {
  jaName: "Dummy Token",
  type: "monster",
  frameType: "token",
  monsterTypeList: ["normal", "token"],
  edition: "latest",
});

// 通常魔法
CardDataRegistry.register(4001, {
  jaName: "Dummy Normal Spell",
  type: "spell",
  frameType: "spell",
  spellType: "normal",
  edition: "latest",
});
ChainableActionRegistry.registerActivation(4001, NormalSpellActivation.createNoOp(4001));

// 装備魔法
CardDataRegistry.register(4002, {
  jaName: "Dummy Equip Spell",
  type: "spell",
  frameType: "spell",
  spellType: "equip",
  edition: "latest",
});
ChainableActionRegistry.registerActivation(4002, EquipSpellActivation.createNoOp(4002));

// 速攻魔法
CardDataRegistry.register(4003, {
  jaName: "Dummy Quick-Play Spell",
  type: "spell",
  frameType: "spell",
  spellType: "quick-play",
  edition: "latest",
});
ChainableActionRegistry.registerActivation(4003, QuickPlaySpellActivation.createNoOp(4003));

// 永続魔法
CardDataRegistry.register(4004, {
  jaName: "Dummy Continuous Spell",
  type: "spell",
  frameType: "spell",
  spellType: "continuous",
  edition: "latest",
});
ChainableActionRegistry.registerActivation(4004, ContinuousSpellActivation.createNoOp(4004));

// フィールド魔法
CardDataRegistry.register(4005, {
  jaName: "Dummy Field Spell",
  type: "spell",
  frameType: "spell",
  spellType: "field",
  edition: "latest",
});
ChainableActionRegistry.registerActivation(4005, FieldSpellActivation.createNoOp(4005));

// 通常罠
CardDataRegistry.register(5001, {
  jaName: "Dummy Normal Trap",
  type: "trap",
  frameType: "trap",
  trapType: "normal",
  edition: "latest",
});

// =============================================================================
// モック準備
// =============================================================================

// LocalStorageのモック
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// グローバルにlocalStorageMockを公開
global.localStorageMock = localStorageMock;
