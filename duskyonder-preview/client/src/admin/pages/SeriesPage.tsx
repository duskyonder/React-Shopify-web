import React, { useState } from "react";
import { useThemeConfig, type CollectionSeries } from "@/contexts/ThemeConfigContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";

export default function SeriesPage() {
  const { config, updateConfig, updateSeries, addSeries, removeSeries } = useThemeConfig();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const seriesList = config.seriesList ?? [];

  const handleDragStart = (i: number) => setDragIndex(i);
  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === i) return;
    const updated = [...seriesList];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(i, 0, moved);
    setDragIndex(i);
    updateConfig({ seriesList: updated });
  };
  const handleDragEnd = () => setDragIndex(null);

  const handleAdd = () => {
    addSeries();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">系列板块</h1>
          <p className="text-muted-foreground text-sm mt-0.5">管理首页系列展示</p>
        </div>
        <Button onClick={handleAdd} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-1" /> 添加系列
        </Button>
      </div>

      {/* Global Settings */}
      <Card className="mb-4">
        <CardContent className="pt-4 pb-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">板块大标题</Label>
              <Input
                value={config.seriesHeadline ?? ""}
                onChange={e => updateConfig({ seriesHeadline: e.target.value })}
                placeholder="Our Collections"
                className="h-8"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">板块副标题</Label>
              <Input
                value={config.seriesSubheadline ?? ""}
                onChange={e => updateConfig({ seriesSubheadline: e.target.value })}
                placeholder="副标题"
                className="h-8"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {seriesList.map((series, index) => (
          <Card
            key={series.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`transition-all ${dragIndex === index ? "opacity-50 scale-[0.98]" : ""}`}
          >
            <CardContent className="pt-4 pb-4 px-4 space-y-3">
              <div className="flex items-center gap-2">
                <GripVertical className="w-5 h-5 text-muted-foreground cursor-move shrink-0" />
                <span className="text-sm font-medium flex-1">{series.name || "未命名系列"}</span>
                <Button
                  variant="ghost" size="sm"
                  onClick={() => removeSeries(series.id)}
                  className="text-destructive hover:text-destructive h-8 w-8 p-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ImageUploader
                  section="series"
                  slot={`series_${series.id}`}
                  currentUrl={series.imageUrl}
                  onUploaded={(url) => updateSeries(series.id, { imageUrl: url })}
                  aspectRatio="4/5"
                  label="上传系列图片"
                />
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">标签（小字）</Label>
                    <Input
                      value={series.label ?? ""}
                      onChange={e => updateSeries(series.id, { label: e.target.value })}
                      placeholder="如: NEW ARRIVAL"
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">系列名称</Label>
                    <Input
                      value={series.name}
                      onChange={e => updateSeries(series.id, { name: e.target.value })}
                      placeholder="系列名称"
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">描述</Label>
                    <Textarea
                      value={series.description ?? ""}
                      onChange={e => updateSeries(series.id, { description: e.target.value })}
                      placeholder="系列描述"
                      rows={3}
                      className="text-sm resize-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">跳转链接</Label>
                    <Input
                      value={series.link ?? ""}
                      onChange={e => updateSeries(series.id, { link: e.target.value })}
                      placeholder="/collections/handle"
                      className="h-8"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {seriesList.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm border rounded-lg border-dashed">
            暂无系列，点击"添加系列"开始
          </div>
        )}
      </div>
    </div>
  );
}
