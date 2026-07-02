import React, { useState } from "react";
import { useThemeConfig } from "@/contexts/ThemeConfigContext";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { GripVertical, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import type { SectionConfig, SectionKey } from "@/contexts/ThemeConfigContext";

export default function SectionsPage() {
  const { config, updateConfig, addFeaturedSection, removeFeaturedSection } = useThemeConfig();
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const sections = config.sectionOrder ?? [];
  const featuredInstances = config.featuredInstances ?? [];

  const save = (updated: SectionConfig[]) => {
    updateConfig({ sectionOrder: updated });
  };

  const toggleVisibility = (index: number) => {
    const updated = sections.map((s, i) =>
      i === index ? { ...s, visible: !s.visible } : s
    );
    save(updated);
  };

  const handleDragStart = (index: number) => setDragIndex(index);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const updated = [...sections];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, moved);
    setDragIndex(index);
    // optimistic update (no save yet)
    updateConfig({ sectionOrder: updated });
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  const handleAddFeatured = () => {
    addFeaturedSection();
  };

  const handleRemoveFeatured = (section: SectionConfig) => {
    if (section.instanceId) {
      removeFeaturedSection(section.instanceId);
    }
  };

  const getSectionLabel = (s: SectionConfig) => {
    const labelMap: Record<string, string> = {
      hero: "Hero Banner",
      marquee: "滚动字幕",
      categories: "分类板块",
      featured: "产品板块",
      videos: "视频板块",
      series: "系列板块",
      fabric: "面料板块",
      newsletter: "订阅弹窗",
    };
    return s.label || labelMap[s.key] || s.key;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">首页板块管理</h1>
          <p className="text-muted-foreground text-sm mt-0.5">拖拽排序，控制各板块的显示与隐藏</p>
        </div>
        <Button onClick={handleAddFeatured} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-1" /> 添加产品板块
        </Button>
      </div>

      <div className="space-y-2">
        {sections.map((section, index) => (
          <Card
            key={`${section.key}-${section.instanceId ?? index}`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`cursor-move transition-all border ${
              dragIndex === index ? "opacity-50 scale-[0.98]" : ""
            } ${!section.visible ? "opacity-60" : ""}`}
          >
            <CardContent className="flex items-center gap-3 py-3 px-4">
              <GripVertical className="w-5 h-5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="font-medium text-sm">{getSectionLabel(section)}</span>
                {section.instanceId && (() => {
                  const inst = featuredInstances.find(f => f.id === section.instanceId);
                  const tagLabel = inst?.tag?.trim();
                  return tagLabel
                    ? <span className="ml-2 text-xs text-muted-foreground">— {tagLabel}</span>
                    : <span className="ml-2 text-xs text-muted-foreground">#{section.instanceId.slice(-4)}</span>;
                })()}
              </div>
              <div className="flex items-center gap-2">
                {section.visible
                  ? <Eye className="w-4 h-4 text-muted-foreground" />
                  : <EyeOff className="w-4 h-4 text-muted-foreground" />
                }
                <Switch
                  checked={section.visible}
                  onCheckedChange={() => toggleVisibility(index)}
                />
                {section.key === "featured" && sections.filter(s => s.key === "featured").length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFeatured(section)}
                    className="text-destructive hover:text-destructive h-8 w-8 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
