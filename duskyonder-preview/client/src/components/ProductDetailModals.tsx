import ReactDOM from "react-dom";
import React, { useState, useEffect } from "react";
import {
  useThemeConfig,
  ProductDetailConfig,
} from "@/contexts/ThemeConfigContext";
import {
  ChevronDownIcon,
  ZoomIcon,
  colorLabel,
} from "@/components/ProductDetailIcons";

// ==================== SIZE GUIDE MODAL ====================
export function SizeGuideModal({
  onClose,
  sizeGuide,
  sizeGuideTables,
}: {
  onClose: () => void;
  sizeGuide: { size: string; bust: string; waist: string; hips: string }[];
  sizeGuideTables?: import("@/contexts/ThemeConfigContext").SizeGuideTable[];
}) {
  const [unit, setUnit] = useState<"in" | "cm">("in");
  const [cat, setCat] = useState(0);

  function convertMeasure(val: string, toCm: boolean): string {
    if (!toCm) return val;
    return val
      .replace(/[\d.]+/g, n => (parseFloat(n) * 2.54).toFixed(1))
      .replace(/"/g, "");
  }

  // Determine which mode to use: dynamic tables or legacy flat rows
  const useDynamic = sizeGuideTables && sizeGuideTables.length > 0;
  const activeTable = useDynamic ? sizeGuideTables![cat] : null;

  // Legacy mode: 3 fixed categories all showing the same rows
  const legacyCategories = ["Tops & Bras", "Bottoms", "Bodysuits"];
  const HOW_TO = [
    {
      label: "Bust",
      desc: "Measure around the fullest part of your chest, keeping the tape parallel to the floor.",
    },
    {
      label: "Waist",
      desc: "Measure around the narrowest part of your torso, usually just above the belly button.",
    },
    {
      label: "Hips",
      desc: "Measure around the fullest part of your hips and seat, about 8 inches below your waist.",
    },
  ];

  const categories = useDynamic
    ? sizeGuideTables!.map(t => t.name)
    : legacyCategories;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          width: "min(560px, 100vw)",
          height: "100vh",
          overflowY: "auto",
          padding: "32px 28px",
          position: "relative",
          animation: "slideInRight 0.3s cubic-bezier(0.23,1,0.32,1)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Size Guide
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 28,
              lineHeight: 1,
              color: "#333",
              padding: "0 4px",
            }}
          >
            ×
          </button>
        </div>
        {/* Category tabs */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          {categories.map((c, i) => (
            <button
              key={c}
              onClick={() => setCat(i)}
              style={{
                padding: "7px 16px",
                borderRadius: 4,
                border: "1px solid #333",
                background: cat === i ? "#1a1a1a" : "transparent",
                color: cat === i ? "#fff" : "#333",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {c}
            </button>
          ))}
        </div>
        {/* Unit toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <span style={{ fontSize: 13, color: "#555" }}>cm</span>
          <div
            onClick={() => setUnit(u => (u === "in" ? "cm" : "in"))}
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              background: unit === "in" ? "#1a1a1a" : "#ccc",
              position: "relative",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 3,
                left: unit === "in" ? 23 : 3,
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#fff",
                transition: "left 0.2s",
              }}
            />
          </div>
          <span style={{ fontSize: 13, color: "#555" }}>in</span>
        </div>
        {/* Size table */}
        <div style={{ overflowX: "auto", marginBottom: 28 }}>
          {useDynamic && activeTable ? (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
                minWidth: 320,
              }}
            >
              <thead>
                <tr style={{ borderBottom: "2px solid #1a1a1a" }}>
                  {activeTable.columns.map(h => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 12px",
                        textAlign: "left",
                        fontWeight: 700,
                        fontSize: 12,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeTable.rows.map((row, i) => (
                  <tr
                    key={i}
                    style={{
                      background: i % 2 === 0 ? "#fafafa" : "#fff",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {activeTable.columns.map((col, ci) => (
                      <td
                        key={col}
                        style={{
                          padding: "10px 12px",
                          fontWeight: ci === 0 ? 700 : 400,
                          fontSize: 13,
                          color: ci === 0 ? "#111" : "#444",
                        }}
                      >
                        {convertMeasure(row[col] || "", unit === "cm")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
                minWidth: 320,
              }}
            >
              <thead>
                <tr style={{ borderBottom: "2px solid #1a1a1a" }}>
                  {["Size", "Bust", "Waist", "Hips"].map(h => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 12px",
                        textAlign: "left",
                        fontWeight: 700,
                        fontSize: 12,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sizeGuide.map((row, i) => (
                  <tr
                    key={row.size}
                    style={{
                      background: i % 2 === 0 ? "#fafafa" : "#fff",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <td
                      style={{
                        padding: "10px 12px",
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      {row.size}
                    </td>
                    <td style={{ padding: "10px 12px", color: "#444" }}>
                      {convertMeasure(row.bust, unit === "cm")}
                    </td>
                    <td style={{ padding: "10px 12px", color: "#444" }}>
                      {convertMeasure(row.waist, unit === "cm")}
                    </td>
                    <td style={{ padding: "10px 12px", color: "#444" }}>
                      {convertMeasure(row.hips, unit === "cm")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {/* How to measure */}
        <div>
          <h3
            style={{
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            How to Measure
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {HOW_TO.map(item => (
              <div
                key={item.label}
                style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#175C40",
                    marginTop: 5,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>
                    {item.label}:{" "}
                  </span>
                  <span
                    style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}
                  >
                    {item.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Fit note */}
        <div
          style={{
            marginTop: 24,
            padding: "14px 16px",
            background: "#f0f7f4",
            borderRadius: 6,
            borderLeft: "3px solid #175C40",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: "#175C40",
              lineHeight: 1.6,
            }}
          >
            <strong>Fit Note:</strong> Our activewear is designed for a close,
            body-hugging fit. If you are between sizes, we recommend sizing up
            for a more relaxed feel.
          </p>
        </div>
      </div>
    </div>
  );
}

// ==================== ZOOM MODAL ====================
export function ZoomModal({
  src,
  onClose,
}: {
  src: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);
  return ReactDOM.createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(0,0,0,0.92)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "zoom-out",
      }}
      onClick={onClose}
    >
      <img
        loading="lazy"
        src={src}
        alt="Zoomed"
        style={{
          maxWidth: "90vw",
          maxHeight: "90vh",
          objectFit: "contain",
          cursor: "default",
        }}
        onClick={e => e.stopPropagation()}
      />
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 20,
          right: 24,
          background: "none",
          border: "none",
          color: "#fff",
          fontSize: 32,
          cursor: "pointer",
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>,
    document.body
  );
}
