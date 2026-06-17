import React, { useState } from "react";
import { useThemeConfig, type Slide } from "@/contexts/ThemeConfigContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { GripVertical, Plus, Trash2, Save } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";

const POSITIONS = [
  "top-left", "top-center", "top-right",
  "middle-left", "middle-center", "middle-right",
  "bottom-left", "bottom-center", "bottom-right",
] as const;

const POS_LABELS: Record<string, string> = {
  "top-left": "左上", "top-center": "上中", "top-right": "右上",
  "middle-left": "左中", "middle-center": "居中", "middle-right": "右中",
  "bottom-left": "左下", "bottom-center": "下中", "bottom-right": "右下",
};

function PositionGrid({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-1 w-28">
      {POSITIONS.map(pos => (
        <button
          key={pos}
          onClick={() => onChange(pos)}
          title={POS_LABELS[pos]}
          className={`h-8 w-8 rounded border text-xs transition-colors ${
            value === pos
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border hover:bg-accent"
          }`}
        >
          {POS_LABELS[pos]}
        </button>
      ))}
    </div>
  );
}

export default function HeroPage() {
  const { config, updateConfig, updateSlide, addSlide, removeSlide } = useThemeConfig();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const slides = config.slides ?? [];

  const handleDragStart = (i: number) => setDragIndex(i);
  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === i) return;
    const updated = [...slides];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(i, 0, moved);
    setDragIndex(i);
    updateConfig({ slides: updated });
  };
  const handleDragEnd = () => setDragIndex(null);

  const handleAdd = () => {
    addSlide();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Hero Banner</h1>
          <p className="text-muted-foreground text-sm mt-0.5">编辑首页轮播图</p>
        </div>
        <Button onClick={handleAdd} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-1" /> 添加 Banner
        </Button>
      </div>

      {/* Global Settings */}
      <Card className="mb-4">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-6 items-end">
            <div className="space-y-1.5 flex-1 min-w-[180px]">
              <Label className="text-xs">轮播高度（桌面端 px）</Label>
              <Input
                type="number"
                value={config.heroHeight ?? 600}
                onChange={e => updateConfig({ heroHeight: Number(e.target.value) })}
                className="h-8"
              />
            </div>
            <div className="space-y-1.5 flex-1 min-w-[180px]">
              <Label className="text-xs">自动播放速度（秒）</Label>
              <Input
                type="number"
                value={config.slideshowSpeed ?? 5}
                onChange={e => updateConfig({ slideshowSpeed: Number(e.target.value) })}
                className="h-8"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {slides.map((slide, index) => (
          <Card
            key={slide.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`transition-all ${dragIndex === index ? "opacity-50 scale-[0.98]" : ""}`}
          >
            <CardHeader className="pb-3 pt-4 px-4">
              <div className="flex items-center gap-2">
                <GripVertical className="w-5 h-5 text-muted-foreground cursor-move shrink-0" />
                <CardTitle className="text-sm flex-1">Banner {index + 1}</CardTitle>
                <Button
                  variant="ghost" size="sm"
                  onClick={() => removeSlide(slide.id)}
                  className="text-destructive hover:text-destructive h-8 w-8 p-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 px-4 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">桌面端图片（推荐 1920×800）</Label>
                  <ImageUploader
                    section="hero"
                    slot={`slide_${slide.id}_desktop`}
                    currentUrl={slide.imageUrl}
                    onUploaded={(url) => updateSlide(slide.id, { imageUrl: url })}
                    aspectRatio="16/5"
                    label="上传桌面端图片"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">移动端图片（推荐 750×1000）</Label>
                  <ImageUploader
                    section="hero"
                    slot={`slide_${slide.id}_mobile`}
                    currentUrl={slide.mobileImageUrl}
                    onUploaded={(url) => updateSlide(slide.id, { mobileImageUrl: url })}
                    aspectRatio="3/4"
                    label="上传移动端图片"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">标题</Label>
                  <Input
                    value={slide.title}
                    onChange={e => updateSlide(slide.id, { title: e.target.value })}
                    placeholder="Banner 标题"
                    className="h-8"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">副标题</Label>
                  <Input
                    value={slide.subtitle}
                    onChange={e => updateSlide(slide.id, { subtitle: e.target.value })}
                    placeholder="Banner 副标题"
                    className="h-8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">按钮文本</Label>
                  <Input
                    value={slide.buttonLabel}
                    onChange={e => updateSlide(slide.id, { buttonLabel: e.target.value })}
                    placeholder="如: Shop Now"
                    className="h-8"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">按钮链接</Label>
                  <Input
                    value={slide.buttonLink}
                    onChange={e => updateSlide(slide.id, { buttonLink: e.target.value })}
                    placeholder="/collections/all"
                    className="h-8"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-6 items-start">
                <div className="space-y-1.5">
                  <Label className="text-xs">Text Position (Desktop)</Label>
                  <PositionGrid
                    value={slide.contentPosition ?? "middle-center"}
                    onChange={(v) => updateSlide(slide.id, { contentPosition: v })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Text Position (Mobile)</Label>
                  <PositionGrid
                    value={slide.contentPositionMobile ?? slide.contentPosition ?? "middle-center"}
                    onChange={(v) => updateSlide(slide.id, { contentPositionMobile: v })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Text Color Mode</Label>
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => updateSlide(slide.id, { textColorMode: 'light' })}
                      className={`px-3 py-1.5 rounded border text-xs font-medium transition-colors ${
                        (slide.textColorMode ?? 'light') === 'light'
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Light (White Text)
                    </button>
                    <button
                      onClick={() => updateSlide(slide.id, { textColorMode: 'dark' })}
                      className={`px-3 py-1.5 rounded border text-xs font-medium transition-colors ${
                        slide.textColorMode === 'dark'
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Dark (Black Text)
                    </button>
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
