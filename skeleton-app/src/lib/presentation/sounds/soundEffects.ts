import { audioContextProvider } from "$lib/presentation/stores/audioStore";
import { playNote, playChord } from "$lib/presentation/utils/beep";

/**
 * プリセット効果音
 */
export const SoundEffects = {
  /** * カードをドロー時: 「シュパッ」
   * 超高速で1オクターブ半上昇させる 
   */
  cardDraw: () =>
    playNote(audioContextProvider, {
      waveType: "sine",
      startFreq: 400,
      endFreq: 1200, // 大きく変化させる
      duration: 0.05, // 0.08よりさらに短く
    }),

  /** * 発動時: 「カチャッ」
   * sawtoothを極短時間使うことで、物理的なスイッチ感を出します
   */
  activate: () =>
    playNote(audioContextProvider, {
      waveType: "sawtooth",
      startFreq: 880,
      endFreq: 440, // 逆に少し下げることで「嵌まった」感を出す
      duration: 0.04, // 聴感上の「ノイズ」に近い短さ
      volume: 0.05,
    }),

  /** * チェーン時: 「ピキーン」
   * triangleで透明感を出しつつ、高音域へ鋭く飛ばす
   */
  chainLink: () =>
    playNote(audioContextProvider, {
      waveType: "triangle",
      startFreq: 880,
      endFreq: 1760,
      duration: 0.1,
    }),

  /** * エラー時: 「ブッ」
   * 低いsawtoothで、あえて少し長めに引く
   */
  error: () =>
    playNote(audioContextProvider, {
      waveType: "sawtooth",
      startFreq: 110,
      endFreq: 55, // 唸るような低音へ
      duration: 0.2,
      volume: 0.1,
    }),

  /** * フェーズ移行時: 「ポーン」
   * sine波でサイン音っぽく。endFreqを指定せず安定させる
   */
  phaseChange: () =>
    playNote(audioContextProvider, {
      waveType: "sine",
      startFreq: 587.33, // D5 (少し緊張感のある音)
      duration: 0.2,
      volume: 0.08,
    }),

  /** * 勝利時: 「ジャラララーン」
   * playChordを少し「ずらして」鳴らす（アルペジオ）と豪華になりますが
   * 現状は透明感のあるtriangleでキラキラ感を演出
   */
  win: () =>
    playChord(
      audioContextProvider,
      [523.25, 659.25, 783.99, 1046.50], // C5, E5, G5, C6 (1オクターブ上を追加)
      {
        waveType: "triangle",
        duration: 0.8,
        volume: 0.1,
      },
    ),
} as const;

export type SoundEffectName = keyof typeof SoundEffects;
