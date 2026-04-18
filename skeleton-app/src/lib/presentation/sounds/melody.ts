/**
 * melody - 音符列を時系列で再生するメロディーユーティリティ
 *
 * MelodyNote の配列と BPM を受け取り、setTimeout で順次再生する。
 * null を挿入することで休符を表現できる。
 */

import { getFrequency } from "$lib/presentation/sounds/musicalNote";
import { playBeep } from "$lib/presentation/sounds/beep";

/** メロディーを構成する1音符（音名・オクターブ・拍数） */
export interface MelodyNote {
  name: string;
  octave: number;
  duration: number;
}

/** BPM に基づいて音符列を順次再生する */
export function playMelody(
  audioContextProvider: () => AudioContext | null,
  waveType: OscillatorType,
  melody: (MelodyNote | null)[],
  tempoBpm: number,
) {
  const beatDurationSec = 60 / tempoBpm; // 1拍の長さ

  melody.forEach((melodyNote, index) => {
    if (!melodyNote) {
      return; // null の場合はスキップ
    }
    const frequency = getFrequency(melodyNote.name, melodyNote.octave);
    const startTime = index * beatDurationSec;
    setTimeout(() => {
      playBeep(audioContextProvider, {
        waveType,
        startFreq: frequency,
        duration: melodyNote.duration * beatDurationSec,
      });
    }, startTime * 1000); // ミリ秒単位に変換
  });
}

/** MelodyButton での動作確認用サンプルメロディー */
export const sampleMelody: { melodyNotes: (MelodyNote | null)[]; defaultTempoBpm: number } = {
  melodyNotes: [
    { name: "ファ#", octave: 4, duration: 1 },
    { name: "ファ", octave: 4, duration: 1 },
    { name: "レ", octave: 4, duration: 1 },
    { name: "ソ#", octave: 3, duration: 1 },
    { name: "レ#", octave: 4, duration: 1 },
    { name: "ソ", octave: 4, duration: 1 },
    { name: "シ", octave: 4, duration: 2 },
    null,
  ],
  defaultTempoBpm: 300,
};
