export type NexusLanguage = {
  id: string;
  label: string;
};

export const siteConfig = {
  name: "Nexbiy",
  logo: {
    label: "Nexbiy",
    href: "/explore",
  },
  supportEmail: process.env.NEXT_PUBLIC_NEXUS_SUPPORT_EMAIL ?? "",
  supportDiscordUrl: process.env.NEXT_PUBLIC_NEXUS_SUPPORT_DISCORD_URL ?? "",
  safetyUrl: "/report",
  socialLinks: [] as Array<{ label: string; href: string }>,
  legalLinks: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
  availableLanguages: [
    { id: "en", label: "English" },
    { id: "fr", label: "French" },
    { id: "ar", label: "Arabic" },
  ] satisfies NexusLanguage[],
} as const;
