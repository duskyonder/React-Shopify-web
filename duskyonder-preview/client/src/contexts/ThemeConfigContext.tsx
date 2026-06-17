import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { fetchHomepageBanners } from "@/lib/shopify";

export interface SlideTextBlock {
  id: string;
  text: string;
  type: "heading" | "body";
  fontSize?: number;
  mobileFontSize?: number; // 移动端字体大小
  fontWeight?: string;
  color?: string;
  fontStyle?: "normal" | "italic";
}
export interface Slide {
  id: string;
  title: string;
  subtitle: string;
  buttonLabel: string;
  buttonLink: string;
  imageUrl?: string;
  mobileImageUrl?: string;           // 移动端专用横幅图片（可选，未设置则使用 imageUrl）
  contentPosition?: string; // "top-left"|"top-center"|"top-right"|"middle-left"|"middle-center"|"middle-right"|"bottom-left"|"bottom-center"|"bottom-right"
  contentPositionMobile?: string; // 移动端独立内容位置
  textColorMode?: 'light' | 'dark'; // 文本颜色模式：light=白色文字, dark=深色文字
  textBlocks?: SlideTextBlock[];
}

export interface Category {
  id: string;
  title: string;
  link: string;
  imageUrl?: string;
}

export interface Video {
  id: string;
  influencerName: string;
  caption: string;
  creatorName?: string; // 达人显示名（不含@）
  creatorAvatar?: string; // 达人头像 URL
  imageUrl?: string;
  videoPlayUrl?: string; // mp4 or YouTube embed URL
  linkedProductId?: string; // product id to show in video modal
  linkedProductName?: string;
  linkedProductPrice?: string;
  linkedProductImage?: string;
  linkedProductImages?: string[]; // 多张产品图（用于弹窗悬浮切换）
  linkedProductLink?: string;
  linkedProductComparePrice?: string; // 划线价
  linkedProductColors?: string[]; // 颜色选项（hex值）
  linkedProductSizes?: string[]; // 尺码选项
}

export interface Product {
  id: string;
  name: string;
  price: string;
  badge?: string;
  imageUrl?: string;
  hoverImageUrl?: string;
  colors: string[];
  colorImages?: Record<string, string>;
  detailUrl?: string;
  relatedProductIds?: string[]; // IDs of products to show as "Pair It Perfectly With" in cart
}

export interface Fabric {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface SocialLinks {
  youtube: string;
  facebook: string;
  instagram: string;
  pinterest: string;
  twitter: string;
  tiktok: string;
}

export interface PromoBarItem {
  id: string;
  text: string;
  link?: string;
}

export interface CollectionSeries {
  id: string;
  label: string;
  name: string;
  description?: string;
  imageUrl?: string;
  link?: string; // 点击图片跳转链接
}

// ---- Care Icon Types ----
export type CareIconKey =
  | "machine-wash" | "hand-wash" | "dry-clean" | "do-not-bleach" | "tumble-dry"
  | "hang-dry" | "iron-low" | "iron-medium" | "do-not-iron" | "do-not-wring";
export interface CareInstruction {
  icon: CareIconKey;
  label: string;
}

// ---- Product Detail Types ----
export interface ProductSizeOption {
  label: string;
  available: boolean;
}
export interface SizeGuideRow {
  size: string;
  bust: string;
  waist: string;
  hips: string;
}
export interface SizeGuideTable {
  id: string;
  name: string; // 表格名称，如 "Tops & Bras"
  columns: string[]; // 列头，如 ["Size", "Bust", "Waist", "Hips"]
  rows: Record<string, string>[]; // 每行数据，key 为列名
}
export interface DescriptionBlock {
  id: string;
  title: string;
  content: string;
}
export interface ProductDetailConfig {
  description: string;
  descriptionBlocks?: DescriptionBlock[];
  fabricId?: string;
  showFabric: boolean;
  careInstructions: CareInstruction[];
  videoUrl?: string;
  showVideo: boolean;
  comparePrice?: string;
  sizes: ProductSizeOption[];
  sizeGuide: SizeGuideRow[];
  sizeGuideTables?: SizeGuideTable[]; // 动态多表格 Size Guide
  shippingText: string; // legacy
  shippingBlocks?: string[]; // multi-block shipping text (new)
  manualRecommendedIds: string[];
  recommendedCount: number;
  mobileRecommendedCount: number;
  showRecommended: boolean;
  showBadge: boolean;
  galleryImages: string[];
}

// ---- Collection Page Types ----
export interface CollectionProduct {
  id: string;
  name: string;
  price: string;
  comparePrice?: string;
  badge?: string;
  imageUrl?: string;
  hoverImageUrl?: string;
  // colors: each entry is a hex OR "#hex1+#hex2" for split-color
  colors: string[];
  colorImages?: Record<string, string>;
  subCategory?: string; // for filtering
  detailUrl?: string;
}

export interface CollectionColorFilter {
  id: string;
  label: string;
  // hex or "#hex1+#hex2" for split-color swatch
  value: string;
}

export interface CollectionConfig {
  id: string;
  handle: string; // URL slug, e.g. "leggings"
  title: string;
  subtitle?: string;
  bannerImageUrl?: string;
  bannerHeight: number; // px
  showBanner: boolean;
  productsPerRow: number; // 2-4
  productAspectRatio: string; // "3/4" | "1/1" | "4/3"
  showColorFilter: boolean;
  colorFilters: CollectionColorFilter[];
  subCategories: string[]; // e.g. ["All", "Leggings", "Shorts"]
  sortOptions: string[]; // e.g. ["Featured", "Price: Low to High", "Newest"]
  products: CollectionProduct[];
  desktopGap: number;
  mobileGap: number;
  productDetails: Record<string, Partial<ProductDetailConfig>>;
}

export interface FooterLink {
  id: string;
  label: string;
  link: string;
}
export interface FooterColumn {
  id: string;
  title: string;
  links: FooterLink[];
}
export interface NavItem {
  id: string;
  label: string;
  link: string;
  children?: Array<{ id: string; label: string; link: string }>;
}

export interface MarqueeItem {
  id: string;
  type: "text" | "image";
  text?: string;
  imageUrl?: string;
}

export type SectionKey =
  | "hero"
  | "categories"
  | "marquee"
  | "videos"
  | "featured"
  | "series"
  | "fabric"
  | "newsletter";

export interface SectionConfig {
  key: SectionKey;
  label: string;
  visible: boolean;
  instanceId?: string; // unique ID for multi-instance sections (e.g., multiple 'featured' blocks)
  titleAlign?: "left" | "center" | "right"; // section title alignment, default center
}

export interface FeaturedInstance {
  id: string; // matches SectionConfig.instanceId
  title: string;
  products: Product[];
  productsPerRow: number;
  productAspectRatio: string;
  dataSource?: 'auto' | 'manual'; // auto=fetch Best Sellers from Shopify, manual=use manually selected products
  collectionHandle?: string; // Shopify collection handle for auto mode (default: best-selling)
}

export interface ThemeConfig {
  showPromoBar: boolean;
  promoBarItems: PromoBarItem[];
  promoBarBg: string;
  promoBarColor: string;
  promoBarFontSize?: number;       // px, 桌面端字体大小，默认 13
  promoBarMobileFontSize?: number; // px, 移动端字体大小，默认 12
  promoBarHeight?: number;         // px, 桌面端高度，默认 40
  promoBarMobileHeight?: number;   // px, 移动端高度，默认 36

  logoText: string;
  logoImageUrl?: string;
  logoImageUrlWhite?: string;      // 白色 Logo（透明导航栏用）
  logoDesktopHeight?: number;      // px, 桌面端 Logo 高度，默认 40
  logoMobileHeight?: number;       // px, 移动端 Logo 高度，默认 32
  navItems: NavItem[];
  accountUrl: string;
  wishlistUrl: string;
  navFontSize: number; // px, 导航链接字体大小
  navMobileFontSize?: number; // px, 移动端导航字体大小
  navFontWeight: "400" | "500" | "600" | "700" | "800"; // 字重
  navFontStyle: "normal" | "italic"; // 斜体
  navTextColor: string; // 滚动后/深色模式下的导航文字颜色
  navHoverColor: string; // 悬浮颜色

  sectionOrder: SectionConfig[];

  slides: Slide[];
  slideshowAutoplay: boolean;
  slideshowSpeed: number;
  heroHeight: number;
  heroMobileHeight?: number;
  heroTitleFontSize?: number;          // px, 桌面端标题字体大小
  heroTitleMobileFontSize?: number;    // px, 移动端标题字体大小
  heroTitleColor?: string;             // 标题颜色
  heroTitleWeight?: "400" | "500" | "600" | "700" | "800" | "900"; // 标题字重
  heroSubtitleFontSize?: number;       // px, 桌面端副标题字体大小
  heroSubtitleMobileFontSize?: number; // px, 移动端副标题字体大小
  heroSubtitleColor?: string;          // 副标题颜色
  heroBtnShape: "square" | "rounded" | "pill"; // border-radius
  heroBtnStyle: "outline" | "solid"; // fill type
  heroBtnBg: string; // background color (for solid)
  heroBtnBorderColor: string; // border color
  heroBtnTextColor: string; // text color
  heroBtnFontSize: number; // px
  heroBtnMobileFontSize?: number; // px, 移动端
  heroBtnFontWeight: "400" | "500" | "600" | "700" | "800";
  heroBtnLetterSpacing: number; // em * 100
  heroBtnPaddingX: number; // px
  heroBtnPaddingY: number; // px
  heroBtnMobilePaddingX?: number; // px, 移动端
  heroBtnMobilePaddingY?: number; // px, 移动端

  showBrandStory: boolean;
  brandStoryTitle: string;
  brandStoryText: string;
  brandStoryButtonLabel: string;
  brandStoryImageUrl?: string;

  showMarquee: boolean;
  marqueeText: string;
  marqueeItems: MarqueeItem[];
  marqueeDirection: "left" | "right";
  marqueeSpeed: number;
  marqueeBg: string;
  marqueeColor: string;

  categoriesTitle: string;
  categories: Category[];
  categoryAspectRatio: string;
  categoriesDesktopCount: number; // 桌面端单行显示数量
  categoriesDesktopGap: number; // px, 桌面端图片间距
  categoriesMobileGap: number; // px, 移动端图片间距
  categoriesCardWidth: number; // px, 桌面端卡片宽度（0=自动按列数平分）
  categoriesMobileCardWidth: number; // px, 移动端卡片宽度（0=自动）
  categoryOverlayOpacity?: number; // 0-100, 遮罩深度百分比, default 60
  categoryLabelFontSizeDesktop?: number; // px, 桌面端标签字体大小, default 14
  categoryLabelFontSizeMobile?: number; // px, 移动端标签字体大小, default 12

  showVideos: boolean;
  videosTitle: string;
  videos: Video[];
  videoAspectRatio: string;
  videosPerRow: number;
  videosDesktopCount: number; // 桌面端单行显示数量
  videosDesktopGap: number; // px, 桌面端图片间距
  videosMobileGap: number; // px, 移动端图片间距
  videosCardWidth: number; // px, 桌面端卡片宽度（0=自动）
  videosMobileCardWidth: number; // px, 移动端卡片宽度（0=自动）
  // 播放卡片弹窗尺寸
  videoModalDesktopWidth: number; // px, 桌面端弹窗宽度
  videoModalImgRatio: string; // 产品图比例 (3:4 / 1:1 / 4:3)

  showFeatured: boolean;
  featuredTitle: string;
  products: Product[];
  productAspectRatio: string;
  productsPerRow: number;
  productsDesktopGap: number; // px, 桌面端图片间距
  productsMobileGap: number; // px, 移动端图片间距
  productsCardWidth: number; // px, 桌面端卡片宽度（0=自动）
  productsMobileCardWidth: number; // px, 移动端卡片宽度（0=自动）
  productsTitleFontSizeDesktop?: number; // px, 桌面端标题字体大小, default 0 (auto)
  productsTitleFontSizeMobile?: number; // px, 移动端标题字体大小, default 0 (auto)
  productsSwatchSize?: number; // px, 色块大小, default 10
  productsSwatchGap?: number; // px, 色块间距, default 4
  productsSwatchOffsetX?: number; // px, 色块水平偏移（向右）, default 0
  productsSwatchMarginTop?: number; // px, 色块上边距, default 6
  productsSwatchAlign?: "flex-start" | "center" | "flex-end"; // 色块对齐方式, default flex-start
  productsDataSource?: 'auto' | 'manual'; // auto=fetch Best Sellers from Shopify, manual=use manually configured products
  productsCollectionHandle?: string; // Shopify collection handle for auto mode
  featuredInstances: FeaturedInstance[]; // multi-instance Best Sellers

  showSeries: boolean;
  seriesHeadline: string;
  seriesSubheadline: string;
  seriesLabel: string;
  seriesList: CollectionSeries[];
  seriesAutoplaySpeed: number;
  seriesImageAspectRatio: string; // e.g. "4/5", "1/1", "3/4"
  seriesImageWidth: number; // px, 桌面端左侧图片宽度（0=自动，约50%）
  seriesMobileImageWidth?: number; // px, 移动端图片宽度（0=自动）

  showFabric: boolean;
  fabricTitle: string;
  fabrics: Fabric[];
  fabricsPerRow: number; // 1-4
  fabricCardPadding: number; // px, e.g. 24-48

