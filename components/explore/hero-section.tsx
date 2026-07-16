"use client";

import { Button, SearchField } from "@heroui/react";
import { Search } from "lucide-react";

import chillDark from "@/ChillDark.webp";
import chillLight from "@/ChillLight.webp";

export function HeroSection() {
  return (
    <section className="relative isolate">
      {/* Artwork background — top hero only, fades into page */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] overflow-hidden md:h-[680px]">
        <div
          className="blended-artwork absolute inset-0 bg-cover bg-bottom bg-no-repeat opacity-100 dark:opacity-0"
          style={{ backgroundImage: `url(${chillLight.src})` }}
        />
        <div
          className="blended-artwork absolute inset-0 bg-cover bg-bottom bg-no-repeat opacity-0 dark:opacity-100"
          style={{ backgroundImage: `url(${chillDark.src})` }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,rgba(255,255,255,0.68)_0%,rgba(255,255,255,0.36)_38%,transparent_72%)] dark:hidden" />
      </div>

      <div className="relative mx-auto flex max-w-[920px] flex-col items-center px-4 pb-10 pt-16 text-center md:px-6 md:pt-20 lg:pt-24">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/80 bg-white/70 px-3 py-1 text-xs font-medium text-muted backdrop-blur-md dark:bg-white/5">
          <span className="size-1.5 rounded-full bg-accent" />
          Discover Discord communities & bots
        </p>

        <h1 className="explore-hero-title text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Find your next{" "}
          <span className="nexus-gradient-text">favorite</span> community
        </h1>

        <p className="explore-hero-copy mt-5 max-w-2xl text-base leading-relaxed md:text-lg">
          Explore thousands of Discord servers and bots to enhance your experience.
          Join communities, find tools, and level up your server.
        </p>

        <div className="mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:items-center">
          <SearchField aria-label="Search communities" className="w-full flex-1">
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search servers, bots, tags..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <Button className="shrink-0 sm:h-10">
            <Search className="size-4" />
            Search
          </Button>
        </div>
      </div>
    </section>
  );
}
