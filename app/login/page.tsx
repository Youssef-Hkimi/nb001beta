"use client";

import { Alert, Button, Card, Separator } from "@heroui/react";
import { ArrowRight, Check, LockKeyhole, ShieldCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { IconifyIcon } from "@/components/ui/iconify-icon";
import { useAuth } from "@/lib/auth/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, login, user } = useAuth();
  const [connecting, setConnecting] = useState(false);

  function continueWithDiscord() {
    setConnecting(true);
    window.setTimeout(() => {
      login();
      router.push("/dashboard");
    }, 650);
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-default/20 px-4 py-12 sm:py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(98,155,248,0.16),transparent_38%)]" />
      <Card className="nexus-card-elevated relative w-full max-w-[520px] gap-0 overflow-hidden rounded-[2rem] p-6 shadow-2xl shadow-black/10 sm:p-9">
        <Button isIconOnly variant="ghost" aria-label="Close login" className="absolute top-5 right-5" onPress={() => router.back()}><X className="size-5" /></Button>

        <div className="flex flex-col items-center text-center">
          <span className="flex size-16 items-center justify-center rounded-2xl border border-border bg-default/60 text-foreground">
            <IconifyIcon icon="ic:baseline-discord" className="size-8" label="Discord" />
          </span>
          <h1 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">{isAuthenticated ? "You’re signed in" : "Log in to Nexus"}</h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted sm:text-base">
            {isAuthenticated ? `Connected as ${user?.username ?? "your Discord account"}.` : "Use your Discord account to create listings, manage projects, and access your Nexus dashboard."}
          </p>
        </div>

        {isAuthenticated ? (
          <div className="mt-8 space-y-3">
            <Alert status="success"><Alert.Indicator /><Alert.Content><Alert.Title>Discord account connected</Alert.Title></Alert.Content></Alert>
            <Button className="w-full" onPress={() => router.push("/dashboard")}>Continue to Dashboard<ArrowRight className="size-4" /></Button>
          </div>
        ) : (
          <>
            <Button className="mt-8 w-full" size="lg" isPending={connecting} onPress={continueWithDiscord}>
              <IconifyIcon icon="ic:baseline-discord" className="size-5" />
              {connecting ? "Connecting…" : "Continue with Discord"}
            </Button>

            <div className="my-7 flex items-center gap-3"><Separator className="flex-1" /><span className="text-xs font-semibold tracking-wide text-muted uppercase">Secure sign-in</span><Separator className="flex-1" /></div>

            <div className="space-y-3">
              <LoginBenefit icon={ShieldCheck} text="Nexus only requests the Discord access needed for your account and listings." />
              <LoginBenefit icon={LockKeyhole} text="Your Discord password is never shared with or stored by Nexus." />
              <LoginBenefit icon={Check} text="Discord is the only login option for now. More providers may be added later." />
            </div>

            <p className="mt-7 text-center text-xs leading-relaxed text-muted">By continuing, you agree to the Nexus Terms of Service and Privacy Policy.</p>
          </>
        )}
      </Card>
    </div>
  );
}

function LoginBenefit({ icon: Icon, text }: { icon: typeof Check; text: string }) {
  return <div className="flex items-start gap-3 rounded-xl bg-default/40 px-3.5 py-3"><span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent"><Icon className="size-3.5" /></span><p className="text-sm leading-relaxed text-muted">{text}</p></div>;
}
