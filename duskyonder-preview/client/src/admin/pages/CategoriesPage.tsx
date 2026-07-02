import React from "react";
import { useThemeConfig } from "@/contexts/ThemeConfigContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";

export default function CategoriesPage() {
  const {
    config, updateConfig,
    updateCategory, addCategory, removeCategory,
    updateCategoryInstance,
  } = useThemeConfig();
  const categories = config.categories ?? [];
  const categoryInstances = config.categoryInstances ?? [
    { id: "categories_default", title: "Shop by Category", tag: "", columnsDesktop: 4, columnsMobile: 2 },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">分类板块</h1>
          <p className="text-muted-foreground text-sm mt-0.5">首页产品分类图片</p>
        </div>
        <Button onClick={addCategory} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-1" /> 添加分类
        </Button>
      </div>

      {/* Per-Instance Settings */}
      {categoryInstances.map((inst) => (
        <Card key={inst.id} className="mb-4 border-l-4 border-l-primary/30">
          <CardContent className="pt-4 pb-4 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                分类板块实例
              </span>
              {inst.tag && (
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{inst.tag}</span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">标签（用于管理员识别）</Label>
                <Input
                  value={inst.tag ?? ""}
                  onChange={e => updateCategoryInstance(inst.id, { tag: e.target.value })}
                  placeholder="例如：主分类、运动系列"
                  className="h-8"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">板块标题</Label>
                <Input
                  value={inst.title ?? ""}
                  onChange={e => updateCategoryInstance(inst.id, { title: e.target.value })}
                  placeholder="Shop by Category"
                  className="h-8"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">桌面端列数</Label>
                <Select
                  value={String(inst.columnsDesktop ?? 4)}
                  onValueChange={v => updateCategoryInstance(inst.id, { columnsDesktop: Number(v) })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 列</SelectItem>
                    <SelectItem value="4">4 列</SelectItem>
                    <SelectItem value="6">6 列</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">移动端列数</Label>
                <Select
                  value={String(inst.columnsMobile ?? 2)}
                  onValueChange={v => updateCategoryInstance(inst.id, { columnsMobile: Number(v) })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 列</SelectItem>
                    <SelectItem value="2">2 列</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Global Settings */}
      <Card className="mb-4">
        <CardContent className="pt-4 pb-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">图片宽高比（如 3/4、1/1）</Label>
              <Input
                value={config.categoryAspectRatio ?? "3/4"}
                onChange={e => updateConfig({ categoryAspectRatio: e.target.value })}
                placeholder="3/4"
                className="h-8"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">桌面端列间距（{config.categoriesDesktopGap ?? 12}px）</Label>
              <Slider
                value={[config.categoriesDesktopGap ?? 12]}
                onValueChange={([v]) => updateConfig({ categoriesDesktopGap: v })}
                min={0} max={48} step={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">移动端列间距（{config.categoriesMobileGap ?? 12}px）</Label>
              <Slider
                value={[config.categoriesMobileGap ?? 12]}
                onValueChange={([v]) => updateConfig({ categoriesMobileGap: v })}
                min={0} max={32} step={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Items */}
      <div className="space-y-4">
        {categories.map((cat) => (
          <Card key={cat.id} className="overflow-hidden">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-sm">{cat.title || "未命名分类"}</span>
                <Button
                  variant="ghost" size="sm"
                  onClick={() => removeCategory(cat.id)}
                  className="text-destructive hover:text-destructive h-8 w-8 p-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs mb-1 block">分类图片</Label>
                  <ImageUploader
                    value={cat.imageUrl}
                    onChange={url => updateCategory(cat.id, { imageUrl: url })}
                    label="Click to change"
                    aspectRatio={config.categoryAspectRatio ?? "3/4"}
                  />
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">标题</Label>
                    <Input
                      value={cat.title ?? ""}
                      onChange={e => updateCategory(cat.id, { title: e.target.value })}
                      placeholder="Category Name"
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">链接</Label>
                    <Input
                      value={cat.link ?? ""}
                      onChange={e => updateCategory(cat.id, { link: e.target.value })}
                      placeholder="/collections/category"
                      className="h-8"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
