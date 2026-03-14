/**
 * DSL Definition Index - カードID別のYAML定義マップ
 *
 * DSL定義済みカードのYAML文字列をカードIDで管理する。
 *
 * @module domain/cards/definitions
 */

// Monsters
import exodiaTheForbiddenOneYaml from "./monsters/exodia-the-forbidden-one.yaml?raw";
import rightArmOfTheForbiddenOneYaml from "./monsters/right-arm-of-the-forbidden-one.yaml?raw";
import leftArmOfTheForbiddenOneYaml from "./monsters/left-arm-of-the-forbidden-one.yaml?raw";
import rightLegOfTheForbiddenOneYaml from "./monsters/right-leg-of-the-forbidden-one.yaml?raw";
import leftLegOfTheForbiddenOneYaml from "./monsters/left-leg-of-the-forbidden-one.yaml?raw";
import royalMagicalLibraryYaml from "./monsters/royal-magical-library.yaml?raw";
import summonerMonkYaml from "./monsters/summoner-monk.yaml?raw";
import sanganYaml from "./monsters/sangan.yaml?raw";
import witchOfTheBlackForestYaml from "./monsters/witch-of-the-black-forest.yaml?raw";
import magicalScientistYaml from "./monsters/magical-scientist.yaml?raw";
import CatapultTurtleYaml from "./monsters/catapult-turtle.yaml?raw";
import crimsonSunbirdYaml from "./monsters/crimson-sunbird.yaml?raw";
import aquaDragonYaml from "./monsters/aqua-dragon.yaml?raw";
import greatMammothOfGoldfineYaml from "./monsters/great-mammoth-of-goldfine.yaml?raw";

// Spells
import potOfGreedYaml from "./spells/pot-of-greed.yaml?raw";
import upstartGoblinYaml from "./spells/upstart-goblin.yaml?raw";
import gracefulCharityYaml from "./spells/graceful-charity.yaml?raw";
import terraformingYaml from "./spells/terraforming.yaml?raw";
import magicalStoneExcavationYaml from "./spells/magical-stone-excavation.yaml?raw";
import intoTheVoidYaml from "./spells/into-the-void.yaml?raw";
import cardOfDemiseYaml from "./spells/card-of-demise.yaml?raw";
import darkFactoryYaml from "./spells/dark-factory.yaml?raw";
import oneDayOfPeaceYaml from "./spells/one-day-of-peace.yaml?raw";
import toonTableOfContentsYaml from "./spells/toon-table-of-contents.yaml?raw";
import potOfDualityYaml from "./spells/pot-of-duality.yaml?raw";
import magicalMalletYaml from "./spells/magical-mallet.yaml?raw";
import handDestructionYaml from "./spells/hand-destruction.yaml?raw";
import toonWorldYaml from "./spells/toon-world.yaml?raw";
import chickenGameYaml from "./spells/chicken-game.yaml?raw";
import brokenBambooSwordYaml from "./spells/broken-bamboo-sword.yaml?raw";

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

  // 効果モンスター
  [33396948, exodiaTheForbiddenOneYaml], // 封印されしエクゾディア
  [70791313, royalMagicalLibraryYaml], // 王立魔法図書館
  [423585, summonerMonkYaml], // 召喚僧サモンプリースト
  [26202165, sanganYaml], // クリッター
  [78010363, witchOfTheBlackForestYaml], // 黒き森のウィッチ
  [34206604, magicalScientistYaml], // 魔導サイエンティスト
  [95727991, CatapultTurtleYaml], // カタパルト・タートル

  // 融合モンスター
  [46696593, crimsonSunbirdYaml], // 紅陽鳥
  [86164529, aquaDragonYaml], // アクア・ドラゴン
  [54622031, greatMammothOfGoldfineYaml], // 金色の魔象

  // 通常魔法
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

  // 速攻魔法
  [74519184, handDestructionYaml], // 手札断殺

  // 永続魔法
  [15259703, toonWorldYaml], // トゥーン・ワールド

  // フィールド魔法
  [67616300, chickenGameYaml], // チキンレース

  // 装備魔法
  [41587307, brokenBambooSwordYaml], // 折れ竹光
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
