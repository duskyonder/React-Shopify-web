import type { ThemeConfig } from "@/contexts/ThemeConfigContext";

// ==================== config/settings_schema.json ====================
export function generateSettingsSchema(): string {
  return JSON.stringify([
    {
      name: "theme_info",
      theme_name: "DUSKYONDER",
      theme_version: "1.0.0",
      theme_author: "DUSKYONDER",
      theme_documentation_url: "https://duskyonder.com",
    },
    {
      name: "Colors",
      settings: [
        { type: "color", id: "color_primary", label: "Primary Color", default: "#175C40" },
        { type: "color", id: "color_secondary", label: "Secondary Color", default: "#2D8B6F" },
      ],
    },
    {
      name: "Typography",
      settings: [
        { type: "font_picker", id: "type_header_font", label: "Headings", default: "helvetica_neue_n7" },
        { type: "font_picker", id: "type_body_font", label: "Body", default: "helvetica_neue_n4" },
      ],
    },
  ], null, 2);
}

// ==================== config/settings_data.json ====================
export function generateSettingsData(config: ThemeConfig): string {
  return JSON.stringify(
    {
      current: {
        sections: {
          header: {
            settings: {
              logo_text: config.logoText,
              logo_image_url: config.logoImageUrl || "",
              promo_bar_enabled: config.showPromoBar || false,
              promo_bar_bg: config.promoBarBg || "#175C40",
              promo_bar_color: config.promoBarColor || "#ffffff",
            },
          },
          footer: {
            settings: {
              about_text: config.footerAbout,
              social_youtube: config.socialLinks.youtube,
              social_facebook: config.socialLinks.facebook,
              social_instagram: config.socialLinks.instagram,
              social_pinterest: config.socialLinks.pinterest,
              social_twitter: config.socialLinks.twitter,
              social_tiktok: config.socialLinks.tiktok,
            },
          },
          marquee: {
            settings: {
              enabled: config.showMarquee || false,
              bg: config.marqueeBg || "#175C40",
              color: config.marqueeColor || "#ffffff",
              direction: config.marqueeDirection || "left",
              speed: config.marqueeSpeed || 20,
            },
          },
        },
      },
    },
    null,
    2
  );
}
