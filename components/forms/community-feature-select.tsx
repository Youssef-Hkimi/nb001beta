"use client";

import type { Key } from "@heroui/react";
import {
  Card,
  Chip,
  CloseButton,
  Description,
  Label,
  ListBox,
  Select,
  Tooltip,
  toast,
} from "@heroui/react";
import { CircleHelp } from "lucide-react";

import {
  COMMUNITY_FEATURE_OPTIONS,
  MAX_COMMUNITY_FEATURES,
} from "@/lib/data/community-features";

type CommunityFeatureSelectProps = {
  value: string[];
  onChange: (features: string[]) => void;
};

export function CommunityFeatureSelect({ value, onChange }: CommunityFeatureSelectProps) {
  const selectedOptions = COMMUNITY_FEATURE_OPTIONS.filter((option) => value.includes(option.id));

  const removeFeature = (id: string) => {
    onChange(value.filter((featureId) => featureId !== id));
  };

  return (
    <Card className="nexus-card-elevated gap-4">
      <Card.Header>
        <div className="flex items-center gap-2">
          <Card.Title>Community Features &amp; Spaces</Card.Title>
          <Tooltip>
            <Tooltip.Trigger
              aria-label="About community features"
              className="rounded-full text-muted outline-none transition-colors hover:text-accent focus-visible:ring-2 focus-visible:ring-accent"
            >
              <CircleHelp className="size-4" />
            </Tooltip.Trigger>
            <Tooltip.Content>Selected features appear on the public server page.</Tooltip.Content>
          </Tooltip>
        </div>
        <Card.Description>
          Choose up to 4 features that best describe what your server offers.
        </Card.Description>
      </Card.Header>
      <Card.Content className="space-y-4">
        <Select
          selectionMode="multiple"
          placeholder="Select community features"
          value={value}
          onChange={(keys) => {
            const next = Array.isArray(keys)
              ? (keys as Key[]).map(String)
              : keys != null
                ? [String(keys)]
                : [];

            if (next.length > MAX_COMMUNITY_FEATURES) {
              toast.warning("You can select up to 4 community features.");
              return;
            }

            onChange(next);
          }}
        >
          <Label>Community features (optional)</Label>
          <Select.Trigger>
            <Select.Value>
              {({ defaultChildren, isPlaceholder }) =>
                isPlaceholder || selectedOptions.length === 0
                  ? defaultChildren
                  : `${selectedOptions.length} selected`
              }
            </Select.Value>
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox selectionMode="multiple">
              {COMMUNITY_FEATURE_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <ListBox.Item key={option.id} id={option.id} textValue={option.label}>
                    <div className="flex min-w-0 items-start gap-3 py-1">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-foreground">
                          {option.label}
                        </span>
                        <span className="block text-xs leading-relaxed text-muted">
                          {option.description}
                        </span>
                      </span>
                    </div>
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                );
              })}
            </ListBox>
          </Select.Popover>
          <Description>
            Optional · {selectedOptions.length}/{MAX_COMMUNITY_FEATURES} selected
          </Description>
        </Select>

        {selectedOptions.length > 0 ? (
          <div className="flex flex-wrap gap-2" aria-label="Selected community features">
            {selectedOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Chip key={option.id} color="accent" variant="soft" className="gap-1.5 pr-0.5">
                  <Icon className="size-3.5" />
                  <Chip.Label>{option.label}</Chip.Label>
                  <CloseButton
                    aria-label={`Remove ${option.label}`}
                    className="size-6 min-h-6 min-w-6"
                    onPress={() => removeFeature(option.id)}
                  />
                </Chip>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted">
            No features selected. The public page preview uses the four recommended defaults.
          </p>
        )}
      </Card.Content>
    </Card>
  );
}
