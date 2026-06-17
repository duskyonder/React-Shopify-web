import React, { useState } from "react";
import { useThemeConfig, type FooterColumn, type FooterLink, type SocialLinks } from "@/contexts/ThemeConfigContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GripVertical, Plus, Trash2 } from "lucide-react";

export default function FooterPage() {
  const { config, updateConfig } = useThemeConfig();
  const columns: FooterColumn[] = config.footerColumns ?? [];
  const socialLinks: SocialLinks = config.socialLinks ?? { youtube: "", facebook: "", instagram: "", pinterest: "", twitter: "", tiktok: "" };

  const saveColumns = (updated: FooterColumn[]) => updateConfig({ footerColumns: updated });

  // ---- Column operations ----
  const addColumn = () => {
    saveColumns([...columns, { id: `col_${Date.now()}`, title: "New Column", links: [] }]);
  };

  const removeColumn = (colId: string) => {
    saveColumns(columns.filter(c => c.id !== colId));
  };

  const updateColumnTitle = (colId: string, title: string) => {
    saveColumns(columns.map(c => c.id === colId ? { ...c, title } : c));
  };

  // ---- Link operations ----
  const addLink = (colId: string) => {
    saveColumns(columns.map(c => c.id === colId
      ? { ...c, links: [...c.links, { id: `link_${Date.now()}`, label: "New Link", link: "/" }] }
      : c
    ));
  };

  const removeLink = (colId: string, linkId: string) => {
    saveColumns(columns.map(c => c.id === colId
      ? { ...c, links: c.links.filter(l => l.id !== linkId) }
      : c
    ));
  };

  const updateLink = (colId: string, linkId: string, field: keyof FooterLink, value: string) => {
    saveColumns(columns.map(c => c.id === colId
      ? { ...c, links: c.links.map(l => l.id === linkId ? { ...l, [field]: value } : l) }
      : c
    ));
  };

  // ---- Drag-sort links within a column ----
  const [dragState, setDragState] = useState<{ colId: string; index: number } | null>(null);

  const handleLinkDragStart = (colId: string, index: number) => setDragState({ colId, index });

  const handleLinkDragOver = (e: React.DragEvent, colId: string, index: number) => {
    e.preventDefault();
    if (!dragState || dragState.colId !== colId || dragState.index === index) return;
    const col = columns.find(c => c.id === colId);
    if (!col) return;
    const updated = [...col.links];
    const [moved] = updated.splice(dragState.index, 1);
    updated.splice(index, 0, moved);
    setDragState({ colId, index });
    saveColumns(columns.map(c => c.id === colId ? { ...c, links: updated } : c));
  };

  // ---- Social links ----
  const updateSocial = (platform: keyof SocialLinks, value: string) => {
    updateConfig({ socialLinks: { ...socialLinks, [platform]: value } });
  };

  const socialPlatforms: (keyof SocialLinks)[] = ["instagram", "tiktok", "youtube", "facebook", "pinterest", "twitter"];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">页脚</h1>
          <p className="text-muted-foreground text-sm mt-0.5">管理页脚导航列和社交链接</p>
        </div>
        <Button onClick={addColumn} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-1" /> 添加导航列
        </Button>
      </div>

      {/* Copyright */}
      <Card>
        <CardContent className="pt-4 pb-4 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">版权文字</Label>
            <Input
              value={config.footerCopyright ?? ""}
              onChange={e => updateConfig({ footerCopyright: e.target.value })}
              placeholder="© 2024 Dusk Yonder. All rights reserved."
              className="h-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation Columns */}
      {columns.map((col) => (
        <Card key={col.id}>
          <CardHeader className="pb-3 pt-4 px-4">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm flex-1">
                <Input
                  value={col.title}
                  onChange={e => updateColumnTitle(col.id, e.target.value)}
                  placeholder="列标题"
                  className="h-7 text-sm font-medium"
                />
              </CardTitle>
              <Button
                variant="ghost" size="sm"
                onClick={() => removeColumn(col.id)}
                className="text-destructive hover:text-destructive h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            {col.links.map((link, i) => (
              <div
                key={link.id}
                draggable
                onDragStart={() => handleLinkDragStart(col.id, i)}
                onDragOver={(e) => handleLinkDragOver(e, col.id, i)}
                onDragEnd={() => setDragState(null)}
                className={`flex items-center gap-2 p-2 rounded-lg border bg-background transition-all ${
                  dragState?.colId === col.id && dragState.index === i ? "opacity-50" : ""
                }`}
              >
                <GripVertical className="w-4 h-4 text-muted-foreground shrink-0 cursor-move" />
                <Input
                  value={link.label}
                  onChange={e => updateLink(col.id, link.id, "label", e.target.value)}
                  placeholder="链接文本"
                  className="h-7 text-sm flex-1"
                />
                <Input
                  value={link.link}
                  onChange={e => updateLink(col.id, link.id, "link", e.target.value)}
                  placeholder="/path"
                  className="h-7 text-sm flex-1"
                />
                <Button
                  variant="ghost" size="sm"
                  onClick={() => removeLink(col.id, link.id)}
                  className="text-destructive hover:text-destructive h-7 w-7 p-0 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
            <Button
              variant="ghost" size="sm"
              onClick={() => addLink(col.id)}
              className="h-8 w-full border border-dashed text-muted-foreground hover:text-foreground"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> 添加链接
            </Button>
          </CardContent>
        </Card>
      ))}

      {columns.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm border rounded-lg border-dashed">
          暂无导航列，点击"添加导航列"开始
        </div>
      )}

      {/* Social Links */}
      <Card>
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="text-sm">社交媒体链接</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {socialPlatforms.map(platform => (
              <div key={platform} className="space-y-1.5">
                <Label className="text-xs capitalize">{platform}</Label>
                <Input
                  value={socialLinks[platform] ?? ""}
                  onChange={e => updateSocial(platform, e.target.value)}
                  placeholder={`https://${platform}.com/...`}
                  className="h-8"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
