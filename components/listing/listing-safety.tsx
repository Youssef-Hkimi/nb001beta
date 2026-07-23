"use client";

import { Alert, Button, Card, Chip, Tooltip } from "@heroui/react";
import { CirclePause, Clock3, ShieldBan, ShieldCheck } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import {
  getListingActionBlockReason,
  LISTING_STATUS_CONFIG,
} from "@/lib/listing-safety";
import type { ListingSafetyStatus, ListingType } from "@/lib/types";

const STATUS_ICONS = {
  PENDING_REVIEW: Clock3,
  SAFE: ShieldCheck,
  PAUSED: CirclePause,
  SUSPENDED: ShieldBan,
} as const;

export function ListingStatusTooltip({
  status,
  children,
}: {
  status: ListingSafetyStatus;
  children: ReactNode;
}) {
  const config = LISTING_STATUS_CONFIG[status];
  return (
    <Tooltip>
      <Tooltip.Trigger
        aria-label={`${config.label}: ${config.description}`}
        className="inline-flex rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {children}
      </Tooltip.Trigger>
      <Tooltip.Content>{config.description}</Tooltip.Content>
    </Tooltip>
  );
}

export function ListingStatusChip({
  status,
  livePrefix = false,
}: {
  status: ListingSafetyStatus;
  livePrefix?: boolean;
}) {
  const config = LISTING_STATUS_CONFIG[status];
  const Icon = STATUS_ICONS[status];
  const label = livePrefix && status === "PENDING_REVIEW" ? "Live · Pending Review" : config.label;
  return (
    <ListingStatusTooltip status={status}>
      <Chip size="sm" variant="soft" color={config.color}>
        <Icon className="size-3.5" aria-hidden />
        <Chip.Label>{label}</Chip.Label>
      </Chip>
    </ListingStatusTooltip>
  );
}

export function ListingStatusAlert({ status, type }: { status: ListingSafetyStatus; type: ListingType }) {
  if (status === "SAFE") return null;
  const config = LISTING_STATUS_CONFIG[status];
  const Icon = STATUS_ICONS[status];
  const pending = type === "bot"
    ? "This bot was recently listed and is waiting for review by Nexbiy."
    : "This server is live and waiting for review by Nexbiy.";
  return (
    <Alert status={config.color === "default" ? "default" : config.color} className="rounded-xl">
      <Alert.Indicator><Icon className="size-4" /></Alert.Indicator>
      <Alert.Content>
        <Alert.Title>{config.label}</Alert.Title>
        <Alert.Description>{status === "PENDING_REVIEW" ? pending : config.description}</Alert.Description>
      </Alert.Content>
    </Alert>
  );
}

export function TrustSafetyCard({ status, type }: { status: ListingSafetyStatus; type: ListingType }) {
  const rows = type === "server"
    ? [
        ["Nexbiy Review", status === "SAFE" ? "Completed" : status === "PENDING_REVIEW" ? "Not completed" : "Unavailable"],
        ["Invite Checked", status === "SAFE" ? "Yes" : status === "PENDING_REVIEW" ? "Pending" : "Unavailable"],
        ["Report Available", "Yes"],
      ]
    : [
        ["Nexbiy Review", status === "SAFE" ? "Completed" : status === "PENDING_REVIEW" ? "Not completed" : "Unavailable"],
        ["Discord TOS", status === "SAFE" ? "Currently meets requirements" : status === "PENDING_REVIEW" ? "Awaiting review" : "Unavailable"],
        ["Report Available", "Yes"],
      ];
  return (
    <Card className="nexus-card-elevated gap-3">
      <Card.Header><Card.Title className="text-base">Trust &amp; Safety</Card.Title></Card.Header>
      <Card.Content className="space-y-2.5">
        <ListingStatusAlert status={status} type={type} />
        <div className="flex items-center justify-between gap-3 rounded-xl bg-default/40 px-3 py-2 text-sm">
          <span>Page Status</span><ListingStatusChip status={status} />
        </div>
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-3 rounded-xl bg-default/40 px-3 py-2 text-sm">
            <span className="text-muted">{label}</span>
            <span className="text-right font-medium text-foreground">{value}</span>
          </div>
        ))}
      </Card.Content>
    </Card>
  );
}

type GuardProps = Omit<ComponentProps<typeof Button>, "children"> & {
  status: ListingSafetyStatus;
  children: ReactNode;
};

export function ListingActionGuard({ status, children, onPress, ...buttonProps }: GuardProps) {
  const reason = getListingActionBlockReason(status);
  if (!reason) return <Button {...buttonProps} onPress={onPress}>{children}</Button>;
  return (
    <Tooltip>
      <Tooltip.Trigger
        aria-label={reason}
        aria-disabled="true"
        className="button button--secondary inline-flex cursor-not-allowed items-center gap-2 opacity-50"
      >
        {children}
      </Tooltip.Trigger>
      <Tooltip.Content>{reason}</Tooltip.Content>
    </Tooltip>
  );
}
