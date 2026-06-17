import React, { useState, useCallback } from "react";
import { useThemeConfig, type Video, type Product } from "@/contexts/ThemeConfigContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GripVertical, Plus, Trash2, Search, Loader2 } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";

const SHOPIFY_STORE_DOMAIN = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN as string;
const SHOPIFY_STOREFRONT_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN as string;

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
      setResults(await searchShopifyProducts(query));
    } finally {
      setLoading(false);
    }
  }, [query]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>搜索关联产品</DialogTitle>
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

function VideoCard({ video }: { video: Video }) {
  const { updateVideo, removeVideo } = useThemeConfig();
  const [searchOpen, setSearchOpen] = useState(false);

  const handleSelectProduct = (product: Product) => {
    updateVideo(video.id, {
      linkedProductId: product.id,
      linkedProductName: product.name,
      linkedProductPrice: product.price,
      linkedProductImage: product.imageUrl,
      linkedProductLink: product.detailUrl,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex items-center gap-2">
          <GripVertical className="w-5 h-5 text-muted-foreground cursor-move shrink-0" />
          <CardTitle className="text-sm flex-1">{video.influencerName || "未命名视频"}</CardTitle>
          <Button
            variant="ghost" size="sm"
            onClick={() => removeVideo(video.id)}
            className="text-destructive hover:text-destructive h-8 w-8 p-0"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">封面图片</Label>
            <ImageUploader
              section="videos"
              slot={`video_${video.id}_cover`}
              currentUrl={video.imageUrl}
              onUploaded={(url) => updateVideo(video.id, { imageUrl: url })}
              aspectRatio="9/16"
              label="上传封面图"
            />
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">达人名称</Label>
              <Input
                value={video.influencerName}
                onChange={e => updateVideo(video.id, { influencerName: e.target.value })}
                placeholder="@username"
                className="h-8"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">视频描述</Label>
              <Input
                value={video.caption}
                onChange={e => updateVideo(video.id, { caption: e.target.value })}
                placeholder="视频描述"
                className="h-8"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">视频播放链接（mp4 或 YouTube）</Label>
              <Input
                value={video.videoPlayUrl ?? ""}
                onChange={e => updateVideo(video.id, { videoPlayUrl: e.target.value })}
                placeholder="https://..."
                className="h-8"
              />
            </div>
          </div>
        </div>

        {/* Linked Product */}
        <div className="border rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">关联产品</Label>
            <Button size="sm" variant="outline" onClick={() => setSearchOpen(true)} className="h-7 text-xs">
              <Search className="w-3.5 h-3.5 mr-1" /> 搜索产品
            </Button>
          </div>
          {video.linkedProductName ? (
            <div className="flex items-center gap-2">
              {video.linkedProductImage && (
                <img src={video.linkedProductImage} alt={video.linkedProductName} className="w-10 h-10 object-cover rounded" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{video.linkedProductName}</p>
                <p className="text-xs text-muted-foreground">{video.linkedProductPrice}</p>
              </div>
              <Button
                variant="ghost" size="sm"
                onClick={() => updateVideo(video.id, { linkedProductId: undefined, linkedProductName: undefined, linkedProductImage: undefined })}
                className="text-destructive hover:text-destructive h-7 w-7 p-0 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">暂未关联产品</p>
          )}
        </div>
      </CardContent>
      <ProductSearchDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={handleSelectProduct}
      />
    </Card>
  );
}

export default function VideosPage() {
  const { config, updateConfig, addVideo } = useThemeConfig();
  const videos = config.videos ?? [];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Video Section</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage homepage influencer videos</p>
        </div>
        <Button onClick={addVideo} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-1" /> Add Video
        </Button>
      </div>

      {/* Global Video Section Settings */}
      <Card className="mb-4">
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Desktop Gap (px)</Label>
              <Input
                type="number"
                value={config.videosDesktopGap ?? 0}
                onChange={e => updateConfig({ videosDesktopGap: Number(e.target.value) })}
                className="h-8"
                min={0} max={60}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Mobile Gap (px)</Label>
              <Input
                type="number"
                value={config.videosMobileGap ?? 12}
                onChange={e => updateConfig({ videosMobileGap: Number(e.target.value) })}
                className="h-8"
                min={0} max={60}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Desktop Height (px, 0=auto)</Label>
              <Input
                type="number"
                value={config.videoCardHeight ?? 0}
                onChange={e => updateConfig({ videoCardHeight: Number(e.target.value) })}
                className="h-8"
                min={0} max={800}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Mobile Height (px, 0=auto)</Label>
              <Input
                type="number"
                value={config.videosMobileCardHeight ?? 0}
                onChange={e => updateConfig({ videosMobileCardHeight: Number(e.target.value) })}
                className="h-8"
                min={0} max={800}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {videos.map(video => (
          <VideoCard key={video.id} video={video} />
        ))}
        {videos.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm border rounded-lg border-dashed">
            暂无视频，点击"添加视频"开始
          </div>
        )}
      </div>
    </div>
  );
}
