"use client";

import { Button, Modal, toast } from "@heroui/react";
import { Clock3, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";

import { useAuth } from "@/lib/auth/auth-context";

const VOTE_COOLDOWN_MS = 6 * 60 * 60 * 1000;

function formatRemaining(milliseconds: number) {
  const totalMinutes = Math.max(1, Math.ceil(milliseconds / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (!hours) return `${minutes}m`;
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}

export function useListingVote({
  listingKey,
  listingId,
  initialVotes,
}: {
  listingKey: string;
  listingId?: string;
  initialVotes: number;
}) {
  const { requireAuth } = useAuth();
  const [voteCount, setVoteCount] = useState(initialVotes);
  const [nextVoteAt, setNextVoteAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"success" | "cooldown">("success");
  const storageKey = `nexus-vote-cooldown:${listingKey}`;
  const legacyStorageKey = `nexus-like-cooldown:${listingKey}`;

  useEffect(() => {
    const stored = Math.max(
      Number(window.localStorage.getItem(storageKey) ?? 0),
      Number(window.localStorage.getItem(legacyStorageKey) ?? 0),
    );
    if (stored > Date.now()) setNextVoteAt(stored);
  }, [legacyStorageKey, storageKey]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const addVote = () => {
    requireAuth(async () => {
      const pressedAt = Date.now();
      setNow(pressedAt);
      if (nextVoteAt > pressedAt) {
        setDialogMode("cooldown");
        setDialogOpen(true);
        return;
      }

      if (!listingId) {
        const nextAvailable = pressedAt + VOTE_COOLDOWN_MS;
        setVoteCount((count) => count + 1);
        setNextVoteAt(nextAvailable);
        window.localStorage.setItem(storageKey, String(nextAvailable));
        setDialogMode("success");
        setDialogOpen(true);
        return;
      }
      try {
        const response = await fetch(`/api/listings/${listingId}/vote`, {method: "POST"});
        const result = await response.json().catch(() => null) as {
          error?: string;
          nextVoteAt?: string | null;
          vote?: {votes_count?: number; next_vote_at?: string};
        } | null;
        if (response.status === 409 && result?.error === "vote_cooldown_active") {
          const nextAvailable = result.nextVoteAt ? new Date(result.nextVoteAt).getTime() : pressedAt + VOTE_COOLDOWN_MS;
          setNextVoteAt(nextAvailable);
          setDialogMode("cooldown");
          setDialogOpen(true);
          return;
        }
        if (!response.ok) throw new Error(result?.error || "vote_failed");
        const nextAvailable = result?.vote?.next_vote_at
          ? new Date(result.vote.next_vote_at).getTime()
          : pressedAt + VOTE_COOLDOWN_MS;
        if (typeof result?.vote?.votes_count === "number") {
          setVoteCount(result.vote.votes_count);
        } else {
          setVoteCount((count) => count + 1);
        }
        setNextVoteAt(nextAvailable);
        window.localStorage.setItem(storageKey, String(nextAvailable));
        setDialogMode("success");
        setDialogOpen(true);
      } catch {
        toast.danger("Vote could not be recorded", {description: "Please try again."});
      }
    });
  };

  return {
    addVote,
    dialogMode,
    dialogOpen,
    isCoolingDown: nextVoteAt > now,
    voteCount,
    remaining: formatRemaining(nextVoteAt - now),
    setDialogOpen,
  };
}

export function ListingVoteDialog({
  listingName,
  mode,
  open,
  remaining,
  onOpenChange,
}: {
  listingName: string;
  mode: "success" | "cooldown";
  open: boolean;
  remaining: string;
  onOpenChange: (open: boolean) => void;
}) {
  const success = mode === "success";
  return (
    <Modal.Backdrop isOpen={open} onOpenChange={onOpenChange}>
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-md">
          <Modal.CloseTrigger />
          <Modal.Header>
            <span className="flex size-11 items-center justify-center rounded-2xl bg-accent/12 text-accent">
              {success ? <ThumbsUp className="size-5 fill-current" /> : <Clock3 className="size-5" />}
            </span>
            <Modal.Heading>{success ? "Vote recorded" : "Vote cooldown active"}</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <p className="text-sm leading-relaxed text-muted">
              {success
                ? `Your vote for ${listingName} has been counted. You can vote for this listing again when the cooldown ends.`
                : `You already voted for ${listingName}. Your next vote becomes available when the cooldown ends.`}
            </p>
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-accent/20 bg-accent/8 px-4 py-3">
              <span className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-xl bg-accent/12 text-accent"><Clock3 className="size-4" /></span>
                <span><span className="block text-xs font-medium text-muted">Next vote available in</span><span className="block text-base font-semibold text-foreground">{remaining}</span></span>
              </span>
              <span className="rounded-full bg-default/70 px-2.5 py-1 text-[11px] font-medium text-muted">6-hour cooldown</span>
            </div>
            <p className="text-xs leading-relaxed text-muted">Votes help active, useful listings reach more people across Nexbiy.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button slot="close">Got it</Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
