"use client";

import {
  Button,
  ColorArea,
  ColorField,
  ColorPicker,
  ColorSlider,
  ColorSwatch,
  ColorSwatchPicker,
  Label,
  parseColor,
} from "@heroui/react";
import { Shuffle } from "lucide-react";

const COLOR_PRESETS = [
  "#ef4444",
  "#f97316",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

type BannerColorPickerProps = {
  value: string;
  onChange: (value: string) => void;
  matchedFromIcon?: boolean;
};

export function BannerColorPicker({
  value,
  onChange,
  matchedFromIcon = false,
}: BannerColorPickerProps) {
  const color = parseColor(value || "#325578");

  const shuffleColor = () => {
    const hue = Math.floor(Math.random() * 360);
    onChange(parseColor(`hsl(${hue}, 62%, 42%)`).toString("hex"));
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-default/20 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-foreground">Banner color</p>
        <p className="mt-0.5 text-xs text-muted">
          {matchedFromIcon
            ? "Matched automatically from your icon."
            : "Used when you do not upload a banner image."}
        </p>
      </div>

      <ColorPicker value={color} onChange={(next) => onChange(next.toString("hex"))}>
        <ColorPicker.Trigger className="shrink-0">
          <ColorSwatch size="lg" />
          <Label>{color.toString("hex").toUpperCase()}</Label>
        </ColorPicker.Trigger>
        <ColorPicker.Popover className="gap-2">
          <ColorSwatchPicker className="justify-center pt-2" size="xs">
            {COLOR_PRESETS.map((preset) => (
              <ColorSwatchPicker.Item key={preset} color={preset}>
                <ColorSwatchPicker.Swatch />
              </ColorSwatchPicker.Item>
            ))}
          </ColorSwatchPicker>
          <ColorArea
            aria-label="Banner color area"
            className="max-w-full"
            colorSpace="hsb"
            xChannel="saturation"
            yChannel="brightness"
          >
            <ColorArea.Thumb />
          </ColorArea>
          <div className="flex items-center gap-2 px-1">
            <ColorSlider
              aria-label="Banner hue"
              channel="hue"
              className="flex-1"
              colorSpace="hsb"
            >
              <ColorSlider.Track>
                <ColorSlider.Thumb />
              </ColorSlider.Track>
            </ColorSlider>
            <Button
              isIconOnly
              aria-label="Choose a random banner color"
              size="sm"
              variant="tertiary"
              onPress={shuffleColor}
            >
              <Shuffle className="size-4" />
            </Button>
          </div>
          <ColorField aria-label="Banner color value">
            <ColorField.Group variant="secondary">
              <ColorField.Prefix>
                <ColorSwatch size="xs" />
              </ColorField.Prefix>
              <ColorField.Input />
            </ColorField.Group>
          </ColorField>
        </ColorPicker.Popover>
      </ColorPicker>
    </div>
  );
}
