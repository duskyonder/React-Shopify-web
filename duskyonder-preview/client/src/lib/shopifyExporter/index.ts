/**
 * shopifyExporter — Shopify 主题文件生成器
 *
 * 模块结构：
 *   layout.ts   — layout/theme.liquid · sections/header.liquid · sections/footer.liquid
 *   homepage.ts — templates/index.json · 首页所有 section Liquid
 *   assets.ts   — assets/style.css · assets/script.js
 *   settings.ts — config/settings_schema.json · config/settings_data.json
 */

import type { ThemeConfig } from "@/contexts/ThemeConfigContext";
import { generateThemeLiquid, generateHeaderLiquid, generateFooterLiquid } from "./layout";
import {
  generateIndexJson,
  generateSlideshowLiquid,
  generateBrandStoryLiquid,
  generateCategoriesLiquid,
  generateVideosLiquid,
  generateFeaturedLiquid,
  generateFabricLiquid,
  generateNewsletterLiquid,
} from "./homepage";
import { generateStyleCss, generateScriptJs } from "./assets";
import { generateSettingsSchema, generateSettingsData } from "./settings";

export interface ShopifyFile {
  path: string;
  content: string;
}

export function generateShopifyTheme(config: ThemeConfig): ShopifyFile[] {
  return [
    { path: "layout/theme.liquid",                   content: generateThemeLiquid(config) },
    { path: "templates/index.json",                   content: generateIndexJson(config) },
    { path: "sections/header.liquid",                 content: generateHeaderLiquid(config) },
    { path: "sections/footer.liquid",                 content: generateFooterLiquid(config) },
    { path: "sections/slideshow.liquid",              content: generateSlideshowLiquid(config) },
    { path: "sections/brand-story.liquid",            content: generateBrandStoryLiquid(config) },
    { path: "sections/categories-slider.liquid",      content: generateCategoriesLiquid(config) },
    { path: "sections/influencer-videos.liquid",      content: generateVideosLiquid(config) },
    { path: "sections/featured-collection.liquid",    content: generateFeaturedLiquid(config) },
    { path: "sections/fabric-intro.liquid",           content: generateFabricLiquid(config) },
    { path: "sections/newsletter-popup.liquid",       content: generateNewsletterLiquid(config) },
    { path: "assets/style.css",                       content: generateStyleCss(config) },
    { path: "assets/script.js",                       content: generateScriptJs() },
    { path: "config/settings_schema.json",            content: generateSettingsSchema() },
    { path: "config/settings_data.json",              content: generateSettingsData(config) },
  ];
}

// Re-export sub-generators for direct use if needed
export {
  generateThemeLiquid, generateHeaderLiquid, generateFooterLiquid,
  generateIndexJson,
  generateSlideshowLiquid, generateBrandStoryLiquid, generateCategoriesLiquid,
  generateVideosLiquid, generateFeaturedLiquid, generateFabricLiquid, generateNewsletterLiquid,
  generateStyleCss, generateScriptJs,
  generateSettingsSchema, generateSettingsData,
};
