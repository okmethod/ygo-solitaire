/**
 * DSL Definition Index - カードID別のYAML定義マップ
 *
 * DSL定義済みカードのYAML文字列をカードIDで管理する。
 *
 * @module domain/cards/definitions
 */

// 通常モンスター
import rightArmOfTheForbiddenOneYaml from "./monsters/normals/right-arm-of-the-forbidden-one.yaml?raw";
import leftArmOfTheForbiddenOneYaml from "./monsters/normals/left-arm-of-the-forbidden-one.yaml?raw";
import rightLegOfTheForbiddenOneYaml from "./monsters/normals/right-leg-of-the-forbidden-one.yaml?raw";
import leftLegOfTheForbiddenOneYaml from "./monsters/normals/left-leg-of-the-forbidden-one.yaml?raw";
import thousandEyesIdolYaml from "./monsters/normals/thousand-eyes-idol.yaml?raw";
import flamvellGuardYaml from "./monsters/normals/flamvell-guard.yaml?raw";
import lunarRabbitOmajinaiYaml from "./monsters/normals/lunar-rabbit-omajinai.yaml?raw";

// 効果モンスター
import exodiaTheForbiddenOneYaml from "./monsters/effects/exodia-the-forbidden-one.yaml?raw";
import royalMagicalLibraryYaml from "./monsters/effects/royal-magical-library.yaml?raw";
import summonerMonkYaml from "./monsters/effects/summoner-monk.yaml?raw";
import sanganYaml from "./monsters/effects/sangan.yaml?raw";
import witchOfTheBlackForestYaml from "./monsters/effects/witch-of-the-black-forest.yaml?raw";
import magicalScientistYaml from "./monsters/effects/magical-scientist.yaml?raw";
import CatapultTurtleYaml from "./monsters/effects/catapult-turtle.yaml?raw";
import toonCannonSoldierYaml from "./monsters/effects/toon-cannon-soldier.yaml?raw";
import treasurePandaYaml from "./monsters/effects/treasure-panda.yaml?raw";
import darkMagicianOfChaosYaml from "./monsters/effects/dark-magician-of-chaos.yaml?raw";

// 融合モンスター
import crimsonSunbirdYaml from "./monsters/fusions/crimson-sunbird.yaml?raw";
import aquaDragonYaml from "./monsters/fusions/aqua-dragon.yaml?raw";
import greatMammothOfGoldfineYaml from "./monsters/fusions/great-mammoth-of-goldfine.yaml?raw";

// シンクロモンスター
import formulaSynchronYaml from "./monsters/synchroes/formula-synchron.yaml?raw";
import tgHyperLibrarianYaml from "./monsters/synchroes/tg-hyper-librarian.yaml?raw";
import stardustChargeWarriorYaml from "./monsters/synchroes/stardust-charge-warrior.yaml?raw";

// トークン
import metalFiendTokenYaml from "./monsters/tokens/metal-fiend-token.yaml?raw";

// 通常魔法
import monsterRebornYaml from "./spells/normals/monster-reborn.yaml?raw";
import potOfGreedYaml from "./spells/normals/pot-of-greed.yaml?raw";
import upstartGoblinYaml from "./spells/normals/upstart-goblin.yaml?raw";
import gracefulCharityYaml from "./spells/normals/graceful-charity.yaml?raw";
import terraformingYaml from "./spells/normals/terraforming.yaml?raw";
import magicalStoneExcavationYaml from "./spells/normals/magical-stone-excavation.yaml?raw";
import intoTheVoidYaml from "./spells/normals/into-the-void.yaml?raw";
import cardOfDemiseYaml from "./spells/normals/card-of-demise.yaml?raw";
import darkFactoryYaml from "./spells/normals/dark-factory.yaml?raw";
import oneDayOfPeaceYaml from "./spells/normals/one-day-of-peace.yaml?raw";
import toonTableOfContentsYaml from "./spells/normals/toon-table-of-contents.yaml?raw";
import potOfDualityYaml from "./spells/normals/pot-of-duality.yaml?raw";
import magicalMalletYaml from "./spells/normals/magical-mallet.yaml?raw";
import goldenBambooSwordYaml from "./spells/normals/golden-bamboo-sword.yaml?raw";
import whiteElephantsGiftYaml from "./spells/normals/white-elephants-gift.yaml?raw";
import fiendsSanctuaryYaml from "./spells/normals/fiends-sanctuary.yaml?raw";
import monsterGateYaml from "./spells/normals/monster-gate.yaml?raw";
import reasoningYaml from "./spells/normals/reasoning.yaml?raw";
import lastWillYaml from "./spells/normals/last-will.yaml?raw";
import potOfAvariceYaml from "./spells/normals/pot-of-avarice.yaml?raw";

// 速攻魔法
import handDestructionYaml from "./spells/quick-plays/hand-destruction.yaml?raw";
import reloadYaml from "./spells/quick-plays/reload.yaml?raw";

// 永続魔法
import toonWorldYaml from "./spells/continuouses/toon-world.yaml?raw";

