import React, { useState } from "react";
import { useThemeConfig, type Slide } from "@/contexts/ThemeConfigContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";

// ── Alignment button group ──────────────────────────────────────────────────
type FlexValue = "flex-start" | "center" | "flex-end";

function AlignGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: FlexValue;
  options: { value: FlexValue; label: string }[];
  onChange: (v: FlexValue) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="flex gap-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-2.5 py-1 rounded border text-xs font-medium transition-colors ${
              value === opt.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted hover:bg-accent border-border"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const JUSTIFY_OPTIONS: { value: FlexValue; label: string }[] = [
  { value: "flex-start", label: "Top" },
  { value: "center",     label: "Middle" },
  { value: "flex-end",   label: "Bottom" },
];

const ALIGN_OPTIONS: { value: FlexValue; label: string }[] = [
  { value: "flex-start", label: "Left" },
  { value: "center",     label: "Center" },
  { value: "flex-end",   label: "Right" },
];

// ── Small numeric input ─────────────────────────────────────────────────────
function NumInput({
  label,
  value,
  onChange,
  unit = "",
  min,
  max,
  step = 1,
  placeholder,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}{unit ? ` (${unit})` : ""}</Label>
      <Input
        type="number"
        value={value ?? ""}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder ?? "—"}
        onChange={(e) => {
          const raw = e.target.value;
          onChange(raw === "" ? undefined : Number(raw));
        }}
        className="h-8 text-xs"
      />
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────
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

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Hero Banner</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Edit homepage slideshow</p>
        </div>
        <Button onClick={addSlide} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-1" /> Add Banner
        </Button>
      </div>

      {/* Global Settings */}
      <Card className="mb-4">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-6 items-end">
            <div className="space-y-1.5 flex-1 min-w-[180px]">
              <Label className="text-xs">Hero Height — Desktop (px)</Label>
              <Input
                type="number"
                value={config.heroHeight ?? 600}
                onChange={e => updateConfig({ heroHeight: Number(e.target.value) })}
                className="h-8"
              />
            </div>
            <div className="space-y-1.5 flex-1 min-w-[180px]">
              <Label className="text-xs">Autoplay Speed (seconds)</Label>
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
            <CardContent className="space-y-5 px-4 pb-4">

              {/* ── Images ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Desktop Image (1920×800 recommended)</Label>
                  <ImageUploader
                    section="hero"
                    slot={`slide_${slide.id}_desktop`}
                    currentUrl={slide.imageUrl}
                    onUploaded={(url) => updateSlide(slide.id, { imageUrl: url })}
                    onClear={() => updateSlide(slide.id, { imageUrl: "" })}
                    aspectRatio="16/5"
                    label="Upload desktop image"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Mobile Image (750×1000 recommended)</Label>
                  <ImageUploader
                    section="hero"
                    slot={`slide_${slide.id}_mobile`}
                    currentUrl={slide.mobileImageUrl}
                    onUploaded={(url) => updateSlide(slide.id, { mobileImageUrl: url })}
                    onClear={() => updateSlide(slide.id, { mobileImageUrl: "" })}
                    aspectRatio="3/4"
                    label="Upload mobile image"
                  />
                </div>
              </div>

              {/* ── Text Content ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Title</Label>
                  <Input
                    value={slide.title}
                    onChange={e => updateSlide(slide.id, { title: e.target.value })}
                    placeholder="Banner title"
                    className="h-8"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Subtitle</Label>
                  <Input
                    value={slide.subtitle}
                    onChange={e => updateSlide(slide.id, { subtitle: e.target.value })}
                    placeholder="Banner subtitle"
                    className="h-8"
                  />
                </div>
              </div>

              {/* ── Button ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Button Text</Label>
                  <Input
                    value={slide.buttonLabel}
                    onChange={e => updateSlide(slide.id, { buttonLabel: e.target.value })}
                    placeholder="e.g. Shop Now"
                    className="h-8"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Button Link</Label>
                  <Input
                    value={slide.buttonLink}
                    onChange={e => updateSlide(slide.id, { buttonLink: e.target.value })}
                    placeholder="/collections/all"
                    className="h-8"
                  />
                </div>
              </div>

              {/* ── Text Color Mode ── */}
              <div className="flex flex-wrap gap-6 items-start">
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

              {/* ── Layout Controls ── */}
              <div className="rounded-lg border border-dashed border-border p-4 space-y-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Layout Controls</p>

                <div className="flex flex-wrap gap-6">
                  <AlignGroup
                    label="Vertical Position (justify-content)"
                    value={(slide.justifyContent as FlexValue) ?? "center"}
                    options={JUSTIFY_OPTIONS}
                    onChange={(v) => updateSlide(slide.id, { justifyContent: v })}
                  />
                  <AlignGroup
                    label="Horizontal Position (align-items)"
                    value={(slide.alignItems as FlexValue) ?? "center"}
                    options={ALIGN_OPTIONS}
                    onChange={(v) => updateSlide(slide.id, { alignItems: v })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <NumInput
                    label="Horizontal Offset"
                    unit="%"
                    value={slide.horizontalOffset}
                    onChange={(v) => updateSlide(slide.id, { horizontalOffset: v })}
                    min={-50} max={50} step={1}
                    placeholder="0"
                  />
                  <NumInput
                    label="Vertical Offset"
                    unit="%"
                    value={slide.verticalOffset}
                    onChange={(v) => updateSlide(slide.id, { verticalOffset: v })}
                    min={-50} max={50} step={1}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* ── Typography Overrides ── */}
              <div className="rounded-lg border border-dashed border-border p-4 space-y-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Typography Overrides</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <NumInput
                    label="Title Font Size"
                    unit="px"
                    value={slide.titleFontSize}
                    onChange={(v) => updateSlide(slide.id, { titleFontSize: v })}
                    min={8} max={200} step={1}
                    placeholder="default"
                  />
                  <NumInput
                    label="Title Letter Spacing"
                    unit="×0.01em"
                    value={slide.titleLetterSpacing}
                    onChange={(v) => updateSlide(slide.id, { titleLetterSpacing: v })}
                    min={-10} max={50} step={1}
                    placeholder="default"
                  />
                  <NumInput
                    label="Subtitle Font Size"
                    unit="px"
                    value={slide.subtitleFontSize}
                    onChange={(v) => updateSlide(slide.id, { subtitleFontSize: v })}
                    min={8} max={100} step={1}
                    placeholder="default"
                  />
                  <NumInput
                    label="Subtitle Letter Spacing"
                    unit="×0.01em"
                    value={slide.subtitleLetterSpacing}
                    onChange={(v) => updateSlide(slide.id, { subtitleLetterSpacing: v })}
                    min={-10} max={50} step={1}
                    placeholder="default"
                  />
                </div>
              </div>

              {/* ── Button Size ── */}
              <div className="rounded-lg border border-dashed border-border p-4 space-y-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Button Size</p>
                <div className="grid grid-cols-2 gap-4">
                  <NumInput
                    label="Button Horizontal Padding"
                    unit="px"
                    value={slide.buttonPaddingX}
                    onChange={(v) => updateSlide(slide.id, { buttonPaddingX: v })}
                    min={0} max={120} step={2}
                    placeholder="default"
                  />
                  <NumInput
                    label="Button Vertical Padding"
                    unit="px"
                    value={slide.buttonPaddingY}
                    onChange={(v) => updateSlide(slide.id, { buttonPaddingY: v })}
                    min={0} max={60} step={2}
                    placeholder="default"
                  />
                </div>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
