import React, { useState, useCallback } from "react";
import { useThemeConfig } from "@/contexts/ThemeConfigContext";
import type {
  InfluencerConfig,
  InfluencerCreator,
  InfluencerShopProduct,
  InfluencerMediaItem,
  InfluencerStatItem,
  InfluencerBenefit,
  InfluencerRequirement,
  InfluencerFaqItem,
  InfluencerFormField,
} from "@/contexts/ThemeConfigContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import ImageUploader from "@/components/ImageUploader";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Plus, Trash2, ChevronDown, ChevronUp, ExternalLink,
  Users, Star, BarChart2, Gift, ClipboardList, HelpCircle, FileText,
  Search, Loader2,
} from "lucide-react";

// ── Shopify product search (reused from ProductsPage pattern) ─────────────
const SHOPIFY_STORE_DOMAIN = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN as string;
const SHOPIFY_STOREFRONT_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN as string;

interface ShopifyProductResult {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
  detailUrl: string;
}

async function searchShopifyProducts(query: string): Promise<ShopifyProductResult[]> {
  const gql = `
    query SearchProducts($query: String!) {
      products(first: 12, query: $query, sortKey: BEST_SELLING) {
        nodes {
          id
          handle
          title
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
  onSelect: (product: ShopifyProductResult) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ShopifyProductResult[]>([]);
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
          <DialogTitle>Search Shopify Products</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && doSearch()}
            placeholder="Type a product name..."
            className="h-8"
            autoFocus
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
                <img src={p.imageUrl} alt={p.name} className="w-12 h-12 object-cover rounded flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.price}</p>
              </div>
            </button>
          ))}
          {results.length === 0 && !loading && query && (
            <p className="text-sm text-muted-foreground text-center py-4">No products found</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function uid() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="mt-0.5 rounded-md bg-primary/10 p-1.5 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <h2 className="text-sm font-semibold leading-none">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

// ── Creator Card ─────────────────────────────────────────────────────────────
function CreatorCard({
  creator,
  index,
  total,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  creator: InfluencerCreator;
  index: number;
  total: number;
  onChange: (updated: InfluencerCreator) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [open, setOpen] = useState(false);
  // shopPickerFor: null = closed, "hero" = Shop Her Look, string id = shopProducts[id]
  const [shopPickerFor, setShopPickerFor] = useState<null | "hero" | string>(null);
  const set = (key: keyof InfluencerCreator, val: string) => onChange({ ...creator, [key]: val });

  return (
    <Card className="border border-border/60">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center gap-2">
          {/* Reorder */}
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              disabled={index === 0}
              onClick={onMoveUp}
              className="disabled:opacity-30 hover:text-primary transition-colors"
              aria-label="Move up"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={index === total - 1}
              onClick={onMoveDown}
              className="disabled:opacity-30 hover:text-primary transition-colors"
              aria-label="Move down"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
          {/* Avatar preview */}
          {creator.avatarUrl ? (
            <img src={creator.avatarUrl} alt={creator.name} className="h-9 w-9 rounded-full object-cover border" />
          ) : (
            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground border">
              {creator.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{creator.name || "Unnamed Creator"}</p>
            <p className="text-xs text-muted-foreground truncate">{creator.handle || "—"}</p>
          </div>
          <Badge variant="outline" className="text-xs capitalize shrink-0">{creator.platform}</Badge>
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={open ? "Collapse" : "Expand"}
          >
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="text-destructive/60 hover:text-destructive transition-colors"
            aria-label="Remove creator"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>

      {open && (
        <CardContent className="pt-0 pb-4 px-4 space-y-4">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Display Name *</Label>
              <Input className="h-8" value={creator.name} onChange={e => set("name", e.target.value)} placeholder="Emma Chen" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Handle *</Label>
              <Input className="h-8" value={creator.handle} onChange={e => set("handle", e.target.value)} placeholder="@emmaactive" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Platform</Label>
              <select
                className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                value={creator.platform}
                onChange={e => set("platform", e.target.value as InfluencerCreator["platform"])}
              >
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
                <option value="xiaohongshu">Xiaohongshu</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Profile Link</Label>
              <Input className="h-8" value={creator.profileLink ?? ""} onChange={e => set("profileLink", e.target.value)} placeholder="https://instagram.com/..." />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Followers</Label>
              <Input className="h-8" value={creator.followers} onChange={e => set("followers", e.target.value)} placeholder="128K" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Likes</Label>
              <Input className="h-8" value={creator.likes ?? ""} onChange={e => set("likes", e.target.value)} placeholder="2.4M" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Posts Count</Label>
              <Input className="h-8" value={creator.postsCount ?? ""} onChange={e => set("postsCount", e.target.value)} placeholder="342" />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <Label className="text-xs">Bio (shown on detail page)</Label>
            <Textarea
              className="text-xs resize-none"
              rows={2}
              value={creator.bio ?? ""}
              onChange={e => set("bio", e.target.value)}
              placeholder="A short bio about this creator..."
            />
          </div>

          {/* Avatar */}
          <div className="space-y-1.5">
            <Label className="text-xs">Avatar Image</Label>
            <ImageUploader
              section="influencer"
              slot={`creator_avatar_${creator.id}`}
              currentUrl={creator.avatarUrl}
              onUploaded={url => set("avatarUrl", url)}
              onClear={() => set("avatarUrl", "")}
              aspectRatio="1/1"
              label="Upload Avatar"
            />
          </div>

          {/* Video cover */}
          <div className="space-y-1.5">
            <Label className="text-xs">Cover Image (shown on index page)</Label>
            <ImageUploader
              section="influencer"
              slot={`creator_cover_${creator.id}`}
              currentUrl={creator.videoCoverUrl}
              onUploaded={url => set("videoCoverUrl", url)}
              onClear={() => set("videoCoverUrl", "")}
              aspectRatio="3/4"
              label="Upload Cover"
            />
          </div>

          {/* Video URL */}
          <div className="space-y-1.5">
            <Label className="text-xs">Video URL (optional — plays on cover click)</Label>
            <Input className="h-8" value={creator.videoUrl ?? ""} onChange={e => set("videoUrl", e.target.value)} placeholder="https://youtube.com/... or .mp4 URL" />
          </div>

          {/* Shop product */}
          <div className="border rounded-md p-3 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Shop Her Look</p>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShopPickerFor("hero")}>
                <Search className="h-3.5 w-3.5 mr-1" /> Pick from Shopify
              </Button>
            </div>
            {creator.shopProductName ? (
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/40 border">
                {creator.shopProductImageUrl && (
                  <img src={creator.shopProductImageUrl} alt={creator.shopProductName} className="w-12 h-12 object-cover rounded flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{creator.shopProductName}</p>
                  <p className="text-xs text-muted-foreground">{creator.shopProductPrice}</p>
                  <p className="text-xs text-muted-foreground truncate">{creator.shopProductLink}</p>
                </div>
                <button type="button" onClick={() => { set("shopProductName", ""); set("shopProductPrice", ""); set("shopProductLink", ""); set("shopProductImageUrl", ""); }} className="text-destructive/60 hover:text-destructive flex-shrink-0">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-2">No product selected. Click "Pick from Shopify" to choose one.</p>
            )}
            {/* Allow image override after Shopify pick */}
            <div className="space-y-1.5">
              <Label className="text-xs">Override Product Image (optional)</Label>
              <ImageUploader
                section="influencer"
                slot={`creator_product_${creator.id}`}
                currentUrl={creator.shopProductImageUrl}
                onUploaded={url => set("shopProductImageUrl", url)}
                onClear={() => set("shopProductImageUrl", "")}
                aspectRatio="3/4"
                label="Upload Product Image"
              />
            </div>
          </div>

          {/* ── Shop Products (multi-product list for detail page) ── */}
          <div className="border rounded-md p-3 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Shop Products (Detail Page Tab)</p>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => {
                  // Add a blank slot and open the picker for it immediately
                  const newId = uid();
                  const newProduct: InfluencerShopProduct = { id: newId, name: "", price: "", imageUrl: "", link: "" };
                  onChange({ ...creator, shopProducts: [...(creator.shopProducts ?? []), newProduct] });
                  setShopPickerFor(newId);
                }}
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Product
              </Button>
            </div>
            {(!creator.shopProducts || creator.shopProducts.length === 0) && (
              <p className="text-xs text-muted-foreground text-center py-2">No products yet. Click "Add Product" to search Shopify.</p>
            )}
            {(creator.shopProducts ?? []).map((sp, idx) => (
              <div key={sp.id} className="border rounded p-3 space-y-2 bg-muted/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground">Product {idx + 1}</span>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" className="h-6 text-xs px-2" onClick={() => setShopPickerFor(sp.id)}>
                      <Search className="h-3 w-3 mr-1" /> Change
                    </Button>
                    <button
                      type="button"
                      onClick={() => onChange({ ...creator, shopProducts: (creator.shopProducts ?? []).filter(p => p.id !== sp.id) })}
                      className="text-destructive/60 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {sp.name ? (
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-background border">
                    {sp.imageUrl && (
                      <img src={sp.imageUrl} alt={sp.name} className="w-12 h-12 object-cover rounded flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{sp.name}</p>
                      <p className="text-xs text-muted-foreground">{sp.price}</p>
                      <p className="text-xs text-muted-foreground truncate">{sp.link}</p>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShopPickerFor(sp.id)}
                    className="w-full py-3 border border-dashed rounded-lg text-xs text-muted-foreground hover:bg-accent transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Search className="h-3.5 w-3.5" /> Click to search and select a product
                  </button>
                )}
                {/* Allow image override after Shopify pick */}
                <div className="space-y-1">
                  <Label className="text-xs">Override Image (optional)</Label>
                  <ImageUploader
                    section="influencer"
                    slot={`creator_sp_${creator.id}_${sp.id}`}
                    currentUrl={sp.imageUrl}
                    onUploaded={url => onChange({ ...creator, shopProducts: (creator.shopProducts ?? []).map(p => p.id === sp.id ? { ...p, imageUrl: url } : p) })}
                    onClear={() => onChange({ ...creator, shopProducts: (creator.shopProducts ?? []).map(p => p.id === sp.id ? { ...p, imageUrl: "" } : p) })}
                    aspectRatio="3/4"
                    label="Upload"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* ── Detail Media Items ── */}
          <div className="border rounded-md p-3 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Media Items (Videos / Images Tab)</p>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => {
                  const newItem: InfluencerMediaItem = { id: uid(), type: "video", url: "", thumbnailUrl: "", caption: "" };
                  onChange({ ...creator, detailMediaItems: [...(creator.detailMediaItems ?? []), newItem] });
                }}
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Media
              </Button>
            </div>
            {(!creator.detailMediaItems || creator.detailMediaItems.length === 0) && (
              <p className="text-xs text-muted-foreground text-center py-2">No media yet. Click "Add Media" to begin.</p>
            )}
            {(creator.detailMediaItems ?? []).map((item, idx) => (
              <div key={item.id} className="border rounded p-3 space-y-2 bg-muted/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground">Media {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => onChange({ ...creator, detailMediaItems: (creator.detailMediaItems ?? []).filter(m => m.id !== item.id) })}
                    className="text-destructive/60 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Type</Label>
                    <select
                      className="h-7 w-full rounded-md border border-input bg-background px-2 text-xs"
                      value={item.type}
                      onChange={e => onChange({ ...creator, detailMediaItems: (creator.detailMediaItems ?? []).map(m => m.id === item.id ? { ...m, type: e.target.value as "image" | "video" } : m) })}
                    >
                      <option value="video">Video</option>
                      <option value="image">Image</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Caption</Label>
                    <Input className="h-7 text-xs" value={item.caption ?? ""} placeholder="Morning flow ✨"
                      onChange={e => onChange({ ...creator, detailMediaItems: (creator.detailMediaItems ?? []).map(m => m.id === item.id ? { ...m, caption: e.target.value } : m) })} />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs">Video / Image URL</Label>
                    <Input className="h-7 text-xs" value={item.url} placeholder="https://... or /manus-storage/..."
                      onChange={e => onChange({ ...creator, detailMediaItems: (creator.detailMediaItems ?? []).map(m => m.id === item.id ? { ...m, url: e.target.value } : m) })} />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs">Thumbnail / Cover Image URL</Label>
                    <Input className="h-7 text-xs" value={item.thumbnailUrl ?? ""} placeholder="https://..."
                      onChange={e => onChange({ ...creator, detailMediaItems: (creator.detailMediaItems ?? []).map(m => m.id === item.id ? { ...m, thumbnailUrl: e.target.value } : m) })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Linked Product Name</Label>
                    <Input className="h-7 text-xs" value={item.productName ?? ""} placeholder="AirLight Leggings"
                      onChange={e => onChange({ ...creator, detailMediaItems: (creator.detailMediaItems ?? []).map(m => m.id === item.id ? { ...m, productName: e.target.value } : m) })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Linked Product Link</Label>
                    <Input className="h-7 text-xs" value={item.productLink ?? ""} placeholder="/products/..."
                      onChange={e => onChange({ ...creator, detailMediaItems: (creator.detailMediaItems ?? []).map(m => m.id === item.id ? { ...m, productLink: e.target.value } : m) })} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}

      {/* ── Shopify product picker dialog (shared for hero + shopProducts) ── */}
      <ProductSearchDialog
        open={shopPickerFor !== null}
        onClose={() => setShopPickerFor(null)}
        onSelect={product => {
          if (shopPickerFor === "hero") {
            onChange({
              ...creator,
              shopProductName: product.name,
              shopProductPrice: product.price,
              shopProductImageUrl: product.imageUrl,
              shopProductLink: product.detailUrl,
            });
          } else if (shopPickerFor) {
            onChange({
              ...creator,
              shopProducts: (creator.shopProducts ?? []).map(p =>
                p.id === shopPickerFor
                  ? { ...p, name: product.name, price: product.price, imageUrl: product.imageUrl, link: product.detailUrl }
                  : p
              ),
            });
          }
          setShopPickerFor(null);
        }}
      />
    </Card>
  );
}

// ── Stat Item Row ─────────────────────────────────────────────────────────────
function StatRow({
  item,
  onChange,
  onRemove,
}: {
  item: InfluencerStatItem;
  onChange: (u: InfluencerStatItem) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={item.visible}
        onCheckedChange={v => onChange({ ...item, visible: v })}
        className="shrink-0"
      />
      <Input
        className="h-8 w-24"
        value={item.value}
        onChange={e => onChange({ ...item, value: e.target.value })}
        placeholder="50+"
      />
      <Input
        className="h-8 flex-1"
        value={item.label}
        onChange={e => onChange({ ...item, label: e.target.value })}
        placeholder="Active Creators"
      />
      <button type="button" onClick={onRemove} className="text-destructive/60 hover:text-destructive shrink-0">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── Benefit Row ───────────────────────────────────────────────────────────────
function BenefitRow({
  item,
  onChange,
  onRemove,
}: {
  item: InfluencerBenefit;
  onChange: (u: InfluencerBenefit) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-start gap-2 border rounded-md p-3">
      <Switch
        checked={item.visible}
        onCheckedChange={v => onChange({ ...item, visible: v })}
        className="mt-0.5 shrink-0"
      />
      <Input
        className="h-8 w-12 text-center"
        value={item.icon}
        onChange={e => onChange({ ...item, icon: e.target.value })}
        placeholder="🎁"
      />
      <div className="flex-1 space-y-1.5">
        <Input
          className="h-8"
          value={item.title}
          onChange={e => onChange({ ...item, title: e.target.value })}
          placeholder="Free Products"
        />
        <Textarea
          className="text-xs resize-none"
          rows={2}
          value={item.description}
          onChange={e => onChange({ ...item, description: e.target.value })}
          placeholder="Description..."
        />
      </div>
      <button type="button" onClick={onRemove} className="text-destructive/60 hover:text-destructive shrink-0 mt-0.5">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── Requirement Row ───────────────────────────────────────────────────────────
function RequirementRow({
  item,
  onChange,
  onRemove,
}: {
  item: InfluencerRequirement;
  onChange: (u: InfluencerRequirement) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={item.visible}
        onCheckedChange={v => onChange({ ...item, visible: v })}
        className="shrink-0"
      />
      <Input
        className="h-8 flex-1"
        value={item.text}
        onChange={e => onChange({ ...item, text: e.target.value })}
        placeholder="Requirement text..."
      />
      <button type="button" onClick={onRemove} className="text-destructive/60 hover:text-destructive shrink-0">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── FAQ Row ───────────────────────────────────────────────────────────────────
function FaqRow({
  item,
  onChange,
  onRemove,
}: {
  item: InfluencerFaqItem;
  onChange: (u: InfluencerFaqItem) => void;
  onRemove: () => void;
}) {
  return (
    <div className="border rounded-md p-3 space-y-2">
      <div className="flex items-start gap-2">
        <Switch
          checked={item.visible}
          onCheckedChange={v => onChange({ ...item, visible: v })}
          className="mt-0.5 shrink-0"
        />
        <div className="flex-1 space-y-1.5">
          <Input
            className="h-8"
            value={item.question}
            onChange={e => onChange({ ...item, question: e.target.value })}
            placeholder="Question..."
          />
          <Textarea
            className="text-xs resize-none"
            rows={2}
            value={item.answer}
            onChange={e => onChange({ ...item, answer: e.target.value })}
            placeholder="Answer..."
          />
        </div>
        <button type="button" onClick={onRemove} className="text-destructive/60 hover:text-destructive shrink-0 mt-0.5">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ── Form Field Row ────────────────────────────────────────────────────────────
function FormFieldRow({
  item,
  onChange,
  onRemove,
}: {
  item: InfluencerFormField;
  onChange: (u: InfluencerFormField) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 border rounded-md p-2">
      <Switch
        checked={item.visible}
        onCheckedChange={v => onChange({ ...item, visible: v })}
        className="shrink-0"
      />
      <div className="flex-1 grid grid-cols-3 gap-2">
        <Input
          className="h-7 text-xs"
          value={item.label}
          onChange={e => onChange({ ...item, label: e.target.value })}
          placeholder="Field label"
        />
        <select
          className="h-7 rounded-md border border-input bg-background px-2 text-xs"
          value={item.type}
          onChange={e => onChange({ ...item, type: e.target.value as InfluencerFormField["type"] })}
        >
          <option value="text">Text</option>
          <option value="email">Email</option>
          <option value="select">Select</option>
          <option value="multiselect">Multi-select</option>
          <option value="textarea">Textarea</option>
          <option value="file">File</option>
        </select>
        <Input
          className="h-7 text-xs"
          value={item.placeholder ?? ""}
          onChange={e => onChange({ ...item, placeholder: e.target.value })}
          placeholder="Placeholder..."
        />
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <Label className="text-xs text-muted-foreground">Req</Label>
        <Switch
          checked={item.required}
          onCheckedChange={v => onChange({ ...item, required: v })}
        />
      </div>
      <button type="button" onClick={onRemove} className="text-destructive/60 hover:text-destructive shrink-0">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function InfluencerEditorPage() {
  const { config, updateInfluencer } = useThemeConfig();
  const inf = config.influencer!;

  // ── Hero helpers ──
  const setHero = (key: keyof InfluencerConfig, val: string | boolean) =>
    updateInfluencer({ [key]: val });

  // ── Creators helpers ──
  const setCreators = (creators: InfluencerCreator[]) => updateInfluencer({ creators });
  const addCreator = () => {
    const newCreator: InfluencerCreator = {
      id: uid(),
      name: "New Creator",
      handle: "@newcreator",
      platform: "instagram",
      followers: "0",
      avatarUrl: "",
      videoCoverUrl: "",
      videoUrl: "",
      profileLink: "#",
    };
    setCreators([...inf.creators, newCreator]);
  };
  const updateCreator = (id: string, updated: InfluencerCreator) =>
    setCreators(inf.creators.map(c => (c.id === id ? updated : c)));
  const removeCreator = (id: string) =>
    setCreators(inf.creators.filter(c => c.id !== id));
  const moveCreatorUp = (index: number) => {
    if (index <= 0) return;
    const arr = [...inf.creators];
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
    setCreators(arr);
  };
  const moveCreatorDown = (index: number) => {
    if (index >= inf.creators.length - 1) return;
    const arr = [...inf.creators];
    [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
    setCreators(arr);
  };

  // ── Stats helpers ──
  const setStats = (statsItems: InfluencerStatItem[]) => updateInfluencer({ statsItems });
  const addStat = () =>
    setStats([...(inf.statsItems ?? []), { id: uid(), value: "0", label: "New Stat", visible: true }]);
  const updateStat = (id: string, u: InfluencerStatItem) =>
    setStats((inf.statsItems ?? []).map(s => (s.id === id ? u : s)));
  const removeStat = (id: string) =>
    setStats((inf.statsItems ?? []).filter(s => s.id !== id));

  // ── Benefits helpers ──
  const setBenefits = (benefits: InfluencerBenefit[]) => updateInfluencer({ benefits });
  const addBenefit = () =>
    setBenefits([...inf.benefits, { id: uid(), icon: "🌟", title: "New Benefit", description: "", visible: true }]);
  const updateBenefit = (id: string, u: InfluencerBenefit) =>
    setBenefits(inf.benefits.map(b => (b.id === id ? u : b)));
  const removeBenefit = (id: string) =>
    setBenefits(inf.benefits.filter(b => b.id !== id));

  // ── Requirements helpers ──
  const setReqLeft = (requirementsLeft: InfluencerRequirement[]) => updateInfluencer({ requirementsLeft });
  const setReqRight = (requirementsRight: InfluencerRequirement[]) => updateInfluencer({ requirementsRight });
  const addReqLeft = () =>
    setReqLeft([...inf.requirementsLeft, { id: uid(), text: "New requirement", visible: true }]);
  const addReqRight = () =>
    setReqRight([...inf.requirementsRight, { id: uid(), text: "New requirement", visible: true }]);

  // ── FAQ helpers ──
  const setFaq = (faqItems: InfluencerFaqItem[]) => updateInfluencer({ faqItems });
  const addFaq = () =>
    setFaq([...inf.faqItems, { id: uid(), question: "New Question?", answer: "", visible: true }]);
  const updateFaq = (id: string, u: InfluencerFaqItem) =>
    setFaq(inf.faqItems.map(f => (f.id === id ? u : f)));
  const removeFaq = (id: string) =>
    setFaq(inf.faqItems.filter(f => f.id !== id));

  // ── Form fields helpers ──
  const setFormFields = (formFields: InfluencerFormField[]) => updateInfluencer({ formFields });
  const addFormField = () =>
    setFormFields([...inf.formFields, { id: uid(), label: "New Field", type: "text", placeholder: "", required: false, visible: true }]);
  const updateFormField = (id: string, u: InfluencerFormField) =>
    setFormFields(inf.formFields.map(f => (f.id === id ? u : f)));
  const removeFormField = (id: string) =>
    setFormFields(inf.formFields.filter(f => f.id !== id));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Influencer Page</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Edit the <a href="/pages/influencer" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 inline-flex items-center gap-1">
              /pages/influencer <ExternalLink className="h-3 w-3" />
            </a> page content. Changes save automatically.
          </p>
        </div>
      </div>

      <Tabs defaultValue="hero">
        <TabsList className="w-full grid grid-cols-6 h-9 text-xs">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="creators">Creators</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="apply">Apply</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        {/* ── HERO TAB ── */}
        <TabsContent value="hero" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-4 space-y-4">
              <SectionHeader icon={Star} title="Hero Section" subtitle="The banner at the top of /pages/influencer" />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-2">
                  <Label className="text-xs">Tag Line</Label>
                  <Input
                    className="h-8"
                    value={inf.heroTag}
                    onChange={e => setHero("heroTag", e.target.value)}
                    placeholder="DUSKYONDER × CREATORS"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label className="text-xs">Hero Title</Label>
                  <Input
                    className="h-8"
                    value={inf.heroTitle}
                    onChange={e => setHero("heroTitle", e.target.value)}
                    placeholder="Move With Us."
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label className="text-xs">Hero Subtitle</Label>
                  <Textarea
                    className="text-xs resize-none"
                    rows={2}
                    value={inf.heroSubtitle}
                    onChange={e => setHero("heroSubtitle", e.target.value)}
                    placeholder="We're building a movement..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Background Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={inf.heroBgColor}
                      onChange={e => setHero("heroBgColor", e.target.value)}
                      className="h-8 w-10 rounded border border-input cursor-pointer p-0.5"
                    />
                    <Input
                      className="h-8 font-mono"
                      value={inf.heroBgColor}
                      onChange={e => setHero("heroBgColor", e.target.value)}
                      placeholder="#0D3D2B"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Text Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={inf.heroTextColor}
                      onChange={e => setHero("heroTextColor", e.target.value)}
                      className="h-8 w-10 rounded border border-input cursor-pointer p-0.5"
                    />
                    <Input
                      className="h-8 font-mono"
                      value={inf.heroTextColor}
                      onChange={e => setHero("heroTextColor", e.target.value)}
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="border rounded-md p-3 space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Primary CTA Button</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Label</Label>
                    <Input className="h-8" value={inf.heroPrimaryBtnLabel} onChange={e => setHero("heroPrimaryBtnLabel", e.target.value)} placeholder="Apply Now" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Link</Label>
                    <Input className="h-8" value={inf.heroPrimaryBtnLink} onChange={e => setHero("heroPrimaryBtnLink", e.target.value)} placeholder="#apply" />
                  </div>
                </div>
              </div>

              <div className="border rounded-md p-3 space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Secondary CTA Button</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Label</Label>
                    <Input className="h-8" value={inf.heroSecondaryBtnLabel} onChange={e => setHero("heroSecondaryBtnLabel", e.target.value)} placeholder="Meet Our Creators" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Link</Label>
                    <Input className="h-8" value={inf.heroSecondaryBtnLink} onChange={e => setHero("heroSecondaryBtnLink", e.target.value)} placeholder="#creators" />
                  </div>
                </div>
              </div>

              {/* Layout toggles */}
              <div className="flex items-center gap-3">
                <Switch
                  checked={inf.heroFullWidth ?? false}
                  onCheckedChange={v => setHero("heroFullWidth", v)}
                />
                <Label className="text-xs">Full-width hero banner</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={inf.showCreators}
                  onCheckedChange={v => updateInfluencer({ showCreators: v })}
                />
                <Label className="text-xs">Show Creators section</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── CREATORS TAB ── */}
        <TabsContent value="creators" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <SectionHeader icon={Users} title="Creators" subtitle={`${inf.creators.length} creator${inf.creators.length !== 1 ? "s" : ""} — each gets a detail page at /pages/influencer/[handle]`} />
            <Button size="sm" variant="outline" onClick={addCreator}>
              <Plus className="h-4 w-4 mr-1" /> Add Creator
            </Button>
          </div>

          {/* Grid settings */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Creators Per Row (desktop)</Label>
                  <Input
                    type="number"
                    className="h-8"
                    min={2} max={6}
                    value={inf.creatorsPerRow ?? 3}
                    onChange={e => updateInfluencer({ creatorsPerRow: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Card Image Ratio</Label>
                  <select
                    className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                    value={inf.creatorImgRatio ?? "4/5"}
                    onChange={e => updateInfluencer({ creatorImgRatio: e.target.value })}
                  >
                    <option value="1/1">1:1 Square</option>
                    <option value="3/4">3:4 Portrait</option>
                    <option value="4/5">4:5 Portrait</option>
                    <option value="9/16">9:16 Tall</option>
                  </select>
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label className="text-xs">Creators Section Title</Label>
                  <Input className="h-8" value={inf.creatorsTitle} onChange={e => updateInfluencer({ creatorsTitle: e.target.value })} placeholder="Meet Our Creators" />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label className="text-xs">Creators Section Subtitle</Label>
                  <Input className="h-8" value={inf.creatorsSubtitle} onChange={e => updateInfluencer({ creatorsSubtitle: e.target.value })} placeholder="Real women. Real movement." />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {inf.creators.map((creator, i) => (
              <CreatorCard
                key={creator.id}
                creator={creator}
                index={i}
                total={inf.creators.length}
                onChange={updated => updateCreator(creator.id, updated)}
                onRemove={() => removeCreator(creator.id)}
                onMoveUp={() => moveCreatorUp(i)}
                onMoveDown={() => moveCreatorDown(i)}
              />
            ))}
            {inf.creators.length === 0 && (
              <div className="text-center py-10 text-muted-foreground text-sm border rounded-lg border-dashed">
                No creators yet. Click "Add Creator" to get started.
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── STATS TAB ── */}
        <TabsContent value="stats" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <SectionHeader icon={BarChart2} title="Stats Bar" subtitle="Counter row shown below the hero" />
                <div className="flex items-center gap-3">
                  <Switch
                    checked={inf.showStats ?? true}
                    onCheckedChange={v => updateInfluencer({ showStats: v })}
                  />
                  <Label className="text-xs">Show stats</Label>
                </div>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-[auto_6rem_1fr_auto] gap-2 text-xs text-muted-foreground px-1 mb-1">
                  <span className="w-9" />
                  <span>Value</span>
                  <span>Label</span>
                  <span className="w-4" />
                </div>
                {(inf.statsItems ?? []).map(stat => (
                  <StatRow
                    key={stat.id}
                    item={stat}
                    onChange={u => updateStat(stat.id, u)}
                    onRemove={() => removeStat(stat.id)}
                  />
                ))}
                {(inf.statsItems ?? []).length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No stats yet.</p>
                )}
              </div>
              <Button size="sm" variant="outline" onClick={addStat}>
                <Plus className="h-4 w-4 mr-1" /> Add Stat
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── BENEFITS TAB ── */}
        <TabsContent value="benefits" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <SectionHeader icon={Gift} title="Benefits Section" subtitle="Why creators should partner with DUSKYONDER" />
                <div className="flex items-center gap-3">
                  <Switch
                    checked={inf.showBenefits}
                    onCheckedChange={v => updateInfluencer({ showBenefits: v })}
                  />
                  <Label className="text-xs">Show section</Label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-2">
                  <Label className="text-xs">Section Title</Label>
                  <Input className="h-8" value={inf.benefitsTitle} onChange={e => updateInfluencer({ benefitsTitle: e.target.value })} />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label className="text-xs">Section Subtitle</Label>
                  <Input className="h-8" value={inf.benefitsSubtitle} onChange={e => updateInfluencer({ benefitsSubtitle: e.target.value })} />
                </div>
              </div>

              <div className="space-y-3">
                {inf.benefits.map(b => (
                  <BenefitRow
                    key={b.id}
                    item={b}
                    onChange={u => updateBenefit(b.id, u)}
                    onRemove={() => removeBenefit(b.id)}
                  />
                ))}
              </div>
              <Button size="sm" variant="outline" onClick={addBenefit}>
                <Plus className="h-4 w-4 mr-1" /> Add Benefit
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── APPLY TAB (Requirements + Form) ── */}
        <TabsContent value="apply" className="space-y-4 mt-4">
          {/* Requirements */}
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <SectionHeader icon={ClipboardList} title="Requirements Section" />
                <div className="flex items-center gap-3">
                  <Switch
                    checked={inf.showRequirements}
                    onCheckedChange={v => updateInfluencer({ showRequirements: v })}
                  />
                  <Label className="text-xs">Show section</Label>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Section Title</Label>
                <Input className="h-8" value={inf.requirementsTitle} onChange={e => updateInfluencer({ requirementsTitle: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Left column */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">{inf.requirementsLeftTitle}</Label>
                    <Button size="sm" variant="ghost" className="h-6 text-xs px-2" onClick={addReqLeft}>
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                  <Input
                    className="h-7 text-xs"
                    value={inf.requirementsLeftTitle}
                    onChange={e => updateInfluencer({ requirementsLeftTitle: e.target.value })}
                    placeholder="Column title..."
                  />
                  <div className="space-y-1.5">
                    {inf.requirementsLeft.map(r => (
                      <RequirementRow
                        key={r.id}
                        item={r}
                        onChange={u => setReqLeft(inf.requirementsLeft.map(x => (x.id === r.id ? u : x)))}
                        onRemove={() => setReqLeft(inf.requirementsLeft.filter(x => x.id !== r.id))}
                      />
                    ))}
                  </div>
                </div>
                {/* Right column */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">{inf.requirementsRightTitle}</Label>
                    <Button size="sm" variant="ghost" className="h-6 text-xs px-2" onClick={addReqRight}>
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                  <Input
                    className="h-7 text-xs"
                    value={inf.requirementsRightTitle}
                    onChange={e => updateInfluencer({ requirementsRightTitle: e.target.value })}
                    placeholder="Column title..."
                  />
                  <div className="space-y-1.5">
                    {inf.requirementsRight.map(r => (
                      <RequirementRow
                        key={r.id}
                        item={r}
                        onChange={u => setReqRight(inf.requirementsRight.map(x => (x.id === r.id ? u : x)))}
                        onRemove={() => setReqRight(inf.requirementsRight.filter(x => x.id !== r.id))}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Form */}
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <SectionHeader icon={FileText} title="Application Form" />
                <div className="flex items-center gap-3">
                  <Switch
                    checked={inf.showForm}
                    onCheckedChange={v => updateInfluencer({ showForm: v })}
                  />
                  <Label className="text-xs">Show form</Label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-2">
                  <Label className="text-xs">Form Title</Label>
                  <Input className="h-8" value={inf.formTitle} onChange={e => updateInfluencer({ formTitle: e.target.value })} />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label className="text-xs">Form Subtitle</Label>
                  <Input className="h-8" value={inf.formSubtitle} onChange={e => updateInfluencer({ formSubtitle: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Submit Button Label</Label>
                  <Input className="h-8" value={inf.formBtnLabel} onChange={e => updateInfluencer({ formBtnLabel: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto_auto] gap-2 text-xs text-muted-foreground px-1 mb-1">
                  <span className="w-9" />
                  <span>Label</span>
                  <span>Type</span>
                  <span>Placeholder</span>
                  <span>Req</span>
                  <span className="w-4" />
                </div>
                {inf.formFields.map(f => (
                  <FormFieldRow
                    key={f.id}
                    item={f}
                    onChange={u => updateFormField(f.id, u)}
                    onRemove={() => removeFormField(f.id)}
                  />
                ))}
              </div>
              <Button size="sm" variant="outline" onClick={addFormField}>
                <Plus className="h-4 w-4 mr-1" /> Add Field
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── FAQ TAB ── */}
        <TabsContent value="faq" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <SectionHeader icon={HelpCircle} title="FAQ Section" />
                <div className="flex items-center gap-3">
                  <Switch
                    checked={inf.showFaq}
                    onCheckedChange={v => updateInfluencer({ showFaq: v })}
                  />
                  <Label className="text-xs">Show FAQ</Label>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">FAQ Section Title</Label>
                <Input className="h-8" value={inf.faqTitle} onChange={e => updateInfluencer({ faqTitle: e.target.value })} />
              </div>

              <div className="space-y-3">
                {inf.faqItems.map(f => (
                  <FaqRow
                    key={f.id}
                    item={f}
                    onChange={u => updateFaq(f.id, u)}
                    onRemove={() => removeFaq(f.id)}
                  />
                ))}
                {inf.faqItems.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No FAQ items yet.</p>
                )}
              </div>
              <Button size="sm" variant="outline" onClick={addFaq}>
                <Plus className="h-4 w-4 mr-1" /> Add FAQ Item
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
