import React, { useState } from "react";
import { useThemeConfig } from "@/contexts/ThemeConfigContext";
import { SFPromoBar, SFHeader, SFFooter } from "@/components/StorefrontShell";

// ==================== SIZE GUIDE PAGE ====================
// Shopify equivalent: /pages/size-guide (Liquid template: pages/size-guide.liquid)
// Data source: global pdpSizeGuide / pdpSizeGuideTables from ThemeConfig

function convertMeasure(val: string, toCm: boolean): string {
  if (!toCm) return val;
  return val.replace(/[\d.]+/g, (n) => (parseFloat(n) * 2.54).toFixed(1)).replace(/"/g, "");
}

const DEFAULT_HOW_TO_MEASURE = [
  { label: "Bust", desc: "Measure around the fullest part of your chest, keeping the tape parallel to the floor." },
  { label: "Waist", desc: "Measure around the narrowest part of your torso, usually just above the belly button." },
  { label: "Hips", desc: "Measure around the fullest part of your hips and seat, about 8 inches below your waist." },
  { label: "Inseam", desc: "Measure from the crotch seam to the bottom of the leg along the inner thigh." },
];

const DEFAULT_FIT_TIPS = [
  { title: "True to Size", desc: "Most of our styles are designed to fit true to size with a close, body-hugging fit." },
  { title: "Size Up for Comfort", desc: "If you're between sizes or prefer a more relaxed feel, we recommend sizing up." },
  { title: "High-Waist Styles", desc: "For high-waist leggings and shorts, consider your hip measurement first." },
];

// ==================== MAIN PAGE ====================
export default function SizeGuidePage() {
  const { config } = useThemeConfig();
  const [unit, setUnit] = useState<"in" | "cm">("in");
  const [activeTable, setActiveTable] = useState(0);

  const sizeGuideTables = config.pdpSizeGuideTables;
  const legacySizeGuide = config.pdpSizeGuide;
  const useDynamic = sizeGuideTables && sizeGuideTables.length > 0;

  const categories = useDynamic
    ? sizeGuideTables!.map((t) => t.name)
    : ["Tops & Bras", "Bottoms", "Bodysuits"];

  const currentTable = useDynamic ? sizeGuideTables![activeTable] : null;

  return (
    <div style={{ minHeight: "100vh", background: "#FAF9F7" }}>
      <SFPromoBar />
      <SFHeader darkMode />

      {/* Hero */}
      <div
        style={{
          background: "#0D3D2B",
          color: "#fff",
          padding: "80px 24px 60px",
          textAlign: "center",
          marginTop: "calc(var(--promo-height, 40px) + 64px)",
        }}
      >
        <div style={{ fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.6, marginBottom: 16 }}>
          DUSKYONDER
        </div>
        <h1
          style={{
            fontFamily: "'Tenor Sans', sans-serif",
            fontSize: "clamp(2.4rem, 5vw, 3.6rem)",
            fontWeight: 400,
            margin: "0 0 16px",
            letterSpacing: "-0.01em",
          }}
        >
          Size Guide
        </h1>
        <p style={{ fontSize: "0.95rem", opacity: 0.75, maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
          Find your perfect fit. All measurements are in inches unless otherwise noted.
        </p>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Unit toggle + category tabs */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 32 }}>
          {/* Category tabs */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {categories.map((cat, i) => (
              <button
                key={cat}
                onClick={() => setActiveTable(i)}
                style={{
                  padding: "8px 20px",
                  borderRadius: 2,
                  border: `1.5px solid ${activeTable === i ? "#0D3D2B" : "#d0ccc7"}`,
                  background: activeTable === i ? "#0D3D2B" : "transparent",
                  color: activeTable === i ? "#fff" : "#555",
                  fontSize: "0.82rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  letterSpacing: "0.04em",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Unit toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {(["in", "cm"] as const).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 2,
                  border: `1.5px solid ${unit === u ? "#0D3D2B" : "#d0ccc7"}`,
                  background: unit === u ? "#0D3D2B" : "transparent",
                  color: unit === u ? "#fff" : "#555",
                  fontSize: "0.78rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {u === "in" ? "Inches" : "Centimeters"}
              </button>
            ))}
          </div>
        </div>

        {/* Size table */}
        <div style={{ background: "#fff", borderRadius: 4, overflow: "hidden", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", marginBottom: 48 }}>
          <div style={{ overflowX: "auto" }}>
            {useDynamic && currentTable ? (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ background: "#0D3D2B", color: "#fff" }}>
                    {currentTable.columns.map((h) => (
                      <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentTable.rows.map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#fafafa" : "#fff", borderBottom: "1px solid #f0f0f0" }}>
                      {currentTable.columns.map((col, ci) => (
                        <td key={col} style={{ padding: "14px 20px", fontWeight: ci === 0 ? 700 : 400, fontSize: ci === 0 ? "0.9rem" : "0.88rem", color: ci === 0 ? "#0D3D2B" : "#444" }}>
                          {convertMeasure(row[col] || "", unit === "cm")}
                          {unit === "cm" && ci > 0 ? " cm" : ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ background: "#0D3D2B", color: "#fff" }}>
                    {["Size", "Bust", "Waist", "Hips"].map((h) => (
                      <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {legacySizeGuide.map((row, i) => (
                    <tr key={row.size} style={{ background: i % 2 === 0 ? "#fafafa" : "#fff", borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "14px 20px", fontWeight: 700, fontSize: "0.9rem", color: "#0D3D2B" }}>{row.size}</td>
                      <td style={{ padding: "14px 20px", color: "#444", fontSize: "0.88rem" }}>{convertMeasure(row.bust, unit === "cm")}{unit === "cm" ? " cm" : ""}</td>
                      <td style={{ padding: "14px 20px", color: "#444", fontSize: "0.88rem" }}>{convertMeasure(row.waist, unit === "cm")}{unit === "cm" ? " cm" : ""}</td>
                      <td style={{ padding: "14px 20px", color: "#444", fontSize: "0.88rem" }}>{convertMeasure(row.hips, unit === "cm")}{unit === "cm" ? " cm" : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Two-column: How to Measure + Fit Tips */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32, marginBottom: 48 }}>
          {/* How to Measure */}
          <div>
            <h2 style={{ fontFamily: "'Tenor Sans', sans-serif", fontSize: "1.7rem", fontWeight: 500, margin: "0 0 24px", color: "#1A1A1A" }}>
              How to Measure
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {DEFAULT_HOW_TO_MEASURE.map((item) => (
                <div key={item.label} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#E8F3F0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#175C40" }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: 4, color: "#1A1A1A" }}>{item.label}</div>
                    <div style={{ fontSize: "0.84rem", color: "#666", lineHeight: 1.65 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fit Tips */}
          <div>
            <h2 style={{ fontFamily: "'Tenor Sans', sans-serif", fontSize: "1.7rem", fontWeight: 500, margin: "0 0 24px", color: "#1A1A1A" }}>
              Fit Tips
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {DEFAULT_FIT_TIPS.map((tip, i) => (
                <div key={i} style={{ padding: "16px 20px", background: "#fff", borderRadius: 4, borderLeft: "3px solid #175C40", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: 6, color: "#0D3D2B" }}>{tip.title}</div>
                  <div style={{ fontSize: "0.84rem", color: "#555", lineHeight: 1.65 }}>{tip.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, padding: "16px 20px", background: "#E8F3F0", borderRadius: 4, fontSize: "0.84rem", color: "#175C40", lineHeight: 1.65 }}>
              <strong>Still unsure?</strong> Our customer care team is happy to help you find your perfect size.{" "}
              <a href={`mailto:${(config as any).contactEmail || "hello@duskyonder.com"}`} style={{ color: "#0D3D2B", fontWeight: 600 }}>
                Contact us →
              </a>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", padding: "40px 24px", background: "#0D3D2B", borderRadius: 4, color: "#fff" }}>
          <h3 style={{ fontFamily: "'Tenor Sans', sans-serif", fontSize: "2rem", fontWeight: 400, margin: "0 0 12px" }}>
            Ready to Shop?
          </h3>
          <p style={{ fontSize: "0.9rem", opacity: 0.75, margin: "0 0 24px" }}>
            Find your size and explore our latest collection.
          </p>
          <a
            href="/collections"
            style={{ display: "inline-block", padding: "13px 32px", background: "#fff", color: "#0D3D2B", borderRadius: 2, fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none" }}
          >
            Shop Now →
          </a>
        </div>
      </div>

      <SFFooter />
    </div>
  );
}
