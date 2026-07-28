import type {Metadata} from "next";

import {DocsLanding} from "@/components/docs/docs-landing";

export const metadata: Metadata = {
  title: "Developer Docs | Nexbiy",
  description:
    "Nexbiy API and SDK documentation for Discord bot integrations.",
};

export default function DocsPage() {
  return <DocsLanding />;
}
