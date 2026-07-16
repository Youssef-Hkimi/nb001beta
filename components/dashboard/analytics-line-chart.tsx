"use client";

import { Button, ButtonGroup, Card } from "@heroui/react";
import { useState } from "react";

import type { AnalyticsRange } from "@/lib/types";

const RANGE_OPTIONS: Array<{ id: AnalyticsRange; label: string }> = [
  { id: "7d", label: "7 Days" },
  { id: "30d", label: "30 Days" },
  { id: "90d", label: "90 Days" },
];

export function AnalyticsLineChart<T extends { date: string }>({
  title,
  description,
  history,
  series,
  range: controlledRange,
  onRangeChange,
  showRangeControls = true,
}: {
  title: string;
  description: string;
  history: Record<AnalyticsRange, T[]>;
  series: Array<{ key: keyof T & string; label: string; color: string }>;
  range?: AnalyticsRange;
  onRangeChange?: (range: AnalyticsRange) => void;
  showRangeControls?: boolean;
}) {
  const [internalRange, setInternalRange] = useState<AnalyticsRange>("30d");
  const range = controlledRange ?? internalRange;
  const setRange = (next: AnalyticsRange) => {
    setInternalRange(next);
    onRangeChange?.(next);
  };
  const points = history[range];
  const width = 720;
  const height = 240;
  const pad = 28;
  const maxValue = Math.max(
    1,
    ...points.flatMap((point) => series.map((line) => Number(point[line.key]) || 0)),
  );
  const x = (index: number) => pad + (index * (width - pad * 2)) / Math.max(1, points.length - 1);
  const y = (value: number) => height - pad - (value / maxValue) * (height - pad * 2);

  return (
    <Card className="nexus-card gap-4">
      <Card.Header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Card.Title>{title}</Card.Title>
          <Card.Description>{description}</Card.Description>
        </div>
        {showRangeControls ? <ButtonGroup size="sm" variant="secondary" aria-label="Analytics date range">
          {RANGE_OPTIONS.map((option) => (
            <Button
              key={option.id}
              aria-pressed={range === option.id}
              variant={range === option.id ? "primary" : "secondary"}
              onPress={() => setRange(option.id)}
            >
              {option.label}
            </Button>
          ))}
        </ButtonGroup> : null}
      </Card.Header>
      <Card.Content>
        <div className="mb-4 flex flex-wrap gap-4 text-xs text-muted">
          {series.map((line) => (
            <span key={line.key} className="inline-flex items-center gap-2">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: line.color }} />
              {line.label}
            </span>
          ))}
        </div>
        <div className="mb-4 grid gap-2 sm:grid-cols-3">
          {series.map((line) => (
            <div key={line.key} className="rounded-xl bg-default/40 px-3 py-2">
              <p className="text-[11px] font-medium text-muted">Total {line.label}</p>
              <p className="mt-0.5 text-sm font-bold text-foreground">
                {new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(points.reduce((total, point) => total + (Number(point[line.key]) || 0), 0))}
              </p>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-60 w-full min-w-[520px]"
            role="img"
            aria-label={`${title} for ${RANGE_OPTIONS.find((option) => option.id === range)?.label}`}
          >
            {[0, 0.25, 0.5, 0.75, 1].map((step) => {
              const lineY = pad + step * (height - pad * 2);
              return (
                <line
                  key={step}
                  x1={pad}
                  x2={width - pad}
                  y1={lineY}
                  y2={lineY}
                  stroke="var(--border)"
                  strokeDasharray="4 5"
                />
              );
            })}
            {series.map((line) => {
              const path = points
                .map((point, index) => `${index === 0 ? "M" : "L"} ${x(index)} ${y(Number(point[line.key]) || 0)}`)
                .join(" ");
              return (
                <g key={line.key}>
                  <path d={path} fill="none" stroke={line.color} strokeWidth="3" strokeLinecap="round" />
                  {points.map((point, index) => (
                    <circle key={`${line.key}-${point.date}`} cx={x(index)} cy={y(Number(point[line.key]) || 0)} r="4" fill={line.color} className="outline-none focus-visible:stroke-foreground" tabIndex={0}>
                      <title>{`${point.date} · ${line.label}: ${Number(point[line.key]).toLocaleString()}`}</title>
                    </circle>
                  ))}
                </g>
              );
            })}
            {points.map((point, index) => (
              <text key={point.date} x={x(index)} y={height - 6} textAnchor="middle" className="fill-muted text-[11px]">
                {point.date}
              </text>
            ))}
          </svg>
        </div>
      </Card.Content>
    </Card>
  );
}
