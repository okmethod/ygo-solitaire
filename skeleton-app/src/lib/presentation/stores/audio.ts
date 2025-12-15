import { writable, get } from "svelte/store";
import { browser } from "$app/environment";

// クリックイベントで audioContext を初期化するため、デフォルトは false
const audioOnStore = writable<boolean>(false);

export function getAudioOn(): boolean {
  return get(audioOnStore);
}

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

// ユーザー操作により初期化されたはずの AudioContext を返す
export function audioContextProvider(): AudioContext | null {
  if (!audioContext) {
    throw new Error("AudioContext is not initialized");
  }
  if (getAudioOn()) {
    return audioContext;
  } else {
    return null;
  }
}
