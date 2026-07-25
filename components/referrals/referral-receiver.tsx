"use client";

import { Button, Modal } from "@heroui/react";
import { Gift, LogIn, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { LinkButton } from "@/components/ui/link-button";
import { useAuth } from "@/lib/auth/auth-context";

const GIFT_IMAGE =
  "https://res.cloudinary.com/zux0o0wz/image/upload/v1784727487/GifBox4_xqmmme.webp";
const CLAIMED_REFERRAL_KEY = "nexus_claimed_referral";
const PENDING_REFERRAL_KEY = "nexus_pending_referral";
const REFERRAL_REWARD_KEY = "nexus_referral_reward_points";

type ReferralStage = "prompt" | "success" | null;

export function ReferralReceiver() {
  const { isAuthenticated, isReady, login } = useAuth();
  const [referralSlug, setReferralSlug] = useState("");
  const [stage, setStage] = useState<ReferralStage>(null);
  const [returningFromLogin, setReturningFromLogin] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryReferral = params.get("ref")?.trim() ?? "";
    const pendingReferral = localStorage.getItem(PENDING_REFERRAL_KEY) ?? "";
    const slug = queryReferral || pendingReferral;

    if (!slug) return;

    if (localStorage.getItem(CLAIMED_REFERRAL_KEY)) {
      cleanReferralQuery();
      return;
    }

    setReferralSlug(slug);
    if (params.get("ref_claim") === "1") {
      setReturningFromLogin(true);
      return;
    }

    timerRef.current = window.setTimeout(() => setStage("prompt"), 3000);
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!returningFromLogin || !isReady || !referralSlug) return;

    if (isAuthenticated) {
      void claimReferralReward(referralSlug).then((accepted) => {
        if (accepted) setStage("success");
        setReturningFromLogin(false);
      });
      return;
    }

    setStage("prompt");
    setReturningFromLogin(false);
  }, [isAuthenticated, isReady, referralSlug, returningFromLogin]);

  function acceptReferral() {
    if (!referralSlug) return;

    if (isAuthenticated) {
      void claimReferralReward(referralSlug).then((accepted) => {
        if (accepted) setStage("success");
      });
      return;
    }

    localStorage.setItem(PENDING_REFERRAL_KEY, referralSlug);
    login(`/explore?ref=${encodeURIComponent(referralSlug)}&ref_claim=1`);
  }

  function declineReferral() {
    localStorage.removeItem(PENDING_REFERRAL_KEY);
    setStage(null);
    cleanReferralQuery();
  }

  function closeSuccess() {
    setStage(null);
    cleanReferralQuery();
  }

  return (
    <Modal.Backdrop isOpen={stage !== null} isDismissable={false}>
      <Modal.Container>
        <Modal.Dialog className="relative isolate overflow-hidden sm:max-w-[520px]">
          <ReferralGiftFall />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_20%,color-mix(in_srgb,var(--accent)_22%,transparent),transparent_58%)]"
          />

          {stage === "prompt" ? (
            <>
              <Modal.Header className="relative z-10 flex-col items-center gap-4 pt-8 text-center">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-accent/15 text-accent shadow-sm">
                  <Gift className="size-6" />
                </span>
                <Modal.Heading>You joined through a referral</Modal.Heading>
              </Modal.Header>
              <Modal.Body className="relative z-10 text-center">
                <p className="mx-auto max-w-sm leading-7 text-muted">
                  Welcome to Nexbiy. Sign in with Discord to receive <strong className="text-foreground">10 Growth Points</strong> for your listings.
                </p>
                <div className="mx-auto mt-3 flex w-fit items-center gap-2 rounded-full border border-accent/20 bg-background/80 px-4 py-2 text-sm font-semibold text-accent shadow-sm backdrop-blur-md">
                  <Sparkles className="size-4" />
                  One referral reward per account
                </div>
              </Modal.Body>
              <Modal.Footer className="relative z-10 flex-col-reverse gap-2 sm:flex-row">
                <Button className="w-full sm:w-auto" variant="tertiary" onPress={declineReferral}>
                  Decline
                </Button>
                <Button className="w-full sm:w-auto" variant="primary" onPress={acceptReferral}>
                  <LogIn className="size-4" />
                  {isAuthenticated ? "Accept reward" : "Accept & log in"}
                </Button>
              </Modal.Footer>
            </>
          ) : null}

          {stage === "success" ? (
            <>
              <Modal.CloseTrigger onPress={closeSuccess} />
              <Modal.Header className="relative z-10 flex-col items-center gap-4 pt-8 text-center">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-success/15 text-success shadow-sm">
                  <Sparkles className="size-6" />
                </span>
                <Modal.Heading>10 Growth Points are ready</Modal.Heading>
              </Modal.Header>
              <Modal.Body className="relative z-10 text-center">
                <p className="mx-auto max-w-sm leading-7 text-muted">
                  Your referral reward is now available in the Rewards section of your dashboard.
                </p>
              </Modal.Body>
              <Modal.Footer className="relative z-10">
                <Button variant="tertiary" onPress={closeSuccess}>Keep browsing</Button>
                <LinkButton href="/dashboard#rewards" variant="primary">Open Rewards</LinkButton>
              </Modal.Footer>
            </>
          ) : null}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}

