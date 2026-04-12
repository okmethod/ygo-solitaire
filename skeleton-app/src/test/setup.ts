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

// テストで使用するカードID
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
  41587307, // 折れ竹光
  24874631, // メタルデビル・トークン
];

// 各種レジストリを初期化（CardData + 効果一括、DSL優先）
registerCardDataWithEffectsByIds(_CARD_IDS);

// テスト用カードデータも登録
CardDataRegistry.register(8001, {
  jaName: "Test Monster A",
  type: "monster",
  frameType: "normal",
  edition: "latest",
});
CardDataRegistry.register(8002, {
  jaName: "Test Monster B",
  type: "monster",
  frameType: "normal",
  edition: "latest",
});
CardDataRegistry.register(8003, {
  jaName: "Test Synchro Monster",
  type: "monster",
  frameType: "synchro",
  edition: "latest",
});

CardDataRegistry.register(1001, {
  jaName: "Test Spell 1",
  type: "spell",
  frameType: "spell",
  spellType: "normal",
  edition: "latest",
});
ChainableActionRegistry.registerActivation(1001, NormalSpellActivation.createNoOp(1001));

CardDataRegistry.register(1002, {
  jaName: "Test Spell 2",
  type: "spell",
  frameType: "spell",
  spellType: "equip",
  edition: "latest",
});
ChainableActionRegistry.registerActivation(1002, EquipSpellActivation.createNoOp(1002));

CardDataRegistry.register(1004, {
  jaName: "Test Spell 4",
  type: "spell",
  frameType: "spell",
  spellType: "quick-play",
  edition: "latest",
});
ChainableActionRegistry.registerActivation(1004, QuickPlaySpellActivation.createNoOp(1004));

CardDataRegistry.register(1005, {
  jaName: "Test Spell 5",
  type: "spell",
  frameType: "spell",
  spellType: "continuous",
  edition: "latest",
});
ChainableActionRegistry.registerActivation(1005, ContinuousSpellActivation.createNoOp(1005));

CardDataRegistry.register(1006, {
  jaName: "Test Spell 6",
  type: "spell",
  frameType: "spell",
  spellType: "field",
  edition: "latest",
});
ChainableActionRegistry.registerActivation(1006, FieldSpellActivation.createNoOp(1006));

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

// トークンモンスター
CardDataRegistry.register(5001, {
  jaName: "Test Token",
  type: "monster",
  frameType: "token",
  race: "Warrior",
  level: 1,
  attack: 0,
  defense: 0,
  edition: "latest",
});

// DSLファクトリテスト用効果モンスター
CardDataRegistry.register(7001, {
  jaName: "Test Effect Monster",
  type: "monster",
  frameType: "effect",
  monsterTypeList: ["effect"],
  level: 4,
  edition: "latest",
});

// 罠カード
CardDataRegistry.register(1007, {
  jaName: "Test Trap 1",
  type: "trap",
  frameType: "trap",
  trapType: "normal",
  edition: "latest",
});

// 任意誘発効果テスト用モンスター
// 召喚成功時に任意誘発効果（NoOp）が発動する。任意効果フローの検証用。
CardDataRegistry.register(6001, {
  jaName: "Test Optional Trigger Monster",
  type: "monster",
  frameType: "effect",
  monsterTypeList: ["effect"],
  race: "Warrior",
  level: 4,
  attack: 1500,
  defense: 1500,
  edition: "latest",
});
ChainableActionRegistry.registerTrigger(
  6001,
  new GenericTriggerEffect(6001, 1, {
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
