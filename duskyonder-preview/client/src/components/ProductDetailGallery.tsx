import React, { useState, useRef, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ZoomIcon, ImagePlaceholderIcon } from "@/components/ProductDetailIcons";
import { ZoomModal } from "@/components/ProductDetailModals";

// ==================== PRODUCT GALLERY ====================
export function ProductGallery({ images, productName, activeColorImage }: { images: string[]; productName: string; activeColorImage?: string }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);

  // Swipe state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const thumbsRef = useRef<HTMLDivElement>(null);
  const prevColorImage = useRef(activeColorImage);

  // Sync color selection
  useEffect(() => {
    if (activeColorImage && activeColorImage !== prevColorImage.current) {
      prevColorImage.current = activeColorImage;
      const idx = images.indexOf(activeColorImage);
      if (idx >= 0) setActiveIdx(idx);
      else setActiveIdx(0);
    }
  }, [activeColorImage, images]);

  // Auto-scroll thumbnails
  useEffect(() => {
    if (thumbsRef.current && thumbsRef.current.children[activeIdx]) {
      const activeThumb = thumbsRef.current.children[activeIdx] as HTMLElement;
      activeThumb.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [activeIdx]);

  const allImages = images.length > 0 ? images : [""];

  // Touch handlers for swiping
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && activeIdx < allImages.length - 1) {
      setActiveIdx(activeIdx + 1);
    }
    if (isRightSwipe && activeIdx > 0) {
      setActiveIdx(activeIdx - 1);
    }
  };

  return (
    <div className="pdp-gallery">
      {/* Main Image with Swipe */}
      <div
        className="pdp-main-image"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <img
          src={allImages[activeIdx] || ""}
          alt={`${productName} image ${activeIdx + 1}`}
          onClick={() => allImages[activeIdx] && setZoomSrc(allImages[activeIdx])}
        />

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

      {/* Thumbnails with Ref for auto-scroll */}
      <div className="pdp-thumbs" ref={thumbsRef}>
        {allImages.map((img, i) => (
          <button
            key={i}
            className={`pdp-thumb${activeIdx === i ? " active" : ""}`}
            onClick={() => setActiveIdx(i)}
          >
            {img ? (
              <img src={img} alt={`Thumb ${i + 1}`} />
            ) : (
              <div className="placeholder"><ImagePlaceholderIcon /></div>
            )}
          </button>
        ))}
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
      <div className="pdp-collapsible-body" style={{ maxHeight: open ? 600 : 0, overflow: "hidden", overflowX: "hidden", transition: "max-height 0.3s cubic-bezier(0.23,1,0.32,1)" }}>
        <div style={{ padding: "12px 0 16px", maxWidth: "100%", overflow: "hidden", boxSizing: "border-box" }}>{children}</div>
      </div>
    </div>
  );
}

