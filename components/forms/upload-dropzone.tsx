"use client";

import { Button } from "@heroui/react";
import { CheckCircle2, Upload } from "lucide-react";

export function UploadDropzone({
  title,
  hint,
  sizeHint,
  selectedLabel,
  onPress,
}: {
  title: string;
  hint: string;
  sizeHint: string;
  selectedLabel?: string;
  onPress?: () => void;
}) {
  return (
    <Button
      variant="ghost"
      className="upload-zone h-auto w-full flex-col gap-2 rounded-2xl px-4 py-8 text-center"
      onPress={onPress}
    >
      <div className="flex size-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
        {selectedLabel ? <CheckCircle2 className="size-5" /> : <Upload className="size-5" />}
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-xs text-muted">{selectedLabel || hint}</p>
        <p className="mt-1 text-xs text-muted">{sizeHint}</p>
      </div>
    </Button>
  );
}