function saveReferralReward(slug: string) {
  localStorage.setItem(CLAIMED_REFERRAL_KEY, slug);
  localStorage.setItem(REFERRAL_REWARD_KEY, "10");
  localStorage.removeItem(PENDING_REFERRAL_KEY);
}

async function claimReferralReward(slug: string) {
  const response = await fetch("/api/referrals/accept", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({code: slug}),
  });
  if (!response.ok && response.status !== 409) return false;
  saveReferralReward(slug);
  return true;
}

function cleanReferralQuery() {
  const url = new URL(window.location.href);
  url.searchParams.delete("ref");
  url.searchParams.delete("ref_claim");
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

function ReferralGiftFall() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const drawingCanvas = canvas;
    const drawingContext = context;

    const image = new Image();
    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let lastFrame = performance.now();
    const particles = Array.from({ length: 30 }, (_, index) => ({
      x: ((index * 37) % 100) / 100,
      y: -((index * 29) % 110) / 100,
      speed: 26 + (index % 7) * 5,
      size: 24 + (index % 5) * 7,
      drift: 8 + (index % 4) * 3,
      phase: index * 0.73,
      opacity: 0.2 + (index % 4) * 0.07,
    }));

    function resize() {
      const rect = drawingCanvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      drawingCanvas.width = Math.max(1, Math.round(width * ratio));
      drawingCanvas.height = Math.max(1, Math.round(height * ratio));
      drawingContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function draw(frame: number) {
      const delta = Math.min(0.034, (frame - lastFrame) / 1000);
      lastFrame = frame;
      drawingContext.clearRect(0, 0, width, height);

      for (const particle of particles) {
        particle.y += (particle.speed * delta) / Math.max(height, 1);
        if (particle.y > 1.15) particle.y = -0.18;
        const drawWidth = particle.size;
        const drawHeight = drawWidth * (image.naturalHeight / image.naturalWidth || 1);
        const x = particle.x * width + Math.sin(frame / 850 + particle.phase) * particle.drift;
        const y = particle.y * height;
        drawingContext.globalAlpha = particle.opacity;
        drawingContext.drawImage(image, x - drawWidth / 2, y - drawHeight / 2, drawWidth, drawHeight);
      }

      drawingContext.globalAlpha = 1;
      animationFrame = window.requestAnimationFrame(draw);
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(drawingCanvas);
    image.onload = () => {
      resize();
      animationFrame = window.requestAnimationFrame(draw);
    };
    image.src = GIFT_IMAGE;

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 size-full" />;
}
