import React from "react";
import { useThemeConfig } from "@/contexts/ThemeConfigContext";
import type { AboutUsSectionKey } from "@/contexts/ThemeConfigContext";
import { SFHeader, SFFooter, SFPromoBar } from "@/components/StorefrontShell";
import { SECTION_MAP } from "@/components/AboutUsSections";

export default function AboutUs() {
  const { config, isConfigReady } = useThemeConfig();
  const au = config.aboutUs;
  if (!au) return null;

  const visibleSections = au.sectionOrder.filter(s => s.visible);

  return (
    <div className="storefront-wrapper">
      {/* Loading veil: hides default-config flash during the initial network round-trip */}
      {!isConfigReady && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#FAF8F4",
            zIndex: 99999,
            pointerEvents: "none",
          }}
        />
      )}
      <SFPromoBar />
      <SFHeader darkMode={false} />
      <main className="au2-page">
        {visibleSections.map(s => {
          const Component = SECTION_MAP[s.key];
          if (!Component) return null;
          return <Component key={s.instanceId ?? s.key} />;
        })}
      </main>
      <SFFooter />
    </div>
  );
}
