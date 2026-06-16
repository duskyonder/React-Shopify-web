import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ThemeConfigProvider } from "./contexts/ThemeConfigContext";
import { CartProvider } from "./contexts/CartContext";
import { CartDrawer } from "./components/CartDrawer";

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
const ReturnsPage = lazy(() => import("./pages/ReturnsPage"));
const FabricGuidePage = lazy(() => import("./pages/FabricGuidePage"));
const SizeGuidePage = lazy(() => import("./pages/SizeGuidePage"));
const AccountPage = lazy(() => import("./pages/AccountPage"));
const ThankYouPage = lazy(() => import("./pages/ThankYouPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const OrderDetailPage = lazy(() => import("./pages/OrderDetailPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));

// 页面加载中的骨架屏（轻量占位）
function PageSkeleton() {
  return (
    <div style={{ minHeight: "100vh", background: "#faf9f7" }} />
  );
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
        <Route path={"/pages/blog"} component={BlogIndex} />
        <Route path={"/pages/blog/:handle"} component={BlogArticle} />
        <Route path={"/pages/influencer"} component={InfluencerPage} />
        <Route path={"/pages/influencer/apply"} component={InfluencerApplyPage} />
        <Route path={"/pages/influencer/:handle"} component={InfluencerCreatorPage} />
        <Route path={"/pages/return-policy"} component={() => <PolicyPage pageKey="returnPolicy" showFaqs showHighlights />} />
        <Route path={"/pages/privacy-policy"} component={() => <PolicyPage pageKey="privacyPolicy" />} />
        <Route path={"/pages/shipping"} component={() => <PolicyPage pageKey="shippingPolicy" showHighlights />} />
        <Route path={"/pages/terms-of-service"} component={() => <PolicyPage pageKey="termsOfService" />} />
        <Route path={"/pages/returns"} component={ReturnsPage} />
        <Route path={"/pages/fabric-guide"} component={FabricGuidePage} />
        <Route path={"/pages/size-guide"} component={SizeGuidePage} />
        <Route path={"/account"} component={AccountPage} />
        <Route path={"/account/login"} component={AccountPage} />
        <Route path={"/account/register"} component={AccountPage} />
        <Route path={"/account/orders"} component={OrdersPage} />
        <Route path={"/account/orders/:id"} component={OrderDetailPage} />
        <Route path={"/thank-you"} component={ThankYouPage} />
        <Route path={"/wishlist"} component={WishlistPage} />
        <Route path={"/search"} component={SearchPage} />
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
