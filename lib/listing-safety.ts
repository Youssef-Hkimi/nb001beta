import type { ListingSafetyStatus } from "@/lib/types";

export const LISTING_STATUS_CONFIG = {
  PENDING_REVIEW: {
    label: "Pending Review",
    color: "warning",
    description: "This listing is live, but Nexbiy has not completed its safety review yet.",
  },
  SAFE: {
    label: "Live",
    color: "success",
    description: "Nexbiy completed its review and this listing is live.",
  },
  PAUSED: {
    label: "Paused",
    color: "default",
    description: "This listing is temporarily paused and public actions may be unavailable.",
  },
  SUSPENDED: {
    label: "Suspended",
    color: "danger",
    description: "Nexbiy suspended this listing because of a safety, policy, or verification concern.",
  },
} as const;

type ListingStatusSource = {
  safetyStatus?: ListingSafetyStatus;
  suspendedAt?: string;
  pausedAt?: string;
  reviewedAt?: string;
};

export function getPublicListingStatus(listing: ListingStatusSource): ListingSafetyStatus {
  if (listing.suspendedAt || listing.safetyStatus === "SUSPENDED") return "SUSPENDED";
  if (listing.pausedAt || listing.safetyStatus === "PAUSED") return "PAUSED";
  if (listing.safetyStatus === "PENDING_REVIEW" || !listing.reviewedAt) return listing.safetyStatus ?? "PENDING_REVIEW";
  return "SAFE";
}

export function isPubliclyDiscoverable(listing: ListingStatusSource) {
  const status = getPublicListingStatus(listing);
  return status === "SAFE" || status === "PENDING_REVIEW";
}

export function getListingActionBlockReason(status: ListingSafetyStatus) {
  if (status === "PAUSED") return "This listing is currently paused.";
  if (status === "SUSPENDED") return "This listing is suspended.";
  return null;
}
