import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/useMobile";
import { Link, useLocation } from "wouter";
import { useThemeConfig, CollectionProduct, ProductDetailConfig } from "@/contexts/ThemeConfigContext";
import { SFPromoBar, SFHeader, SFFooter } from "@/components/StorefrontShell";
import { ChevronLeftIcon } from "@/components/ProductDetailIcons";
import { ProductGallery } from "@/components/ProductDetailGallery";
import { ProductInfoPanel, ProductVideo, RecommendedProducts, BackToTop, MobileStickyCart, InlineNewsletterStrip } from "@/components/ProductDetailInfo";
import { fetchProductByHandle, type ShopifyProduct } from "@/lib/shopify";
import { useCart } from "@/contexts/CartContext";

export default function ProductDetail() {
  const { config } = useThemeConfig();
  const [location] = useLocation();
  const { addItem, openCart } = useCart();

  // Extract handle from URL: /products/:handle
  const handle = location.replace(/^\/products\//, "");

  // Shopify product state
  const [shopifyProduct, setShopifyProduct] = useState<ShopifyProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch product from Shopify by handle
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchProductByHandle(handle).then((product) => {
      setShopifyProduct(product);
      if (!product) {
        setError("Product not found");
      }
      setLoading(false);
    }).catch((err) => {
      console.error("Failed to fetch product:", err);
      setError("Failed to load product");
      setLoading(false);
    });
  }, [handle]);

  // Also try to find product in local config (fallback for collection context)
  let foundCollection = config.collections[0];
  for (const col of config.collections) {
    const prod = col.products.find(p => {
      const prodHandle = p.detailUrl?.replace("/products/", "") ||
        p.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      return prodHandle === handle;
    });
    if (prod) {
      foundCollection = col;
      break;
    }
  }
  const foundDetail: Partial<ProductDetailConfig> = foundCollection?.productDetails?.[shopifyProduct?.id ?? ""] || {};

  // Build a CollectionProduct-compatible object from Shopify data
  const product: CollectionProduct | null = shopifyProduct ? buildProductFromShopify(shopifyProduct) : null;

  // Color selection state
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);

  // Build gallery images from Shopify product
  const galleryImages: string[] = shopifyProduct?.images?.map(img => img.url) ?? [];

  // Determine active color image for gallery sync
  const activeColorHex = product?.colors?.[selectedColorIdx];
  const activeColorImage = activeColorHex && product?.colorImages?.[activeColorHex]
    ? product.colorImages[activeColorHex]
    : undefined;

  const showVideo = foundDetail.showVideo && foundDetail.videoUrl;
  const showRecommended = foundDetail.showRecommended !== false;
  const recommendedCount = Math.min(Math.max(foundDetail.recommendedCount || 4, 4), 6);
  const mobileRecommendedCount = Math.min(Math.max(foundDetail.mobileRecommendedCount || 2, 2), 6);
  const recommendedTitle = config.pdpRecommendedTitle || "You May Also Like";
  const recommendedTitleColor = config.pdpRecommendedTitleColor || "";
  const recommendedTitleSize = config.pdpRecommendedTitleSize || 22;
  const recommendedTitleMobileSize = config.pdpRecommendedTitleMobileSize || 18;

  // Loading state
  if (loading) {
    return (
      <div className="storefront">
        <SFPromoBar />
        <SFHeader darkMode />
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 40, height: 40, border: "3px solid #e0e0e0", borderTopColor: "#175C40", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
            <p style={{ color: "#666", fontSize: 14 }}>Loading product...</p>
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <SFFooter />
      </div>
    );
  }

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

        {product && shopifyProduct ? (
          <>
            {/* Main content: gallery + info */}
            <div className="pdp-main-layout">
              <ProductGallery images={galleryImages} productName={product.name} activeColorImage={activeColorImage} />
              <ProductInfoPanel
                product={product}
                detail={foundDetail}
                collectionHandle={foundCollection.handle}
                collectionTitle={foundCollection.title}
                selectedColorIdx={selectedColorIdx}
                onColorChange={setSelectedColorIdx}
                shopifyProduct={shopifyProduct}
              />
            </div>

            {/* Product video */}
            {showVideo && foundDetail.videoUrl && (
              <ProductVideo videoUrl={foundDetail.videoUrl} />
            )}

            {/* Recommended products */}
            {showRecommended && foundCollection.products.length > 1 && (
              <RecommendedProducts
                currentProductId={product.id}
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
            <Link href="/collections" className="pdp-not-found-link">Browse Collections</Link>
          </div>
        )}
      </div>

      <InlineNewsletterStrip />
      <SFFooter />
      <BackToTop />
      {product && <MobileStickyCart productName={product.name} price={product.price} shopifyProduct={shopifyProduct} />}
    </div>
  );
}

// =====================================================
// Helper: Convert Shopify product to CollectionProduct format
// =====================================================
function buildProductFromShopify(sp: ShopifyProduct): CollectionProduct {
  // Extract unique colors from options
  const colorOption = sp.options.find(o => o.name.toLowerCase() === "color");
  const colors = colorOption?.values ?? [];

  // Build color-to-image mapping from variants
  const colorImages: Record<string, string> = {};
  if (colorOption) {
    for (const variant of sp.variants) {
      const colorOpt = variant.selectedOptions.find(o => o.name.toLowerCase() === "color");
      if (colorOpt && variant.image?.url && !colorImages[colorOpt.value]) {
        colorImages[colorOpt.value] = variant.image.url;
      }
    }
  }

  // Price from first variant
  const firstVariant = sp.variants[0];
  const price = firstVariant ? `$${parseFloat(firstVariant.price.amount).toFixed(0)}` : "$0";
  const comparePrice = firstVariant?.compareAtPrice
    ? `$${parseFloat(firstVariant.compareAtPrice.amount).toFixed(0)}`
    : undefined;

  return {
    id: sp.id,
    name: sp.title,
    price,
    comparePrice,
    imageUrl: sp.images[0]?.url,
    hoverImageUrl: sp.images[1]?.url,
    colors,
    colorImages,
    detailUrl: `/products/${sp.handle}`,
  };
}
