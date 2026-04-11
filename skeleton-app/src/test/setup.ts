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
const TEST_CARD_IDS = [
  33396948, // 封印されしエクゾディア
  70903634, // 封印されし者の右腕
  7902349, // 封印されし者の左腕
  8124921, // 封印されし者の右足
  44519536, // 封印されし者の左足
  70791313, // 王立魔法図書館
  70368879, // 成金ゴブリン
  55144522, // 強欲な壺
  79571449, // 天使の施し
  73628505, // テラフォーミング
  67616300, // チキンレース
  90953320, // ＴＧ ハイパー・ライブラリアン
  50091196, // フォーミュラ・シンクロン
  41587307, // 折れ竹光
  22589918, // リロード（チェーン確認テスト用：速攻魔法 SS2）
];

// 各種レジストリを初期化（CardData + 効果一括、DSL優先）
registerCardDataWithEffectsByIds(TEST_CARD_IDS);

// テスト用カードデータも登録
CardDataRegistry.register(12345678, {
  jaName: "Test Monster A",
  type: "monster",
  frameType: "normal",
  edition: "latest",
});
CardDataRegistry.register(87654321, {
  jaName: "Test Monster B",
  type: "monster",
  frameType: "normal",
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

CardDataRegistry.register(1003, {
  jaName: "Test Spell 3",
  type: "spell",
  frameType: "spell",
  spellType: "normal",
  edition: "latest",
});
ChainableActionRegistry.registerActivation(1003, NormalSpellActivation.createNoOp(1003));

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

// シンクロ召喚テスト用カードデータ
// チューナーモンスター
CardDataRegistry.register(2001, {
  jaName: "Test Tuner Lv1",
  type: "monster",
  frameType: "effect",
  monsterTypeList: ["effect", "tuner"],
  race: "Warrior",
  level: 1,
  attack: 100,
  defense: 100,
  edition: "latest",
});
CardDataRegistry.register(2002, {
  jaName: "Test Tuner Lv2",
  type: "monster",
  frameType: "effect",
  monsterTypeList: ["effect", "tuner"],
  race: "Warrior",
  level: 2,
  attack: 500,
  defense: 500,
  edition: "latest",
});
CardDataRegistry.register(2003, {
  jaName: "Test Tuner Lv3",
  type: "monster",
  frameType: "effect",
  monsterTypeList: ["effect", "tuner"],
  race: "Warrior",
  level: 3,
  attack: 1000,
  defense: 1000,
  edition: "latest",
});

// 非チューナーモンスター
CardDataRegistry.register(3001, {
  jaName: "Test NonTuner Lv1",
  type: "monster",
  frameType: "normal",
  race: "Warrior",
  level: 1,
  attack: 100,
  defense: 100,
  edition: "latest",
});
CardDataRegistry.register(3002, {
  jaName: "Test NonTuner Lv2",
  type: "monster",
  frameType: "normal",
  race: "Warrior",
  level: 2,
  attack: 500,
  defense: 500,
  edition: "latest",
});
CardDataRegistry.register(3003, {
  jaName: "Test NonTuner Lv3",
  type: "monster",
  frameType: "normal",
  race: "Warrior",
  level: 3,
  attack: 1000,
  defense: 1000,
  edition: "latest",
});
CardDataRegistry.register(3004, {
  jaName: "Test NonTuner Lv4",
  type: "monster",
  frameType: "effect",
  monsterTypeList: ["effect"],
  race: "Warrior",
  level: 4,
  attack: 1500,
  defense: 1500,
  edition: "latest",
});

// シンクロモンスター
CardDataRegistry.register(4005, {
  jaName: "Test Synchro Lv5",
  type: "monster",
  frameType: "synchro",
  monsterTypeList: ["effect"],
  race: "Dragon",
  level: 5,
  attack: 2300,
  defense: 1800,
  edition: "latest",
});
CardDataRegistry.register(4006, {
  jaName: "Test Synchro Lv6",
  type: "monster",
  frameType: "synchro",
  monsterTypeList: ["effect"],
  race: "Dragon",
  level: 6,
  attack: 2500,
  defense: 2000,
  edition: "latest",
});
CardDataRegistry.register(4007, {
  jaName: "Test Synchro Lv7",
  type: "monster",
  frameType: "synchro",
  monsterTypeList: ["effect"],
  race: "Dragon",
  level: 7,
  attack: 2700,
  defense: 2200,
  edition: "latest",
});
CardDataRegistry.register(4008, {
  jaName: "Test Synchro Lv8",
  type: "monster",
  frameType: "synchro",
  monsterTypeList: ["effect"],
  race: "Dragon",
  level: 8,
  attack: 3000,
  defense: 2500,
  edition: "latest",
});

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
