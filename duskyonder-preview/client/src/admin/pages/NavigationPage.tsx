import React, { useState } from "react";
import { useThemeConfig, type NavItem } from "@/contexts/ThemeConfigContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  GripVertical,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import ImageUploader from "@/components/ImageUploader";

export default function NavigationPage() {
  const {
    config,
    updateConfig,
    updateNavItem,
    addNavItem,
    removeNavItem,
    addNavChild,
    removeNavChild,
    updateNavChild,
  } = useThemeConfig();
  const navItems = config.navItems ?? [];

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [menuHandle, setMenuHandle] = useState("main-menu");
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // Shopify menu import
  const getMenuQuery = trpc.navigation?.getMenu?.useQuery(
    { handle: menuHandle },
    { enabled: false }
  );

  const handleImportFromShopify = async () => {
    try {
      const result = await getMenuQuery.refetch();
      if (result.data?.items) {
        const imported: NavItem[] = result.data.items.map((item: any) => ({
          id: `nav_${item.id ?? Date.now()}_${Math.random().toString(36).slice(2)}`,
          label: item.title,
          link: item.url ?? "/",
          children:
            item.items?.map((child: any) => ({
              id: `nav_${child.id ?? Date.now()}_${Math.random().toString(36).slice(2)}`,
              label: child.title,
              link: child.url ?? "/",
            })) ?? [],
        }));
        updateConfig({ navItems: imported });
        toast.success(`已从 Shopify 导入 ${imported.length} 个导航项`);
      }
    } catch (e) {
      toast.error("导入失败，请检查菜单 handle 是否正确");
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDragStart = (i: number) => setDragIndex(i);
  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === i) return;
    const updated = [...navItems];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(i, 0, moved);
    setDragIndex(i);
    updateConfig({ navItems: updated });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold">导航栏</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          管理网站顶部导航菜单
        </p>
      </div>

      {/* Logo Settings */}
      <Card>
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="text-sm">Logo 设置</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">深色 Logo（默认）</Label>
              <ImageUploader
                section="logo"
                slot="main"
                currentUrl={config.logoImageUrl}
                onUploaded={url => updateConfig({ logoImageUrl: url })}
                onClear={() => updateConfig({ logoImageUrl: undefined })}
                aspectRatio="3/1"
                label="Upload Logo"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">白色 Logo（透明导航栏）</Label>
              <ImageUploader
                section="logo"
                slot="white"
                currentUrl={config.logoImageUrlWhite}
                onUploaded={url => updateConfig({ logoImageUrlWhite: url })}
                onClear={() => updateConfig({ logoImageUrlWhite: undefined })}
                aspectRatio="3/1"
                label="Upload White Logo"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Logo 文字（无图片时显示）</Label>
            <Input
              value={config.logoText ?? ""}
              onChange={e => updateConfig({ logoText: e.target.value })}
              placeholder="DUSKYONDER"
              className="h-8"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">
                桌面端 Logo 高度: {config.logoDesktopHeight ?? 40}px
              </Label>
              <Slider
                min={20}
                max={100}
                step={2}
                value={[config.logoDesktopHeight ?? 40]}
                onValueChange={([v]) => updateConfig({ logoDesktopHeight: v })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">
                移动端 Logo 高度: {config.logoMobileHeight ?? 32}px
              </Label>
              <Slider
                min={16}
                max={80}
                step={2}
                value={[config.logoMobileHeight ?? 32]}
                onValueChange={([v]) => updateConfig({ logoMobileHeight: v })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import from Shopify */}
      <Card>
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="text-sm">从 Shopify 导入菜单</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            在 Shopify 后台 → 在线商店 → 导航 中找到菜单，复制其 handle（URL
            中的最后一段）
          </p>
          <div className="flex gap-2 flex-wrap">
            {["main-menu", "footer", "top-menu", "mobile-menu"].map(h => (
              <button
                key={h}
                onClick={() => setMenuHandle(h)}
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                  menuHandle === h
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-accent"
                }`}
              >
                {h}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={menuHandle}
              onChange={e => setMenuHandle(e.target.value)}
              placeholder="菜单 handle，如 main-menu"
              className="h-8 flex-1"
            />
            <Button
              size="sm"
              onClick={handleImportFromShopify}
              disabled={getMenuQuery.isFetching}
            >
              {getMenuQuery.isFetching ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-1" />
              )}
              导入
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Manual Edit */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">
          当前导航项（可手动编辑）
        </h2>
        <Button onClick={addNavItem} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-1" /> 添加导航项
        </Button>
      </div>

      <div className="space-y-2">
        {navItems.map((item, index) => (
          <Card
            key={item.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={e => handleDragOver(e, index)}
            onDragEnd={() => setDragIndex(null)}
            className={`transition-all ${dragIndex === index ? "opacity-50 scale-[0.98]" : ""}`}
          >
            <CardContent className="px-4 py-3 space-y-2">
              {/* Main item row */}
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground shrink-0 cursor-move" />
                <Input
                  value={item.label}
                  onChange={e =>
                    updateNavItem(item.id, { label: e.target.value })
                  }
                  placeholder="导航文本"
                  className="h-7 text-sm flex-1"
                />
                <Input
                  value={item.link}
                  onChange={e =>
                    updateNavItem(item.id, { link: e.target.value })
                  }
                  placeholder="/path"
                  className="h-7 text-sm flex-1"
                />
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="h-7 w-7 flex items-center justify-center hover:bg-accent rounded transition-colors shrink-0"
                >
                  {expanded.has(item.id) ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeNavItem(item.id)}
                  className="text-destructive hover:text-destructive h-7 w-7 p-0 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Children */}
              {expanded.has(item.id) && (
                <div className="ml-6 space-y-1.5 pt-1 border-l-2 border-border pl-3">
                  {(item.children ?? []).map(child => (
                    <div key={child.id} className="flex items-center gap-2">
                      <Input
                        value={child.label}
                        onChange={e =>
                          updateNavChild(item.id, child.id, {
                            label: e.target.value,
                          })
                        }
                        placeholder="子菜单文本"
                        className="h-7 text-xs flex-1"
                      />
                      <Input
                        value={child.link}
                        onChange={e =>
                          updateNavChild(item.id, child.id, {
                            link: e.target.value,
                          })
                        }
                        placeholder="/path"
                        className="h-7 text-xs flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeNavChild(item.id, child.id)}
                        className="text-destructive hover:text-destructive h-7 w-7 p-0 shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addNavChild(item.id)}
                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="w-3 h-3 mr-1" /> 添加子菜单
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {navItems.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm border rounded-lg border-dashed">
            暂无导航项
          </div>
        )}
      </div>
    </div>
  );
}
