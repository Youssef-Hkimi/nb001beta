"use client";

import { AlertDialog, Button, Card, Checkbox, Chip, Label, ListBox, Select, Spinner, Table, Tabs, toast } from "@heroui/react";
import { ArrowRight, Clock3, Copy, Gift, MousePointerClick, ShieldAlert, Sparkles, Trophy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/lib/auth/auth-context";

const REWARD_SERVERS = [
  { id: "nexus-hub", name: "Nexbiy Hub" },
  { id: "lofi-girl", name: "Lofi Girl" },
  { id: "reactflux", name: "ReactFlux" },
];

const MOCK_REFERRALS = [
  { id: "maya", name: "Maya", status: "Signed up", completed: false, reward: 0 },
  { id: "kai", name: "Kai", status: "Signed up", completed: true, reward: 10 },
];

function getDailyResetCountdown() {
  const now = new Date();
  const nextReset = new Date(now);
  nextReset.setHours(24, 0, 0, 0);
  const remainingSeconds = Math.max(0, Math.floor((nextReset.getTime() - now.getTime()) / 1000));
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

function RewardsFallEffect({ burst, visible }: { burst: boolean; visible: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const burstRef = useRef(burst);
  const [painted, setPainted] = useState(false);

  useEffect(() => {
    burstRef.current = burst;
  }, [burst]);

  useEffect(() => {
    if (!visible) {
      setPainted(false);
      return;
    }

    const frame = window.requestAnimationFrame(() => setPainted(true));
    return () => window.cancelAnimationFrame(frame);
  }, [visible]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true, desynchronized: true });
    if (!canvas || !ctx) return;
    const drawingContext = ctx;

    let width = Math.max(1, canvas.clientWidth);
    let height = Math.max(1, canvas.clientHeight);
    let animationFrame = 0;
    let lastFrameTime = performance.now();
    let disposed = false;
    let started = false;

    const resizeCanvas = () => {
      width = Math.max(1, canvas.clientWidth);
      height = Math.max(1, canvas.clientHeight);
      canvas.width = width;
      canvas.height = height;
    };
    resizeCanvas();
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvas);

    const normalConfig = {
      density: 96,
      speed: 1,
      size: 99,
      wind: -0.2,
      rotation: true,
      rotSpeed: 0.035,
      sway: 0,
      imgSrc: "https://res.cloudinary.com/zux0o0wz/image/upload/v1784727487/GifBox4_xqmmme.webp",
    };
    const burstConfig = {
      density: 134,
      speed: 15,
      size: 230,
      wind: 0.3,
      rotation: true,
      rotSpeed: 0.03,
      sway: 0,
    };

    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      vx: 0,
      vy: 0,
      radius: 120,
      active: false,
    };
    const handlePointerMove = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      mouse.targetX = event.clientX - bounds.left;
      mouse.targetY = event.clientY - bounds.top;
      if (!mouse.active) {
        mouse.x = mouse.targetX;
        mouse.y = mouse.targetY;
      }
      mouse.active = true;
    };
    const handlePointerLeave = (event: PointerEvent) => {
      if (event.relatedTarget === null) mouse.active = false;
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerout", handlePointerLeave, { passive: true });

    const img = new Image();
    img.decoding = "async";
    const sprite = document.createElement("canvas");
    const spriteSize = 320;
    sprite.width = spriteSize;
    sprite.height = spriteSize;
    let intensity = 0;

    class Particle {
      x: number;
      y: number;
      speed: number;
      size: number;
      angle: number;
      rotSpeed: number;
      swayFreq: number;
      swayOffset: number;
      opacity: number;
      vx: number;
      vy: number;

      constructor(initial = false) {
        this.x = Math.random() * width * 1.4 - width * 0.2;
        this.y = initial ? Math.random() * height : -100;
        this.speed = Math.random() * 2;
        this.size = 0.7 + Math.random() * 0.6;
        this.angle = Math.random() * Math.PI * 2;
        this.rotSpeed = Math.random() - 0.5;
        this.swayFreq = 0.01 + Math.random() * 0.02;
        this.swayOffset = Math.random() * Math.PI * 2;
        this.opacity = 0.6 + Math.random() * 0.4;
        this.vx = 0;
        this.vy = 0;
      }

      update(delta: number) {
        const speed = normalConfig.speed + (burstConfig.speed - normalConfig.speed) * intensity;
        const wind = normalConfig.wind + (burstConfig.wind - normalConfig.wind) * intensity;
        const sway = normalConfig.sway + (burstConfig.sway - normalConfig.sway) * intensity;
        const rotationSpeed = normalConfig.rotSpeed + (burstConfig.rotSpeed - normalConfig.rotSpeed) * intensity;

        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distSq = dx * dx + dy * dy;
        const visualSize = (normalConfig.size + (burstConfig.size - normalConfig.size) * intensity) * this.size;
        const interactionRadius = mouse.radius + visualSize * 0.35;
        const radSq = interactionRadius * interactionRadius;

        if (mouse.active && distSq < radSq && distSq > 0) {
          const dist = Math.sqrt(distSq);
          const force = 1 - dist / interactionRadius;
          const angle = Math.atan2(dy, dx);
          const pointerSpeed = Math.min(8, Math.hypot(mouse.vx, mouse.vy) * 0.55);
          const push = force * (3 + pointerSpeed);
          this.vx += Math.cos(angle) * push + mouse.vx * 0.14;
          this.vy += Math.sin(angle) * push + mouse.vy * 0.14;
        }

        this.y += (speed + this.speed + this.vy) * delta;
        this.x += (wind + this.vx + (sway === 0 ? 0 : Math.sin(this.y * this.swayFreq + this.swayOffset) * sway)) * delta;
        this.vx *= Math.pow(0.92, delta);
        this.vy *= Math.pow(0.92, delta);

        if (normalConfig.rotation) this.angle += this.rotSpeed * rotationSpeed * delta;
        const edgeMargin = burstConfig.size;
        if (this.y > height + edgeMargin) {
          this.y = -edgeMargin;
          this.x = Math.random() * width * 1.4 - width * 0.2;
        }
        if (this.x < -edgeMargin) this.x = width + edgeMargin;
        if (this.x > width + edgeMargin) this.x = -edgeMargin;
      }

      draw(visibility: number) {
        const size = (normalConfig.size + (burstConfig.size - normalConfig.size) * intensity) * this.size;
        const drawHeight = size * (sprite.height / sprite.width);
        const cosine = Math.cos(this.angle);
        const sine = Math.sin(this.angle);
        drawingContext.setTransform(cosine, sine, -sine, cosine, this.x, this.y);
        drawingContext.globalAlpha = this.opacity * visibility;
        if (sprite.width !== 0) {
          drawingContext.drawImage(sprite, -size / 2, -drawHeight / 2, size, drawHeight);
        }
      }
    }

    const particles: Particle[] = [];

    function loop(frameTime: number) {
      const delta = Math.min(2, Math.max(0.5, (frameTime - lastFrameTime) / 16.667));
      lastFrameTime = frameTime;
      drawingContext.setTransform(1, 0, 0, 1, 0, 0);
      drawingContext.globalAlpha = 1;
      drawingContext.clearRect(0, 0, width, height);
      const target = burstRef.current ? 1 : 0;
      const easing = target > intensity ? 0.09 : 0.018;
      intensity += (target - intensity) * (1 - Math.pow(1 - easing, delta));
      if (mouse.active) {
        const previousX = mouse.x;
        const previousY = mouse.y;
        const pointerEasing = 1 - Math.pow(0.24, delta);
        mouse.x += (mouse.targetX - mouse.x) * pointerEasing;
        mouse.y += (mouse.targetY - mouse.y) * pointerEasing;
        mouse.vx = mouse.x - previousX;
        mouse.vy = mouse.y - previousY;
      } else {
        mouse.x = -1000;
        mouse.y = -1000;
        mouse.vx = 0;
        mouse.vy = 0;
      }
      const activeDensity = normalConfig.density + (burstConfig.density - normalConfig.density) * intensity;
      for (let index = 0; index < burstConfig.density; index += 1) {
        const visibility = index < normalConfig.density ? 1 : Math.max(0, Math.min(1, activeDensity - index));
        particles[index].update(delta);
        if (visibility > 0) particles[index].draw(visibility);
      }
      drawingContext.setTransform(1, 0, 0, 1, 0, 0);
      drawingContext.globalAlpha = 1;
      animationFrame = window.requestAnimationFrame(loop);
    }

    function startAnimation() {
      if (disposed || started || img.naturalWidth === 0) return;
      started = true;
      sprite.height = Math.round(spriteSize * (img.naturalHeight / img.naturalWidth));
      const spriteContext = sprite.getContext("2d");
      spriteContext?.drawImage(img, 0, 0, sprite.width, sprite.height);
      img.removeAttribute("src");
      for (let index = 0; index < burstConfig.density; index += 1) {
        particles.push(new Particle(true));
      }
      animationFrame = window.requestAnimationFrame(loop);
    }

    img.onload = startAnimation;
    img.src = normalConfig.imgSrc;
    if (img.complete && img.naturalWidth > 0) {
      window.requestAnimationFrame(startAnimation);
    }

    return () => {
      disposed = true;
      img.onload = null;
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerout", handlePointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="fallingCanvas"
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[60] h-screen w-screen transform-gpu contain-strict transition-opacity duration-700 ease-in-out ${painted ? "opacity-100" : "opacity-0"}`}
    />
  );
}

export function RewardsLanding() {
  const { user } = useAuth();
  const [agreementOpen, setAgreementOpen] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [programStarted, setProgramStarted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [burst, setBurst] = useState(false);
  const [showGifts, setShowGifts] = useState(true);
  const [giftsMounted, setGiftsMounted] = useState(true);
  const [activeTab, setActiveTab] = useState("referral");
  const [selectedRewardServer, setSelectedRewardServer] = useState("nexus-hub");
  const [availablePoints, setAvailablePoints] = useState(10);
  const [dailyResetCountdown, setDailyResetCountdown] = useState("24:00:00");
  const timersRef = useRef<number[]>([]);
  const giftUnmountTimerRef = useRef<number | null>(null);
  const referralSlug = (user?.username ?? user?.displayName ?? "alex")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "alex";
  const referralLink = `nexbiy.gg/ref/${referralSlug}`;

  useEffect(() => {
    return () => timersRef.current.forEach((timer) => window.clearTimeout(timer));
  }, []);

  useEffect(() => {
    const updateCountdown = () => setDailyResetCountdown(getDailyResetCountdown());
    updateCountdown();
    const interval = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(interval);
  }, []);

  function acceptAgreement() {
    setAgreementOpen(false);
    setTransitioning(true);
    setGiftVisibility(true);
    setBurst(true);

    timersRef.current.push(window.setTimeout(() => {
      setProgramStarted(true);
      setTransitioning(false);
    }, 650));

    timersRef.current.push(window.setTimeout(() => {
      setBurst(false);
      setGiftVisibility(false);
    }, 2100));
  }

  function setGiftVisibility(visible: boolean) {
    if (giftUnmountTimerRef.current !== null) {
      window.clearTimeout(giftUnmountTimerRef.current);
      giftUnmountTimerRef.current = null;
    }

    if (visible) {
      setGiftsMounted(true);
      setShowGifts(true);
      return;
    }

    setShowGifts(false);
    const timer = window.setTimeout(() => {
      setGiftsMounted(false);
      giftUnmountTimerRef.current = null;
    }, 750);
    giftUnmountTimerRef.current = timer;
    timersRef.current.push(timer);
  }

  async function copyReferralLink() {
    await navigator.clipboard.writeText(`${window.location.origin}/ref/${referralSlug}`);
    toast.success("Referral link copied", { description: "Share it with friends to start earning Growth Points." });
  }

  function claimGrowthPoints() {
    if (availablePoints === 0) {
      toast.info("No Growth Points available", { description: "New qualified referrals will appear here." });
      return;
    }

    const serverName = REWARD_SERVERS.find((server) => server.id === selectedRewardServer)?.name ?? "your server";
    setAvailablePoints(0);
    toast.success("Growth Points claimed", { description: `10 Growth Points were applied to ${serverName}.` });
  }

  return (
    <section aria-labelledby="rewards-heading" className="mx-auto w-full max-w-[980px]">
      <Card className={`nexus-card relative isolate overflow-hidden rounded-3xl ${programStarted && !transitioning ? "" : "min-h-[min(680px,calc(100vh-8rem))]"}`}>
        {giftsMounted ? <RewardsFallEffect burst={burst} visible={showGifts || burst} /> : null}
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_50%_5%,color-mix(in_srgb,var(--accent)_18%,transparent),transparent_44%)]" />
        <Card.Content className={`relative z-10 flex flex-col p-6 sm:p-8 ${programStarted && !transitioning ? "" : "min-h-[min(680px,calc(100vh-8rem))]"}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-accent">
              <span className="flex size-9 items-center justify-center rounded-xl bg-accent/12">
                <Gift className="size-4" />
              </span>
              Rewards
            </div>
            {programStarted && !transitioning ? (
              <Button size="sm" variant="secondary" onPress={() => setGiftVisibility(!showGifts)}>
                <Gift className="size-4" />
                {showGifts ? "Hide gifts" : "Show gifts"}
              </Button>
            ) : null}
          </div>

          {transitioning ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center animate-[verification-tab-blend_350ms_ease-out]">
              <span className="flex items-center gap-3 rounded-2xl border border-border bg-background/85 px-5 py-3 font-semibold text-foreground shadow-lg backdrop-blur-md">
                <Spinner size="sm" />
                Activating your rewards
              </span>
            </div>
          ) : programStarted ? (
            <div className="flex flex-col justify-start py-5 animate-[verification-tab-blend_500ms_ease-out] sm:py-6">
              <div className="mx-auto w-full max-w-[820px] text-center">
                <Chip color="accent" variant="soft">
                  <Sparkles className="size-3.5" />
                  <Chip.Label>Referral Program</Chip.Label>
                </Chip>
                <h1 id="rewards-heading" className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Grow Nexbiy. Earn rewards.</h1>
                <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-muted">Share your personal referral link and earn Growth Points from qualified signups.</p>

                <Tabs selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(String(key))} className="mt-6 w-full" variant="primary">
                  <Tabs.ListContainer className="mx-auto max-w-md">
                    <Tabs.List aria-label="Referral rewards sections">
                      <Tabs.Tab id="referral">Referral</Tabs.Tab>
                      <Tabs.Tab id="tracking">Tracking</Tabs.Tab>
                    </Tabs.List>
                  </Tabs.ListContainer>

                  <Tabs.Panel id="referral" className="pt-8">
                    <Card className="nexus-card-elevated mx-auto max-w-3xl text-left">
                      <Card.Header className="p-7 pb-0">
                        <Card.Title className="text-xl">Your referral link</Card.Title>
                        <Card.Description className="mt-1 text-base">Earn 10 Growth Points for every qualified signup.</Card.Description>
                      </Card.Header>
                      <Card.Content className="p-7">
                        <div className="flex items-center gap-3 rounded-2xl border border-border bg-default/50 p-4">
                          <code className="min-w-0 flex-1 truncate px-2 text-base font-semibold text-foreground sm:text-lg">{referralLink}</code>
                          <Button isIconOnly size="md" variant="secondary" aria-label="Copy referral link" onPress={copyReferralLink}>
                            <Copy className="size-5" />
                          </Button>
                        </div>
                      </Card.Content>
                    </Card>
                  </Tabs.Panel>

                  <Tabs.Panel id="tracking" className="pt-5">
                    <div className="mx-auto max-w-[820px] space-y-4 text-left">
                      <div className="grid items-stretch gap-3 md:grid-cols-3">
                        <Card className="nexus-card-elevated h-36">
                          <Card.Content className="flex h-full flex-col p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                              <p className="text-xs font-medium text-muted">Referral clicks</p>
                              <p className="mt-0.5 text-2xl font-bold tabular-nums text-foreground">2</p>
                              </div>
                              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                                <MousePointerClick className="size-4.5" />
                              </span>
                            </div>
                            <p className="mt-auto text-[11px] text-muted">Qualified link visits</p>
                          </Card.Content>
                        </Card>

                        <Card className="nexus-card-elevated h-36">
                          <Card.Content className="flex h-full flex-col p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                              <p className="text-xs font-medium text-muted">Daily point limit</p>
                              <p className="mt-0.5 text-xl font-bold text-foreground">10 points</p>
                              </div>
                              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                                <Clock3 className="size-4.5" />
                              </span>
                            </div>
                            <p className="mt-auto text-[11px] text-muted">Resets in <span className="font-semibold tabular-nums text-foreground">{dailyResetCountdown}</span></p>
                          </Card.Content>
                        </Card>

                        <Card className="nexus-card-elevated h-36 md:col-span-1">
                          <Card.Content className="flex h-full flex-col p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-muted">Available Growth Points</p>
                                <p className="mt-0.5 text-2xl font-bold tabular-nums text-foreground">{availablePoints}</p>
                              </div>
                              <span className="flex size-9 items-center justify-center rounded-xl bg-success/10 text-success">
                                <Trophy className="size-5" />
                              </span>
                            </div>
                            <div className="mt-auto flex items-center gap-2">
                              <Select
                                className="min-w-0 flex-1"
                                selectedKey={selectedRewardServer}
                                onSelectionChange={(key) => setSelectedRewardServer(String(key))}
                              >
                                <Label className="sr-only">Server to reward</Label>
                                <Select.Trigger className="h-9 min-w-0">
                                  <Select.Value className="truncate" />
                                  <Select.Indicator />
                                </Select.Trigger>
                                <Select.Popover>
                                  <ListBox>
                                    {REWARD_SERVERS.map((server) => (
                                      <ListBox.Item key={server.id} id={server.id} textValue={server.name}>
                                        {server.name}
                                        <ListBox.ItemIndicator />
                                      </ListBox.Item>
                                    ))}
                                  </ListBox>
                                </Select.Popover>
                              </Select>
                              <Button size="sm" variant="primary" isDisabled={availablePoints === 0} onPress={claimGrowthPoints}>Claim</Button>
                            </div>
                          </Card.Content>
                        </Card>
                      </div>

                      <Card className="nexus-card-elevated overflow-hidden">
                        <Card.Header className="p-5 pb-2">
                          <Card.Title className="text-lg">Referral activity</Card.Title>
                          <Card.Description>Track signups, completed actions, and earned Growth Points.</Card.Description>
                        </Card.Header>
                        <Card.Content className="px-2 pb-2 sm:px-4 sm:pb-4">
                          <Table>
                            <Table.ScrollContainer>
                              <Table.Content aria-label="Referral activity" className="min-w-[640px]">
                                <Table.Header>
                                  <Table.Column isRowHeader>User</Table.Column>
                                  <Table.Column>Status</Table.Column>
                                  <Table.Column>Completed action</Table.Column>
                                  <Table.Column className="text-end">Reward</Table.Column>
                                </Table.Header>
                                <Table.Body>
                                  {MOCK_REFERRALS.map((referral) => (
                                    <Table.Row key={referral.id} id={referral.id}>
                                      <Table.Cell>
                                        <div className="flex items-center gap-3">
                                          <span className="flex size-9 items-center justify-center rounded-full bg-accent/12 text-sm font-bold text-accent">
                                            {referral.name.slice(0, 1)}
                                          </span>
                                          <span className="font-medium text-foreground">{referral.name}</span>
                                        </div>
                                      </Table.Cell>
                                      <Table.Cell>{referral.status}</Table.Cell>
                                      <Table.Cell>
                                        <Chip size="sm" color={referral.completed ? "success" : "warning"} variant="soft">
                                          <Chip.Label>{referral.completed ? "Completed" : "Pending"}</Chip.Label>
                                        </Chip>
                                      </Table.Cell>
                                      <Table.Cell className="text-end font-semibold tabular-nums">
                                        {referral.reward > 0 ? `+${referral.reward}` : "0"}
                                      </Table.Cell>
                                    </Table.Row>
                                  ))}
                                </Table.Body>
                              </Table.Content>
                            </Table.ScrollContainer>
                          </Table>
                        </Card.Content>
                      </Card>
                    </div>
                  </Tabs.Panel>
                </Tabs>
              </div>
            </div>
          ) : (
            <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center py-16 text-center animate-[verification-tab-blend_500ms_ease-out] sm:py-24">
              <Chip color="accent" variant="soft">
                <Sparkles className="size-3.5" />
                <Chip.Label>Nexbiy Referral Rewards</Chip.Label>
              </Chip>

              <h1 id="rewards-heading" className="mt-7 max-w-5xl text-4xl leading-[1.08] font-bold tracking-tight sm:text-5xl lg:text-6xl">
                <span className="block text-foreground">Invite friends to Nexbiy.</span>
                <span className="block bg-gradient-to-r from-[#629BF8] to-[#82B0F9] bg-clip-text text-transparent">Earn Growth Points.</span>
                <span className="block text-foreground">Use them to promote your listings.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-muted sm:text-lg">
                Share Nexbiy with friends and earn points when qualified referrals join. Redeem them for temporary visibility boosts across Nexbiy.
              </p>

              <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <Button className="min-w-40" size="lg" variant="primary" onPress={() => setAgreementOpen(true)}>
                  Earn now
                  <ArrowRight className="size-4" />
                </Button>
                <div className="flex min-h-12 items-center justify-center gap-3 rounded-2xl border border-border bg-background/80 px-5 shadow-sm backdrop-blur-md" aria-label="Current Growth Points: 0">
                  <span className="text-2xl font-bold tabular-nums text-foreground">0</span>
                  <span className="text-sm font-medium text-muted">Growth Points</span>
                </div>
              </div>
            </div>
          )}
        </Card.Content>
      </Card>

      <AlertDialog
        isOpen={agreementOpen}
        onOpenChange={(isOpen) => {
          setAgreementOpen(isOpen);
          if (!isOpen) setAgreementAccepted(false);
        }}
      >
        <AlertDialog.Backdrop>
          <AlertDialog.Container>
            <AlertDialog.Dialog className="sm:max-w-[440px]">
              <AlertDialog.CloseTrigger />
              <AlertDialog.Header>
                <AlertDialog.Icon status="success" />
                <AlertDialog.Heading>Referral Program Agreement</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body className="space-y-4">
                <p className="text-sm leading-6 text-muted">A fair referral program keeps rewards valuable for every Nexbiy owner.</p>
                <div className="grid gap-2.5">
                  <div className="flex gap-3 rounded-xl border border-border bg-default/35 p-3.5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <Sparkles className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">10-point daily limit</p>
                      <p className="mt-0.5 text-xs leading-5 text-muted">Owners may apply up to 10 Growth Points each day.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 rounded-xl border border-warning/25 bg-warning/5 p-3.5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
                      <ShieldAlert className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Fair use required</p>
                      <p className="mt-0.5 text-xs leading-5 text-muted">Fake referrals or reward manipulation may result in program suspension.</p>
                    </div>
                  </div>
                </div>
                <Checkbox isSelected={agreementAccepted} onChange={setAgreementAccepted}>
                  <Checkbox.Content className="items-start gap-3 rounded-xl border border-border p-3">
                    <Checkbox.Control className="mt-0.5">
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    <span className="text-sm leading-5 text-foreground">I understand and agree to follow the Referral Program rules.</span>
                  </Checkbox.Content>
                </Checkbox>
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button slot="close" variant="tertiary">Cancel</Button>
                <Button variant="primary" isDisabled={!agreementAccepted} onPress={acceptAgreement}>Agree &amp; continue</Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
    </section>
  );
}
