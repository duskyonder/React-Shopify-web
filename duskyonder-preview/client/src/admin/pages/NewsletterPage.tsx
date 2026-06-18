import React, { useState } from "react";
import { useThemeConfig } from "@/contexts/ThemeConfigContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import ImageUploader from "@/components/ImageUploader";
import { Mail, Eye } from "lucide-react";

const PAGE_OPTIONS = [
  { value: "home", label: "首页" },
  { value: "products", label: "产品列表页" },
  { value: "product", label: "产品详情页" },
  { value: "collections", label: "系列页" },
  { value: "about", label: "关于我们" },
  { value: "all", label: "所有页面" },
];

export default function NewsletterPage() {
  const { config, updateConfig } = useThemeConfig();
  const [previewTheme, setPreviewTheme] = useState<"dark-green" | "cream">(
    config.newsletterTheme ?? "dark-green"
  );

  const newsletterPages: string[] = (config as any).newsletterPages ?? ["home"];

  const togglePage = (page: string) => {
    if (page === "all") {
      updateConfig({ newsletterPages: ["all"] } as any);
      return;
    }
    const current = newsletterPages.filter(p => p !== "all");
    if (current.includes(page)) {
      const next = current.filter(p => p !== page);
      updateConfig({ newsletterPages: next.length ? next : ["home"] } as any);
    } else {
      updateConfig({ newsletterPages: [...current, page] } as any);
    }
  };

  const isDark = previewTheme === "dark-green";
  const bgColor = isDark ? "#0D3D2B" : "#F5F0E8";
  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const mutedColor = isDark ? "rgba(255,255,255,0.6)" : "#555";
  const btnBg = isDark ? "#FFFFFF" : "#0D3D2B";
  const btnColor = isDark ? "#0D3D2B" : "#FFFFFF";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">订阅弹框</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            邮件订阅弹窗设置
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={config.enableNewsletter}
            onCheckedChange={v => updateConfig({ enableNewsletter: v })}
          />
          <Label className="text-sm">启用弹框</Label>
        </div>
      </div>

      {/* 基本内容 */}
      <Card className="mb-4">
        <CardContent className="pt-4 pb-4 space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            内容
          </h3>
          <div className="space-y-1.5">
            <Label className="text-xs">标题</Label>
            <Input
              value={config.newsletterTitle}
              onChange={e => updateConfig({ newsletterTitle: e.target.value })}
              placeholder="Join the Club"
              className="h-8"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">正文</Label>
            <Textarea
              value={config.newsletterText}
              onChange={e => updateConfig({ newsletterText: e.target.value })}
              placeholder="Subscribe to receive updates..."
              rows={3}
              className="text-sm resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">社交证明文字（可选）</Label>
            <Input
              value={config.newsletterSocialProof ?? ""}
              onChange={e =>
                updateConfig({ newsletterSocialProof: e.target.value })
              }
              placeholder="Join 10,000+ members who move with purpose"
              className="h-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* 外观设置 */}
      <Card className="mb-4">
        <CardContent className="pt-4 pb-4 space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            外观
          </h3>

          {/* 配色切换 */}
          <div className="space-y-2">
            <Label className="text-xs">配色方案</Label>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  updateConfig({ newsletterTheme: "dark-green" });
                  setPreviewTheme("dark-green");
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                  config.newsletterTheme === "dark-green" ||
                  !config.newsletterTheme
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground"
                }`}
              >
                <span
                  className="w-4 h-4 rounded-full border border-white/20"
                  style={{ background: "#0D3D2B" }}
                />
                深绿色
              </button>
              <button
                onClick={() => {
                  updateConfig({ newsletterTheme: "cream" });
                  setPreviewTheme("cream");
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                  config.newsletterTheme === "cream"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground"
                }`}
              >
                <span
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ background: "#F5F0E8" }}
                />
                米白色
              </button>
            </div>
          </div>

          {/* 左侧图片 */}
          <div className="space-y-1.5">
            <Label className="text-xs">左侧图片（可选）</Label>
            <ImageUploader
              section="newsletter"
              slot="image"
              currentUrl={config.newsletterImageUrl}
              onUploaded={url => updateConfig({ newsletterImageUrl: url })}
              aspectRatio="3/4"
              label="上传图片"
            />
            {config.newsletterImageUrl && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive h-7 text-xs mt-1"
                onClick={() => updateConfig({ newsletterImageUrl: undefined })}
              >
                移除图片
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 触发设置 */}
      <Card className="mb-4">
        <CardContent className="pt-4 pb-4 space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            触发设置
          </h3>

          {/* 延迟时间 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">延迟出现时间</Label>
              <span className="text-xs text-muted-foreground font-mono">
                {config.newsletterDelay} 秒
              </span>
            </div>
            <Slider
              value={[config.newsletterDelay]}
              onValueChange={([v]) => updateConfig({ newsletterDelay: v })}
              min={0}
              max={30}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>立即显示</span>
              <span>30 秒</span>
            </div>
          </div>

          {/* 出现页面 */}
          <div className="space-y-2">
            <Label className="text-xs">在哪些页面显示</Label>
            <div className="flex flex-wrap gap-2">
              {PAGE_OPTIONS.map(opt => {
                const isAll = opt.value === "all";
                const checked = isAll
                  ? newsletterPages.includes("all")
                  : !newsletterPages.includes("all") &&
                    newsletterPages.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => togglePage(opt.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      checked
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border hover:border-muted-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 实时预览 */}
      <Card className="mb-4">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              预览
            </h3>
          </div>
          <div
            className="rounded-xl overflow-hidden shadow-lg"
            style={{
              background: bgColor,
              display: "flex",
              minHeight: "200px",
              maxWidth: "480px",
              margin: "0 auto",
            }}
          >
            {/* Left image panel */}
            <div
              style={{
                width: "40%",
                background: isDark
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "200px",
                overflow: "hidden",
              }}
            >
              {config.newsletterImageUrl ? (
                <img
                  src={config.newsletterImageUrl}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <Mail
                  style={{
                    width: 32,
                    height: 32,
                    color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)",
                  }}
                />
              )}
            </div>
            {/* Right content panel */}
            <div
              style={{
                flex: 1,
                padding: "20px 16px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div
                style={{
                  fontSize: "9px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: isDark ? "rgba(255,255,255,0.5)" : "#175C40",
                  borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : "#175C40"}`,
                  paddingBottom: "4px",
                  marginBottom: "2px",
                  display: "inline-block",
                  width: "fit-content",
                }}
              >
                DUSKYONDER
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: textColor,
                  lineHeight: 1.3,
                }}
              >
                {config.newsletterTitle || "Join the Club"}
              </div>
              <div
                style={{ fontSize: "10px", color: mutedColor, lineHeight: 1.5 }}
              >
                {config.newsletterText || "Subscribe to receive updates..."}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "4px",
                  marginTop: "4px",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: "24px",
                    borderRadius: "4px",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.2)" : "#ccc"}`,
                    background: isDark ? "rgba(255,255,255,0.08)" : "#fff",
                  }}
                />
                <div
                  style={{
                    padding: "0 8px",
                    height: "24px",
                    borderRadius: "4px",
                    background: btnBg,
                    color: btnColor,
                    fontSize: "9px",
                    display: "flex",
                    alignItems: "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  Join →
                </div>
              </div>
              {config.newsletterSocialProof && (
                <div style={{ fontSize: "9px", color: mutedColor }}>
                  ★ {config.newsletterSocialProof}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
