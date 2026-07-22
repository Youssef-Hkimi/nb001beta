import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  ImagePlus,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

type FeatureAccent = "trust" | "creative" | "safety" | "growth";

type FeatureBlockProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: FeatureAccent;
};

const MIDDLE_FEATURES: FeatureBlockProps[] = [
  {
    title: "Verified Safe Communities",
    description:
      "We verify communities that follow Discord’s Terms of Service, stay safe for users, and have no serious misconduct reports.",
    icon: ShieldCheck,
    accent: "trust",
  },
  {
    title: "Custom Media",
    description:
      "Creators can upload custom banners and icons for their listings for free, making every community feel more personal.",
    icon: ImagePlus,
    accent: "creative",
  },
];

const RIGHT_FEATURES: FeatureBlockProps[] = [
  {
    title: "Safety Guards",
    description:
      "Servers and bots listed on Nexus are reviewed and monitored to help protect users while they browse.",
    icon: ShieldAlert,
    accent: "safety",
  },
  {
    title: "Growth Tools",
    description:
      "Votes, analytics, featured spots, and dashboard tools help creators get discovered and grow faster.",
    icon: TrendingUp,
    accent: "growth",
  },
];

export function FeatureBlock({
  title,
  description,
  icon: Icon,
  accent,
}: FeatureBlockProps) {
  return (
    <div className="feature-block group text-left">
      <div
        className={`feature-block-icon feature-block-icon--${accent} flex size-11 items-center justify-center rounded-[11px] sm:size-12`}
      >
        <Icon className="size-[1.15rem]" strokeWidth={1.75} aria-hidden />
      </div>
      <h3 className="feature-block-title mt-4 text-base font-semibold tracking-tight text-foreground sm:text-[1.05rem]">
        {title}
      </h3>
      <p className="mt-2 max-w-[22rem] text-sm leading-relaxed text-muted sm:text-[0.9375rem] sm:leading-[1.65]">
        {description}
      </p>
    </div>
  );
}

export function FeatureOverviewSection() {
  return (
    <section className="bg-[var(--page-bg)] px-4 py-12 md:px-6 md:py-16 lg:px-8 lg:py-20">
      <div className="feature-overview-card mx-auto max-w-[1320px]">
        <div className="feature-overview-texture" aria-hidden />

        <div className="relative z-[1] grid grid-cols-1 gap-10 sm:gap-12 md:grid-cols-2 md:gap-x-10 md:gap-y-12 lg:grid-cols-[1.3fr_1fr_1fr] lg:gap-x-12 xl:gap-x-16">
          <div className="text-left md:col-span-2 lg:col-span-1">
            <h2
              id="feature-overview-heading"
              className="max-w-[18ch] text-3xl font-bold tracking-tight text-foreground sm:text-4xl sm:leading-[1.15]"
            >
              Built for safer Discord discovery
            </h2>
            <p className="mt-4 max-w-[28rem] text-sm leading-relaxed text-muted sm:text-base sm:leading-relaxed">
              Nexus helps users discover trusted Discord servers and bots while giving creators a
              clean way to showcase and grow their communities.
            </p>
            <Link
              href="/server"
              className="feature-overview-link mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#629BF8] sm:mt-7 sm:text-[0.9375rem]"
            >
              Explore how Nexus works
              <ArrowRight className="feature-overview-link-arrow size-4 shrink-0" aria-hidden />
            </Link>
          </div>

          <div className="flex flex-col gap-10 sm:gap-12">
            {MIDDLE_FEATURES.map((feature) => (
              <FeatureBlock key={feature.title} {...feature} />
            ))}
          </div>

          <div className="flex flex-col gap-10 sm:gap-12">
            {RIGHT_FEATURES.map((feature) => (
              <FeatureBlock key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
