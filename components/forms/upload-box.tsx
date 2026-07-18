"use client";

import { Button, Label, Modal, Slider } from "@heroui/react";
import { Crop, ImagePlus, Upload, X } from "lucide-react";
import { useId, useRef, useState } from "react";

const BANNER_WIDTH = 960;
const BANNER_HEIGHT = 320;

type PendingBanner = {
  file: File;
  url: string;
  width: number;
  height: number;
};

type UploadBoxProps = {
  title: string;
  hint: string;
  sizeHint: string;
  variant?: "icon" | "banner";
  previewUrl?: string | null;
  onFile?: (file: File, previewUrl: string) => void;
  onClear?: () => void;
};

export function UploadBox({
  title,
  hint,
  sizeHint,
  variant = "banner",
  previewUrl,
  onFile,
  onClear,
}: UploadBoxProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingBanner, setPendingBanner] = useState<PendingBanner | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  const closeCropper = () => {
    if (pendingBanner) URL.revokeObjectURL(pendingBanner.url);
    setPendingBanner(null);
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
  };

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);

    if (variant === "icon") {
      onFile?.(file, url);
      return;
    }

    const image = new Image();
    image.onload = () => {
      if (image.naturalWidth === BANNER_WIDTH && image.naturalHeight === BANNER_HEIGHT) {
        onFile?.(file, url);
        return;
      }
      setPendingBanner({
        file,
        url,
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };
    image.onerror = () => URL.revokeObjectURL(url);
    image.src = url;
  };

  const saveCroppedBanner = async () => {
    if (!pendingBanner) return;
    const image = new Image();
    image.src = pendingBanner.url;
    await image.decode();

    const sourceRatio = pendingBanner.width / pendingBanner.height;
    const targetRatio = BANNER_WIDTH / BANNER_HEIGHT;
    const baseWidth = sourceRatio > targetRatio
      ? pendingBanner.height * targetRatio
      : pendingBanner.width;
    const baseHeight = sourceRatio > targetRatio
      ? pendingBanner.height
      : pendingBanner.width / targetRatio;
    const cropWidth = baseWidth / zoom;
    const cropHeight = baseHeight / zoom;
    const sourceX = (pendingBanner.width - cropWidth) * ((offsetX + 100) / 200);
    const sourceY = (pendingBanner.height - cropHeight) * ((offsetY + 100) / 200);

    const canvas = document.createElement("canvas");
    canvas.width = BANNER_WIDTH;
    canvas.height = BANNER_HEIGHT;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(
      image,
      sourceX,
      sourceY,
      cropWidth,
      cropHeight,
      0,
      0,
      BANNER_WIDTH,
      BANNER_HEIGHT,
    );

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.92),
    );
    if (!blob) return;
    const filename = `${pendingBanner.file.name.replace(/\.[^.]+$/, "")}-nexus-banner.webp`;
    const croppedFile = new File([blob], filename, { type: "image/webp" });
    const croppedUrl = URL.createObjectURL(croppedFile);
    onFile?.(croppedFile, croppedUrl);
    closeCropper();
  };

  const previewBackgroundSize = (() => {
    if (!pendingBanner) return "cover";
    const ratio = pendingBanner.width / pendingBanner.height;
    return ratio > 3
      ? `${(ratio / 3) * zoom * 100}% ${zoom * 100}%`
      : `${zoom * 100}% ${(3 / ratio) * zoom * 100}%`;
  })();

  return (
    <>
      <div className="space-y-2">
      <label
        htmlFor={inputId}
        className={[
          "upload-zone group relative flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl text-center transition-all duration-200",
          variant === "icon" ? "aspect-square max-w-[160px] p-4" : "aspect-[3/1] min-h-0 w-full px-4 py-8",
          previewUrl ? "border-solid border-accent/40 p-0" : "",
        ].join(" ")}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt={`${title} preview`}
            className={[
              "h-full w-full object-cover",
              variant === "icon" ? "rounded-2xl" : "aspect-[3/1]",
            ].join(" ")}
          />
        ) : (
          <>
            <div className="flex size-11 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent/15">
              {variant === "icon" ? (
                <Upload className="size-5" />
              ) : (
                <ImagePlus className="size-5" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="mt-1 text-xs text-muted">{hint}</p>
              <p className="mt-1 text-xs text-muted">{sizeHint}</p>
            </div>
          </>
        )}
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>
      {previewUrl && onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 text-xs font-medium text-muted transition-colors hover:text-foreground"
        >
          <X className="size-3.5" />
          Remove image
        </button>
      ) : null}
      </div>

      <Modal.Backdrop isOpen={Boolean(pendingBanner)} onOpenChange={(open) => {
        if (!open) closeCropper();
      }}>
        <Modal.Container size="lg">
          <Modal.Dialog className="sm:max-w-3xl">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Crop banner</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="space-y-5">
              <p className="text-sm text-muted">
                Nexus banners use a fixed 960×320 resolution. Reposition and resize your image before applying it.
              </p>
              <div
                className="aspect-[3/1] w-full overflow-hidden rounded-2xl border border-border bg-default/40"
                style={{
                  backgroundImage: pendingBanner ? `url("${pendingBanner.url}")` : undefined,
                  backgroundPosition: `${(offsetX + 100) / 2}% ${(offsetY + 100) / 2}%`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: previewBackgroundSize,
                }}
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <Slider value={zoom} minValue={1} maxValue={3} step={0.05} onChange={(value) => setZoom(Number(value))}>
                  <div className="flex items-center justify-between gap-2">
                    <Label>Resize</Label>
                    <Slider.Output />
                  </div>
                  <Slider.Track><Slider.Fill /><Slider.Thumb /></Slider.Track>
                </Slider>
                <Slider value={offsetX} minValue={-100} maxValue={100} step={1} onChange={(value) => setOffsetX(Number(value))}>
                  <div className="flex items-center justify-between gap-2">
                    <Label>Horizontal</Label>
                    <Slider.Output />
                  </div>
                  <Slider.Track><Slider.Fill /><Slider.Thumb /></Slider.Track>
                </Slider>
                <Slider value={offsetY} minValue={-100} maxValue={100} step={1} onChange={(value) => setOffsetY(Number(value))}>
                  <div className="flex items-center justify-between gap-2">
                    <Label>Vertical</Label>
                    <Slider.Output />
                  </div>
                  <Slider.Track><Slider.Fill /><Slider.Thumb /></Slider.Track>
                </Slider>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onPress={closeCropper}>Cancel</Button>
              <Button onPress={() => void saveCroppedBanner()}>
                <Crop className="size-4" />
                Use banner
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  );
}
