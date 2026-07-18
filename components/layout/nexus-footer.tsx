"use client";

import { Button, Dropdown, Input, Link, Separator, Spinner, toast } from "@heroui/react";
import {
  ChevronDown,
  Globe2,
  Mail,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import { FormEvent, useRef, useState } from "react";

import { siteConfig } from "@/lib/site-config";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SITEMAP_COLUMNS = [
  {
    title: "Explore",
    links: [
      { label: "Explore Nexus", href: "/explore" },
      { label: "Discord Servers", href: "/server" },
      { label: "Discord Bots", href: "/bots" },
      { label: "Categories", href: "/categories" },
      { label: "Trending Communities", href: "/explore#trending" },
    ],
  },
  {
    title: "For Creators",
    links: [
      { label: "Add a Server", href: "/dashboard/new?type=server" },
      { label: "Add a Bot", href: "/dashboard/new?type=bot" },
      { label: "Creator Dashboard", href: "/dashboard" },
      { label: "Listing Guidelines", href: "/guidelines" },
      { label: "Verification Requirements", href: "/verification" },
    ],
  },
  {
    title: "Trust & Support",
    links: [
      { label: "Safety Center", href: "/safety" },
      { label: "Help Center", href: "/help" },
      { label: "Report a Listing", href: "/report" },
      { label: "Community Standards", href: "/community-standards" },
      { label: "Platform Status", href: "/status" },
    ],
  },
  {
    title: "Company & Legal",
    links: [
      { label: "About Nexus", href: "/about" },
      { label: "Contact", href: "/contact" },
      ...siteConfig.legalLinks,
    ],
  },
] as const;

export function NexusFooter() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [language, setLanguage] = useState(siteConfig.availableLanguages[0]);
  const submittedEmails = useRef(new Set<string>());
  const currentYear = new Date().getFullYear();

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setEmailError("Enter a valid email address.");
      return;
    }

    if (isSubmitting) return;
    if (submittedEmails.current.has(normalizedEmail)) {
      toast.info("This email is already subscribed.");
      return;
    }

    setEmailError("");
    setIsSubmitting(true);

    try {
      const [response] = await Promise.all([
        fetch("/api/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: normalizedEmail }),
        }),
        new Promise((resolve) => setTimeout(resolve, 400)),
      ]);

      if (!response.ok) throw new Error("Subscription failed");

      submittedEmails.current.add(normalizedEmail);
      setEmail("");
      toast.success("You’re subscribed to Nexus updates.");
    } catch {
      toast.danger("We couldn’t subscribe this email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <footer
      id="site-footer"
      className="nexus-footer border-t border-border"
      aria-labelledby="footer-newsletter-title"
    >
      <div className="mx-auto w-full max-w-[1360px] px-5 pt-16 pb-8 sm:px-6 md:pt-24 lg:px-8 lg:pt-28 lg:pb-10">
        <section className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <h2
            id="footer-newsletter-title"
            className="max-w-2xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Discover what’s next on Nexus
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">
            Get community highlights, new bot discoveries, platform updates, and creator
            opportunities delivered to your inbox.
          </p>

          <form
            className="mt-8 flex w-full max-w-[620px] flex-col gap-3 sm:flex-row"
            onSubmit={subscribe}
            noValidate
          >
            <div className="min-w-0 flex-1 text-left">
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2 text-muted"
                  aria-hidden
                />
                <Input
                  aria-label="Email address"
                  aria-describedby={emailError ? "newsletter-email-error" : undefined}
                  aria-invalid={Boolean(emailError)}
                  className={`nexus-footer-input h-11 w-full pl-10 ${
                    emailError ? "!border-danger" : ""
                  }`}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (emailError) setEmailError("");
                  }}
                />
              </div>
              {emailError ? (
                <p id="newsletter-email-error" className="mt-1.5 px-1 text-xs text-danger">
                  {emailError}
                </p>
              ) : null}
            </div>
            <Button
              type="submit"
              className="h-11 shrink-0 px-6 sm:min-w-32"
              variant="primary"
              isDisabled={isSubmitting}
            >
              {isSubmitting ? <Spinner size="sm" aria-label="Subscribing" /> : null}
              {isSubmitting ? "Subscribing…" : "Subscribe"}
            </Button>
          </form>
          <p className="mt-3 text-xs text-muted">No spam. Unsubscribe whenever you like.</p>
        </section>

        <nav
          aria-label="Footer navigation"
          className="mt-16 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4"
        >
          {SITEMAP_COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-bold tracking-wide text-foreground">{column.title}</h3>
              <ul className="mt-5 space-y-3">
                {column.links.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="nexus-footer-link text-sm text-muted">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <section aria-label="Nexus support" className="mt-16 grid gap-8 md:grid-cols-3 lg:mt-20">
          <SupportBlock
            icon={<MessageCircle className="size-5 text-[#629BF8]" aria-hidden />}
            label="Discord support"
            value="Join the Nexus support community"
            href={siteConfig.supportDiscordUrl}
          />
          <SupportBlock
            icon={<Mail className="size-5 text-[#9B8AFB]" aria-hidden />}
            label="Need help?"
            value={siteConfig.supportEmail || "Email support will be available soon"}
            href={siteConfig.supportEmail ? `mailto:${siteConfig.supportEmail}` : ""}
          />
          <SupportBlock
            icon={<ShieldCheck className="size-5 text-emerald-500" aria-hidden />}
            label="Report a safety concern"
            value="Contact the Trust & Safety team"
            href={siteConfig.safetyUrl}
          />
        </section>

        <Separator className="mt-14 mb-8 bg-border lg:mt-16" />

        <div className="grid items-center gap-6 text-center md:grid-cols-[1fr_2fr_1fr] md:text-left">
          <Link
            href={siteConfig.logo.href}
            aria-label="Nexus home"
            className="mx-auto inline-flex items-center gap-2.5 text-foreground md:mx-0 md:justify-self-start"
          >
            <Image src="/nexus-logo.jpg" alt="" width={36} height={36} className="size-9 rounded-xl object-cover" />
            <span className="text-lg font-bold tracking-tight">{siteConfig.logo.label}</span>
          </Link>

          <p className="text-xs leading-5 text-muted md:text-center">
            © {currentYear} {siteConfig.name}. Discord is a trademark of Discord Inc. Nexus is not
            affiliated with Discord Inc.
          </p>

          <Dropdown>
            <Dropdown.Trigger
              aria-label={`Select language. Current language: ${language.label}`}
              className="button button--ghost mx-auto inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm font-medium md:mx-0 md:justify-self-end"
            >
              <Globe2 className="size-4 text-muted" aria-hidden />
              {language.label}
              <ChevronDown className="size-3.5 text-muted" aria-hidden />
            </Dropdown.Trigger>
            <Dropdown.Popover placement="top end">
              <Dropdown.Menu
                aria-label="Languages"
                selectionMode="single"
                selectedKeys={[language.id]}
                onAction={(key) => {
                  const nextLanguage = siteConfig.availableLanguages.find(
                    (item) => item.id === String(key),
                  );
                  if (nextLanguage) setLanguage(nextLanguage);
                }}
              >
                {siteConfig.availableLanguages.map((item) => (
                  <Dropdown.Item key={item.id} id={item.id} textValue={item.label}>
                    <Globe2 className="size-4" aria-hidden />
                    {item.label}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>
      </div>
    </footer>
  );
}

function SupportBlock({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted">{label}</p>
        {href ? (
          <Link href={href} className="nexus-footer-link mt-1 inline-flex text-sm font-semibold text-foreground">
            {value}
          </Link>
        ) : (
          <p className="mt-1 text-sm font-semibold text-foreground/70">{value}</p>
        )}
      </div>
    </div>
  );
}
