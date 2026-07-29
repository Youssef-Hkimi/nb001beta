"use client";

import { Modal } from "@heroui/react";
import { Bot, Compass, Server } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { LinkButton } from "@/components/ui/link-button";
import { useAuth } from "@/lib/auth/auth-context";

const WELCOME_SEEN_KEY = "nexbiy-welcome-seen-v1";
const WELCOME_DELAY_MS = 1600;

const HIGHLIGHTS = [
  {
    icon: Compass,
    title: "Discover communities",
    description: "Find Discord spaces built around your interests.",
  },
  {
    icon: Bot,
    title: "Explore useful bots",
    description: "Browse tools that help communities grow and thrive.",
  },
  {
    icon: Server,
    title: "Share your own listing",
    description: "Sign in when you are ready to publish a server or bot.",
  },
];

export function NewVisitorWelcome() {
  const pathname = usePathname();
  const { isAuthenticated, isReady } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isReady || isAuthenticated) return;
    if (
      pathname.startsWith("/login") ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/admin") ||
      new URLSearchParams(window.location.search).has("ref")
    ) {
      return;
    }

    try {
      if (window.localStorage.getItem(WELCOME_SEEN_KEY)) return;
    } catch {
      return;
    }

    const timer = window.setTimeout(() => setIsOpen(true), WELCOME_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [isAuthenticated, isReady, pathname]);

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) {
      try {
        window.localStorage.setItem(WELCOME_SEEN_KEY, "true");
      } catch {
        // The welcome remains safely dismissible when storage is unavailable.
      }
    }
  }

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={handleOpenChange}>
      <Modal.Container>
        <Modal.Dialog className="overflow-hidden sm:max-w-xl">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_top,rgba(98,155,248,0.25),transparent_68%)]"
          />
          <Modal.CloseTrigger />
          <Modal.Header className="relative flex flex-col items-center px-6 pt-8 text-center sm:px-8">
            <span className="mb-4 flex size-16 items-center justify-center rounded-2xl border border-accent/20 bg-background/80 shadow-sm">
              <Image
                src="/nexus-logo.jpg"
                alt="Nexbiy"
                width={52}
                height={52}
                className="size-13 rounded-xl object-cover"
              />
            </span>
            <Modal.Heading className="text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome to Nexbiy
            </Modal.Heading>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted sm:text-base">
              Your place to discover Discord communities, find useful bots, and grow a listing of
              your own.
            </p>
          </Modal.Header>

          <Modal.Body className="relative px-6 sm:px-8">
            <div className="grid gap-2.5 sm:grid-cols-3">
              {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="flex gap-3 rounded-2xl border border-border bg-default/35 p-3 sm:block"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-accent">
                    <Icon className="size-4.5" aria-hidden />
                  </span>
                  <div className="min-w-0 sm:mt-3">
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Modal.Body>

          <Modal.Footer className="relative flex-col gap-2 px-6 pb-7 sm:flex-row sm:justify-center sm:px-8">
            <LinkButton href="/explore" slot="close" className="w-full sm:w-auto">
              <Compass className="size-4" aria-hidden />
              Start exploring
            </LinkButton>
            <LinkButton
              href="/bots"
              slot="close"
              variant="secondary"
              className="w-full sm:w-auto"
            >
              Browse bots
            </LinkButton>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
