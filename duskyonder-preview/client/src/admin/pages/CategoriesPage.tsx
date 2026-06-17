import React from "react";
import { useThemeConfig } from "@/contexts/ThemeConfigContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Plus, Trash2 } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";

export default function CategoriesPage() {
  const { config, updateConfig, updateCategory, addCategory, removeCategory } = useThemeConfig();
  const categories = config.categories ?? [];

  const handleAdd = () => {
    addCategory();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">分类板块</h1>
          <p className="text-muted-foreground text-sm mt-0.5">首页产品分类图片</p>
        </div>
        <Button onClick={handleAdd} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-1" /> 添加分类
        </Button>
      </div>

      {/* Global Settings */}
      <Card className="mb-4">
        <CardContent className="pt-4 pb-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">板块标题</Label>
              <Input
                value={config.categoriesTitle ?? ""}
                onChange={e => updateConfig({ categoriesTitle: e.target.value })}
                placeholder="Shop by Category"
                className="h-8"
              />
            </div>
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
              <Label className="text-xs">移动端列间距（{config.categoriesMobileGap ?? 8}px）</Label>
              <Slider
                value={[config.categoriesMobileGap ?? 8]}
                onValueChange={([v]) => updateConfig({ categoriesMobileGap: v })}
                min={0} max={32} step={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <Card key={cat.id}>
            <CardContent className="pt-4 pb-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">{cat.title || "未命名分类"}</Label>
                <Button
                  variant="ghost" size="sm"
                  onClick={() => removeCategory(cat.id)}
                  className="text-destructive hover:text-destructive h-8 w-8 p-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <ImageUploader
                section="categories"
                slot={`cat_${cat.id}`}
                currentUrl={cat.imageUrl}
                onUploaded={(url) => updateCategory(cat.id, { imageUrl: url })}
                aspectRatio={config.categoryAspectRatio ?? "3/4"}
                label="上传分类图片"
              />
              <div className="space-y-1.5">
                <Label className="text-xs">标题</Label>
                <Input
                  value={cat.title}
                  onChange={e => updateCategory(cat.id, { title: e.target.value })}
                  placeholder="分类名称"
                  className="h-8"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">跳转链接</Label>
                <Input
                  value={cat.link}
                  onChange={e => updateCategory(cat.id, { link: e.target.value })}
                  placeholder="/collections/handle"
                  className="h-8"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