  enableNewsletter: boolean;
  newsletterTitle: string;
  newsletterSubtitle?: string;  // 副标题（可选，默认用 newsletterText）
  newsletterText: string;
  newsletterDelay: number;
  newsletterTheme?: 'dark-green' | 'cream'; // 弹窗主题色，默认 'dark-green'
  newsletterImageUrl?: string; // 左侧图片 URL（Split-layout 用）
  newsletterSocialProof?: string; // 社交证明文字（如 "10,000+ members"）
  newsletterPages?: string[]; // 弹框出现的页面，如 ['home', 'products']，或 ['all']

  footerColumns?: FooterColumn[];
  footerNavFontSize?: number;
  footerNavMobileFontSize?: number;
  footerPaddingY?: number;             // px, 页脚上下内边距（桌面端），默认 60
  footerMobilePaddingY?: number;       // px, 页脚上下内边距（移动端），默认 24
  footerAbout: string;
  footerCopyright?: string;            // 自定义版权文字（空则使用默认）
  socialLinks: SocialLinks;

  // ---- Collection Pages ----
  collections: CollectionConfig[];
  // ---- Global Product Detail Defaults ----
  pdpShippingText: string; // legacy
  pdpShippingBlocks?: string[]; // multi-block (new)
  pdpSizeGuide: SizeGuideRow[];
  pdpSizeGuideTables?: SizeGuideTable[]; // 动态多表格 Size Guide（全局默认）
  pdpDefaultSizes: ProductSizeOption[];
  pdpDefaultDescriptionBlocks?: DescriptionBlock[]; // 全局默认产品描述块（Shopify 占位）
  pdpDefaultCareInstructions?: CareInstruction[]; // 全局默认洗涤说明
  // ---- PDP UI Controls ----
  pdpShowShare?: boolean;
  pdpShowWishlist?: boolean;
  // ---- PDP Font Size Controls ----
  pdpTitleFontSizeDesktop?: number; // px, 产品名桌面端字体大小, default 32
  pdpTitleFontSizeMobile?: number;  // px, 产品名移动端字体大小, default 26
  pdpBodyFontSizeDesktop?: number;  // px, 正文桌面端字体大小, default 14
  pdpBodyFontSizeMobile?: number;   // px, 正文移动端字体大小, default 13
  // ---- PDP Shipping/Return Modules ----
  pdpShippingModuleTitle?: string;
  pdpShippingModuleBlocks?: string[];
  pdpReturnModuleTitle?: string;
  pdpReturnModuleBlocks?: string[];
  // ---- Recommended Section ----
  pdpRecommendedTitle?: string;
  pdpRecommendedTitleColor?: string;
  pdpRecommendedTitleSize?: number;
  pdpRecommendedTitleMobileSize?: number;
  pdpRecommendedBadges?: Record<string, string>; // 推荐区专属 Tag，key=productId, value=badge文字
  // ---- About Us Page ----
  aboutUs?: AboutUsConfig;
  blog?: BlogConfig;
  influencer?: InfluencerConfig;
  // ---- Policy Pages ----
  policyPages?: PolicyPagesConfig;
  returnsPage?: ReturnsPageConfig;
  fabricGuidePage?: FabricGuidePageConfig;
  // ---- Cart Drawer ----
  cartDrawerWidth?: number; // px, 360-560, default 420
  cartItemNameFontSizeDesktop?: number; // px, 产品名桌面端字体大小, default 15
  cartItemNameFontSizeMobile?: number; // px, 产品名移动端字体大小, default 14
  cartItemPriceFontSizeDesktop?: number; // px, 价格桌面端字体大小, default 14
  cartItemPriceFontSizeMobile?: number; // px, 价格移动端字体大小, default 13
  freeShippingThreshold?: number; // default 150
  freeShippingText?: string; // default "Add {{amount}} more for free shipping"
  freeShippingAchievedText?: string; // default "You've unlocked free shipping! 🎉"
  // ---- Section Layout Controls ----
  // Products section
  productsMaxWidth?: number; // px, 800-1920, desktop max-width, default 1680
  productCardHeight?: number; // px, 0-600, desktop card height (0=auto), default 0
  productsMobileMaxWidth?: number; // px, 320-1200, mobile max-width (0=full), default 0
  productsMobileCardHeight?: number; // px, 0-600, mobile card height (0=auto), default 0
  // Videos section
  videosMaxWidth?: number; // px, 800-1920, desktop max-width, default 1680
  videoCardHeight?: number; // px, 0-600, desktop card height (0=auto), default 0
  videosMobileMaxWidth?: number; // px, 320-1200, mobile max-width (0=full), default 0
  videosMobileCardHeight?: number; // px, 0-600, mobile card height (0=auto), default 0
  // Series section
  seriesMaxWidth?: number; // px, 800-1920, desktop max-width, default 1680
  seriesImageHeight?: number; // px, 300-800, desktop min-height, default 520
  seriesMobileMaxWidth?: number; // px, 320-1200, mobile max-width (0=full), default 0
  seriesMobileMinHeight?: number; // px, 200-600, mobile min-height (0=auto), default 0
}


// ---- Policy Pages Types ----
export interface PolicyPageConfig {
  heroTitle: string;
  heroSubtitle: string;
  heroBgColor: string;
  heroTextColor: string;
  heroMinHeight?: number; // px, default 280
  heroDesktopPosition?: string; // 9-grid: top-left/top-center/top-right/middle-left/middle-center/middle-right/bottom-left/bottom-center/bottom-right
  heroMobilePosition?: string; // same enum, defaults to heroDesktopPosition
  bodyHtml: string; // Shopify Liquid: {{ shop.refund_policy.body }}
  showToc: boolean; // 是否显示目录导航
  ctaLabel?: string;
  ctaLink?: string;
  // 退货政策专用：FAQ
  faqs?: PolicyFaq[];
  // 发货时效专用：亮点卡片
  highlights?: PolicyHighlight[];
}
export interface PolicyFaq {
  id: string;
  question: string;
  answer: string;
}
export interface PolicyHighlight {
  id: string;
  icon: string;
  title: string;
  desc: string;
}
export interface PolicyPagesConfig {
  returnPolicy: PolicyPageConfig;
  privacyPolicy: PolicyPageConfig;
  shippingPolicy: PolicyPageConfig;
  termsOfService: PolicyPageConfig;
}

export interface ReturnsStep {
  id: string;
  title: string;
  desc: string;
}
export interface ReturnsEligibilityItem {
  id: string;
  eligible: boolean; // true=符合，false=不符合
  text: string;
}
export interface ReturnsPageConfig {
  heroTitle: string;
  heroSubtitle: string;
  heroBgColor: string;
  heroTextColor: string;
  heroMinHeight?: number; // px, default 280
  heroDesktopPosition?: string;
  heroMobilePosition?: string;
  policySummary: string;
  contactEmail: string;
  emailSubject: string;
  eligibilityItems: ReturnsEligibilityItem[];
  steps: ReturnsStep[];
  ctaLabel: string;
  ctaLink: string;
  ctaNote: string;
}

export interface FabricItem {
  id: string;
  name: string;
  composition: string;
  tags: string[]; // 特性标签
  scene: string; // 适合场景
  color?: string; // 色块颜色
  imageUrl?: string;
  description?: string; // 可选描述
}
export interface FabricCareItem {
  id: string;
  icon: string;
  text: string;
}
export interface FabricGuidePageConfig {
  heroTitle: string;
  heroSubtitle: string;
  heroBgImageUrl?: string;
  heroBgColor: string;
  heroTextColor: string;
  heroMinHeight?: number; // px, default 280
  heroDesktopPosition?: string;
  heroMobilePosition?: string;
  intro: string;
  fabrics: FabricItem[];
  fabricsPerRow: number;
  careItems: FabricCareItem[];
  sustainabilityTitle: string;
  sustainabilityText: string;
  showSustainability: boolean;
}

// ---- Influencer Page Types ----
export interface InfluencerTextStyle {
  fontSize?: number;         // px
  mobileFontSize?: number;   // px
  fontWeight?: "400" | "500" | "600" | "700" | "800";
  fontStyle?: "normal" | "italic";
  color?: string;
  visible?: boolean;         // show/hide this text element
  maxWidth?: string;         // e.g. '600px'
}

export interface InfluencerCreator {
  id: string;
  name: string;              // display name
  handle: string;            // @handle
  platform: "instagram" | "tiktok" | "youtube" | "xiaohongshu";
  followers: string;         // e.g. "128K"
  likes?: string;            // e.g. "2.4M"
  postsCount?: string;       // e.g. "342"
  avatarUrl?: string;
  videoCoverUrl?: string;    // poster image for video
  videoUrl?: string;         // mp4 or YouTube link
  profileLink?: string;      // social profile URL
  shopProductName?: string;  // product to feature in "Shop Her Look"
  shopProductPrice?: string;
  shopProductImageUrl?: string;
  shopProductLink?: string;
  // Detail page media
  bio?: string;
  detailMediaItems?: InfluencerMediaItem[];
}

export interface InfluencerMediaItem {
  id: string;
  type: "image" | "video";
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  productName?: string;
  productLink?: string;
}

export interface InfluencerStatItem {
  id: string;
  value: string;   // e.g. "50+"
  label: string;   // e.g. "Active Creators"
  visible: boolean;
}

export type InfluencerApplySectionKey = "ia-benefits" | "ia-requirements" | "ia-form" | "ia-faq" | "ia-footer-cta";

export interface InfluencerApplySectionConfig {
  key: InfluencerApplySectionKey;
  label: string;
  visible: boolean;
}

// InfluencerMediaItem, InfluencerStatItem, InfluencerApplySectionConfig, InfluencerApplySectionKey are exported above

export interface InfluencerBenefit {
  id: string;
  icon: string;              // emoji or icon name
  title: string;
  description: string;
  visible: boolean;
}

export interface InfluencerRequirement {
  id: string;
  text: string;
  visible: boolean;
}

export interface InfluencerFormField {
  id: string;
  label: string;
  type: "text" | "email" | "select" | "multiselect" | "textarea" | "file";
  placeholder?: string;
  options?: string[];        // for select/multiselect
  required: boolean;
  visible: boolean;
}

export interface InfluencerFaqItem {
  id: string;
  question: string;
  answer: string;
  visible: boolean;
}

export interface InfluencerConfig {
  // Hero
  heroTag: string;
  heroTitle: string;
  heroSubtitle: string;
  heroPrimaryBtnLabel: string;
  heroPrimaryBtnLink: string;
  heroSecondaryBtnLabel: string;
  heroSecondaryBtnLink: string;
  heroBgColor: string;
  heroTextColor: string;
  heroFullWidth?: boolean;   // full-width banner toggle
  // Text styles (per-element typography + visibility)
  textStyles: Record<string, InfluencerTextStyle>;
  // Creators section
  showCreators: boolean;
  creatorsTitle: string;
  creatorsSubtitle: string;
  creatorsPerRow?: number;   // 2-6, default 4
  creatorImgRatio?: string;  // e.g. "3/4", "1/1", "4/5"
  creators: InfluencerCreator[];
  // Stats / counter section
  showStats?: boolean;
  statsItems?: InfluencerStatItem[];
  // Benefits section
  showBenefits: boolean;
  benefitsTitle: string;
  benefitsSubtitle: string;
  benefits: InfluencerBenefit[];
  // Requirements section
  showRequirements: boolean;
  requirementsTitle: string;
  requirementsLeftTitle: string;
  requirementsRightTitle: string;
  requirementsLeft: InfluencerRequirement[];
  requirementsRight: InfluencerRequirement[];
  reqSectionPaddingY?: number;   // top/bottom padding in px, default 60
  reqSectionPaddingX?: number;   // left/right padding in px, default 24
  reqSectionMaxWidth?: number;   // max-width in px, default 1100
  // Application form
  showForm: boolean;
  formTitle: string;
  formSubtitle: string;
  formBtnLabel: string;
  formFields: InfluencerFormField[];
  // FAQ
  showFaq: boolean;
  faqTitle: string;
  faqItems: InfluencerFaqItem[];
  // Footer CTA
  showFooterCta: boolean;
  footerCtaTitle: string;
  footerCtaSubtitle: string;
  footerCtaPrimaryLabel: string;
  footerCtaPrimaryLink: string;
  footerCtaSecondaryLabel: string;
  footerCtaSecondaryLink: string;
  // Apply page section order
  applyPageSectionOrder?: InfluencerApplySectionConfig[];
}

const defaultInfluencerConfig: InfluencerConfig = {
  heroTag: "DUSKYONDER × CREATORS",
  heroTitle: "Move With Us.",
  heroSubtitle: "We're building a community of women who move with purpose — and we want you in it.",
  heroPrimaryBtnLabel: "Apply Now",
  heroPrimaryBtnLink: "#apply",
  heroSecondaryBtnLabel: "Meet Our Creators",
  heroSecondaryBtnLink: "#creators",
  heroBgColor: "#0D3D2B",
  heroTextColor: "#FFFFFF",
  textStyles: {},
  showCreators: true,
  creatorsTitle: "Meet Our Creators",
  creatorsSubtitle: "Real women. Real movement. Real stories.",
  creators: [
    { id: "cr_1", name: "Emma Chen", handle: "@emmaactive", platform: "instagram", followers: "128K", likes: "2.4M", postsCount: "342", avatarUrl: "", videoCoverUrl: "", videoUrl: "", profileLink: "#", shopProductName: "AirLight Leggings", shopProductPrice: "$98", shopProductImageUrl: "", shopProductLink: "#" },
    { id: "cr_2", name: "Sophia Liu", handle: "@sophiamoves", platform: "tiktok", followers: "256K", likes: "5.1M", postsCount: "189", avatarUrl: "", videoCoverUrl: "", videoUrl: "", profileLink: "#", shopProductName: "SculptFlex Shorts", shopProductPrice: "$68", shopProductImageUrl: "", shopProductLink: "#" },
    { id: "cr_3", name: "Mia Park", handle: "@miarunsfar", platform: "instagram", followers: "89K", likes: "1.8M", postsCount: "421", avatarUrl: "", videoCoverUrl: "", videoUrl: "", profileLink: "#", shopProductName: "EcoMove Bra", shopProductPrice: "$58", shopProductImageUrl: "", shopProductLink: "#" },
    { id: "cr_4", name: "Lily Zhang", handle: "@lilyyoga", platform: "youtube", followers: "312K", likes: "8.7M", postsCount: "156", avatarUrl: "", videoCoverUrl: "", videoUrl: "", profileLink: "#", shopProductName: "Freedom Shorts", shopProductPrice: "$68", shopProductImageUrl: "", shopProductLink: "#" },
  ],
  heroFullWidth: false,
  creatorsPerRow: 3,
  creatorImgRatio: "4/5",
  showStats: true,
  statsItems: [
    { id: "st_1", value: "50+", label: "Active Creators", visible: true },
    { id: "st_2", value: "10K+", label: "Community Members", visible: true },
    { id: "st_3", value: "15%", label: "Commission Rate", visible: true },
  ],
  applyPageSectionOrder: [
    { key: "ia-benefits", label: "合作权益", visible: true },
    { key: "ia-requirements", label: "申请要求", visible: true },
    { key: "ia-form", label: "申请表单", visible: true },
    { key: "ia-faq", label: "FAQ", visible: true },
    { key: "ia-footer-cta", label: "Footer CTA", visible: true },
  ],
  showBenefits: true,
  benefitsTitle: "Why Partner With DUSKYONDER",
  benefitsSubtitle: "More than a collab — a community.",
  benefits: [
    { id: "b1", icon: "🎁", title: "Free Products", description: "Priority access to new season drops. Wear it before it launches.", visible: true },
    { id: "b2", icon: "💰", title: "Commission", description: "Exclusive discount code for your audience — 15% off, and you earn on every sale.", visible: true },
    { id: "b3", icon: "🔬", title: "Early Access", description: "Join our inner circle for product testing and give feedback that shapes future collections.", visible: true },
    { id: "b4", icon: "🌟", title: "Brand Feature", description: "Top creators are featured on our website and social channels.", visible: true },
  ],
  showRequirements: true,
  reqSectionPaddingY: 60,
  reqSectionPaddingX: 24,
  reqSectionMaxWidth: 1100,
  requirementsTitle: "What We're Looking For",
  requirementsLeftTitle: "Application Requirements",
  requirementsRightTitle: "Content Requirements",
  requirementsLeft: [
    { id: "rl1", text: "Public account on Instagram, TikTok, YouTube, or Xiaohongshu", visible: true },
    { id: "rl2", text: "Content focused on women's fitness, movement, or lifestyle", visible: true },
    { id: "rl3", text: "Genuine engagement — follower count is secondary to authenticity", visible: true },
    { id: "rl4", text: "Must be 18 years or older", visible: true },
  ],
  requirementsRight: [
    { id: "rr1", text: "Minimum 1 post per month featuring DUSKYONDER product", visible: true },
    { id: "rr2", text: "Tag @DUSKYONDER and use #MoveWithDUSKYONDER", visible: true },
    { id: "rr3", text: "Content should feel natural and authentic — not overly promotional", visible: true },
    { id: "rr4", text: "Stories, Reels, TikToks, and long-form videos all welcome", visible: true },
  ],
  showForm: true,
  formTitle: "Ready to Move With Us?",
  formSubtitle: "Tell us about yourself and how you move.",
  formBtnLabel: "Submit Application",
  formFields: [
    { id: "ff1", label: "First Name", type: "text", placeholder: "Your first name", required: true, visible: true },
    { id: "ff2", label: "Last Name", type: "text", placeholder: "Your last name", required: true, visible: true },
    { id: "ff3", label: "Email", type: "email", placeholder: "your@email.com", required: true, visible: true },
    { id: "ff4", label: "Country / Region", type: "select", placeholder: "Select your region", options: ["United States", "Canada", "United Kingdom", "Australia", "China", "Other"], required: true, visible: true },
    { id: "ff5", label: "Instagram Handle", type: "text", placeholder: "@yourhandle", required: false, visible: true },
    { id: "ff6", label: "Instagram Followers", type: "select", placeholder: "Select range", options: ["< 1K", "1K – 10K", "10K – 50K", "50K – 200K", "200K+"], required: false, visible: true },
    { id: "ff7", label: "TikTok Handle", type: "text", placeholder: "@yourhandle", required: false, visible: true },
    { id: "ff8", label: "TikTok Followers", type: "select", placeholder: "Select range", options: ["< 1K", "1K – 10K", "10K – 50K", "50K – 200K", "200K+"], required: false, visible: true },
    { id: "ff9", label: "Other Platform Links", type: "text", placeholder: "YouTube, Xiaohongshu, etc.", required: false, visible: true },
    { id: "ff10", label: "Collaboration Type", type: "multiselect", options: ["Product Gifting", "Paid Partnership", "Affiliate Commission", "Content Creation"], required: false, visible: true },
    { id: "ff11", label: "Content Speciality", type: "multiselect", options: ["Reels / TikTok", "Lifestyle Photography", "Fitness Content", "Product Reviews", "Long-form Video"], required: false, visible: true },
    { id: "ff12", label: "Media Kit", type: "file", placeholder: "Upload PDF or image", required: false, visible: true },
    { id: "ff13", label: "Why do you want to partner with us?", type: "textarea", placeholder: "Tell us your story...", required: false, visible: true },
  ],
  showFaq: true,
  faqTitle: "Frequently Asked Questions",
  faqItems: [
    { id: "fq1", question: "Is there a minimum follower requirement?", answer: "No minimum follower count — we care more about engagement rate and content quality than numbers.", visible: true },
    { id: "fq2", question: "Is this a paid partnership or product gifting?", answer: "We offer both. Most partnerships start with product gifting, and paid collaborations are offered to creators who consistently perform well.", visible: true },
    { id: "fq3", question: "Do I need to post exclusively for DUSKYONDER?", answer: "No exclusivity required. We simply ask that you don't post for direct competitors during an active campaign.", visible: true },
    { id: "fq4", question: "How long does it take to hear back?", answer: "We review all applications within 5–7 business days and will reach out via email if your profile is a good fit.", visible: true },
    { id: "fq5", question: "How do I get my exclusive discount code?", answer: "Once accepted into the program, you'll receive a welcome email with your unique code and all partnership details.", visible: true },
  ],
  showFooterCta: true,
  footerCtaTitle: "Not Sure Yet?",
  footerCtaSubtitle: "Follow us on Instagram to see how our creators move — then decide.",
  footerCtaPrimaryLabel: "@DUSKYONDER on Instagram",
  footerCtaPrimaryLink: "https://instagram.com/duskyonder",
  footerCtaSecondaryLabel: "Back to Blog",
  footerCtaSecondaryLink: "/pages/blog",
};

// ---- Blog Types ----
export interface BlogConfig {
  heroTitle?: string;
  heroSubtitle?: string;
  heroBgColor?: string;
  heroTextColor?: string;
  heroMinHeight?: number; // px, default 320
  heroDesktopPosition?: string;
  heroMobilePosition?: string;
  showFeatured?: boolean;
  showCategoryFilter?: boolean;
  customCategories?: string[];
  footerCtaTitle?: string;
  footerCtaSubtitle?: string;
  footerCtaPlaceholder?: string;
  footerCtaButton?: string;
  showFooterCta?: boolean;
  detailMode?: "drawer" | "page";
  showToc?: boolean;
  showBreadcrumb?: boolean;
  cardLinkStyle?: "A" | "C";
}


// ---- About Us Types ----
export type AboutUsSectionKey =
  | "au-hero"
  | "au-story"
  | "au-principles"
  | "au-product-philosophy"
  | "au-stats"
  | "au-universe"
  | "au-cta";

export interface AboutUsSectionConfig {
  key: AboutUsSectionKey;
  label: string;
  visible: boolean;
  instanceId?: string;
}

export interface AboutUsTextStyle {
  maxWidth?: string; // e.g. '600px', '100%', '80ch'
  noWrap?: boolean;  // white-space: nowrap
}

export interface AboutUsPrinciple {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  body: string;
}

export interface AboutUsStatItem {
  id: string;
  value: string;
  label: string;
}

export interface AboutUsUniverseCard {
  id: string;
  number: string;
  module: string;
  title: string;
  body: string;
}

export interface AboutUsConfig {
  sectionOrder: AboutUsSectionConfig[];
  textStyles?: Record<string, AboutUsTextStyle>;
  heroHeadline: string;
  heroSubtitle: string;
  heroEst: string;
  heroBgUrl: string;
  heroMinHeight?: number; // px, default 100vh
  heroDesktopPosition?: string;
  heroMobilePosition?: string;
  storyTag: string;
  storyTitle: string;
  storyParagraphs: string[];
  storyImageUrl: string;
  storyImageAspect?: string; /* e.g. "3/4" | "4/5" | "1/1" | "16/9" | "2/3" */
  principlesTag: string;
  principlesTitle: string;
  principles: AboutUsPrinciple[];
  philosophyTag: string;
  philosophyTitle: string;
  philosophyBody: string;
  philosophyPoints: string[];
  philosophyCtaLabel: string;
  philosophyCtaLink: string;
  philosophyImageUrl: string;
  philosophyImageAspect?: string; /* e.g. "3/4" | "4/5" | "1/1" | "16/9" | "2/3" */
  stats: AboutUsStatItem[];
  universeTag: string;
  universeTitle: string;
  universeCards: AboutUsUniverseCard[];
  ctaTitle: string;
  ctaSubtitle: string;
  ctaPrimaryLabel: string;
  ctaPrimaryLink: string;
  ctaSecondaryLabel: string;
  ctaSecondaryLink: string;
}

const defaultAboutUsConfig: AboutUsConfig = {
  sectionOrder: [
    { key: "au-hero", label: "Hero 横幅", visible: true },
    { key: "au-story", label: "品牌故事", visible: true },
    { key: "au-principles", label: "三大理念", visible: true },
    { key: "au-product-philosophy", label: "产品哲学", visible: true },
    { key: "au-stats", label: "品牌数字", visible: true },
    { key: "au-universe", label: "品牌宇宙", visible: true },
    { key: "au-cta", label: "行动召唤", visible: true },
  ],
  heroHeadline: "BEYOND THE HORIZON",
  heroSubtitle: "为每一个敢于突破的她而生",
  heroEst: "Est. 2022",
  heroBgUrl: "",
  storyTag: "Our Story",
  storyTitle: "从黎明到黄昏，为她而设计",
  storyParagraphs: [
    "DUSKYONDER 诞生于一个简单的信念：运动服可以不止于制服，它可以是一种签名——经过深思熟虑、精心制作、独一无二。",
    '品牌名取自 "Dusky"（黄昏）与 "Yonder"（远方），象征着突破边界、追求更远处的精神。',
    "我们拒绝快时尚的捷径，拒绝全球运动服的千篇一律。每一块面料都经过精心挑选，每一条版型都经过打磨，每一个系列都值得上架。",
  ],
  storyImageUrl: "",
  storyImageAspect: "3/4",
  principlesTag: "What We Stand For",
  principlesTitle: "三个原则，一种哲学",
  principles: [
    { id: "p1", number: "01", title: "Craft", subtitle: "精工细作", body: "我们拒绝快时尚的捷径。每一块面料都经过精心挑选，每一条版型都经过真实穿着测试，只有通过严格标准的产品才能上架。" },
    { id: "p2", number: "02", title: "Community", subtitle: "共同前行", body: "从清晨的瑜伽垫到深夜的健身房，我们与每一位穿上 DUSKYONDER 的她同行。社群是我们一切创作的核心。" },
    { id: "p3", number: "03", title: "Spirit", subtitle: "不止于此", body: "真正的力量来自于持续行动的勇气。DUSKYONDER 不只是一件运动服，它是你突破自我的宣言。" },
  ],
  philosophyTag: "The Difference",
  philosophyTitle: "细节之处，见真章",
  philosophyBody: "真正的品质与 LOGO 无关，它藏在面料的克重里、藏在腰带的贴合度里、藏在一节课后依然完好的缝线里。我们所有产品均在内部设计、测试、精修——确保你穿上的第一刻就感受到对了。",
  philosophyPoints: [
    "自研面料，兼顾性能与耐久性",
    "经过数百小时真实穿着测试的版型",
    "经典设计，历久弥新，拒绝一次性流行",
  ],
  philosophyCtaLabel: "探索我们的面料",
  philosophyCtaLink: "/pages/fabrics",
  philosophyImageUrl: "",
  philosophyImageAspect: "4/5",
  stats: [
    { id: "s1", value: "2022", label: "品牌创立年份" },
    { id: "s2", value: "50+", label: "已上线 SKU" },
    { id: "s3", value: "10,000+", label: "全球客户" },
    { id: "s4", value: "4.8 ★", label: "平均产品评分" },
  ],
  universeTag: "The DUSKYONDER Universe",
  universeTitle: "不止于运动服，一种生活方式",
  universeCards: [
    { id: "u1", number: "01", module: "Activewear", title: "为运动而生", body: "从核心基础款到季节性系列，每件单品都经过精心设计，陪伴你的每一次运动。" },
    { id: "u2", number: "02", module: "Community", title: "达人社群", body: "与全球运动达人、健身博主共同构建的真实社群，分享穿搭、训练与生活。" },
    { id: "u3", number: "03", module: "Fabric", title: "面料故事", body: "每一块面料背后都有一个关于科技与自然的故事，了解让你感觉良好的秘密。" },
    { id: "u4", number: "04", module: "Sustainability", title: "可持续承诺", body: "我们相信时尚可以更负责任。了解我们在包装、面料和供应链上的可持续实践。" },
  ],
  ctaTitle: "这是你的邀请",
  ctaSubtitle: "无论你是第一次踏上瑜伽垫，还是已经在备战下一场比赛——这里有你的位置。",
  ctaPrimaryLabel: "探索新品",
  ctaPrimaryLink: "/collections/new",
  ctaSecondaryLabel: "加入社群",
  ctaSecondaryLink: "/pages/community",
};


const defaultSectionOrder: SectionConfig[] = [
  { key: "hero", label: "英雄横幅", visible: true, titleAlign: "center" },
  { key: "categories", label: "产品分类", visible: true, titleAlign: "center" },
  { key: "marquee", label: "滚动字幕", visible: true, titleAlign: "center" },
  { key: "videos", label: "达人视频", visible: true, titleAlign: "center" },
  { key: "featured", label: "Best Sellers", visible: true, instanceId: "featured_default", titleAlign: "center" },
  { key: "series", label: "系列展示", visible: true, titleAlign: "center" },
  { key: "fabric", label: "面料介绍", visible: true, titleAlign: "center" },
];

const defaultConfig: ThemeConfig = {
  showPromoBar: true,
  promoBarItems: [
    { id: "promo_1", text: "Free Shipping Over $150 USD | Free Exchanges*", link: "/policies/shipping" },
    { id: "promo_2", text: "New Arrivals Just Dropped — Shop Now", link: "/collections/new" },
  ],
  promoBarBg: "#175C40",
  promoBarColor: "#ffffff",
  promoBarFontSize: 13,
  promoBarMobileFontSize: 12,
  promoBarHeight: 40,
  promoBarMobileHeight: 36,

  logoText: "DUSKYONDER",
  logoImageUrl: undefined,
  logoImageUrlWhite: undefined,
  logoDesktopHeight: 40,
  logoMobileHeight: 32,
  navItems: [
    {
      id: "nav_1", label: "New", link: "/collections/new",
      children: [
        { id: "nav_1_1", label: "New Arrivals", link: "/collections/new" },
        { id: "nav_1_2", label: "Trending Now", link: "/collections/trending" },
      ],
    },
    {
      id: "nav_2", label: "Best Sellers", link: "/collections/best-sellers",
      children: [
        { id: "nav_2_1", label: "Sports Bras", link: "/collections/sports-bra" },
        { id: "nav_2_2", label: "Leggings", link: "/collections/leggings" },
        { id: "nav_2_3", label: "Sets", link: "/collections/sets" },
      ],
    },
    { id: "nav_3", label: "Shop All", link: "/collections/all" },
    { id: "nav_4", label: "About", link: "/pages/about-us" },
  ],
  accountUrl: "/account/login",
  wishlistUrl: "/wishlist",
  navFontSize: 14,
  navFontWeight: "500",
  navFontStyle: "normal",
  navTextColor: "#333333",
  navHoverColor: "#175C40",

  sectionOrder: defaultSectionOrder,

  slides: [
    {
      id: "slide_1",
      title: "Move with Purpose",
      subtitle: "Discover our new premium activewear collection designed for modern life.",
      buttonLabel: "Shop New Arrivals",
      buttonLink: "/collections/all",
    },
    {
      id: "slide_2",
      title: "Eco-Friendly Fabrics",
      subtitle: "Mindfully designed, sustainably sourced activewear for every movement.",
      buttonLabel: "Learn More",
      buttonLink: "/pages/about-us",
    },
  ],
  slideshowAutoplay: true,
  slideshowSpeed: 5,
  heroHeight: 600,
  heroMobileHeight: 500,
  heroBtnShape: "square",
  heroBtnStyle: "outline",
  heroBtnBg: "#175C40",
  heroBtnBorderColor: "rgba(255,255,255,0.9)",
  heroBtnTextColor: "#ffffff",
  heroBtnFontSize: 14,
  heroBtnFontWeight: "600",
  heroBtnLetterSpacing: 8,
  heroBtnPaddingX: 28,
  heroBtnPaddingY: 12,

  showBrandStory: false,
  brandStoryTitle: "Our Story",
  brandStoryText: "DUSKYONDER was born from a desire to create activewear that bridges the gap between high-performance athletic gear and sophisticated everyday wear.",
  brandStoryButtonLabel: "Read More",

  showMarquee: true,
  marqueeText: "DUSKYONDER",
  marqueeItems: [
    { id: "mq_1", type: "text", text: "DUSKYONDER" },
    { id: "mq_2", type: "text", text: "MOVE WITH PURPOSE" },
    { id: "mq_3", type: "text", text: "ECO-FRIENDLY FABRICS" },
  ],
  marqueeDirection: "left",
  marqueeSpeed: 20,
  marqueeBg: "#f5f0eb",
  marqueeColor: "#175C40",

  categoriesTitle: "Shop by Category",
  categoryAspectRatio: "3/4",
  categoriesDesktopCount: 6,
  categoriesDesktopGap: 0,
  categoriesMobileGap: 0,
  categoriesCardWidth: 0,
  categoriesMobileCardWidth: 0,
  categoryOverlayOpacity: 60,
  categoryLabelFontSizeDesktop: 14,
  categoryLabelFontSizeMobile: 12,
  categories: [
    { id: "cat_1", title: "Sports Bra", link: "/collections/sports-bra" },
    { id: "cat_2", title: "Leggings", link: "/collections/leggings" },
    { id: "cat_3", title: "Shorts", link: "/collections/shorts" },
    { id: "cat_4", title: "Jumpsuit", link: "/collections/jumpsuit" },
    { id: "cat_5", title: "Tennis Wear", link: "/collections/tennis-wear" },
    { id: "cat_6", title: "Athleisure", link: "/collections/athleisure" },
  ],

  showVideos: true,
  videosTitle: "Seen on Social",
  videoAspectRatio: "9/16",
  videosPerRow: 4,
  videosDesktopCount: 4,
  videosDesktopGap: 0,
  videosMobileGap: 12,
  videosCardWidth: 0,
  videosMobileCardWidth: 0,
  videoModalDesktopWidth: 960,
  videoModalImgRatio: "3/4",
  videos: [
    { id: "vid_1", influencerName: "@alexa_yoga", creatorName: "Alexa Yoga", caption: "Loving the Forest Green Yoga Set!" },
    { id: "vid_2", influencerName: "@sarah_fit", creatorName: "Sarah Fit", caption: "Best workout top ever." },
    { id: "vid_3", influencerName: "@emma_move", creatorName: "Emma Move", caption: "Sculpt and support in all the right places." },
    { id: "vid_4", influencerName: "@grace_active", creatorName: "Grace Active", caption: "Eco-friendly never looked so good." },
  ],

  showFeatured: true,
  productsDataSource: 'manual',
  productsCollectionHandle: '',
  featuredTitle: "Best Sellers",
  productAspectRatio: "3/4",
  productsPerRow: 4,
  productsDesktopGap: 0,
  productsMobileGap: 12,
  productsCardWidth: 0,
  productsMobileCardWidth: 0,
  productsTitleFontSizeDesktop: 0,
  productsTitleFontSizeMobile: 0,
  productsSwatchSize: 10,
  productsSwatchGap: 4,
  productsSwatchOffsetX: 0,
  productsSwatchMarginTop: 6,
  productsSwatchAlign: "flex-start",
  featuredInstances: [],
  products: [
    { id: "prod_1", name: "EcoMove Sports Bra", price: "$68", badge: "Best Seller", colors: ["#175C40", "#2D8B6F", "#F9F9F9"], colorImages: {}, detailUrl: "/products/ecomove-sports-bra" },
    { id: "prod_2", name: "AirLight Leggings", price: "$98", badge: "New", colors: ["#0D3D2B", "#175C40", "#E8F3F0"], colorImages: {}, detailUrl: "/products/airlight-leggings" },
    { id: "prod_3", name: "SculptFlex Shorts", price: "$58", colors: ["#175C40", "#333", "#F9F9F9"], colorImages: {}, detailUrl: "/products/sculptflex-shorts" },
    { id: "prod_4", name: "Forest Jumpsuit", price: "$128", badge: "Limited", colors: ["#175C40", "#2D8B6F"], colorImages: {}, detailUrl: "/products/forest-jumpsuit" },
  ],

  showSeries: true,
  seriesLabel: "TOP COLLECTIONS",
  seriesHeadline: "THIS DREAMY PRINT",
  seriesSubheadline: "DRAWS INSPIRATION",
  seriesAutoplaySpeed: 5,
  seriesImageAspectRatio: "4/5",
  seriesImageWidth: 0,
  seriesList: [
    { id: "ser_1", label: "01.", name: "Dreamy Mermaid Series" },
    { id: "ser_2", label: "02.", name: "Classic Stripes Series", description: "经典条纹系列" },
    { id: "ser_3", label: "03.", name: "Lavender Series" },
    { id: "ser_4", label: "04.", name: 'Classic "Old Money" Series' },
    { id: "ser_5", label: "05.", name: "Dreamy Barbie Series" },
  ],

  showFabric: true,
  fabricTitle: "Our Premium Fabrics",
  fabricsPerRow: 3,
  fabricCardPadding: 32,
  fabrics: [
    { id: "fab_1", title: "EcoMove", description: "Made from 84% recycled polyester and 16% elastane. Offering a soft, brushed feel with 4-way stretch.", icon: "♻️" },
    { id: "fab_2", title: "AirLight", description: "Ultra-lightweight, moisture-wicking fabric that feels like a second skin. Perfect for high-intensity workouts.", icon: "💨" },
    { id: "fab_3", title: "SculptFlex", description: "Compressive, high-support fabric designed to sculpt and shape. Ideal for yoga, pilates, and daily wear.", icon: "✨" },
  ],

  enableNewsletter: true,
  newsletterTitle: "Join the Club",
  newsletterText: "Subscribe to receive updates on new arrivals, special offers, and exclusive events.",
  newsletterDelay: 3,
  newsletterTheme: 'dark-green',
  newsletterImageUrl: undefined,
  newsletterSocialProof: "Join 10,000+ members who move with purpose",
  newsletterPages: ["home"],

  footerAbout: "DUSKYONDER is dedicated to creating premium, sustainable activewear for modern movement.",
  footerCopyright: undefined,
  socialLinks: {
    youtube: "https://www.youtube.com/@DUSKYONDER",
    facebook: "https://www.facebook.com/people/Dusk-yonder-serena/61576847709239/",
    instagram: "https://www.instagram.com/duskyonderwear/",
    pinterest: "https://www.pinterest.com/DUSKYONDER/",
    twitter: "https://x.com/dusk_yonder",
    tiktok: "https://www.tiktok.com/@duskyonder",
  },
  pdpShippingText: "Free shipping on orders over $150 USD. Free exchanges within 30 days. Returns accepted within 14 days of delivery for unworn, unwashed items with tags attached.",
  pdpShippingBlocks: [
    "Free shipping on orders over $150 USD.",
    "Free exchanges within 30 days.",
    "Returns accepted within 14 days of delivery for unworn, unwashed items with tags attached.",
  ],
  pdpSizeGuide: [
    { size: "XS", bust: "31-32\"", waist: "24-25\"", hips: "34-35\"" },
    { size: "S",  bust: "33-34\"", waist: "26-27\"", hips: "36-37\"" },
    { size: "M",  bust: "35-36\"", waist: "28-29\"", hips: "38-39\"" },
    { size: "L",  bust: "37-39\"", waist: "30-32\"", hips: "40-42\"" },
    { size: "XL", bust: "40-42\"", waist: "33-35\"", hips: "43-45\"" },
  ],
  pdpDefaultSizes: [
    { label: "XS", available: true },
    { label: "S",  available: true },
    { label: "M",  available: true },
    { label: "L",  available: true },
    { label: "XL", available: true },
  ],
  // PDP Default Description Blocks (Shopify placeholder)
  pdpDefaultDescriptionBlocks: [
    { id: "pd1", title: "PRODUCT DETAILS", content: "{{ product.description }}\n\nThis placeholder will be replaced by your Shopify product description when the theme is deployed to your store." },
  ],
  // PDP Default Care Instructions
  pdpDefaultCareInstructions: [
    { icon: "machine-wash", label: "Machine Wash Cold" },
    { icon: "hang-dry", label: "Hang to Dry" },
    { icon: "do-not-bleach", label: "Do Not Bleach" },
  ],
  // PDP UI Controls
  pdpShowShare: true,
  pdpShowWishlist: true,
  // PDP Shipping/Return Modules
  pdpShippingModuleTitle: "Free Shipping",
  pdpShippingModuleBlocks: ["Free shipping on orders over $150 USD.", "Express shipping available at checkout."],
  pdpReturnModuleTitle: "Easy Returns",
  pdpReturnModuleBlocks: ["Free exchanges within 30 days.", "Returns accepted within 14 days of delivery for unworn, unwashed items with tags attached."],
  // Recommended Section
  pdpRecommendedTitle: "You May Also Like",
  pdpRecommendedTitleColor: "#1a1a1a",
  pdpRecommendedTitleSize: 28,
  pdpRecommendedTitleMobileSize: 22,
  aboutUs: defaultAboutUsConfig,
  blog: {},
  influencer: defaultInfluencerConfig,
  collections: [
    {
      id: "col_leggings",
      handle: "leggings",
      title: "Leggings",
      subtitle: "Sculpt, support, and move freely.",
      bannerHeight: 320,
      showBanner: true,
      productsPerRow: 4,
      productAspectRatio: "3/4",
      showColorFilter: true,
      desktopGap: 16,
      mobileGap: 8,
      colorFilters: [
        { id: "cf_1", label: "Forest Green", value: "#175C40" },
        { id: "cf_2", label: "Midnight Black", value: "#1a1a1a" },
        { id: "cf_3", label: "Ivory White", value: "#F9F9F9" },
        { id: "cf_4", label: "Dusty Rose", value: "#C9A0A0" },
        { id: "cf_5", label: "Forest + Black", value: "#175C40+#1a1a1a" },
      ],
      subCategories: ["All", "High-Waist", "Flare", "Capri", "Shorts"],
      sortOptions: ["Featured", "Price: Low to High", "Price: High to Low", "Newest"],
      productDetails: {},
      products: [
        { id: "colprod_1", name: "AirLight High-Waist Leggings", price: "$98", badge: "Best Seller", colors: ["#175C40", "#1a1a1a", "#F9F9F9"], colorImages: {}, subCategory: "High-Waist" },
        { id: "colprod_2", name: "SculptFlex Flare Leggings", price: "$108", badge: "New", colors: ["#175C40", "#C9A0A0", "#175C40+#1a1a1a"], colorImages: {}, subCategory: "Flare" },
        { id: "colprod_3", name: "EcoMove Capri Leggings", price: "$88", colors: ["#1a1a1a", "#175C40"], colorImages: {}, subCategory: "Capri" },
        { id: "colprod_4", name: "Freedom Shorts", price: "$68", badge: "Limited", colors: ["#F9F9F9", "#C9A0A0"], colorImages: {}, subCategory: "Shorts" },
        { id: "colprod_5", name: "Serenity Leggings", price: "$92", colors: ["#175C40", "#1a1a1a"], colorImages: {}, subCategory: "High-Waist" },
        { id: "colprod_6", name: "Form Flare Pants", price: "$118", badge: "New", colors: ["#C9A0A0", "#F9F9F9", "#175C40+#1a1a1a"], colorImages: {}, subCategory: "Flare" },
        { id: "colprod_7", name: "Fade High-Waist Leggings", price: "$96", colors: ["#1a1a1a", "#175C40"], colorImages: {}, subCategory: "High-Waist" },
        { id: "colprod_8", name: "Club Serenity Shorts", price: "$72", colors: ["#C9A0A0", "#1a1a1a"], colorImages: {}, subCategory: "Shorts" },
      ],
    },
  ],
  policyPages: {
    returnPolicy: {
      heroTitle: "Returns & Refunds",
      heroSubtitle: "We want you to love every piece. If something isn't right, we've got you.",
      heroBgColor: "#175C40",
      heroTextColor: "#ffffff",
      bodyHtml: "<p>This page will automatically display your return policy from Shopify Admin once the theme is installed. To preview, you can edit this text in the editor panel.</p><h3>Return Window</h3><p>Items must be returned within 20 days of delivery. Items must be unworn, unwashed, and in original condition with tags attached.</p><h3>Refund Process</h3><p>Refunds are processed within 10 business days after the returned package is received and inspected. A restocking fee of $5 (US) or $6 per item (International) will be deducted.</p><h3>Non-Returnable Items</h3><p>Final Sale items, swimwear, and items without original packaging are not eligible for return.</p>",
      showToc: false,
      ctaLabel: "Start a Return",
      ctaLink: "/pages/returns",
      faqs: [
        { id: "faq1", question: "Can I return sale items?", answer: "Sale items can be returned unless marked as Final Sale. Final Sale items are not eligible for returns, store credit, or exchanges." },
        { id: "faq2", question: "What if I received a faulty or incorrect item?", answer: "Contact support@duskyonder.com with your order number and a photo. We'll resolve it promptly at no cost to you." },
        { id: "faq3", question: "Can I return items purchased with a discount code?", answer: "Yes, as long as they are not marked as Final Sale. The refund will reflect the amount actually paid." },
        { id: "faq4", question: "What address should I ship my return to?", answer: "Do not use the original shipping address. Use the approved return address provided in our confirmation email." },
        { id: "faq5", question: "What if my package is lost during return transit?", answer: "Always use a tracked shipping service and email the tracking number to us. We are not responsible for lost or untrackable returns." },
        { id: "faq6", question: "How long does my refund take?", answer: "Up to 10 business days after the returned package is received and inspected at our warehouse." },
        { id: "faq7", question: "Can I return more than 10 items?", answer: "A maximum of 10 items per order can be returned." },
        { id: "faq8", question: "Do you offer direct exchanges?", answer: "We do not offer direct exchanges. Please return your original item for a refund and place a new order." },
      ],
    },
    privacyPolicy: {
      heroTitle: "Privacy Policy",
      heroSubtitle: "Your privacy matters to us.",
      heroBgColor: "#175C40",
      heroTextColor: "#ffffff",
      bodyHtml: "<p>This page will automatically display your privacy policy from Shopify Admin once the theme is installed. To preview, you can edit this text in the editor panel.</p><h3>Information We Collect</h3><p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This includes your name, email address, shipping address, and payment information.</p><h3>How We Use Your Information</h3><p>We use the information we collect to process transactions, send transactional and promotional communications, and improve our services.</p><h3>Sharing Your Information</h3><p>We do not sell, trade, or otherwise transfer your personal information to outside parties except as described in this policy.</p><h3>Your Rights</h3><p>You have the right to access, correct, or delete your personal information. Contact us at support@duskyonder.com to exercise these rights.</p>",
      showToc: true,
    },
    shippingPolicy: {
      heroTitle: "Shipping & Delivery",
      heroSubtitle: "Fast dispatch, worldwide delivery. Here's what to expect.",
      heroBgColor: "#175C40",
      heroTextColor: "#ffffff",
      bodyHtml: "<p>This page will automatically display your shipping policy from Shopify Admin once the theme is installed. To preview, you can edit this text in the editor panel.</p><h3>Processing Time</h3><p>Orders are processed within 1-2 business days from our US warehouse. Orders placed on weekends or holidays will be processed the next business day.</p><h3>Domestic Shipping (US)</h3><p>Standard Shipping: 3-7 business days. Express Shipping: 1-3 business days. Free standard shipping on orders over $150 USD.</p><h3>International Shipping</h3><p>International orders typically arrive within 7-15 business days depending on destination. Import duties and taxes may apply and are the responsibility of the recipient.</p><h3>Order Tracking</h3><p>Once your order ships, you'll receive a confirmation email with tracking information.</p>",
      showToc: false,
      ctaLabel: "Track My Order",
      ctaLink: "#",
      highlights: [
        { id: "h1", icon: "\ud83d\ude80", title: "Fast Dispatch", desc: "1-2 business days from US warehouse" },
        { id: "h2", icon: "\ud83c\udf0f", title: "Worldwide Delivery", desc: "3-15 business days" },
        { id: "h3", icon: "\ud83d\udce6", title: "Free Shipping", desc: "On orders over $150 USD" },
      ],
    },
    termsOfService: {
      heroTitle: "Terms of Service",
      heroSubtitle: "Please read these terms carefully before using our services.",
      heroBgColor: "#175C40",
      heroTextColor: "#ffffff",
      bodyHtml: "<p>This page will automatically display your terms of service from Shopify Admin once the theme is installed. To preview, you can edit this text in the editor panel.</p><h3>1. Acceptance of Terms</h3><p>By accessing and using this website, you accept and agree to be bound by the terms and provisions of this agreement.</p><h3>2. Products and Pricing</h3><p>All prices are listed in USD. We reserve the right to modify prices at any time. Product descriptions and images are for illustrative purposes.</p><h3>3. Orders and Payment</h3><p>We accept major credit cards and PayPal. By placing an order, you confirm that the payment information provided is accurate.</p><h3>4. Intellectual Property</h3><p>All content on this website, including text, graphics, logos, and images, is the property of DUSKYONDER and protected by applicable intellectual property laws.</p><h3>5. Governing Law</h3><p>These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which DUSKYONDER operates.</p>",
      showToc: true,
    },
  },
  returnsPage: {
    heroTitle: "Start a Return",
    heroSubtitle: "Quick, easy, and hassle-free. Follow the steps below.",
    heroBgColor: "#175C40",
    heroTextColor: "#ffffff",
    policySummary: "We offer a 20-day return window for unworn, unwashed items in original condition. Final Sale items are non-refundable. A $5 USD (US) or $6 USD/item (International) return handling fee applies.",
    contactEmail: "support@duskyonder.com",
    emailSubject: "Return Request - Order #",
    eligibilityItems: [
      { id: "e1", eligible: true, text: "Returned within 20 days of delivery" },
      { id: "e2", eligible: true, text: "Unworn, unwashed, tags attached" },
      { id: "e3", eligible: true, text: "Original packaging intact" },
      { id: "e4", eligible: true, text: "Regular-priced items" },
      { id: "e5", eligible: false, text: "Returned after 20 days" },
      { id: "e6", eligible: false, text: "Worn, washed, or altered items" },
      { id: "e7", eligible: false, text: "Items without original packaging" },
      { id: "e8", eligible: false, text: "Final Sale / Clearance items" },
    ],
    steps: [
      { id: "s1", title: "Check Eligibility", desc: "Review the conditions above. Items must be within the 20-day return window and in original condition." },
      { id: "s2", title: "Submit Your Request", desc: "Email support@duskyonder.com with: order number, item(s) to return, reason, and photo (for faulty/incorrect items)." },
      { id: "s3", title: "Receive Return Instructions", desc: "We'll respond within 1-2 business days with the approved return address. Do not ship to the original address." },
      { id: "s4", title: "Ship Your Return", desc: "Ship within 7 days of approval using a tracked service. Email your tracking number to support@duskyonder.com." },
      { id: "s5", title: "Receive Your Refund", desc: "Processed within 10 business days after warehouse inspection. US: $5 RMA fee / International: $6 per item deducted." },
    ],
    ctaLabel: "Email Us to Start a Return",
    ctaLink: "mailto:support@duskyonder.com",
    ctaNote: "We typically respond within 1-2 business days.",
  },
  fabricGuidePage: {
    heroTitle: "Fabric Guide",
    heroSubtitle: "Every piece starts with the right fabric. Discover what makes DUSKYONDER different.",
    heroBgColor: "#175C40",
    heroTextColor: "#ffffff",
    intro: "At DUSKYONDER, we believe performance and sustainability go hand in hand. Every fabric we use is selected for its feel, function, and environmental impact - so you can move freely and feel good about what you wear.",
    fabrics: [
      { id: "fab1", name: "AirLight\u2122 Nylon", composition: "88% Nylon, 12% Spandex", tags: ["Lightweight", "Quick-dry", "4-way stretch"], scene: "Running, cycling, HIIT", color: "#B8D4C8" },
      { id: "fab2", name: "SoftMove\u2122 Polyester", composition: "82% Recycled Polyester, 18% Spandex", tags: ["Ultra-soft", "Compression", "Eco-friendly"], scene: "Yoga, Pilates, low-impact training", color: "#D4C5B8" },
      { id: "fab3", name: "RibKnit\u2122 Cotton Blend", composition: "60% Cotton, 35% Polyester, 5% Spandex", tags: ["Breathable", "Textured", "Everyday wear"], scene: "Studio wear, casual athleisure", color: "#C8C8C8" },
      { id: "fab4", name: "SculptFit\u2122 Compression", composition: "76% Nylon, 24% Spandex", tags: ["High compression", "Sculpting", "Opaque"], scene: "Strength training, squats, HIIT", color: "#1a1a1a" },
      { id: "fab5", name: "EcoStretch\u2122 Recycled", composition: "90% ECONYL\u00ae Recycled Nylon, 10% Spandex", tags: ["Sustainable", "Durable", "Chlorine-resistant"], scene: "Swimming, outdoor sports, travel", color: "#175C40" },
      { id: "fab6", name: "VelvetFlex\u2122 Brushed", composition: "85% Polyester, 15% Spandex", tags: ["Brushed inner", "Warm", "Cozy"], scene: "Cool-season training, loungewear", color: "#8B7355" },
    ],
    fabricsPerRow: 3,
    careItems: [
      { id: "c1", icon: "\ud83c\udf21\ufe0f", text: "Machine wash cold (30\u00b0C / 86\u00b0F)" },
      { id: "c2", icon: "\ud83d\udeab", text: "Do not bleach" },
      { id: "c3", icon: "\ud83c\udf00", text: "Gentle cycle only" },
      { id: "c4", icon: "\ud83d\udebf", text: "Rinse immediately after swimming or sweating" },
      { id: "c5", icon: "\u274c", text: "Do not tumble dry - lay flat to dry" },
      { id: "c6", icon: "\ud83d\udd25", text: "Do not iron directly on fabric" },
    ],
    sustainabilityTitle: "Our Commitment to Sustainability",
    sustainabilityText: "We are committed to reducing our environmental footprint. Our EcoStretch\u2122 and SoftMove\u2122 fabrics use recycled materials, and we continuously work to expand our sustainable fabric range. Packaging is plastic-free and made from recycled materials.",
    showSustainability: true,
  },
  // ---- Cart Drawer Defaults ----
  cartDrawerWidth: 420,
  cartItemNameFontSizeDesktop: 15,
  cartItemNameFontSizeMobile: 14,
  cartItemPriceFontSizeDesktop: 14,
  cartItemPriceFontSizeMobile: 13,
  freeShippingThreshold: 150,
  freeShippingText: "Add {{amount}} more for free shipping",
  freeShippingAchievedText: "You've unlocked free shipping! 🎉",
  productsMaxWidth: 1680,
  productCardHeight: 0,
  productsMobileMaxWidth: 0,
  productsMobileCardHeight: 0,
  videosMaxWidth: 1680,
  videoCardHeight: 0,
  videosMobileMaxWidth: 0,
  videosMobileCardHeight: 0,
  seriesMaxWidth: 1680,
  seriesImageHeight: 520,
  seriesMobileMaxWidth: 0,
  seriesMobileMinHeight: 0,
};

interface ThemeConfigContextType {
  config: ThemeConfig;
  updateConfig: (updates: Partial<ThemeConfig>) => void;
  updateSlide: (id: string, updates: Partial<Slide>) => void;
  addSlide: () => void;
  removeSlide: (id: string) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  addCategory: () => void;
  removeCategory: (id: string) => void;
  updateVideo: (id: string, updates: Partial<Video>) => void;
  addVideo: () => void;
  removeVideo: (id: string) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  addProduct: () => void;
  removeProduct: (id: string) => void;
  updateFabric: (id: string, updates: Partial<Fabric>) => void;
  addFabric: () => void;
  removeFabric: (id: string) => void;
  updateSeries: (id: string, updates: Partial<CollectionSeries>) => void;
  addSeries: () => void;
  removeSeries: (id: string) => void;
  updatePromoItem: (id: string, updates: Partial<PromoBarItem>) => void;
  addPromoItem: () => void;
  removePromoItem: (id: string) => void;
  updateNavItem: (id: string, updates: Partial<NavItem>) => void;
  addNavItem: () => void;
  removeNavItem: (id: string) => void;
  addNavChild: (parentId: string) => void;
  removeNavChild: (parentId: string, childId: string) => void;
  updateNavChild: (parentId: string, childId: string, updates: { label?: string; link?: string }) => void;
  updateMarqueeItem: (id: string, updates: Partial<MarqueeItem>) => void;
  addMarqueeItem: (type: "text" | "image") => void;
  removeMarqueeItem: (id: string) => void;
  moveSectionUp: (instanceId: string) => void;
  moveSectionDown: (instanceId: string) => void;
  addFeaturedSection: () => void;
  removeFeaturedSection: (instanceId: string) => void;
  updateFeaturedInstance: (instanceId: string, updates: Partial<FeaturedInstance>) => void;
  updateSectionAlign: (uid: string, align: "left" | "center" | "right") => void;
  addSectionByKey: (key: SectionKey) => void;
  isSaving: boolean;
  // Collections
  addCollection: () => void;
  removeCollection: (id: string) => void;
  updateCollection: (id: string, updates: Partial<CollectionConfig>) => void;
  addCollectionProduct: (collectionId: string) => void;
  removeCollectionProduct: (collectionId: string, productId: string) => void;
  updateCollectionProduct: (collectionId: string, productId: string, updates: Partial<CollectionProduct>) => void;
  addCollectionColorFilter: (collectionId: string) => void;
  removeCollectionColorFilter: (collectionId: string, filterId: string) => void;
  updateCollectionColorFilter: (collectionId: string, filterId: string, updates: Partial<CollectionColorFilter>) => void;
  updateProductDetail: (collectionId: string, productId: string, updates: Partial<ProductDetailConfig>) => void;
  // Influencer
  updateInfluencer: (updates: Partial<InfluencerConfig>) => void;
  moveApplySectionUp: (index: number) => void;
  moveApplySectionDown: (index: number) => void;
  // About Us
  updateAboutUs: (updates: Partial<AboutUsConfig>) => void;
  addAboutUsSection: (section: AboutUsSectionConfig) => void;
  removeAboutUsSection: (instanceId: string) => void;
  moveAboutUsSectionUp: (index: number) => void;
  moveAboutUsSectionDown: (index: number) => void;
  updateAboutUsTextStyle: (field: string, style: Partial<AboutUsTextStyle>) => void;
  // Policy Pages
  updatePolicyPage: (pageKey: keyof PolicyPagesConfig, updates: Partial<PolicyPageConfig>) => void;
  addPolicyFaq: (pageKey: keyof PolicyPagesConfig) => void;
  removePolicyFaq: (pageKey: keyof PolicyPagesConfig, id: string) => void;
  updatePolicyFaq: (pageKey: keyof PolicyPagesConfig, id: string, updates: Partial<PolicyFaq>) => void;
  addPolicyHighlight: (pageKey: keyof PolicyPagesConfig) => void;
  removePolicyHighlight: (pageKey: keyof PolicyPagesConfig, id: string) => void;
  updatePolicyHighlight: (pageKey: keyof PolicyPagesConfig, id: string, updates: Partial<PolicyHighlight>) => void;
  // Returns Page
  updateReturnsPage: (updates: Partial<ReturnsPageConfig>) => void;
  addReturnsStep: () => void;
  removeReturnsStep: (id: string) => void;
  updateReturnsStep: (id: string, updates: Partial<ReturnsStep>) => void;
  addReturnsEligibilityItem: () => void;
  removeReturnsEligibilityItem: (id: string) => void;
  updateReturnsEligibilityItem: (id: string, updates: Partial<ReturnsEligibilityItem>) => void;
  // Fabric Guide Page
  updateFabricGuidePage: (updates: Partial<FabricGuidePageConfig>) => void;
  addFabricItem: () => void;
  removeFabricItem: (id: string) => void;
  updateFabricItem: (id: string, updates: Partial<FabricItem>) => void;
  addFabricCareItem: () => void;
  removeFabricCareItem: (id: string) => void;
  updateFabricCareItem: (id: string, updates: Partial<FabricCareItem>) => void;
}

const ThemeConfigContext = createContext<ThemeConfigContextType | null>(null);

export function ThemeConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ThemeConfig>(defaultConfig);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setConfigMutation = trpc.siteConfig.set.useMutation();
  const { data: shopifyData } = trpc.siteConfig.getAll.useQuery();
  useEffect(() => {
    const rawThemeConfig = shopifyData?.themeConfig;
    if (rawThemeConfig && typeof rawThemeConfig === 'object') {
      try {
        const saved = rawThemeConfig as any;
        if (saved.navItems && Array.isArray(saved.navItems)) {
          saved.navItems = saved.navItems.map((item: any, i: number) => ({
            id: item.id || `nav_${i + 1}`,
            label: item.label || "",
            link: item.link || "#",
            children: (item.children || []).map((child: any, j: number) => ({
              id: child.id || `nav_${i + 1}_${j + 1}`,
              label: child.label || "",
              link: child.link || "#",
            })),
          }));
        }
        if (!saved.marqueeItems) {
          saved.marqueeItems = [{ id: "mq_1", type: "text", text: saved.marqueeText || "DUSKYONDER" }];
        }
        if (!saved.marqueeDirection) saved.marqueeDirection = "left";
        // Deep-merge influencer so new fields (heroFullWidth, statsItems, etc.) keep their defaults
        if (saved.influencer && defaultConfig.influencer) {
          saved.influencer = { ...defaultConfig.influencer, ...saved.influencer };
          // Preserve new fields that may not exist in old saved data
          if (!saved.influencer.statsItems || !Array.isArray(saved.influencer.statsItems)) {
            saved.influencer.statsItems = defaultConfig.influencer.statsItems;
          }
          if (saved.influencer.showStats === undefined) saved.influencer.showStats = defaultConfig.influencer.showStats;
          if (saved.influencer.heroFullWidth === undefined) saved.influencer.heroFullWidth = defaultConfig.influencer.heroFullWidth;
          if (!saved.influencer.creatorsPerRow) saved.influencer.creatorsPerRow = defaultConfig.influencer.creatorsPerRow;
          if (!saved.influencer.creatorImgRatio) saved.influencer.creatorImgRatio = defaultConfig.influencer.creatorImgRatio;
          if (!saved.influencer.applyPageSectionOrder || !Array.isArray(saved.influencer.applyPageSectionOrder)) {
            saved.influencer.applyPageSectionOrder = defaultConfig.influencer.applyPageSectionOrder;
          }
        }
        setConfig(prev => ({ ...defaultConfig, ...prev, ...saved }));
      } catch {}
    }
    if (shopifyData?.uploadedImages && typeof shopifyData.uploadedImages === 'object') {
      const images = shopifyData.uploadedImages as Record<string, Record<string, string>>;
      setConfig(prev => {
        const next = { ...prev };
        if (images.slideshow) {
          next.slides = prev.slides.map(s => ({ ...s, imageUrl: images.slideshow?.[s.id] || s.imageUrl }));
        }
        if (images["brand-story"]?.main) next.brandStoryImageUrl = images["brand-story"].main;
        if (images.categories) {
          next.categories = prev.categories.map(c => ({ ...c, imageUrl: images.categories?.[c.id] || c.imageUrl }));
        }
        if (images.videos) {
          next.videos = prev.videos.map(v => ({ ...v, imageUrl: images.videos?.[v.id] || v.imageUrl }));
        }
        if (images.products) {
          next.products = prev.products.map(p => ({
            ...p,
            imageUrl: images.products?.[p.id] || p.imageUrl,
            hoverImageUrl: images.products?.[`${p.id}_hover`] || p.hoverImageUrl,
          }));
        }
        if (images.series) {
          next.seriesList = prev.seriesList.map(s => ({ ...s, imageUrl: images.series?.[s.id] || s.imageUrl }));
        }
        if (images.logo?.main) next.logoImageUrl = images.logo.main;
        if (images.marquee) {
          next.marqueeItems = prev.marqueeItems.map(m => ({
            ...m,
            imageUrl: m.type === "image" ? (images.marquee?.[m.id] || m.imageUrl) : m.imageUrl,
          }));
        }
        return next;
      });
    }
  }, [shopifyData]);

