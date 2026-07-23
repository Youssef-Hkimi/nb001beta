"use client";

import { Button, Card, Chip } from "@heroui/react";
import {
  ArrowRight,
  Check,
  Gift,
  Link2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserRoundPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { NexusFooter } from "@/components/layout/nexus-footer";
import { PublicRewardsRain } from "@/components/rewards/public-rewards-physics";
import { IconifyIcon } from "@/components/ui/iconify-icon";
import { useAuth } from "@/lib/auth/auth-context";

const STEPS = [
  {
    title: "Share your personal link",
    description: "Every Nexbiy member receives one referral link from the Rewards dashboard.",
    icon: Link2,
  },
  {
    title: "A friend joins Nexbiy",
    description: "When a qualified friend signs up, the referral is tracked automatically.",
    icon: UserRoundPlus,
  },
  {
    title: "Both of you earn 10 points",
    description: "Growth Points can be applied to help an eligible server or bot reach more people.",
    icon: Gift,
  },
] as const;

const BENEFITS = [
  "10 Growth Points for each qualified referral",
  "10 welcome Growth Points for the referred friend",
  "Choose which eligible listing receives your points",
  "Clear referral status and reward tracking",
] as const;

export function PublicRewardsPage() {
  const router = useRouter();
  const { isAuthenticated, isReady, login } = useAuth();
  const [showGifts, setShowGifts] = useState(true);

  useEffect(() => {
    if (isReady && isAuthenticated) {
      router.replace("/dashboard?tab=rewards");
    }
  }, [isAuthenticated, isReady, router]);

  if (!isReady || isAuthenticated) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative isolate min-h-[calc(100vh-4rem)] overflow-x-clip bg-background text-foreground">
      <PublicRewardsRain visible={showGifts} />
      <Button
        size="sm"
        variant="secondary"
        className="fixed top-20 right-4 z-40 shadow-sm backdrop-blur-md"
        onPress={() => setShowGifts((visible) => !visible)}
      >
        <Gift className="size-4" />
        {showGifts ? "Hide gifts" : "Show gifts"}
      </Button>

      <section className="relative overflow-hidden border-b border-border px-4 py-20 md:px-6 md:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(98,155,248,0.18),transparent_38%),radial-gradient(circle_at_18%_70%,rgba(192,252,28,0.08),transparent_28%),radial-gradient(circle_at_82%_72%,rgba(37,150,190,0.10),transparent_28%)]" />
        <div className="relative z-10 mx-auto flex w-full max-w-[1080px] flex-col items-center text-center">
          <Chip className="border border-[#2596be]/25 bg-[#2596be]/10 text-[#2596be]" variant="soft">
            <Gift className="size-4" />
            <Chip.Label>Nexbiy Referral Rewards</Chip.Label>
          </Chip>

          <h1 className="mt-7 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl">
            Invite friends.{" "}
            <span className="bg-gradient-to-r from-[#2596be] via-[#629BF8] to-[#c0fc1c] bg-clip-text text-transparent">
              Grow together.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            Share Nexbiy with friends and earn Growth Points that help your Discord server
            or bot stand out in discovery.
          </p>

          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
            <Button
              data-reward-collider
              size="lg"
              className="min-w-52"
              onPress={() => login("/dashboard?tab=rewards")}
            >
              <IconifyIcon icon="ic:baseline-discord" className="size-5" />
              Login Now
              <ArrowRight className="size-4" />
            </Button>
            <Button
              data-reward-collider
              size="lg"
              variant="secondary"
              onPress={() => document.getElementById("how-rewards-work")?.scrollIntoView({ behavior: "smooth" })}
            >
              See how it works
            </Button>
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted">
            <span className="flex items-center gap-1.5"><Check className="size-4 text-emerald-500" />Free to join</span>
            <span className="flex items-center gap-1.5"><Check className="size-4 text-emerald-500" />10 points per qualified referral</span>
            <span className="flex items-center gap-1.5"><Check className="size-4 text-emerald-500" />Tracked in your dashboard</span>
          </div>
        </div>
      </section>

      <main className="relative z-10">
        <section id="how-rewards-work" className="scroll-mt-24 px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto w-full max-w-[1120px]">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold text-accent">How rewards work</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                A simple reward for growing Nexbiy
              </h2>
              <p className="mt-4 leading-relaxed text-muted">
                Referrals reward both people while keeping promotion fair and transparent.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <Card key={step.title} className="nexus-card gap-5 p-6">
                    <div className="flex items-center justify-between">
                      <span className="flex size-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                        <Icon className="size-5" />
                      </span>
                      <span className="text-sm font-semibold text-muted">0{index + 1}</span>
                    </div>
                    <div>
                      <Card.Title className="text-lg">{step.title}</Card.Title>
                      <Card.Description className="mt-2 leading-relaxed">
                        {step.description}
                      </Card.Description>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-default/20 px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto grid w-full max-w-[1120px] items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <span className="flex size-12 items-center justify-center rounded-2xl bg-[#c0fc1c]/10 text-[#79a900] dark:text-[#c0fc1c]">
                <TrendingUp className="size-6" />
              </span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                Turn referrals into listing growth
              </h2>
              <p className="mt-4 max-w-xl leading-relaxed text-muted">
                Apply earned Growth Points to an eligible server or bot from your Rewards
                dashboard. Owners may apply up to 10 points per day.
              </p>
            </div>

            <Card className="nexus-card-elevated gap-5 p-6 md:p-8">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-[#2596be]/10 text-[#2596be]">
                  <Sparkles className="size-5" />
                </span>
                <div>
                  <Card.Title>What you unlock</Card.Title>
                  <Card.Description>Everything stays visible in one dashboard.</Card.Description>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {BENEFITS.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-2.5 rounded-2xl bg-default/50 p-3.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                    <p className="text-sm leading-6 text-foreground">{benefit}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        <section className="px-4 py-16 md:px-6 md:py-24">
          <Card className="nexus-card-elevated relative mx-auto max-w-[960px] items-center gap-5 overflow-hidden p-8 text-center md:p-12">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(98,155,248,0.16),transparent_48%)]" />
            <span className="relative flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <ShieldCheck className="size-5" />
            </span>
            <div className="relative">
              <Card.Title className="text-2xl sm:text-3xl">Ready to earn Growth Points?</Card.Title>
              <Card.Description className="mx-auto mt-3 max-w-xl leading-relaxed">
                Log in with Discord to get your personal referral link and open the full
                Rewards dashboard.
              </Card.Description>
            </div>
            <Button
              data-reward-collider
              size="lg"
              className="relative min-w-52"
              onPress={() => login("/dashboard?tab=rewards")}
            >
              <IconifyIcon icon="ic:baseline-discord" className="size-5" />
              Login Now
            </Button>
          </Card>
        </section>
      </main>

      <div className="relative z-10">
        <NexusFooter />
      </div>
    </div>
  );
}
