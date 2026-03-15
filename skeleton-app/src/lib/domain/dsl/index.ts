/**
 * DSL Module - カード定義DSL関連のエクスポート
 *
 * DSL（Domain Specific Language）を使ってカードを宣言的に定義するための機能を提供する。
 *
 * @module domain/dsl
 */

// Loader
export { loadCardDataFromYaml, loadCardDataWithEffectsFromYaml } from "./core/loader";