  // Load Banner data: prefer themeConfig saved slides, fallback to homepage_banner metaobjects
  useEffect(() => {
    // If themeConfig already has slides saved (from editor), use those
    const savedSlides = (shopifyData?.themeConfig as any)?.slides;
    if (savedSlides && Array.isArray(savedSlides) && savedSlides.length > 0) {
      // Slides are already merged via the themeConfig load above, no need to fetch separately
      return;
    }
    // Fallback: fetch from homepage_banner metaobjects (initial setup before editor is used)
    fetchHomepageBanners().then((banners) => {
      if (banners.length > 0) {
        setConfig((prev) => ({
          ...prev,
          slides: banners.map((b, i) => ({
            id: `shopify_slide_${i}`,
            title: b.title ?? "",
            subtitle: b.subtitle ?? "",
            buttonLabel: b.buttonLabel ?? "",
            buttonLink: b.buttonLink ?? "/",
            imageUrl: b.imageUrl ?? "",
            mobileImageUrl: b.mobileImageUrl ?? b.imageUrl ?? "",
            contentPosition: b.contentPosition ?? "middle-center",
            textColorMode: (b as any).textColorMode ?? "light",
          })),
        }));
      }
    }).catch((err) => {
      console.warn("Shopify banner fetch failed, using default slides:", err);
    });
  }, [shopifyData]);

