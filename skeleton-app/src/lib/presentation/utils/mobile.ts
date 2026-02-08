/** Tailwind md ブレークポイント (768px) */
const MD_BREAKPOINT = 768;

/** スマホ判定（768px未満） 
 * 
 * ウィンドウリサイズに追従しないことに注意。
 */
export const isMobile = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.innerWidth < MD_BREAKPOINT;
};
