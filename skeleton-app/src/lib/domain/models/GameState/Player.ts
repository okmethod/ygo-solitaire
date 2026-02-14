/**
 * Player - プレイヤー
 */

/** プレイヤー種別 */
export const PLAYERS = ["player", "opponent"] as const;
export type Player = (typeof PLAYERS)[number];
