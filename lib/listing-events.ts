"use client";

export function trackListingEvent(
  listingId: string | undefined,
  type: "view" | "invite_click" | "link_copy",
) {
  if (!listingId) return;
  void fetch(`/api/listings/${listingId}/events`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({type}),
    keepalive: true,
  }).catch(() => undefined);
}
