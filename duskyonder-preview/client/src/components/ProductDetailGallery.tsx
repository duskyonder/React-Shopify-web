import React, { useState, useRef, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ZoomIcon, ImagePlaceholderIcon } from "@/components/ProductDetailIcons";
import { ZoomModal } from "@/components/ProductDetailModals";

// ==================== PRODUCT GALLERY ====================
export function ProductGallery({ images, productName, activeColorImage }: { images: string[]; productName: string; activeColorImage?: string }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  // When color changes, update active image to the color-specific image
  const prevColorImage = useRef(activeColorImage);
  useEffect(() => {
    if (activeColorImage && activeColorImage !== prevColorImage.current) {
      prevColorImage.current = activeColorImage;
      const idx = images.indexOf(activeColorImage);
      if (idx >= 0) setActiveIdx(idx);
      else setActiveIdx(0); // fallback to first
    }
  }, [activeColorImage, images]);

  const allImages = images.length > 0 ? images : [""];

  return (
    <div className="pdp-gallery">
      {/* Left thumbnails */}
      <div className="pdp-thumbs">
        {allImages.map((img, i) => (
          <button
            key={i}
            className={`pdp-thumb${activeIdx === i ? " active" : ""}`}
            onClick={() => setActiveIdx(i)}
          >
            {img ? (
              <img loading="lazy" src={img} alt={`${productName} ${i + 1}`} />
            ) : (
              <div className="pdp-thumb-placeholder"><ImagePlaceholderIcon /></div>
            )}
          </button>
        ))}
      </div>

      {/* Main image */}
      <div
        className="pdp-main-image"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={() => allImages[activeIdx] && setZoomSrc(allImages[activeIdx])}
        style={{ cursor: allImages[activeIdx] ? "zoom-in" : "default" }}
      >
        {allImages[activeIdx] ? (
          <img loading="lazy" src={allImages[activeIdx]} alt={productName} />
        ) : (
          <div className="pdp-main-placeholder"><ImagePlaceholderIcon /></div>
        )}
        {isHovering && allImages[activeIdx] && (
          <div className="pdp-zoom-hint"><ZoomIcon /><span>Click to zoom</span></div>
        )}
        {/* Prev/Next arrows for mobile */}
        {allImages.length > 1 && (
          <>
            <button className="pdp-arrow prev" onClick={e => { e.stopPropagation(); setActiveIdx(i => Math.max(0, i - 1)); }} style={{ opacity: activeIdx === 0 ? 0.3 : 1 }}>
              <ChevronLeftIcon />
            </button>
            <button className="pdp-arrow next" onClick={e => { e.stopPropagation(); setActiveIdx(i => Math.min(allImages.length - 1, i + 1)); }} style={{ opacity: activeIdx === allImages.length - 1 ? 0.3 : 1 }}>
              <ChevronRightIcon />
            </button>
          </>
        )}
      </div>

      {zoomSrc && <ZoomModal src={zoomSrc} onClose={() => setZoomSrc(null)} />}
    </div>
  );
}

// ==================== COLLAPSIBLE SECTION ====================
export function CollapsibleSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="pdp-collapsible">
      <button className="pdp-collapsible-header" onClick={() => setOpen(o => !o)}>
        <span>{title}</span>
        <span style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease", display: "flex" }}>
          <ChevronDownIcon />
        </span>
      </button>
      <div className="pdp-collapsible-body" style={{ maxHeight: open ? 600 : 0, overflow: "hidden", transition: "max-height 0.3s cubic-bezier(0.23,1,0.32,1)" }}>
        <div style={{ padding: "12px 0 16px", maxWidth: "100%", overflow: "hidden", boxSizing: "border-box" }}>{children}</div>
      </div>
    </div>
  );
}

