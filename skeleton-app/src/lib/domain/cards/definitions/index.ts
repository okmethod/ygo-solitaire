/**
 * DSL Definition Index - カードID別のYAML定義マップ
 *
 * DSL定義済みカードのYAML文字列をカードIDで管理する。
 *
 * @module domain/cards/definitions
 */

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
import chickenGameYaml from "./spells/chicken-game.yaml?raw";

// Monsters
import royalMagicalLibraryYaml from "./monsters/royal-magical-library.yaml?raw";

/**
 * カードID → YAML定義文字列のマップ
 *
 * DSL定義が存在するカードのみを含む。
 */
export const dslDefinitions: ReadonlyMap<number, string> = new Map([
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

  // フィールド魔法
  [67616300, chickenGameYaml], // チキンレース

  // 効果モンスター
  [70791313, royalMagicalLibraryYaml], // 王立魔法図書館
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
