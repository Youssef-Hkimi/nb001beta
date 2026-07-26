"use client";

import { useRef } from "react";
import { Button } from "@heroui/react";
import { CheckCircle2, Upload } from "lucide-react";

export function UploadDropzone({
  title,
  hint,
  sizeHint,
  selectedLabel,
  onPress,
  onFiles,
  multiple = false,
  accept = "image/*",
}: {
  title: string;
  hint: string;
  sizeHint: string;
  selectedLabel?: string;
  onPress?: () => void;
  onFiles?: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      {onFiles ? (
        <input
          ref={inputRef}
          hidden
          accept={accept}
          multiple={multiple}
          type="file"
          onChange={(event) => {
            const files = Array.from(event.currentTarget.files || []);
            if (files.length) onFiles(files);
            event.currentTarget.value = "";
          }}
        />
      ) : null}
      <Button
        variant="ghost"
        className="upload-zone h-auto w-full flex-col gap-2 rounded-2xl px-4 py-8 text-center"
        onPress={() => {
          if (onFiles) inputRef.current?.click();
          else onPress?.();
        }}
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
    </>
  );
}
