import React, { useState, useCallback } from "react";
import { useThemeConfig, type FeaturedInstance, type Product } from "@/contexts/ThemeConfigContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GripVertical, Plus, Trash2, Search, X, Loader2 } from "lucide-react";

const SHOPIFY_STORE_DOMAIN = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN as string;
const SHOPIFY_STOREFRONT_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN as string;

async function searchShopifyProducts(query: string): Promise<Product[]> {
  const gql = `
    query SearchProducts($query: String!) {
      products(first: 12, query: $query, sortKey: BEST_SELLING) {
        nodes {
          id
          handle
          title
          priceRange { minVariantPrice { amount currencyCode } }
          images(first: 1) { nodes { url } }
          variants(first: 1) { nodes { id } }
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

function ProductSearchDialog({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (product: Product) => void;
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
            onKeyDown={e => e.key === "Enter" && doSearch()}
            placeholder="输入产品名称..."
            className="h-8"
          />
          <Button size="sm" onClick={doSearch} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>
        <div className="space-y-2 max-h-80 overflow-y-auto mt-2">
          {results.map(p => (
            <button
              key={p.id}
              onClick={() => { onSelect(p); onClose(); }}
              className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-accent text-left transition-colors"
            >
              {p.imageUrl && (
                <img src={p.imageUrl} alt={p.name} className="w-12 h-12 object-cover rounded" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.price}</p>
              </div>
            </button>
          ))}
          {results.length === 0 && !loading && query && (
            <p className="text-sm text-muted-foreground text-center py-4">未找到产品</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FeaturedInstanceEditor({ instance }: { instance: FeaturedInstance }) {
  const { updateFeaturedInstance, removeFeaturedSection } = useThemeConfig();
  const [searchOpen, setSearchOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const products = instance.products ?? [];

  const handleAddProduct = (product: Product) => {
    updateFeaturedInstance(instance.id, { products: [...products, product] });
  };

  const handleRemoveProduct = (productId: string) => {
    updateFeaturedInstance(instance.id, { products: products.filter(p => p.id !== productId) });
  };

  const handleDragStart = (i: number) => setDragIndex(i);
  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === i) return;
    const updated = [...products];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(i, 0, moved);
    setDragIndex(i);
    updateFeaturedInstance(instance.id, { products: updated });
  };

  return (
    <Card>
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm flex-1">
            <Input
              value={instance.title}
              onChange={e => updateFeaturedInstance(instance.id, { title: e.target.value })}
              placeholder="板块标题"
              className="h-7 text-sm font-medium"
            />
          </CardTitle>
          {instance.id !== "featured_default" && (
            <Button
              variant="ghost" size="sm"
              onClick={() => removeFeaturedSection(instance.id)}
              className="text-destructive hover:text-destructive h-8 w-8 p-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        {/* Data Source Toggle */}
        <div className="flex gap-4 items-end">
          <div className="space-y-1.5 flex-1">
            <Label className="text-xs">Data Source</Label>
            <Select
              value={instance.dataSource ?? 'manual'}
              onValueChange={v => updateFeaturedInstance(instance.id, { dataSource: v as 'auto' | 'manual' })}
            >
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto (Shopify Best Sellers)</SelectItem>
                <SelectItem value="manual">Manual (Select Products)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(instance.dataSource === 'auto') && (
            <div className="space-y-1.5 flex-1">
              <Label className="text-xs">Collection Handle (optional)</Label>
              <Input
                value={instance.collectionHandle ?? ''}
                onChange={e => updateFeaturedInstance(instance.id, { collectionHandle: e.target.value })}
                placeholder="e.g. best-selling (empty = all best sellers)"
                className="h-8"
              />
            </div>
          )}
        </div>

        <div className="flex gap-4 items-end">
          <div className="space-y-1.5 flex-1">
            <Label className="text-xs">Products Per Row</Label>
            <Select
              value={String(instance.productsPerRow ?? 4)}
              onValueChange={v => updateFeaturedInstance(instance.id, { productsPerRow: Number(v) })}
            >
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[2, 3, 4, 5].map(n => (
                  <SelectItem key={n} value={String(n)}>{n} columns</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 flex-1">
            <Label className="text-xs">Image Aspect Ratio</Label>
            <Input
              value={instance.productAspectRatio ?? "3/4"}
              onChange={e => updateFeaturedInstance(instance.id, { productAspectRatio: e.target.value })}
              placeholder="3/4"
              className="h-8"
            />
          </div>
          {(instance.dataSource !== 'auto') && (
            <Button size="sm" variant="outline" onClick={() => setSearchOpen(true)}>
              <Search className="w-4 h-4 mr-1" /> Search & Add Products
            </Button>
          )}
        </div>

        {(instance.dataSource !== 'auto') && <div className="space-y-1.5">
          {products.map((product, i) => (
            <div
              key={product.id}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDragEnd={() => setDragIndex(null)}
              className={`flex items-center gap-3 p-2 rounded-lg border bg-background transition-all ${
                dragIndex === i ? "opacity-50" : ""
              }`}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground shrink-0 cursor-move" />
              {product.imageUrl && (
                <img src={product.imageUrl} alt={product.name} className="w-10 h-10 object-cover rounded" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.price}</p>
              </div>
              <Button
                variant="ghost" size="sm"
                onClick={() => handleRemoveProduct(product.id)}
                className="text-destructive hover:text-destructive h-7 w-7 p-0 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
          {products.length === 0 && (
            <div className="text-center py-6 text-muted-foreground text-sm border rounded-lg border-dashed">
              Click "Search & Add Products" to add products
            </div>
          )}
        </div>}
        {(instance.dataSource === 'auto') && (
          <div className="text-center py-4 text-muted-foreground text-sm border rounded-lg border-dashed bg-muted/30">
            Products will be automatically fetched from Shopify Best Sellers.
            {instance.collectionHandle && <span className="block mt-1">Collection: <strong>{instance.collectionHandle}</strong></span>}
          </div>
        )}
      </CardContent>

      <ProductSearchDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={handleAddProduct}
      />
    </Card>
  );
}

export default function ProductsPage() {
  const { config, addFeaturedSection } = useThemeConfig();
  const instances = config.featuredInstances ?? [];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">产品板块</h1>
          <p className="text-muted-foreground text-sm mt-0.5">管理首页 Best Sellers 产品展示</p>
        </div>
        <Button onClick={addFeaturedSection} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-1" /> 添加产品板块
        </Button>
      </div>

      <div className="space-y-4">
        {instances.map(instance => (
          <FeaturedInstanceEditor key={instance.id} instance={instance} />
        ))}
        {instances.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm border rounded-lg border-dashed">
            暂无产品板块
          </div>
        )}
      </div>
    </div>
  );
}
