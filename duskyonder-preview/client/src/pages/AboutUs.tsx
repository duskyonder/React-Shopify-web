import React, { useEffect } from "react";
import { useThemeConfig } from "@/contexts/ThemeConfigContext";
import type { AboutUsSectionKey } from "@/contexts/ThemeConfigContext";
import { SFHeader, SFFooter, SFPromoBar } from "@/components/StorefrontShell";
import { SECTION_MAP } from "@/components/AboutUsSections";

const _setMeta = (sel: string, val: string) => {
  let el = document.querySelector<HTMLMetaElement>(sel);
  if (!el) { el = document.createElement("meta"); const [a, v] = sel.replace(/[\[\]'"]/g, "").split("="); el.setAttribute(a, v); document.head.appendChild(el); }
  el.setAttribute("content", val);
};

export default function AboutUs() {
  const { config } = useThemeConfig();

  useEffect(() => {
    const prev = document.title;
    document.title = "Our Story & Ambassador Application | Premium Athleisure | Dusk Yonder";
    _setMeta('meta[name="description"]', "Dusk Yonder is dedicated to creating premium athleisure for modern movement. Discover versatile activewear and apply to join our creator community.");
    _setMeta('meta[property="og:title"]', "Our Story & Ambassador Application | Premium Athleisure | Dusk Yonder");
    _setMeta('meta[property="og:description"]', "Dusk Yonder is dedicated to creating premium athleisure for modern movement. Discover versatile activewear and apply to join our creator community.");
    return () => {
      document.title = prev;
      _setMeta('meta[name="description"]', "Dusk Yonder — high-performance activewear designed for versatility.");
      _setMeta('meta[property="og:title"]', "Dusk Yonder | Performance Activewear");
      _setMeta('meta[property="og:description"]', "Dusk Yonder — high-performance activewear designed for versatility.");
    };
  }, []);

  const au = config.aboutUs;
  if (!au) return null;

  const visibleSections = au.sectionOrder.filter(s => s.visible);

  return (
    <div className="storefront-wrapper">
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
