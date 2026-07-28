export type ListingMediaUpload = {
  kind: "icon" | "banner" | "gallery";
  file: File;
  position?: number;
};

export async function uploadListingMedia(
  listingId: string,
  uploads: ListingMediaUpload[],
) {
  for (const upload of uploads) {
    const form = new FormData();
    form.set("kind", upload.kind);
    form.set("file", upload.file);
    if (upload.position !== undefined) form.set("position", String(upload.position));

    const response = await fetch(`/api/listings/${listingId}/media`, {
      method: "POST",
      body: form,
    });
    if (!response.ok) {
      const result = await response.json().catch(() => null) as {error?: string} | null;
      throw new Error(result?.error || "media_upload_failed");
    }
  }
}
