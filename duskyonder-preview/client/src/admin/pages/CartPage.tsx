import React, { useState, useCallback } from "react";
import { useThemeConfig, type Product } from "@/contexts/ThemeConfigContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Search, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const SHOPIFY_STORE_DOMAIN = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN as string;
const SHOPIFY_STOREFRONT_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN as string;

// ---- Shopify product search helper ----
async function searchShopifyProducts(query: string): Promise<Product[]> {
  const gql = `
    query SearchProducts($query: String!) {
      products(first: 12, query: $query, sortKey: BEST_SELLING) {
        nodes {
          id handle title
          priceRange { minVariantPrice { amount currencyCode } }
          images(first: 1) { nodes { url } }
        }
      }
    }
  `;
  const res = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/api/2024-10/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query: gql, variables: { query } }),
  });
  const json = await res.json();
  return (json.data?.products?.nodes ?? []).map((p: any) => ({
    id: p.id,
    name: p.title,
    price: `$${parseFloat(p.priceRange.minVariantPrice.amount).toFixed(2)}`,
    imageUrl: p.images.nodes[0]?.url ?? "",
    colors: [],
    detailUrl: `/products/${p.handle}`,
  }));
}

// ---- Product search dialog ----
function ProductSearchDialog({
  open,
  onClose,
  onSelect,
  excludeIds,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (product: Product) => void;
  excludeIds: Set<string>;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const doSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const products = await searchShopifyProducts(query);
      setResults(products);
    } finally {
      setLoading(false);
    }
  }, [query]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>搜索 Shopify 产品</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="输入产品名称..."
            onKeyDown={e => e.key === "Enter" && doSearch()}
          />
          <Button onClick={doSearch} disabled={loading} size="sm">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>
        <div className="mt-2 max-h-72 overflow-y-auto space-y-2">
          {results.map(p => (
            <div
              key={p.id}
              className="flex items-center gap-3 p-2 rounded-lg border cursor-pointer hover:bg-muted transition-colors"
              onClick={() => { if (!excludeIds.has(p.id)) { onSelect(p); onClose(); } }}
            >
              {p.imageUrl && (
                <img src={p.imageUrl} alt={p.name} className="w-10 h-10 object-cover rounded" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.price}</p>
              </div>
              {excludeIds.has(p.id) && (
                <span className="text-xs text-muted-foreground">已添加</span>
              )}
            </div>
          ))}
          {results.length === 0 && !loading && (
            <p className="text-sm text-muted-foreground text-center py-4">搜索产品以添加</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---- Main Cart Settings Page ----
export default function CartPage() {
  const { config, updateConfig } = useThemeConfig();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Derive manual product objects from config.products using cartManualProductIds
  const allProducts: Product[] = config.products ?? [];
  const manualIds: string[] = config.cartManualProductIds ?? [];
  const manualProducts = manualIds
    .map(id => allProducts.find(p => p.id === id))
    .filter(Boolean) as Product[];
  const manualIdSet = new Set(manualIds);

  const addManualProduct = (product: Product) => {
    // Also ensure the product exists in config.products
    const exists = allProducts.some(p => p.id === product.id);
    const updatedProducts = exists ? allProducts : [...allProducts, product];
    updateConfig({
      cartManualProductIds: [...manualIds, product.id],
      products: updatedProducts,
    } as any);
  };

  const removeManualProduct = (id: string) => {
    updateConfig({ cartManualProductIds: manualIds.filter(mid => mid !== id) } as any);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">购物车抽屉设置</h1>
        <p className="text-muted-foreground text-sm mt-0.5">配置购物车抽屉的免费配送进度条和产品推荐</p>
      </div>

      {/* ---- Free Shipping Bar ---- */}
      <Card className="mb-5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">免费配送进度条</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              id="show-shipping-bar"
              checked={config.showShippingBar ?? true}
              onCheckedChange={v => updateConfig({ showShippingBar: v } as any)}
            />
            <Label htmlFor="show-shipping-bar" className="text-sm cursor-pointer">显示免费配送进度条</Label>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">免费配送门槛金额 ($)</Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={config.freeShippingThreshold ?? 150}
              onChange={e => updateConfig({ freeShippingThreshold: parseFloat(e.target.value) || 0 } as any)}
              className="max-w-[160px]"
            />
            <p className="text-xs text-muted-foreground">订单金额达到此值时显示"已解锁免费配送"</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">未达门槛时的提示文案</Label>
            <Input
              value={config.freeShippingText ?? "Add {{amount}} more for free shipping"}
              onChange={e => updateConfig({ freeShippingText: e.target.value } as any)}
              placeholder="Add {{amount}} more for free shipping"
            />
            <p className="text-xs text-muted-foreground">使用 {"{{amount}}"} 作为剩余金额占位符</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">达到门槛后的提示文案</Label>
            <Input
              value={config.freeShippingAchievedText ?? "You've unlocked free shipping! 🎉"}
              onChange={e => updateConfig({ freeShippingAchievedText: e.target.value } as any)}
              placeholder="You've unlocked free shipping! 🎉"
            />
          </div>
        </CardContent>
      </Card>

      {/* ---- Upsell Recommendations ---- */}
      <Card className="mb-5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">产品推荐（加购区）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              id="show-recommendations"
              checked={config.showRecommendations ?? true}
              onCheckedChange={v => updateConfig({ showRecommendations: v } as any)}
            />
            <Label htmlFor="show-recommendations" className="text-sm cursor-pointer">显示产品推荐区</Label>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">推荐区标题</Label>
            <Input
              value={config.recommendationTitle ?? "PAIR IT PERFECTLY WITH"}
              onChange={e => updateConfig({ recommendationTitle: e.target.value } as any)}
              placeholder="PAIR IT PERFECTLY WITH"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">推荐模式</Label>
            <Select
              value={config.recommendationMode ?? "manual"}
              onValueChange={v => updateConfig({ recommendationMode: v as 'manual' | 'auto' } as any)}
            >
              <SelectTrigger className="max-w-[260px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">手动精选 (Manually Curated)</SelectItem>
                <SelectItem value="auto">Shopify 智能推荐 (Auto AI)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {(config.recommendationMode ?? "manual") === "auto"
                ? "自动模式：根据购物车中第一件商品，调用 Shopify Storefront API 实时获取推荐产品。"
                : "手动模式：从下方手动选择固定推荐产品。"}
            </p>
          </div>

          {/* Manual product list — only shown in manual mode */}
          {(config.recommendationMode ?? "manual") === "manual" && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">手动推荐产品列表</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDialogOpen(true)}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> 添加产品
                  </Button>
                </div>
                {manualProducts.length === 0 && (
                  <p className="text-sm text-muted-foreground py-2">暂无手动推荐产品，点击"添加产品"进行搜索。</p>
                )}
                <div className="space-y-2">
                  {manualProducts.map(p => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 p-2 rounded-lg border bg-muted/30"
                    >
                      {p.imageUrl && (
                        <img src={p.imageUrl} alt={p.name} className="w-10 h-10 object-cover rounded" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.price}</p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive h-7 w-7"
                        onClick={() => removeManualProduct(p.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Product search dialog */}
      <ProductSearchDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSelect={addManualProduct}
        excludeIds={manualIdSet}
      />
    </div>
  );
}
