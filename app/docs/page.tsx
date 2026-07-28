import type {Metadata} from "next";

import {DocsLanding} from "@/components/docs/docs-landing";

export const metadata: Metadata = {
  title: "Bot Stats Reporting Docs | Nexbiy",
  description:
    "Connect a Discord bot to Nexbiy with secure server-count reporting guides for discord.js, discord.py, REST, and sharded bots.",
};

export default function DocsPage() {
  return <DocsLanding />;
}
