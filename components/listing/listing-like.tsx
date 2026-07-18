"use client";

import { Button, Modal } from "@heroui/react";
import { Clock3, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";

import { useAuth } from "@/lib/auth/auth-context";

const LIKE_COOLDOWN_MS = 6 * 60 * 60 * 1000;

function formatRemaining(milliseconds: number) {
  const totalMinutes = Math.max(1, Math.ceil(milliseconds / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (!hours) return `${minutes}m`;
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}

export function useListingLike({
  listingKey,
  initialLikes,
}: {
  listingKey: string;
  initialLikes: number;
}) {
  const { requireAuth } = useAuth();
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [nextLikeAt, setNextLikeAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"success" | "cooldown">("success");
  const storageKey = `nexus-like-cooldown:${listingKey}`;

  useEffect(() => {
    const stored = Number(window.localStorage.getItem(storageKey) ?? 0);
    if (stored > Date.now()) setNextLikeAt(stored);
  }, [storageKey]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const addLike = () => {
    requireAuth(() => {
      const pressedAt = Date.now();
      setNow(pressedAt);
      if (nextLikeAt > pressedAt) {
        setDialogMode("cooldown");
        setDialogOpen(true);
        return;
      }

      const nextAvailable = pressedAt + LIKE_COOLDOWN_MS;
      setLikeCount((count) => count + 1);
      setNextLikeAt(nextAvailable);
      window.localStorage.setItem(storageKey, String(nextAvailable));
      setDialogMode("success");
      setDialogOpen(true);
    });
  };

  return {
    addLike,
    dialogMode,
    dialogOpen,
    isCoolingDown: nextLikeAt > now,
    likeCount,
    remaining: formatRemaining(nextLikeAt - now),
    setDialogOpen,
  };
}

export function ListingLikeDialog({
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
            <Modal.Heading>{success ? "Like added" : "Like cooldown active"}</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <p className="text-sm leading-relaxed text-muted">
              {success
                ? `${listingName} received your like. You can support this listing again in ${remaining}.`
                : `You already liked ${listingName}. You can like this listing again in ${remaining}.`}
            </p>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-default/40 px-3 py-2.5 text-sm text-foreground">
              <Clock3 className="size-4 text-accent" />
              Six-hour like cooldown
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button slot="close">Got it</Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
