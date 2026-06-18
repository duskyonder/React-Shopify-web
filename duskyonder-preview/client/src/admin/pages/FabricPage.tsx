import React from "react";
import { useThemeConfig, type Fabric } from "@/contexts/ThemeConfigContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

export default function FabricPage() {
  const { config, updateConfig, updateFabric, addFabric, removeFabric } =
    useThemeConfig();
  const fabrics = config.fabrics ?? [];

  const handleAdd = () => {
    addFabric();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">面料板块</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            管理首页面料特性展示
          </p>
        </div>
        <Button onClick={handleAdd} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-1" /> 添加面料
        </Button>
      </div>

      {/* Global Settings */}
      <Card className="mb-4">
        <CardContent className="pt-4 pb-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">板块标题</Label>
              <Input
                value={config.fabricTitle ?? ""}
                onChange={e => updateConfig({ fabricTitle: e.target.value })}
                placeholder="Our Fabrics"
                className="h-8"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">每行显示数量</Label>
              <Select
                value={String(config.fabricsPerRow ?? 3)}
                onValueChange={v => updateConfig({ fabricsPerRow: Number(v) })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map(n => (
                    <SelectItem key={n} value={String(n)}>
                      {n} 列
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fabrics.map(fabric => (
          <Card key={fabric.id}>
            <CardContent className="pt-4 pb-4 px-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {fabric.title || "未命名"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFabric(fabric.id)}
                  className="text-destructive hover:text-destructive h-8 w-8 p-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">图标（Emoji 或文字）</Label>
                <Input
                  value={fabric.icon}
                  onChange={e =>
                    updateFabric(fabric.id, { icon: e.target.value })
                  }
                  placeholder="✨"
                  className="h-8"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">标题</Label>
                <Input
                  value={fabric.title}
                  onChange={e =>
                    updateFabric(fabric.id, { title: e.target.value })
                  }
                  placeholder="面料名称"
                  className="h-8"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">描述</Label>
                <Textarea
                  value={fabric.description}
                  onChange={e =>
                    updateFabric(fabric.id, { description: e.target.value })
                  }
                  placeholder="面料特性描述"
                  rows={3}
                  className="text-sm resize-none"
                />
              </div>
            </CardContent>
          </Card>
        ))}
        {fabrics.length === 0 && (
          <div className="col-span-2 text-center py-12 text-muted-foreground text-sm border rounded-lg border-dashed">
            暂无面料，点击"添加面料"开始
          </div>
        )}
      </div>
    </div>
  );
}
