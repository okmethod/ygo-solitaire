import { navigateTo } from "$lib/utils/navigation";

type TransitionAction = "navigate" | "redirect" | "redirectNewTab";

export interface TransitionContent {
  label: string;
  symbolSrc?: {
    type: "image" | "icon";
    key: string;
  };
  action: TransitionAction;
  target: string;
}

interface ImageConfig {
  src: string;
  alt: string;
}

interface IconConfig {
  icon: string;
}

export interface TransitionButtonConfig {
  label: string;
  symbol: ImageConfig | IconConfig | null;
  onClick: () => void;
}

export function isImageConfig(symbol: ImageConfig | IconConfig | null): symbol is ImageConfig {
  if (symbol === null) return false;
  const imageConfig = symbol as ImageConfig;
  return imageConfig.src !== undefined && imageConfig.alt !== undefined;
}

export function isIconConfig(symbol: ImageConfig | IconConfig | null): symbol is IconConfig {
  if (symbol === null) return false;
  const iconConfig = symbol as IconConfig;
  return iconConfig.icon !== undefined;
}

function getOnClick(action: TransitionAction, target: string): () => void {
  const actions: { [key in TransitionAction]: () => void } = {
    navigate: () => navigateTo(target),
    redirect: () => {
      window.location.href = target;
    },
    redirectNewTab: () => window.open(target, "_blank"),
  };
  return actions[action] || (() => {});
}

export function generateButtonConfigs(
  contents: TransitionContent[],
  imageUrlDict?: Record<string, string>,
): TransitionButtonConfig[] {
  return contents.map((content) => ({
    label: content.label,
    symbol:
      content.symbolSrc !== undefined
        ? content.symbolSrc.type === "image" && imageUrlDict !== undefined
          ? {
              src: imageUrlDict[content.symbolSrc.key],
              alt: content.symbolSrc.key,
            }
          : {
              icon: content.symbolSrc.key,
            }
        : null,
    onClick: getOnClick(content.action, content.target),
  }));
}
