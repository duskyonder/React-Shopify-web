import React, { useState, useEffect, useRef, useCallback } from "react";
import { useIsMobile } from "@/hooks/useMobile";
import { Link, useLocation } from "wouter";
import { useThemeConfig, CollectionProduct, ProductDetailConfig } from "@/contexts/ThemeConfigContext";
import { SFPromoBar, SFHeader, SFFooter } from "@/components/StorefrontShell";
import { ChevronLeftIcon } from "@/components/ProductDetailIcons";
import { ProductGallery } from "@/components/ProductDetailGallery";
import { ProductInfoPanel, ProductVideo, RecommendedProducts, BackToTop, MobileStickyCart, InlineNewsletterStrip } from "@/components/ProductDetailInfo";

export default function ProductDetail() {
  const { config } = useThemeConfig();
  const [location] = useLocation();

  // Extract handle from URL: /products/:handle
  const handle = location.replace(/^\/products\//, "");

  // Find product across all collections
  let foundProduct: CollectionProduct | null = null;
  let foundCollection = config.collections[0];
  let foundDetail: Partial<ProductDetailConfig> = {};

  for (const col of config.collections) {
    const prod = col.products.find(p => {
      const prodHandle = p.detailUrl?.replace("/products/", "") ||
        p.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      return prodHandle === handle;
    });
    if (prod) {
      foundProduct = prod;
      foundCollection = col;
      foundDetail = col.productDetails?.[prod.id] || {};
      break;
    }
  }

  // Fallback: also search home page products
  if (!foundProduct) {
    const homeProd = config.products.find(p => {
      const prodHandle = p.detailUrl?.replace("/products/", "") ||
        p.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      return prodHandle === handle;
    });
    if (homeProd) {
      // Convert Product to CollectionProduct shape
      foundProduct = { ...homeProd, colors: homeProd.colors || [], colorImages: homeProd.colorImages || {} };
    }
  }

  // PREVIEW FALLBACK: if still no product found, use a mock product so the detail page layout can be previewed
  if (!foundProduct) {
    foundProduct = {
      id: "preview_mock",
      name: "Sculpt Bra",
      price: "$68",
      comparePrice: "$88",
      badge: "Best Seller",
      colors: ["#175C40", "#2D2D2D", "#8B7355", "#C8C8C8"],
      colorImages: {},
      detailUrl: "/products/" + handle,
    };
  }

  // Color selection state (lifted to sync gallery)
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);

  // Build gallery images (include colorImages for all colors)
  const galleryImages: string[] = [];
  if (foundProduct?.imageUrl) galleryImages.push(foundProduct.imageUrl);
  if (foundProduct?.hoverImageUrl) galleryImages.push(foundProduct.hoverImageUrl);
  // Add color-specific images
  if (foundProduct?.colorImages) {
    Object.values(foundProduct.colorImages).forEach(url => {
      if (url && !galleryImages.includes(url)) galleryImages.push(url);
    });
  }
  if (foundDetail.galleryImages) galleryImages.push(...foundDetail.galleryImages.filter(u => u && !galleryImages.includes(u)));

  // Determine active color image for gallery sync
  const activeColorHex = foundProduct?.colors?.[selectedColorIdx];
  const activeColorImage = activeColorHex && foundProduct?.colorImages?.[activeColorHex]
    ? foundProduct.colorImages[activeColorHex]
    : undefined;

  const showVideo = foundDetail.showVideo && foundDetail.videoUrl;
  const showRecommended = foundDetail.showRecommended !== false;
  const recommendedCount = Math.min(Math.max(foundDetail.recommendedCount || 4, 4), 6);
  const mobileRecommendedCount = Math.min(Math.max(foundDetail.mobileRecommendedCount || 2, 2), 6);
  const recommendedTitle = config.pdpRecommendedTitle || "You May Also Like";
  const recommendedTitleColor = config.pdpRecommendedTitleColor || "";
  const recommendedTitleSize = config.pdpRecommendedTitleSize || 22;
  const recommendedTitleMobileSize = config.pdpRecommendedTitleMobileSize || 18;

  return (
    <div className="storefront">
      <SFPromoBar />
      <SFHeader darkMode />

      <div className="pdp-page" style={{
        "--pdp-title-font-size-desktop": `${config.pdpTitleFontSizeDesktop ?? 32}px`,
        "--pdp-title-font-size-mobile": `${config.pdpTitleFontSizeMobile ?? 26}px`,
        "--pdp-body-font-size-desktop": `${config.pdpBodyFontSizeDesktop ?? 14}px`,
        "--pdp-body-font-size-mobile": `${config.pdpBodyFontSizeMobile ?? 13}px`,
      } as React.CSSProperties}>
        {/* Back to collection */}
        <div className="pdp-back-bar">
          <Link href={`/collections/${foundCollection.handle}`} className="pdp-back-link">
            <ChevronLeftIcon />
            <span>Back to {foundCollection.title}</span>
          </Link>
        </div>

        {foundProduct ? (
          <>
            {/* Main content: gallery + info */}
            <div className="pdp-main-layout">
              <ProductGallery images={galleryImages} productName={foundProduct.name} activeColorImage={activeColorImage} />
              <ProductInfoPanel
                product={foundProduct}
                detail={foundDetail}
                collectionHandle={foundCollection.handle}
                collectionTitle={foundCollection.title}
                selectedColorIdx={selectedColorIdx}
                onColorChange={setSelectedColorIdx}
              />
            </div>

            {/* Product video */}
            {showVideo && foundDetail.videoUrl && (
              <ProductVideo videoUrl={foundDetail.videoUrl} />
            )}

            {/* Recommended products */}
            {showRecommended && foundCollection.products.length > 1 && (
              <RecommendedProducts
                currentProductId={foundProduct.id}
                collectionProducts={foundCollection.products}
                manualIds={foundDetail.manualRecommendedIds || []}
                count={recommendedCount}
                mobileCount={mobileRecommendedCount}
                sectionTitle={recommendedTitle}
                titleColor={recommendedTitleColor}
                titleSize={recommendedTitleSize}
                titleMobileSize={recommendedTitleMobileSize}
                recommendedBadges={config.pdpRecommendedBadges}
              />
            )}
          </>
        ) : (
          <div className="pdp-not-found">
            <h2>Product Not Found</h2>
            <p>The product you're looking for doesn't exist or has been removed.</p>
            <Link href="/collections/leggings" className="pdp-not-found-link">Browse Collections</Link>
          </div>
        )}
      </div>

      <InlineNewsletterStrip />
      <SFFooter />
      <BackToTop />
      {foundProduct && <MobileStickyCart productName={foundProduct.name} price={foundProduct.price} />}
    </div>
  );
}
