import React from "react";
import { useThemeConfig } from "@/contexts/ThemeConfigContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";

export default function MarqueePage() {
  const { config, updateConfig, updateMarqueeItem, addMarqueeItem, removeMarqueeItem } = useThemeConfig();

  const items = config.marqueeItems ?? [];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">滚动字幕</h1>
          <p className="text-muted-foreground text-sm mt-0.5">首页滚动 Marquee 条幅</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => addMarqueeItem("text")} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-1" /> 添加文字
          </Button>
          <Button onClick={() => addMarqueeItem("image")} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-1" /> 添加图片
          </Button>
        </div>
      </div>

      {/* Global settings */}
      <Card className="mb-4">
        <CardContent className="pt-4 pb-4 space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              checked={config.showMarquee ?? true}
              onCheckedChange={(v) => updateConfig({ showMarquee: v })}
            />
            <Label className="text-sm">显示滚动字幕</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">滚动速度（秒/循环）</Label>
              <Input
                type="number"
                value={config.marqueeSpeed ?? 20}
                onChange={e => updateConfig({ marqueeSpeed: Number(e.target.value) })}
                className="h-8"
                min={5}
                max={120}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">滚动方向</Label>
              <Select
                value={config.marqueeDirection ?? "left"}
                onValueChange={(v) => updateConfig({ marqueeDirection: v as "left" | "right" })}
              >
                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">向左</SelectItem>
                  <SelectItem value="right">向右</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">背景颜色</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={config.marqueeBg ?? "#f5f0eb"}
                  onChange={e => updateConfig({ marqueeBg: e.target.value })}
                  className="w-8 h-8 rounded border cursor-pointer"
                />
                <Input
                  value={config.marqueeBg ?? "#f5f0eb"}
                  onChange={e => updateConfig({ marqueeBg: e.target.value })}
                  className="h-8 flex-1 font-mono text-xs"
                  placeholder="#f5f0eb"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">文字颜色</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={config.marqueeColor ?? "#175C40"}
                  onChange={e => updateConfig({ marqueeColor: e.target.value })}
                  className="w-8 h-8 rounded border cursor-pointer"
                />
                <Input
                  value={config.marqueeColor ?? "#175C40"}
                  onChange={e => updateConfig({ marqueeColor: e.target.value })}
                  className="h-8 flex-1 font-mono text-xs"
                  placeholder="#175C40"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items list */}
      <div className="space-y-2">
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex items-start gap-3 py-3 px-4">
              <GripVertical className="w-5 h-5 text-muted-foreground shrink-0 mt-2" />

              <div className="flex-1 space-y-2">
                {item.type === "text" ? (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">文字内容</Label>
                    <Input
                      value={item.text ?? ""}
                      onChange={e => updateMarqueeItem(item.id, { text: e.target.value })}
                      placeholder="输入滚动文字…"
                      className="h-8 text-sm"
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">图片</Label>
                    <ImageUploader
                      section="marquee"
                      slot={item.id}
                      currentUrl={item.imageUrl}
                      onUploaded={(url) => updateMarqueeItem(item.id, { imageUrl: url })}
                      onClear={() => updateMarqueeItem(item.id, { imageUrl: undefined })}
                      aspectRatio="3/1"
                      label="上传图片"
                    />
                  </div>
                )}
                <span className="inline-block text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {item.type === "text" ? "文字" : "图片"}
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeMarqueeItem(item.id)}
                className="text-destructive hover:text-destructive h-8 w-8 p-0 shrink-0 mt-1"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}

        {items.length === 0 && (
          <div className="text-center py-10 text-muted-foreground text-sm border rounded-lg border-dashed">
            暂无条目，点击"添加文字"或"添加图片"开始
          </div>
        )}
      </div>
    </div>
  );
}
