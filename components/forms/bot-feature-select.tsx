"use client";

import type { Key } from "@heroui/react";
import { Card, Chip, CloseButton, Description, Label, ListBox, Select, Tooltip, toast } from "@heroui/react";
import { CircleHelp } from "lucide-react";

import { BOT_FEATURE_OPTIONS, MAX_BOT_FEATURES } from "@/lib/data/bot-features";

export function BotFeatureSelect({ value, onChange }: { value: string[]; onChange: (features: string[]) => void }) {
  const selected = BOT_FEATURE_OPTIONS.filter((option) => value.includes(option.id));

  return (
    <Card className="nexus-card-elevated gap-4">
      <Card.Header>
        <div className="flex items-center gap-2">
          <Card.Title>Bot Features &amp; Capabilities</Card.Title>
          <Tooltip>
            <Tooltip.Trigger aria-label="About bot features" className="rounded-full text-muted outline-none hover:text-accent focus-visible:ring-2 focus-visible:ring-accent">
              <CircleHelp className="size-4" />
            </Tooltip.Trigger>
            <Tooltip.Content>Selected features appear on the bot card and public page.</Tooltip.Content>
          </Tooltip>
        </div>
        <Card.Description>Choose up to 6 capabilities that best describe what your bot can do.</Card.Description>
      </Card.Header>
      <Card.Content className="space-y-4">
        <Select
          selectionMode="multiple"
          placeholder="Select bot features"
          value={value}
          onChange={(keys) => {
            const next = Array.isArray(keys) ? (keys as Key[]).map(String) : keys != null ? [String(keys)] : [];
            if (next.length > MAX_BOT_FEATURES) {
              toast.warning("You can select up to 6 bot features.");
              return;
            }
            onChange(next);
          }}
        >
          <Label>Bot features (optional)</Label>
          <Select.Trigger>
            <Select.Value>{({ defaultChildren, isPlaceholder }) => isPlaceholder || !selected.length ? defaultChildren : `${selected.length} selected`}</Select.Value>
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox selectionMode="multiple">
              {BOT_FEATURE_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <ListBox.Item key={option.id} id={option.id} textValue={option.label}>
                    <div className="flex min-w-0 items-start gap-3 py-1">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent"><Icon className="size-4" /></span>
                      <span className="min-w-0"><span className="block text-sm font-medium text-foreground">{option.label}</span><span className="block text-xs leading-relaxed text-muted">{option.description}</span></span>
                    </div>
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                );
              })}
            </ListBox>
          </Select.Popover>
          <Description>Optional · {selected.length}/{MAX_BOT_FEATURES} selected</Description>
        </Select>

        {selected.length ? (
          <div className="flex flex-wrap gap-2" aria-label="Selected bot features">
            {selected.map((option) => {
              const Icon = option.icon;
              return (
                <Chip key={option.id} color="accent" variant="soft" className="gap-1.5 pr-0.5">
                  <Icon className="size-3.5" /><Chip.Label>{option.label}</Chip.Label>
                  <CloseButton aria-label={`Remove ${option.label}`} className="size-6 min-h-6 min-w-6" onPress={() => onChange(value.filter((id) => id !== option.id))} />
                </Chip>
              );
            })}
          </div>
        ) : <p className="text-xs text-muted">No features selected. Public previews use recommended fallback capabilities.</p>}
      </Card.Content>
    </Card>
  );
}
