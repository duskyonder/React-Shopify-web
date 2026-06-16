/**
 * 九宫格位置 → CSS 变量映射
 * 用于 Hero 区域的 flexbox 定位
 */
export type HeroPosition =
  | "top-left" | "top-center" | "top-right"
  | "middle-left" | "middle-center" | "middle-right"
  | "bottom-left" | "bottom-center" | "bottom-right";

const JUSTIFY_MAP: Record<string, string> = {
  "top-left": "flex-start", "top-center": "flex-start", "top-right": "flex-start",
  "middle-left": "center", "middle-center": "center", "middle-right": "center",
  "bottom-left": "flex-end", "bottom-center": "flex-end", "bottom-right": "flex-end",
};
const ALIGN_MAP: Record<string, string> = {
  "top-left": "flex-start", "top-center": "center", "top-right": "flex-end",
  "middle-left": "flex-start", "middle-center": "center", "middle-right": "flex-end",
  "bottom-left": "flex-start", "bottom-center": "center", "bottom-right": "flex-end",
};
const TEXT_MAP: Record<string, string> = {
  "top-left": "left", "top-center": "center", "top-right": "right",
  "middle-left": "left", "middle-center": "center", "middle-right": "right",
  "bottom-left": "left", "bottom-center": "center", "bottom-right": "right",
};

export function heroPositionVars(
  desktopPos?: string,
  mobilePos?: string
): React.CSSProperties {
  const dp = desktopPos || "middle-center";
  const mp = mobilePos; // undefined = same as desktop (CSS fallback handles it)
  const vars: Record<string, string> = {
    "--hero-justify": JUSTIFY_MAP[dp] || "center",
    "--hero-align-items": ALIGN_MAP[dp] || "center",
    "--hero-text-align": TEXT_MAP[dp] || "center",
  };
  if (mp) {
    vars["--hero-m-justify"] = JUSTIFY_MAP[mp] || "center";
    vars["--hero-m-align-items"] = ALIGN_MAP[mp] || "center";
    vars["--hero-m-text-align"] = TEXT_MAP[mp] || "center";
  }
  return vars as React.CSSProperties;
}

export const NINE_GRID_POSITIONS = [
  { key: "top-left", label: "↖" }, { key: "top-center", label: "↑" }, { key: "top-right", label: "↗" },
  { key: "middle-left", label: "←" }, { key: "middle-center", label: "⊙" }, { key: "middle-right", label: "→" },
  { key: "bottom-left", label: "↙" }, { key: "bottom-center", label: "↓" }, { key: "bottom-right", label: "↘" },
] as const;
