import React from "react";
import { useThemeConfig } from "@/contexts/ThemeConfigContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { GripVertical, Plus, Trash2 } from "lucide-react";

export default function PromoBarPage() {
  const {
    config,
    updateConfig,
    updatePromoItem,
    addPromoItem,
    removePromoItem,
  } = useThemeConfig();
  const items = config.marqueeItems?.filter(i => i.type === "text") ?? [];

  // PromoBar uses showPromoBar + promoBarItems (separate from marquee)
  const promoItems = (config as any).promoBarItems ?? [];
  const showPromoBar = (config as any).showPromoBar ?? true;
  const promoSpeed = (config as any).promoBarSpeed ?? 4;

  const updatePromo = (updates: Record<string, unknown>) => {
    updateConfig(updates as any);
  };

  const addItem = () => {
    const newItems = [
      ...promoItems,
      { id: `promo_${Date.now()}`, text: "New announcement", link: "" },
    ];
    updatePromo({ promoBarItems: newItems });
  };

  const removeItem = (id: string) => {
    updatePromo({ promoBarItems: promoItems.filter((i: any) => i.id !== id) });
  };

  const updateItem = (id: string, field: string, value: string) => {
    updatePromo({
      promoBarItems: promoItems.map((i: any) =>
        i.id === id ? { ...i, [field]: value } : i
      ),
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">促销栏</h1>
          <p className="text-muted-foreground text-sm mt-0.5">顶部滚动公告栏</p>
        </div>
        <Button onClick={addItem} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-1" /> 添加条目
        </Button>
      </div>

      <Card className="mb-4">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-6 items-center">
            <div className="flex items-center gap-2">
              <Switch
                checked={showPromoBar}
                onCheckedChange={v => updatePromo({ showPromoBar: v })}
              />
              <Label className="text-sm">显示促销栏</Label>
            </div>
            <div className="space-y-1.5 flex-1 min-w-[160px]">
              <Label className="text-xs">滚动速度（秒/条目）</Label>
              <Input
                type="number"
                value={promoSpeed}
                onChange={e =>
                  updatePromo({ promoBarSpeed: Number(e.target.value) })
                }
                className="h-8"
                min={1}
                max={20}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {promoItems.map((item: any, index: number) => (
          <Card key={item.id}>
            <CardContent className="flex items-center gap-3 py-3 px-4">
              <GripVertical className="w-5 h-5 text-muted-foreground shrink-0" />
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                <Input
                  value={item.text}
                  onChange={e => updateItem(item.id, "text", e.target.value)}
                  placeholder="公告文本"
                  className="h-8 text-sm"
                />
                <Input
                  value={item.link ?? ""}
                  onChange={e => updateItem(item.id, "link", e.target.value)}
                  placeholder="链接（可选）"
                  className="h-8 text-sm"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(item.id)}
                className="text-destructive hover:text-destructive h-8 w-8 p-0 shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {promoItems.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm border rounded-lg border-dashed">
            暂无条目，点击"添加条目"开始
          </div>
        )}
      </div>
    </div>
  );
}