// フィールド魔法
import chickenGameYaml from "./spells/fields/chicken-game.yaml?raw";

// 装備魔法
import brokenBambooSwordYaml from "./spells/equips/broken-bamboo-sword.yaml?raw";
import wonderWandYaml from "./spells/equips/wonder-wand.yaml?raw";
import prematureBurialYaml from "./spells/equips/premature-burial.yaml?raw";

/**
 * カードID → YAML定義文字列のマップ
 *
 * DSL定義が存在するカードのみを含む。
 */
export const dslDefinitions: ReadonlyMap<number, string> = new Map([
  // 通常モンスター
  [70903634, rightArmOfTheForbiddenOneYaml], // 封印されし者の右腕
  [7902349, leftArmOfTheForbiddenOneYaml], // 封印されし者の左腕
  [8124921, rightLegOfTheForbiddenOneYaml], // 封印されし者の右足
  [44519536, leftLegOfTheForbiddenOneYaml], // 封印されし者の左足
  [27125110, thousandEyesIdolYaml], // 千眼の邪教神
  [21615956, flamvellGuardYaml], // ガード・オブ・フレムベル
  [47643326, lunarRabbitOmajinaiYaml], // スペース・オマジナイ・ウサギ

  // 効果モンスター
  [33396948, exodiaTheForbiddenOneYaml], // 封印されしエクゾディア
  [70791313, royalMagicalLibraryYaml], // 王立魔法図書館
  [423585, summonerMonkYaml], // 召喚僧サモンプリースト
  [26202165, sanganYaml], // クリッター
  [78010363, witchOfTheBlackForestYaml], // 黒き森のウィッチ
  [34206604, magicalScientistYaml], // 魔導サイエンティスト
  [95727991, CatapultTurtleYaml], // カタパルト・タートル
  [79875176, toonCannonSoldierYaml], // トゥーン・キャノン・ソルジャー
  [45221020, treasurePandaYaml], // トレジャー・パンダー
  [40737112, darkMagicianOfChaosYaml], // 混沌の黒魔術師

  // 融合モンスター
  [46696593, crimsonSunbirdYaml], // 紅陽鳥
  [86164529, aquaDragonYaml], // アクア・ドラゴン
  [54622031, greatMammothOfGoldfineYaml], // 金色の魔象

  // シンクロモンスター
  [50091196, formulaSynchronYaml], // フォーミュラ・シンクロン
  [90953320, tgHyperLibrarianYaml], // ＴＧ ハイパー・ライブラリアン
  [64880894, stardustChargeWarriorYaml], // スターダスト・チャージ・ウォリアー

  // トークン
  [24874631, metalFiendTokenYaml], // メタルデビル・トークン

  // 通常魔法
  [83764719, monsterRebornYaml], // 死者蘇生
  [55144522, potOfGreedYaml], // 強欲な壺
  [70368879, upstartGoblinYaml], // 成金ゴブリン
  [79571449, gracefulCharityYaml], // 天使の施し
  [73628505, terraformingYaml], // テラ・フォーミング
  [98494543, magicalStoneExcavationYaml], // 魔法石の採掘
  [93946239, intoTheVoidYaml], // 無の煉獄
  [59750328, cardOfDemiseYaml], // 命削りの宝札
  [90928333, darkFactoryYaml], // 闇の量産工場
  [33782437, oneDayOfPeaceYaml], // 一時休戦
  [89997728, toonTableOfContentsYaml], // トゥーンのもくじ
  [98645731, potOfDualityYaml], // 強欲で謙虚な壺
  [85852291, magicalMalletYaml], // 打ち出の小槌
  [74029853, goldenBambooSwordYaml], // 黄金色の竹光
  [18756904, whiteElephantsGiftYaml], // 馬の骨の対価
  [24874630, fiendsSanctuaryYaml], // デビルズ・サンクチュアリ
  [43040603, monsterGateYaml], // モンスターゲート
  [58577036, reasoningYaml], // 名推理
  [85602018, lastWillYaml], // 遺言状
  [67169062, potOfAvariceYaml], // 貪欲な壺

  // 速攻魔法
  [74519184, handDestructionYaml], // 手札断殺
  [22589918, reloadYaml], // リロード

  // 永続魔法
  [15259703, toonWorldYaml], // トゥーン・ワールド

  // フィールド魔法
  [67616300, chickenGameYaml], // チキンレース

  // 装備魔法
  [41587307, brokenBambooSwordYaml], // 折れ竹光
  [67775894, wonderWandYaml], // ワンダー・ワンド
  [70828912, prematureBurialYaml], // 早すぎた埋葬
]);

/**
 * 指定カードIDにDSL定義が存在するか確認
 */
export function hasDSLDefinition(cardId: number): boolean {
  return dslDefinitions.has(cardId);
}

/**
 * 指定カードIDのDSL定義を取得
 */
export function getDSLDefinition(cardId: number): string | undefined {
  return dslDefinitions.get(cardId);
}