  const persistConfig = useCallback((newConfig: ThemeConfig) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        await setConfigMutation.mutateAsync({ key: "themeConfig", value: newConfig });
      } finally {
        setIsSaving(false);
      }
    }, 800);
  }, [setConfigMutation]);

  const updateConfig = useCallback((updates: Partial<ThemeConfig>) => {
    setConfig(prev => { const next = { ...prev, ...updates }; persistConfig(next); return next; });
  }, [persistConfig]);

  const makeUpdater = <T extends { id: string }>(field: keyof ThemeConfig) =>
    useCallback((id: string, updates: Partial<T>) => {
      setConfig(prev => {
        const arr = (prev[field] as unknown) as T[];
        const next = { ...prev, [field]: arr.map(item => item.id === id ? { ...item, ...updates } : item) };
        persistConfig(next);
        return next;
      });
    }, [persistConfig]);

  const makeAdder = <T extends { id: string }>(field: keyof ThemeConfig, factory: () => T) =>
    useCallback(() => {
      setConfig(prev => {
        const next = { ...prev, [field]: [...((prev[field] as unknown) as T[]), factory()] };
        persistConfig(next);
        return next;
      });
    }, [persistConfig]);

  const makeRemover = <T extends { id: string }>(field: keyof ThemeConfig, minCount = 1) =>
    useCallback((id: string) => {
      setConfig(prev => {
        const arr = (prev[field] as unknown) as T[];
        if (arr.length <= minCount) return prev;
        const next = { ...prev, [field]: arr.filter(item => item.id !== id) };
        persistConfig(next);
        return next;
      });
    }, [persistConfig]);

  const updateSlide = makeUpdater<Slide>("slides");
  const addSlide = makeAdder<Slide>("slides", () => ({
    id: `slide_${Date.now()}`, title: "New Slide", subtitle: "Add your subtitle here.", buttonLabel: "Shop Now", buttonLink: "/collections/all",
  }));
  const removeSlide = makeRemover<Slide>("slides", 1);

  const updateCategory = makeUpdater<Category>("categories");
  const addCategory = makeAdder<Category>("categories", () => ({
    id: `cat_${Date.now()}`, title: "New Category", link: "/collections/new-category",
  }));
  const removeCategory = makeRemover<Category>("categories", 1);

  const updateVideo = makeUpdater<Video>("videos");
  const addVideo = makeAdder<Video>("videos", () => ({
    id: `vid_${Date.now()}`, influencerName: "@new_creator", caption: "Check out this look!",
  }));
  const removeVideo = makeRemover<Video>("videos", 1);

  const updateProduct = makeUpdater<Product>("products");
  const addProduct = makeAdder<Product>("products", () => ({
    id: `prod_${Date.now()}`, name: "New Product", price: "$0", colors: ["#175C40"], colorImages: {}, detailUrl: "/products/new",
  }));
  const removeProduct = makeRemover<Product>("products", 1);

  const updateFabric = makeUpdater<Fabric>("fabrics");
  const addFabric = makeAdder<Fabric>("fabrics", () => ({
    id: `fab_${Date.now()}`, title: "New Fabric", description: "Fabric description here.", icon: "🌿",
  }));
  const removeFabric = makeRemover<Fabric>("fabrics", 1);

  const updateSeries = makeUpdater<CollectionSeries>("seriesList");
  const addSeries = makeAdder<CollectionSeries>("seriesList", () => ({
    id: `ser_${Date.now()}`, label: `${String(Date.now()).slice(-2)}.`, name: "New Series",
  }));
  const removeSeries = makeRemover<CollectionSeries>("seriesList", 1);

  const updatePromoItem = makeUpdater<PromoBarItem>("promoBarItems");
  const addPromoItem = makeAdder<PromoBarItem>("promoBarItems", () => ({
    id: `promo_${Date.now()}`, text: "New Promotion — Shop Now", link: "/collections/all",
  }));
  const removePromoItem = makeRemover<PromoBarItem>("promoBarItems", 1);

  const updateNavItem = useCallback((id: string, updates: Partial<NavItem>) => {
    setConfig(prev => {
      const next = { ...prev, navItems: prev.navItems.map(item => item.id === id ? { ...item, ...updates } : item) };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);

  const addNavItem = useCallback(() => {
    setConfig(prev => {
      const newItem: NavItem = { id: `nav_${Date.now()}`, label: "New Link", link: "#" };
      const next = { ...prev, navItems: [...prev.navItems, newItem] };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);

  const removeNavItem = useCallback((id: string) => {
    setConfig(prev => {
      if (prev.navItems.length <= 1) return prev;
      const next = { ...prev, navItems: prev.navItems.filter(item => item.id !== id) };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);

  const addNavChild = useCallback((parentId: string) => {
    setConfig(prev => {
      const newChild = { id: `nav_child_${Date.now()}`, label: "Sub Link", link: "#" };
      const next = {
        ...prev,
        navItems: prev.navItems.map(item =>
          item.id === parentId
            ? { ...item, children: [...(item.children || []), newChild] }
            : item
        ),
      };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);

  const removeNavChild = useCallback((parentId: string, childId: string) => {
    setConfig(prev => {
      const next = {
        ...prev,
        navItems: prev.navItems.map(item =>
          item.id === parentId
            ? { ...item, children: (item.children || []).filter(c => c.id !== childId) }
            : item
        ),
      };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);

  const updateNavChild = useCallback((parentId: string, childId: string, updates: { label?: string; link?: string }) => {
    setConfig(prev => {
      const next = {
        ...prev,
        navItems: prev.navItems.map(item =>
          item.id === parentId
            ? { ...item, children: (item.children || []).map(c => c.id === childId ? { ...c, ...updates } : c) }
            : item
        ),
      };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);

  const updateMarqueeItem = useCallback((id: string, updates: Partial<MarqueeItem>) => {
    setConfig(prev => {
      const next = { ...prev, marqueeItems: prev.marqueeItems.map(item => item.id === id ? { ...item, ...updates } : item) };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);

  const addMarqueeItem = useCallback((type: "text" | "image") => {
    setConfig(prev => {
      const newItem: MarqueeItem = { id: `mq_${Date.now()}`, type, text: type === "text" ? "NEW TEXT" : undefined };
      const next = { ...prev, marqueeItems: [...prev.marqueeItems, newItem] };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);

  const removeMarqueeItem = useCallback((id: string) => {
    setConfig(prev => {
      if (prev.marqueeItems.length <= 1) return prev;
      const next = { ...prev, marqueeItems: prev.marqueeItems.filter(item => item.id !== id) };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);

  // Helper: get unique identifier for a section (instanceId if present, else key)
  const getSectionUid = (s: SectionConfig) => s.instanceId || s.key;

  const moveSectionUp = useCallback((uid: string) => {
    setConfig(prev => {
      const arr = [...prev.sectionOrder];
      const idx = arr.findIndex(s => (s.instanceId || s.key) === uid);
      if (idx <= 0) return prev;
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      const next = { ...prev, sectionOrder: arr };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);

  const moveSectionDown = useCallback((uid: string) => {
    setConfig(prev => {
      const arr = [...prev.sectionOrder];
      const idx = arr.findIndex(s => (s.instanceId || s.key) === uid);
      if (idx < 0 || idx >= arr.length - 1) return prev;
      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
      const next = { ...prev, sectionOrder: arr };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);

  const addFeaturedSection = useCallback(() => {
    setConfig(prev => {
      const newId = `featured_${Date.now()}`;
      const newInstance: FeaturedInstance = {
        id: newId, title: "New Best Sellers",
        products: [], productsPerRow: 4, productAspectRatio: "3/4",
      };
      const newSection: SectionConfig = { key: "featured", label: "Best Sellers", visible: true, instanceId: newId };
      // Insert after last featured section
      const arr = [...prev.sectionOrder];
      const lastFeaturedIdx = arr.map((s, i) => s.key === "featured" ? i : -1).filter(i => i >= 0).pop() ?? arr.length - 1;
      arr.splice(lastFeaturedIdx + 1, 0, newSection);
      const next = { ...prev, sectionOrder: arr, featuredInstances: [...prev.featuredInstances, newInstance] };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);

  const removeFeaturedSection = useCallback((uid: string) => {
    setConfig(prev => {
      if (uid === "featured_default") return prev; // can't remove default
      const next = {
        ...prev,
        sectionOrder: prev.sectionOrder.filter(s => (s.instanceId || s.key) !== uid),
        featuredInstances: prev.featuredInstances.filter(f => f.id !== uid),
      };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);

  const updateSectionAlign = useCallback((uid: string, align: "left" | "center" | "right") => {
    setConfig(prev => {
      const newOrder = prev.sectionOrder.map(s =>
        (s.instanceId || s.key) === uid ? { ...s, titleAlign: align } : s
      );
      const next = { ...prev, sectionOrder: newOrder };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);

  const SECTION_LABELS: Record<SectionKey, string> = {
    "hero": "英雄横幅", "categories": "产品分类",
    "marquee": "滚动字幕", "videos": "达人视频", "featured": "Best Sellers",
    "series": "系列展示", "fabric": "面料介绍", "newsletter": "邮件订阅",
  };

  const addSectionByKey = useCallback((key: SectionKey) => {
    setConfig(prev => {
      if (key === "featured") {
        // featured uses addFeaturedSection logic
        const newId = `featured_${Date.now()}`;
        const newInstance: FeaturedInstance = {
          id: newId, title: "New Best Sellers",
          products: [], productsPerRow: 4, productAspectRatio: "3/4",
        };
        const newSection: SectionConfig = { key: "featured", label: "Best Sellers", visible: true, instanceId: newId, titleAlign: "center" };
        const arr = [...prev.sectionOrder];
        const lastFeaturedIdx = arr.map((s, i) => s.key === "featured" ? i : -1).filter(i => i >= 0).pop() ?? arr.length - 1;
        arr.splice(lastFeaturedIdx + 1, 0, newSection);
        const next = { ...prev, sectionOrder: arr, featuredInstances: [...prev.featuredInstances, newInstance] };
        persistConfig(next);
        return next;
      }
      // For non-featured sections, check if already exists (single-instance sections)
      const alreadyExists = prev.sectionOrder.some(s => s.key === key);
      if (alreadyExists) {
        // Re-enable it if hidden
        const newOrder = prev.sectionOrder.map(s => s.key === key ? { ...s, visible: true } : s);
        const next = { ...prev, sectionOrder: newOrder };
        persistConfig(next);
        return next;
      }
      const newSection: SectionConfig = { key, label: SECTION_LABELS[key] || key, visible: true, titleAlign: "center" };
      const arr = [...prev.sectionOrder, newSection];
      const next = { ...prev, sectionOrder: arr };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);

  const updateFeaturedInstance = useCallback((uid: string, updates: Partial<FeaturedInstance>) => {
    setConfig(prev => {
      const exists = prev.featuredInstances.some(f => f.id === uid);
      let newInstances: FeaturedInstance[];
      if (exists) {
        newInstances = prev.featuredInstances.map(f => f.id === uid ? { ...f, ...updates } : f);
      } else {
        // Instance not found (e.g. loaded from DB without featuredInstances) — create it
        const newInst: FeaturedInstance = {
          id: uid, title: "Best Sellers", products: [],
          productsPerRow: 4, productAspectRatio: "3/4",
          ...updates,
        };
        newInstances = [...prev.featuredInstances, newInst];
      }
      const next = { ...prev, featuredInstances: newInstances };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);

  // ---- Collections mutators ----
  const addCollection = useCallback(() => {
    setConfig(prev => {
      const newCol: CollectionConfig = {
        id: `col_${Date.now()}`,
        handle: `collection-${Date.now()}`,
        title: "New Collection",
        bannerHeight: 320,
        showBanner: true,
        productsPerRow: 4,
        productAspectRatio: "3/4",
        showColorFilter: true,
        colorFilters: [],
        subCategories: ["All"],
        sortOptions: ["Featured", "Price: Low to High", "Price: High to Low", "Newest"],
        products: [],
        desktopGap: 16,
        mobileGap: 8,
        productDetails: {},
      };
      const next = { ...prev, collections: [...(prev.collections || []), newCol] };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);

  const removeCollection = useCallback((id: string) => {
    setConfig(prev => {
      if ((prev.collections || []).length <= 1) return prev;
      const next = { ...prev, collections: prev.collections.filter(c => c.id !== id) };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);

  const updateCollection = useCallback((id: string, updates: Partial<CollectionConfig>) => {
    setConfig(prev => {
      const next = { ...prev, collections: (prev.collections || []).map(c => c.id === id ? { ...c, ...updates } : c) };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);

  const addCollectionProduct = useCallback((collectionId: string) => {
    setConfig(prev => {
      const newProd: CollectionProduct = { id: `colprod_${Date.now()}`, name: "New Product", price: "$0", colors: ["#175C40"], colorImages: {} };
      const next = { ...prev, collections: (prev.collections || []).map(c => c.id === collectionId ? { ...c, products: [...c.products, newProd] } : c) };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);

  const removeCollectionProduct = useCallback((collectionId: string, productId: string) => {
    setConfig(prev => {
      const next = { ...prev, collections: (prev.collections || []).map(c => c.id === collectionId ? { ...c, products: c.products.filter(p => p.id !== productId) } : c) };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);

  const updateCollectionProduct = useCallback((collectionId: string, productId: string, updates: Partial<CollectionProduct>) => {
    setConfig(prev => {
      const next = { ...prev, collections: (prev.collections || []).map(c => c.id === collectionId ? { ...c, products: c.products.map(p => p.id === productId ? { ...p, ...updates } : p) } : c) };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);

  const addCollectionColorFilter = useCallback((collectionId: string) => {
    setConfig(prev => {
      const newFilter: CollectionColorFilter = { id: `cf_${Date.now()}`, label: "New Color", value: "#888888" };
      const next = { ...prev, collections: (prev.collections || []).map(c => c.id === collectionId ? { ...c, colorFilters: [...c.colorFilters, newFilter] } : c) };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);

  const removeCollectionColorFilter = useCallback((collectionId: string, filterId: string) => {
    setConfig(prev => {
      const next = { ...prev, collections: (prev.collections || []).map(c => c.id === collectionId ? { ...c, colorFilters: c.colorFilters.filter(f => f.id !== filterId) } : c) };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);

  const updateCollectionColorFilter = useCallback((collectionId: string, filterId: string, updates: Partial<CollectionColorFilter>) => {
    setConfig(prev => {
      const next = { ...prev, collections: (prev.collections || []).map(c => c.id === collectionId ? { ...c, colorFilters: c.colorFilters.map(f => f.id === filterId ? { ...f, ...updates } : f) } : c) };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);

  const updateProductDetail = useCallback((collectionId: string, productId: string, updates: Partial<ProductDetailConfig>) => {
    setConfig(prev => {
      const next = { ...prev, collections: (prev.collections || []).map(c => {
        if (c.id !== collectionId) return c;
        const existing = c.productDetails?.[productId] || {};
        return { ...c, productDetails: { ...(c.productDetails || {}), [productId]: { ...existing, ...updates } } };
      })};
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);

  // ---- Influencer helpers ----
  const updateInfluencer = useCallback((updates: Partial<InfluencerConfig>) => {
    setConfig(prev => {
      const next = { ...prev, influencer: { ...(prev.influencer ?? defaultInfluencerConfig), ...updates } };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);

  // ---- Influencer Apply page section order helpers ----
  const moveApplySectionUp = useCallback((index: number) => {
    setConfig(prev => {
      const inf = prev.influencer ?? defaultInfluencerConfig;
      const arr = [...(inf.applyPageSectionOrder ?? defaultInfluencerConfig.applyPageSectionOrder!)];
      if (index <= 0) return prev;
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      const next = { ...prev, influencer: { ...inf, applyPageSectionOrder: arr } };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);

  const moveApplySectionDown = useCallback((index: number) => {
    setConfig(prev => {
      const inf = prev.influencer ?? defaultInfluencerConfig;
      const arr = [...(inf.applyPageSectionOrder ?? defaultInfluencerConfig.applyPageSectionOrder!)];
      if (index >= arr.length - 1) return prev;
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      const next = { ...prev, influencer: { ...inf, applyPageSectionOrder: arr } };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);

  // ---- About Us helpers ----
  const updateAboutUs = useCallback((updates: Partial<AboutUsConfig>) => {
    setConfig(prev => {
      const next = { ...prev, aboutUs: { ...(prev.aboutUs ?? defaultAboutUsConfig), ...updates } };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);

  const addAboutUsSection = useCallback((section: AboutUsSectionConfig) => {
    setConfig(prev => {
      const au = prev.aboutUs ?? defaultAboutUsConfig;
      const next = { ...prev, aboutUs: { ...au, sectionOrder: [...au.sectionOrder, section] } };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);

  const removeAboutUsSection = useCallback((instanceId: string) => {
    setConfig(prev => {
      const au = prev.aboutUs ?? defaultAboutUsConfig;
      const next = { ...prev, aboutUs: { ...au, sectionOrder: au.sectionOrder.filter(s => (s.instanceId ?? s.key) !== instanceId) } };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);

  const moveAboutUsSectionUp = useCallback((index: number) => {
    setConfig(prev => {
      const au = prev.aboutUs ?? defaultAboutUsConfig;
      if (index <= 0) return prev;
      const arr = [...au.sectionOrder];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      const next = { ...prev, aboutUs: { ...au, sectionOrder: arr } };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);

  const moveAboutUsSectionDown = useCallback((index: number) => {
    setConfig(prev => {
      const au = prev.aboutUs ?? defaultAboutUsConfig;
      if (index >= au.sectionOrder.length - 1) return prev;
      const arr = [...au.sectionOrder];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      const next = { ...prev, aboutUs: { ...au, sectionOrder: arr } };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);

  const updateAboutUsTextStyle = useCallback((field: string, style: Partial<AboutUsTextStyle>) => {
    setConfig(prev => {
      const au = prev.aboutUs ?? defaultAboutUsConfig;
      const existing = au.textStyles?.[field] ?? {};
      const next = { ...prev, aboutUs: { ...au, textStyles: { ...(au.textStyles ?? {}), [field]: { ...existing, ...style } } } };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);

  // ---- Policy Pages helpers ----
  const defaultPolicyPages = defaultConfig.policyPages!;
  const updatePolicyPage = useCallback((pageKey: keyof PolicyPagesConfig, updates: Partial<PolicyPageConfig>) => {
    setConfig(prev => {
      const pp = prev.policyPages ?? defaultPolicyPages;
      const next = { ...prev, policyPages: { ...pp, [pageKey]: { ...pp[pageKey], ...updates } } };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);
  const addPolicyFaq = useCallback((pageKey: keyof PolicyPagesConfig) => {
    setConfig(prev => {
      const pp = prev.policyPages ?? defaultPolicyPages;
      const page = pp[pageKey];
      const faqs = [...(page.faqs ?? []), { id: `faq_${Date.now()}`, question: "New Question", answer: "New Answer" }];
      const next = { ...prev, policyPages: { ...pp, [pageKey]: { ...page, faqs } } };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);
  const removePolicyFaq = useCallback((pageKey: keyof PolicyPagesConfig, id: string) => {
    setConfig(prev => {
      const pp = prev.policyPages ?? defaultPolicyPages;
      const page = pp[pageKey];
      const faqs = (page.faqs ?? []).filter(f => f.id !== id);
      const next = { ...prev, policyPages: { ...pp, [pageKey]: { ...page, faqs } } };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);
  const updatePolicyFaq = useCallback((pageKey: keyof PolicyPagesConfig, id: string, updates: Partial<PolicyFaq>) => {
    setConfig(prev => {
      const pp = prev.policyPages ?? defaultPolicyPages;
      const page = pp[pageKey];
      const faqs = (page.faqs ?? []).map(f => f.id === id ? { ...f, ...updates } : f);
      const next = { ...prev, policyPages: { ...pp, [pageKey]: { ...page, faqs } } };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);
  const addPolicyHighlight = useCallback((pageKey: keyof PolicyPagesConfig) => {
    setConfig(prev => {
      const pp = prev.policyPages ?? defaultPolicyPages;
      const page = pp[pageKey];
      const highlights = [...(page.highlights ?? []), { id: `hl_${Date.now()}`, icon: "📦", title: "New Highlight", desc: "Description" }];
      const next = { ...prev, policyPages: { ...pp, [pageKey]: { ...page, highlights } } };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);
  const removePolicyHighlight = useCallback((pageKey: keyof PolicyPagesConfig, id: string) => {
    setConfig(prev => {
      const pp = prev.policyPages ?? defaultPolicyPages;
      const page = pp[pageKey];
      const highlights = (page.highlights ?? []).filter(h => h.id !== id);
      const next = { ...prev, policyPages: { ...pp, [pageKey]: { ...page, highlights } } };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);
  const updatePolicyHighlight = useCallback((pageKey: keyof PolicyPagesConfig, id: string, updates: Partial<PolicyHighlight>) => {
    setConfig(prev => {
      const pp = prev.policyPages ?? defaultPolicyPages;
      const page = pp[pageKey];
      const highlights = (page.highlights ?? []).map(h => h.id === id ? { ...h, ...updates } : h);
      const next = { ...prev, policyPages: { ...pp, [pageKey]: { ...page, highlights } } };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);

  // ---- Returns Page helpers ----
  const defaultReturnsPage = defaultConfig.returnsPage!;
  const updateReturnsPage = useCallback((updates: Partial<ReturnsPageConfig>) => {
    setConfig(prev => {
      const next = { ...prev, returnsPage: { ...(prev.returnsPage ?? defaultReturnsPage), ...updates } };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);
  const addReturnsStep = useCallback(() => {
    setConfig(prev => {
      const rp = prev.returnsPage ?? defaultReturnsPage;
      const steps = [...rp.steps, { id: `step_${Date.now()}`, title: "New Step", desc: "Step description" }];
      const next = { ...prev, returnsPage: { ...rp, steps } };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);
  const removeReturnsStep = useCallback((id: string) => {
    setConfig(prev => {
      const rp = prev.returnsPage ?? defaultReturnsPage;
      const next = { ...prev, returnsPage: { ...rp, steps: rp.steps.filter(s => s.id !== id) } };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);
  const updateReturnsStep = useCallback((id: string, updates: Partial<ReturnsStep>) => {
    setConfig(prev => {
      const rp = prev.returnsPage ?? defaultReturnsPage;
      const next = { ...prev, returnsPage: { ...rp, steps: rp.steps.map(s => s.id === id ? { ...s, ...updates } : s) } };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);
  const addReturnsEligibilityItem = useCallback(() => {
    setConfig(prev => {
      const rp = prev.returnsPage ?? defaultReturnsPage;
      const eligibilityItems = [...rp.eligibilityItems, { id: `eli_${Date.now()}`, eligible: true, text: "New condition" }];
      const next = { ...prev, returnsPage: { ...rp, eligibilityItems } };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);
  const removeReturnsEligibilityItem = useCallback((id: string) => {
    setConfig(prev => {
      const rp = prev.returnsPage ?? defaultReturnsPage;
      const next = { ...prev, returnsPage: { ...rp, eligibilityItems: rp.eligibilityItems.filter(e => e.id !== id) } };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);
  const updateReturnsEligibilityItem = useCallback((id: string, updates: Partial<ReturnsEligibilityItem>) => {
    setConfig(prev => {
      const rp = prev.returnsPage ?? defaultReturnsPage;
      const next = { ...prev, returnsPage: { ...rp, eligibilityItems: rp.eligibilityItems.map(e => e.id === id ? { ...e, ...updates } : e) } };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);

  // ---- Fabric Guide Page helpers ----
  const defaultFabricGuidePage = defaultConfig.fabricGuidePage!;
  const updateFabricGuidePage = useCallback((updates: Partial<FabricGuidePageConfig>) => {
    setConfig(prev => {
      const next = { ...prev, fabricGuidePage: { ...(prev.fabricGuidePage ?? defaultFabricGuidePage), ...updates } };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);
  const addFabricItem = useCallback(() => {
    setConfig(prev => {
      const fg = prev.fabricGuidePage ?? defaultFabricGuidePage;
      const fabrics = [...fg.fabrics, { id: `fab_${Date.now()}`, name: "New Fabric", composition: "100% Polyester", tags: ["Lightweight"], scene: "All activities", color: "#B8D4C8" }];
      const next = { ...prev, fabricGuidePage: { ...fg, fabrics } };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);
  const removeFabricItem = useCallback((id: string) => {
    setConfig(prev => {
      const fg = prev.fabricGuidePage ?? defaultFabricGuidePage;
      const next = { ...prev, fabricGuidePage: { ...fg, fabrics: fg.fabrics.filter(f => f.id !== id) } };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);
  const updateFabricItem = useCallback((id: string, updates: Partial<FabricItem>) => {
    setConfig(prev => {
      const fg = prev.fabricGuidePage ?? defaultFabricGuidePage;
      const next = { ...prev, fabricGuidePage: { ...fg, fabrics: fg.fabrics.map(f => f.id === id ? { ...f, ...updates } : f) } };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);
  const addFabricCareItem = useCallback(() => {
    setConfig(prev => {
      const fg = prev.fabricGuidePage ?? defaultFabricGuidePage;
      const careItems = [...fg.careItems, { id: `care_${Date.now()}`, icon: "🧺", text: "New care instruction" }];
      const next = { ...prev, fabricGuidePage: { ...fg, careItems } };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);
  const removeFabricCareItem = useCallback((id: string) => {
    setConfig(prev => {
      const fg = prev.fabricGuidePage ?? defaultFabricGuidePage;
      const next = { ...prev, fabricGuidePage: { ...fg, careItems: fg.careItems.filter(c => c.id !== id) } };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);
  const updateFabricCareItem = useCallback((id: string, updates: Partial<FabricCareItem>) => {
    setConfig(prev => {
      const fg = prev.fabricGuidePage ?? defaultFabricGuidePage;
      const next = { ...prev, fabricGuidePage: { ...fg, careItems: fg.careItems.map(c => c.id === id ? { ...c, ...updates } : c) } };
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);

  return (
    <ThemeConfigContext.Provider value={{
      config, updateConfig,
      updateSlide, addSlide, removeSlide,
      updateCategory, addCategory, removeCategory,
      updateVideo, addVideo, removeVideo,
      updateProduct, addProduct, removeProduct,
      updateFabric, addFabric, removeFabric,
      updateSeries, addSeries, removeSeries,
      updatePromoItem, addPromoItem, removePromoItem,
      updateNavItem, addNavItem, removeNavItem,
      addNavChild, removeNavChild, updateNavChild,
      updateMarqueeItem, addMarqueeItem, removeMarqueeItem,
      moveSectionUp, moveSectionDown,
      addFeaturedSection, removeFeaturedSection, updateFeaturedInstance,
      updateSectionAlign, addSectionByKey,
      isSaving,
      addCollection, removeCollection, updateCollection,
      addCollectionProduct, removeCollectionProduct, updateCollectionProduct,
      addCollectionColorFilter, removeCollectionColorFilter, updateCollectionColorFilter,
      updateProductDetail,
      updateInfluencer,
      moveApplySectionUp, moveApplySectionDown,
      updateAboutUs, addAboutUsSection, removeAboutUsSection,
      moveAboutUsSectionUp, moveAboutUsSectionDown,
      updateAboutUsTextStyle,
      updatePolicyPage, addPolicyFaq, removePolicyFaq, updatePolicyFaq,
      addPolicyHighlight, removePolicyHighlight, updatePolicyHighlight,
      updateReturnsPage, addReturnsStep, removeReturnsStep, updateReturnsStep,
      addReturnsEligibilityItem, removeReturnsEligibilityItem, updateReturnsEligibilityItem,
      updateFabricGuidePage, addFabricItem, removeFabricItem, updateFabricItem,
      addFabricCareItem, removeFabricCareItem, updateFabricCareItem,
    }}>
      {children}
    </ThemeConfigContext.Provider>
  );
}

export function useThemeConfig() {
  const ctx = useContext(ThemeConfigContext);
  if (!ctx) throw new Error("useThemeConfig must be used within ThemeConfigProvider");
  return ctx;
}
