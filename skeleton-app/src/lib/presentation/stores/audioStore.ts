/**
 * audioStore - Web Audio API のライフサイクル管理ストア
 *
 * ブラウザの制約（ユーザー操作なしに AudioContext を起動できない）に対応するため、
 * 音声ON/OFFの状態管理と AudioContext の遅延初期化をここに集約する。
 * soundEffects.ts はこのストアを経由して AudioContext を取得する。
 */

import { writable, get } from "svelte/store";
import { browser } from "$app/environment";

// クリックイベントで audioContext を初期化するため、デフォルトは false
const audioOnStore = writable<boolean>(false);

/** 音声ON/OFF状態を返す */
export function getAudioOn(): boolean {
  return get(audioOnStore);
}

/** 音声ON/OFFを切り替える。初回ON時に AudioContext を初期化する */
export function setAudioOn(audioOn: boolean): void {
  audioOnStore.set(audioOn);
  if (!audioContext) {
    initializeAudioContext();
  }
}

// この初期化関数は、ユーザー操作イベントにより呼び出すこと
let audioContext: AudioContext | null = null;
function initializeAudioContext(): AudioContext | null {
  if (!browser) return null;
  audioContext = new window.AudioContext();
  return audioContext;
}

// AudioContext を返す（初期化前または音声オフの場合は null）
/** AudioContext を返す。音声オフまたは未初期化の場合は null（再生関数側で null チェックして無音にする） */
export function audioContextProvider(): AudioContext | null {
  if (!audioContext || !getAudioOn()) {
    return null;
  }
  return audioContext;
}
