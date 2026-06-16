import React from "react";
import { CareIconKey } from "@/contexts/ThemeConfigContext";

// ==================== ICONS ====================
export const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
export const ChevronLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
);
export const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
);
export const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
);
export const ZoomIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);
export const ShareIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);
export const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);
export const PinterestIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
  </svg>
);
export const LinkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);
export const ArrowUpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15" /></svg>
);
export const ImagePlaceholderIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ opacity: 0.3 }}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);
export const PlayIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" fill="rgba(0,0,0,0.5)" />
    <polygon points="10 8 16 12 10 16 10 8" fill="white" />
  </svg>
);

// ==================== CARE ICONS ====================
const CARE_ICON_MAP: Record<CareIconKey, { symbol: string; label: string }> = {
  "machine-wash":  { symbol: "⊙", label: "Machine Wash Cold" },
  "hand-wash":     { symbol: "✋", label: "Hand Wash Only" },
  "dry-clean":     { symbol: "◯", label: "Dry Clean Only" },
  "do-not-bleach": { symbol: "△", label: "Do Not Bleach" },
  "tumble-dry":    { symbol: "□", label: "Tumble Dry Low" },
  "hang-dry":      { symbol: "⌇", label: "Hang to Dry" },
  "iron-low":      { symbol: "♨", label: "Iron Low Heat" },
  "iron-medium":   { symbol: "♨♨", label: "Iron Medium Heat" },
  "do-not-iron":   { symbol: "✕", label: "Do Not Iron" },
  "do-not-wring":  { symbol: "⊗", label: "Do Not Wring" },
};

// SVG-based care icons for better visual quality
export function CareIconSvg({ icon }: { icon: CareIconKey }) {
  const iconMap: Record<CareIconKey, React.ReactElement> = {
    "machine-wash": (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="20" height="18" rx="2"/>
        <circle cx="12" cy="13" r="4"/>
        <path d="M5 7h2M9 7h2"/>
      </svg>
    ),
    "hand-wash": (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
        <path d="M9 9c0-1.1.9-2 2-2h2a2 2 0 0 1 2 2v5H9V9z"/>
        <path d="M6 14v-4a2 2 0 0 1 2-2"/>
        <path d="M18 14v-4a2 2 0 0 0-2-2"/>
        <path d="M4 20h16"/>
      </svg>
    ),
    "dry-clean": (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9"/>
        <text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor" stroke="none">P</text>
      </svg>
    ),
    "do-not-bleach": (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3L21 20H3L12 3z"/>
        <line x1="5" y1="5" x2="19" y2="19" strokeWidth="2"/>
      </svg>
    ),
    "tumble-dry": (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="20" height="18" rx="2"/>
        <circle cx="12" cy="12" r="5"/>
        <circle cx="12" cy="12" r="2"/>
      </svg>
    ),
    "hang-dry": (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3v2M4 5l8 4 8-4M4 5v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5"/>
      </svg>
    ),
    "iron-low": (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 17h18l-2-6H5L3 17z"/>
        <path d="M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/>
        <circle cx="9" cy="14.5" r="0.5" fill="currentColor"/>
      </svg>
    ),
    "iron-medium": (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 17h18l-2-6H5L3 17z"/>
        <path d="M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/>
        <circle cx="8" cy="14.5" r="0.5" fill="currentColor"/>
        <circle cx="12" cy="14.5" r="0.5" fill="currentColor"/>
      </svg>
    ),
    "do-not-iron": (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 17h18l-2-6H5L3 17z"/>
        <line x1="3" y1="3" x2="21" y2="21" strokeWidth="2"/>
      </svg>
    ),
    "do-not-wring": (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 8c0-2.2 1.8-4 4-4s4 1.8 4 4"/>
        <path d="M8 8v8c0 2.2 1.8 4 4 4s4-1.8 4-4V8"/>
        <line x1="3" y1="3" x2="21" y2="21" strokeWidth="2"/>
      </svg>
    ),
  };
  return iconMap[icon] || <span style={{ fontSize: 24 }}>{CARE_ICON_MAP[icon]?.symbol}</span>;
}

// ==================== COLOR LABEL HELPER ====================
export function colorLabel(hex: string): string {
  // Map common brand hex codes to readable names
  const KNOWN: Record<string, string> = {
    "#175c40": "Forest Green",
    "#0d3d2b": "Deep Forest",
    "#1a1a1a": "Black",
    "#f9f9f9": "White",
    "#ffffff": "White",
    "#000000": "Black",
    "#c9a0a0": "Dusty Rose",
    "#8b4513": "Saddle Brown",
    "#d4a0b0": "Blush Pink",
    "#2c5f8a": "Navy Blue",
    "#6b7280": "Gray",
    "#e5e7eb": "Light Gray",
  };
  // Handle split color (e.g. "#175C40+#1a1a1a")
  if (hex.includes("+")) {
    return hex.split("+").map(h => colorLabel(h.trim())).join(" / ");
  }
  const lower = hex.toLowerCase();
  return KNOWN[lower] || hex.replace(/^#/, "").toUpperCase();
}
