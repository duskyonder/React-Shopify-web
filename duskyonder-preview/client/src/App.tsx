import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect, useLocation } from "wouter";
import { getCustomerLoginUrlAsync } from "@/lib/shopify";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ThemeConfigProvider } from "./contexts/ThemeConfigContext";
import { CartProvider } from "./contexts/CartContext";
import { CartDrawer } from "./components/CartDrawer";

// ---- 301 Redirect Map ----
// Add source → destination pairs here. These are evaluated client-side;
// for true server-side 301s, mirror this array in your CDN/edge config.
// Format: { from: "/old-path", to: "/new-path" }
export const REDIRECT_MAP: Array<{ from: string; to: string }> = [
  // Example:
  // { from: "/old-collections/sale", to: "/collections/sale" },
  // { from: "/pages/returns-policy", to: "/pages/return-policy" },
];

// Redirect component: matches exact path and issues client-side redirect
function RedirectRoute({ from, to }: { from: string; to: string }) {
  return <Route path={from} component={() => <Redirect to={to} />} />;
}

// 首页同步加载（首屏关键路径）
import Home from "./pages/Home";

// 其他页面懒加载（按需加载，减少首屏 bundle 体积）
const Collections = lazy(() => import("./pages/Collections"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const BlogIndex = lazy(() => import("./pages/BlogIndex"));
const BlogArticle = lazy(() => import("./pages/BlogArticle"));
const InfluencerPage = lazy(() => import("./pages/InfluencerPage"));
const InfluencerApplyPage = lazy(() => import("./pages/InfluencerApplyPage"));
const InfluencerCreatorPage = lazy(() => import("./pages/InfluencerCreatorPage"));
const PolicyPage = lazy(() => import("./pages/PolicyPage"));
const DynamicPolicyPage = lazy(() => import("./pages/PolicyPage").then(m => ({ default: m.DynamicPolicyPage })));
const ReturnsPage = lazy(() => import("./pages/ReturnsPage"));
const FabricGuidePage = lazy(() => import("./pages/FabricGuidePage"));
const SizeGuidePage = lazy(() => import("./pages/SizeGuidePage"));
const AccountPage = lazy(() => import("./pages/AccountPage"));
const ThankYouPage = lazy(() => import("./pages/ThankYouPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const OrderDetailPage = lazy(() => import("./pages/OrderDetailPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));

// Admin pages (lazy loaded)
const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const AdminSectionsPage = lazy(() => import("./admin/pages/SectionsPage"));
const AdminHeroPage = lazy(() => import("./admin/pages/HeroPage"));
const AdminPromoBarPage = lazy(() => import("./admin/pages/PromoBarPage"));
const AdminCategoriesPage = lazy(() => import("./admin/pages/CategoriesPage"));
const AdminProductsPage = lazy(() => import("./admin/pages/ProductsPage"));
const AdminVideosPage = lazy(() => import("./admin/pages/VideosPage"));
const AdminSeriesPage = lazy(() => import("./admin/pages/SeriesPage"));
const AdminFabricPage = lazy(() => import("./admin/pages/FabricPage"));
const AdminFooterPage = lazy(() => import("./admin/pages/FooterPage"));
const AdminNavigationPage = lazy(() => import("./admin/pages/NavigationPage"));
const AdminNewsletterPage = lazy(() => import("./admin/pages/NewsletterPage"));
const AdminCartPage = lazy(() => import("./admin/pages/CartPage"));
const AdminInfluencerPage = lazy(() => import("./admin/pages/InfluencerPage"));
const AdminMarqueePage = lazy(() => import("./admin/pages/MarqueePage"));

// 页面加载中的骨架屏（轻量占位）
function PageSkeleton() {
  return (
    <div style={{ minHeight: "100vh", background: "#faf9f7" }} />
  );
}

// Safety-net: redirect /account/login and /account/register to Shopify hosted auth
function ShopifyAuthRedirect({ returnPath = "/account" }: { returnPath?: string }) {
  useEffect(() => {
    getCustomerLoginUrlAsync(`${window.location.origin}${returnPath}`).then(url => {
      window.location.href = url;
    });
  }, [returnPath]);
  return null;
}

function Router() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/collections"} component={Collections} />
        <Route path={"/collections/:handle"} component={Collections} />
        <Route path={"/products/:handle"} component={ProductDetail} />
        <Route path={"/pages/about-us"} component={AboutUs} />
        <Route path={"/blogs/news"} component={BlogIndex} />
        <Route path={"/blogs/news/:handle"} component={BlogArticle} />
        <Route path={"/pages/influencer"} component={InfluencerPage} />
        <Route path={"/pages/influencer/apply"} component={InfluencerApplyPage} />
        <Route path={"/pages/influencer/:handle"} component={InfluencerCreatorPage} />
        {/* Policy pages — canonical /policies/:handle route */}
        <Route path={"/policies/:handle"} component={DynamicPolicyPage} />
        {/* Legacy bare-handle aliases — redirect to canonical */}
        <Route path={"/privacy-policy"}><Redirect to="/policies/privacy-policy" /></Route>
        <Route path={"/return-policy"}><Redirect to="/policies/return-policy" /></Route>
        <Route path={"/refund-policy"}><Redirect to="/policies/refund-policy" /></Route>
        <Route path={"/shipping-policy"}><Redirect to="/policies/shipping-policy" /></Route>
        <Route path={"/terms-of-service"}><Redirect to="/policies/terms-of-service" /></Route>
        {/* Legacy /pages/* aliases — redirect to canonical */}
        <Route path={"/pages/privacy-policy"}><Redirect to="/policies/privacy-policy" /></Route>
        <Route path={"/pages/return-policy"}><Redirect to="/policies/return-policy" /></Route>
        <Route path={"/pages/refund-policy"}><Redirect to="/policies/refund-policy" /></Route>
        <Route path={"/pages/shipping-policy"}><Redirect to="/policies/shipping-policy" /></Route>
        <Route path={"/pages/shipping"}><Redirect to="/policies/shipping-policy" /></Route>
        <Route path={"/pages/terms-of-service"}><Redirect to="/policies/terms-of-service" /></Route>
        <Route path={"/pages/returns"} component={ReturnsPage} />
        <Route path={"/pages/fabric-guide"} component={FabricGuidePage} />
        <Route path={"/pages/size-guide"} component={SizeGuidePage} />
        <Route path={"/account"} component={AccountPage} />
        <Route path={"/account/login"} component={() => <ShopifyAuthRedirect returnPath="/account" />} />
        <Route path={"/account/register"} component={() => <ShopifyAuthRedirect returnPath="/account" />} />
        <Route path={"/account/orders"} component={OrdersPage} />
        <Route path={"/account/orders/:id"} component={OrderDetailPage} />
        <Route path={"/thank-you"} component={ThankYouPage} />
        <Route path={"/wishlist"} component={WishlistPage} />
        <Route path={"/search"} component={SearchPage} />
        <Route path={"/contact"} component={ContactPage} />
        <Route path={"/pages/contact"} component={ContactPage} />
        <Route path={"/faq"}><Redirect to="/pages/faq" /></Route>
        <Route path={"/pages/faq"} component={FAQPage} />
        {/* Admin routes */}
        <Route path="/admin" component={() => <AdminLayout><AdminSectionsPage /></AdminLayout>} />
        <Route path="/admin/hero" component={() => <AdminLayout><AdminHeroPage /></AdminLayout>} />
        <Route path="/admin/promo" component={() => <AdminLayout><AdminPromoBarPage /></AdminLayout>} />
        <Route path="/admin/categories" component={() => <AdminLayout><AdminCategoriesPage /></AdminLayout>} />
        <Route path="/admin/products" component={() => <AdminLayout><AdminProductsPage /></AdminLayout>} />
        <Route path="/admin/videos" component={() => <AdminLayout><AdminVideosPage /></AdminLayout>} />
        <Route path="/admin/series" component={() => <AdminLayout><AdminSeriesPage /></AdminLayout>} />
        <Route path="/admin/fabric" component={() => <AdminLayout><AdminFabricPage /></AdminLayout>} />
        <Route path="/admin/footer" component={() => <AdminLayout><AdminFooterPage /></AdminLayout>} />
        <Route path="/admin/navigation" component={() => <AdminLayout><AdminNavigationPage /></AdminLayout>} />
        <Route path="/admin/newsletter" component={() => <AdminLayout><AdminNewsletterPage /></AdminLayout>} />
        <Route path="/admin/cart" component={() => <AdminLayout><AdminCartPage /></AdminLayout>} />
        <Route path="/admin/influencer" component={() => <AdminLayout><AdminInfluencerPage /></AdminLayout>} />
        <Route path="/admin/marquee" component={() => <AdminLayout><AdminMarqueePage /></AdminLayout>} />
        {/* Generic Shopify page catch-all — fetches live content by handle */}
        <Route path={"/pages/:handle"} component={() => <PolicyPage />} />
        {/* 301 Redirects — generated from REDIRECT_MAP */}
        {REDIRECT_MAP.map(r => <RedirectRoute key={r.from} from={r.from} to={r.to} />)}
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <ThemeConfigProvider>
            <CartProvider>
              <Toaster />
              <CartDrawer />
              <Router />
            </CartProvider>
          </ThemeConfigProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
