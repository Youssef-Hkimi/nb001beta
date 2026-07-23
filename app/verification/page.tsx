"use client";

import { Accordion, Alert, Avatar, Button, Card, Chip, Tabs } from "@heroui/react";
import {
  Award,
  Bell,
  ChevronDown,
  Clock3,
  Eye,
  FileCheck2,
  SearchCheck,
  UserRoundCheck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { NexusFooter } from "@/components/layout/nexus-footer";
import { IconifyIcon } from "@/components/ui/iconify-icon";
import { LinkButton } from "@/components/ui/link-button";
import { VerifiedBadgeIcon } from "@/components/ui/verified-badge-icon";

const SERVER_REQUIREMENTS = [
  { title: "5,000+ members", description: "A stable community with at least 5,000 Discord members.", icon: "solar:users-group-rounded-linear" },
  { title: "Discord ToS compliant", description: "The server follows Discord’s Terms of Service and Community Guidelines.", icon: "solar:shield-check-linear" },
  { title: "Consistently active", description: "Healthy, ongoing activity from real members and an active staff team.", icon: "solar:chat-round-dots-linear" },
  { title: "Safe for work", description: "The community and its public Nexbiy listing must remain SFW.", icon: "solar:heart-angle-linear" },
] as const;

const BOT_REQUIREMENTS = [
  { title: "Used in 500+ servers", description: "The bot is actively connected to at least 500 Discord servers.", icon: "solar:server-square-cloud-linear" },
  { title: "Discord ToS compliant", description: "The bot follows Discord policies and uses approved API behavior.", icon: "solar:code-square-linear" },
  { title: "Actively maintained", description: "Developers ship fixes, improvements, and meaningful feature updates.", icon: "solar:programming-linear" },
  { title: "Safe for work", description: "The bot’s listing, commands, and primary functionality must remain SFW.", icon: "solar:shield-user-linear" },
] as const;

const VERIFIED_EXAMPLES = [
  { name: "Lofi Lounge", meta: "Music · 128K members", image: "/verification/lofi-lounge.png", icon: "solar:headphones-round-sound-linear", tone: "bg-violet-500/15 text-violet-400" },
  { name: "Study Garden", meta: "Study · 84K members", image: "/verification/study-garden.png", icon: "solar:notebook-linear", tone: "bg-emerald-500/15 text-emerald-400" },
  { name: "Cozy Corner", meta: "Social · 46K members", image: "/verification/cozy-corner.png", icon: "solar:cup-hot-linear", tone: "bg-amber-500/15 text-amber-400" },
  { name: "Midnight Café", meta: "Chill · 31K members", image: "/verification/midnight-cafe.png", icon: "solar:moon-stars-linear", tone: "bg-blue-500/15 text-blue-400" },
] as const;

const PROCESS = [
  { title: "Nexbiy checks your server or bot", description: "Nexbiy reviews trusted platform signals, listing information, activity, and safety indicators to confirm that the project meets the baseline requirements.", icon: SearchCheck },
  { title: "Review and agree to the terms", description: "The lister reviews and accepts the Nexbiy verification terms and conditions, including the ongoing safety and maintenance responsibilities.", icon: FileCheck2 },
  { title: "Receive the verification badge", description: "After the platform checks and terms are completed, Nexbiy issues the badge to the eligible listing and its lister profile.", icon: Award },
] as const;

const FAQS = [
  { id: "apply", question: "Can I apply for verification?", answer: "Not yet. Nexbiy monitors eligibility automatically. When a listing appears eligible, its lister will receive a notification with the next steps." },
  { id: "cards", question: "Does the badge appear on discovery cards or banners?", answer: "No. Verification is not displayed on listing-card banners. It appears on the full server or bot view page and beside the verified lister’s profile." },
  { id: "guaranteed", question: "Does meeting every requirement guarantee verification?", answer: "No. Requirements make a listing eligible for review, but Nexbiy may consider authenticity, safety history, platform abuse, maintenance quality, and other trust signals." },
  { id: "removed", question: "Can a verification badge be removed?", answer: "Yes. Nexbiy may remove verification if a server, bot, or lister stops meeting the requirements or violates Discord or Nexbiy policies." },
  { id: "benefits", question: "What are the benefits of verification?", answer: "Verification adds a trusted identity signal, can improve discovery confidence, and may unlock future creator and developer features as Nexbiy grows." },
] as const;

export default function VerificationPage() {
  const [audience, setAudience] = useState<"server" | "bot">("server");
  const [noticeVisible, setNoticeVisible] = useState(false);

  return (
    <div className="bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-border px-4 py-16 md:px-6 md:py-24 lg:py-28">
        <div className="relative mx-auto grid w-full max-w-[1240px] items-center gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)]">
          <div className="max-w-2xl">
            <Chip color="accent" variant="soft"><VerifiedBadgeIcon className="size-4 text-accent" /><Chip.Label>Nexbiy Verification</Chip.Label></Chip>
            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">Trust that stands out.</h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">Nexbiy verification helps people recognize established, authentic, and safely maintained Discord servers and bots.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <LinkButton href="#requirements">View requirements</LinkButton>
              <LinkButton href="#process" variant="secondary">How verification works</LinkButton>
            </div>
            <p className="mt-5 flex items-center gap-2 text-sm text-muted"><Clock3 className="size-4 text-accent" />Verification is awarded by Nexbiy. It cannot be selected while creating a listing.</p>
          </div>

          <VerificationArtwork />
        </div>
      </section>

      <main>
        <section id="requirements" className="scroll-mt-24 px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto w-full max-w-[1120px]">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold text-accent">Eligibility requirements</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">What Nexbiy looks for</h2>
              <p className="mt-4 leading-relaxed text-muted">Choose a listing type to see the baseline requirements. Meeting them makes a listing eligible for review, not automatically verified.</p>
            </div>

            <Tabs selectedKey={audience} onSelectionChange={(key) => setAudience(String(key) as "server" | "bot")} className="mt-10 w-full" variant="primary">
              <Tabs.ListContainer className="mx-auto w-full max-w-md">
                <Tabs.List aria-label="Verification listing type">
                  <Tabs.Tab id="server"><IconifyIcon icon="solar:users-group-rounded-linear" className="size-4" />Server verification</Tabs.Tab>
                  <Tabs.Tab id="bot"><IconifyIcon icon="solar:chat-square-code-linear" className="size-4" />Bot verification</Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>
              <Tabs.Panel id="server" className="pt-8">{audience === "server" ? <div key="server-requirements" className="verification-tab-content"><RequirementGrid items={SERVER_REQUIREMENTS} /></div> : null}</Tabs.Panel>
              <Tabs.Panel id="bot" className="pt-8">{audience === "bot" ? <div key="bot-requirements" className="verification-tab-content"><RequirementGrid items={BOT_REQUIREMENTS} /></div> : null}</Tabs.Panel>
            </Tabs>
          </div>
        </section>

        <section id="process" className="scroll-mt-24 border-y border-border bg-default/20 px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto w-full max-w-[1040px]">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-accent">Verification process</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">From eligibility to verified</h2>
              <p className="mt-4 leading-relaxed text-muted">Nexbiy checks listings proactively. There is currently no public application form or paid shortcut.</p>
            </div>
            <div className="relative mt-10 before:absolute before:top-8 before:bottom-8 before:left-6 before:w-px before:bg-border sm:before:left-7">
              {PROCESS.map((step, index) => <TimelineStep key={step.title} step={step} index={index} />)}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto w-full max-w-[1120px]">
            <div className="grid gap-5 lg:grid-cols-2">
              <Card className="nexus-card gap-4 p-6">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-accent/10 text-accent"><UserRoundCheck className="size-5" /></span>
                <div><Card.Title>Verified lister profile</Card.Title><Card.Description className="mt-2 leading-relaxed">The person or team responsible for an eligible listing receives a verification badge beside their Nexbiy profile identity.</Card.Description></div>
                <div className="flex items-center gap-3 rounded-2xl border border-border p-3"><Avatar className="size-11"><Avatar.Fallback className="bg-violet-500/15 font-semibold text-violet-400">ML</Avatar.Fallback></Avatar><div><p className="flex items-center gap-1.5 text-sm font-semibold">Mira Lofi <VerifiedBadgeIcon className="size-4 text-accent" /></p><p className="text-xs text-muted">Verified lister</p></div></div>
              </Card>
              <Card className="nexus-card gap-4 p-6">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-accent/10 text-accent"><Eye className="size-5" /></span>
                <div><Card.Title>Badge on the full view page</Card.Title><Card.Description className="mt-2 leading-relaxed">The listing itself is verified on its public server or bot page. Discovery-card banners remain clean and do not show the badge.</Card.Description></div>
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-border p-3"><div className="flex items-center gap-3"><Avatar className="size-11 rounded-xl"><Avatar.Image src="/verification/lofi-lounge.png" alt="" className="h-full w-full object-cover" /><Avatar.Fallback className="rounded-xl bg-violet-500/15 text-violet-400"><IconifyIcon icon="solar:headphones-round-sound-linear" className="size-5" /></Avatar.Fallback></Avatar><div><p className="text-sm font-semibold">Lofi Lounge</p><p className="text-xs text-muted">Public server page</p></div></div><VerifiedBadgeIcon className="size-5 text-accent" /></div>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-default/20 px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto w-full max-w-[880px]">
            <div className="text-center"><p className="text-sm font-semibold text-accent">Questions and answers</p><h2 className="mt-2 text-3xl font-bold tracking-tight">Verification FAQ</h2></div>
            <Accordion className="mt-10 space-y-3" hideSeparator defaultExpandedKeys={["apply"]}>
              {FAQS.map((item) => (
                <Accordion.Item key={item.id} id={item.id} className="rounded-2xl border border-border bg-background px-5">
                  <Accordion.Heading>
                    <Accordion.Trigger className="flex w-full items-center gap-3 py-5 text-left">
                      <span className="min-w-0 flex-1 font-semibold text-foreground">{item.question}</span>
                      <Accordion.Indicator className="text-muted"><ChevronDown className="size-4" /></Accordion.Indicator>
                    </Accordion.Trigger>
                  </Accordion.Heading>
                  <Accordion.Panel><Accordion.Body className="pb-5 text-sm leading-relaxed text-muted">{item.answer}</Accordion.Body></Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          </div>
        </section>

        <section className="px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto w-full max-w-[960px]">
            <Card className="nexus-card-elevated items-center gap-5 p-7 text-center md:p-10">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent"><Bell className="size-5" /></span>
              <div><Card.Title className="text-2xl">Eligible creators are notified automatically</Card.Title><Card.Description className="mx-auto mt-2 max-w-2xl leading-relaxed">Keep your listing accurate, maintain a safe project, and stay active. Nexbiy will contact you when your server or bot becomes eligible for review.</Card.Description></div>
              <Button variant={noticeVisible ? "secondary" : "primary"} onPress={() => setNoticeVisible((visible) => !visible)}>{noticeVisible ? "Hide example notice" : "Preview eligibility notice"}</Button>
              {noticeVisible ? <Alert status="accent" className="w-full max-w-xl text-left"><Alert.Indicator /><Alert.Content><Alert.Title>Your listing may be eligible</Alert.Title><Alert.Description>Nexbiy has detected that your listing meets the baseline requirements. Review the verification steps from your dashboard.</Alert.Description></Alert.Content></Alert> : null}
            </Card>
          </div>
        </section>
      </main>

      <NexusFooter />
    </div>
  );
}

function RequirementGrid({ items }: { items: ReadonlyArray<{ title: string; description: string; icon: `${string}:${string}` }> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => <Card key={item.title} className="nexus-card gap-4 p-5"><span className="flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent"><IconifyIcon icon={item.icon} className="size-5" /></span><div><Card.Title className="text-base">{item.title}</Card.Title><Card.Description className="mt-2 leading-relaxed">{item.description}</Card.Description></div></Card>)}
    </div>
  );
}

function TimelineStep({ step, index }: { step: (typeof PROCESS)[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const Icon = step.icon;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`verification-timeline-step relative grid min-h-[52vh] grid-cols-[3rem_minmax(0,1fr)] items-center gap-4 py-8 sm:grid-cols-[3.5rem_minmax(0,1fr)] md:min-h-[58vh] ${visible ? "is-visible" : ""}`}>
      <span className={`verification-timeline-marker z-10 flex size-12 items-center justify-center rounded-2xl border shadow-sm ${index === PROCESS.length - 1 ? "border-accent bg-accent text-white" : "border-border bg-background text-accent"}`}><Icon className="size-5" /></span>
      <Card className="verification-timeline-card nexus-card min-h-56 justify-center gap-5 p-6 md:min-h-64 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3"><span className="text-sm font-semibold text-accent">Step {index + 1} of {PROCESS.length}</span><Chip size="sm" variant="soft" color={index === PROCESS.length - 1 ? "accent" : "default"}><Chip.Label>{index === PROCESS.length - 1 ? "Badge issued" : "Required"}</Chip.Label></Chip></div>
        <div><Card.Title className="text-xl md:text-2xl">{step.title}</Card.Title><Card.Description className="mt-3 max-w-2xl text-sm leading-7 md:text-base">{step.description}</Card.Description></div>
        <p className="text-xs font-medium text-muted">{index === PROCESS.length - 1 ? "The verified status is now visible on Nexbiy." : "Continue scrolling to see the next step."}</p>
      </Card>
    </div>
  );
}

function VerificationArtwork() {
  return (
    <div className="relative min-h-[390px] p-2 sm:min-h-[440px] sm:p-4" aria-label="Examples of verified Discord communities">
      <div className="grid min-h-[350px] content-center gap-4 sm:min-h-[400px] sm:grid-cols-2 sm:gap-5">
        {VERIFIED_EXAMPLES.map((server, index) => (
          <div key={server.name} className="verification-server-float" style={{ animationDelay: `${index * -1.1}s` }}>
            <VerifiedServerCard server={server} />
          </div>
        ))}
      </div>
    </div>
  );
}

function VerifiedServerCard({ server }: { server: (typeof VERIFIED_EXAMPLES)[number] }) {
  return (
    <Card className="verification-server-card nexus-card group gap-0 p-3.5 shadow-lg shadow-black/5 backdrop-blur sm:p-4">
      <div className="flex items-center gap-3">
        <Avatar className="size-12 rounded-2xl">
          <Avatar.Image src={server.image} alt="" className="h-full w-full object-cover" />
          <Avatar.Fallback className={`rounded-2xl ${server.tone}`}><IconifyIcon icon={server.icon} className="size-6" /></Avatar.Fallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-foreground">{server.name}<VerifiedBadgeIcon className="size-4 text-accent transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" /></p>
          <p className="mt-0.5 truncate text-xs text-muted">{server.meta}</p>
          <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-muted"><span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />Active now</p>
        </div>
      </div>
    </Card>
  );
}
