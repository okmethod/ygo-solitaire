import { vi } from "vitest";
import { CardDataRegistry, registerCardDataByIds } from "$lib/domain/CardDataRegistry";
import { ChainableActionRegistry, registerChainableActionsByIds } from "$lib/domain/effects/actions";
import { registerAdditionalRulesByIds } from "$lib/domain/effects/rules";
import { NormalSpellActivation } from "$lib/domain/effects/actions/activations/NormalSpellActivation";
import { QuickPlaySpellActivation } from "$lib/domain/effects/actions/activations/QuickPlaySpellActivation";
import { ContinuousSpellActivation } from "$lib/domain/effects/actions/activations/ContinuousSpellActivation";
import { FieldSpellActivation } from "$lib/domain/effects/actions/activations/FieldSpellActivation";

// テストで使用するカードID
const TEST_CARD_IDS = [
  33396948, // 封印されしエクゾディア
  7902349, // 封印されし者の左腕
  70903634, // 封印されし者の右腕
  44519536, // 封印されし者の左足
  8124921, // 封印されし者の右足
  70791313, // 王立魔法図書館
  70368879, // 成金ゴブリン
  67616300, // チキンレース
  55144522, // 強欲な壺
  79571449, // 天使の施し
  33782437, // 一時休戦
  85852291, // 打ち出の小槌
  74519184, // 手札断札
  90928333, // 闇の量産工場
  73628505, // テラフォーミング
  98494543, // 魔法石の採掘
  93946239, // 無の煉獄
  98645731, // 強欲で謙虚な壺
  59750328, // 命削りの宝札
  89997728, // トゥーンのもくじ
  15259703, // トゥーン・ワールド
];

// 各種レジストリを初期化（テストデータを含む）
registerCardDataByIds(TEST_CARD_IDS);
registerChainableActionsByIds(TEST_CARD_IDS);
registerAdditionalRulesByIds(TEST_CARD_IDS);

// テスト用カードデータも登録
CardDataRegistry.register(12345678, { jaName: "Test Monster A", type: "monster", frameType: "normal" });
CardDataRegistry.register(87654321, { jaName: "Test Monster B", type: "monster", frameType: "normal" });

CardDataRegistry.register(1001, { jaName: "Test Spell 1", type: "spell", frameType: "spell", spellType: "normal" });
ChainableActionRegistry.registerActivation(1001, NormalSpellActivation.createNoOp(1001));

CardDataRegistry.register(1002, { jaName: "Test Spell 2", type: "spell", frameType: "spell", spellType: "normal" });
ChainableActionRegistry.registerActivation(1002, NormalSpellActivation.createNoOp(1002));

CardDataRegistry.register(1003, { jaName: "Test Spell 3", type: "spell", frameType: "spell", spellType: "normal" });
ChainableActionRegistry.registerActivation(1003, NormalSpellActivation.createNoOp(1003));

CardDataRegistry.register(1004, {
  jaName: "Test Spell 4",
  type: "spell",
  frameType: "spell",
  spellType: "quick-play",
});
ChainableActionRegistry.registerActivation(1004, QuickPlaySpellActivation.createNoOp(1004));

CardDataRegistry.register(1005, {
  jaName: "Test Spell 5",
  type: "spell",
  frameType: "spell",
  spellType: "continuous",
});
ChainableActionRegistry.registerActivation(1005, ContinuousSpellActivation.createNoOp(1005));

CardDataRegistry.register(1006, { jaName: "Test Spell 6", type: "spell", frameType: "spell", spellType: "field" });
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
