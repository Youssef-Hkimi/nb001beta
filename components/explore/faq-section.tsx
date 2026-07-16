"use client";

import { Accordion } from "@heroui/react";
import { ChevronDown, CircleHelp } from "lucide-react";

type FAQItemData = {
  id: string;
  question: string;
  answer: string;
};

const FAQ_ITEMS: FAQItemData[] = [
  {
    id: "temporary-listing",
    question: "Is my server listing temporary?",
    answer:
      "No. Once your server is listed on Nexus, it stays discoverable globally unless you remove it, pause it, or it violates our platform rules. This helps communities keep growing over time without needing to relist.",
  },
  {
    id: "verified-badge",
    question: "How do I get a verified badge for my server?",
    answer:
      "To receive a verified badge, a server must meet Nexus verification requirements. This includes following Discord’s Terms of Service, having at least 5,000 members, remaining active and SFW, and passing a Nexus review.",
  },
  {
    id: "private-data",
    question: "Does Nexus collect or store private Discord user data?",
    answer:
      "Nexus does not collect, sell, or share private Discord user data. We only use the basic information needed to display listings, manage accounts, and keep the platform safe. Private messages, member conversations, and hidden server data are not collected.",
  },
  {
    id: "what-is-nexus",
    question: "What is Nexus?",
    answer:
      "Nexus is a Discord discovery platform where users can find servers, bots, and communities more easily. We help server owners showcase their communities with polished listings, while helping users browse safer and more organized Discord spaces.",
  },
  {
    id: "list-server-and-bot",
    question: "Can I list both a server and a bot?",
    answer:
      "Yes. Nexus supports both Discord server listings and Discord bot listings. Servers and bots have dedicated pages, categories, filters, and dashboard tools.",
  },
  {
    id: "edit-listing",
    question: "Can I edit my listing after publishing?",
    answer:
      "Yes. You can update your server or bot listing from your dashboard at any time. You can edit descriptions, tags, banners, icons, invite links, and other public listing details.",
  },
  {
    id: "safety",
    question: "How does Nexus help keep users safe?",
    answer:
      "Nexus uses listing reviews, trust signals, report options, and safety checks to help users browse with more confidence. Communities that break safety rules or Discord’s Terms of Service may be removed.",
  },
  {
    id: "pricing",
    question: "Do I need to pay to list my server?",
    answer:
      "No. Basic server and bot listings are free. Creators can upload custom icons and banners for free. Optional growth tools or featured placements may be added later.",
  },
];

export function FAQItem({ id, question, answer }: FAQItemData) {
  return (
    <Accordion.Item id={id} className="faq-item">
      <Accordion.Heading>
        <Accordion.Trigger className="faq-trigger">
          <CircleHelp className="faq-help-icon size-5 shrink-0" aria-hidden strokeWidth={1.75} />
          <span className="faq-question min-w-0 flex-1 text-left text-[0.9375rem] font-semibold leading-snug tracking-tight text-foreground sm:text-base">
            {question}
          </span>
          <Accordion.Indicator className="faq-chevron shrink-0 text-muted">
            <ChevronDown className="size-4" aria-hidden strokeWidth={2} />
          </Accordion.Indicator>
        </Accordion.Trigger>
      </Accordion.Heading>
      <Accordion.Panel>
        <Accordion.Body className="faq-answer text-sm leading-relaxed text-muted sm:text-[0.9375rem] sm:leading-[1.65]">
          {answer}
        </Accordion.Body>
      </Accordion.Panel>
    </Accordion.Item>
  );
}

export function FAQSection() {
  return (
    <section
      aria-labelledby="faq-heading"
      className="bg-[var(--page-bg)] px-4 py-20 md:px-6 md:py-24 lg:py-28"
    >
      <div className="mx-auto w-full max-w-[960px]">
        <header className="mx-auto max-w-2xl text-center">
          <h2
            id="faq-heading"
            className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-[2rem] md:leading-tight"
          >
            Frequently asked questions
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted sm:mt-4 sm:text-base">
            Everything you need to know about listing, verifying, and discovering communities on
            Nexus.
          </p>
        </header>

        <Accordion
          className="faq-accordion mt-10 w-full md:mt-12"
          hideSeparator
          defaultExpandedKeys={["temporary-listing"]}
        >
          {FAQ_ITEMS.map((item) => (
            <FAQItem key={item.id} {...item} />
          ))}
        </Accordion>
      </div>
    </section>
  );
}
