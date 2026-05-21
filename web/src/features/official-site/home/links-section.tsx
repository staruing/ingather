"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { externalLinkProps } from "@/lib/utils";

type SiteLink = {
  id: string;
  label: string;
  url: string;
  icon: string | null;
};

type HomeAsset = {
  id: string;
  type: string;
  url: string;
  alt: string | null;
};

export function LinksSection() {
  const [links, setLinks] = useState<SiteLink[]>([]);
  const [hero, setHero] = useState<HomeAsset | null>(null);

  useEffect(() => {
    fetch("/api/links")
      .then((r) => r.json())
      .then((d) => {
        setLinks(d.links ?? []);
        const assets: HomeAsset[] = d.assets ?? [];
        setHero(assets.find((a) => a.type === "hero") ?? assets[0] ?? null);
      })
      .catch(console.error);
  }, []);

  return (
    <section className="space-y-4">
      {hero && (
        <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-2xl border border-violet-500/25 bg-violet-950/40">
          <Image
            src={hero.url}
            alt={hero.alt ?? "별으잉"}
            width={80}
            height={80}
            className="opacity-90"
            unoptimized={hero.url.endsWith(".svg")}
          />
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            className="flex items-center gap-3 rounded-xl border border-violet-500/20 bg-violet-950/30 px-4 py-3 text-violet-100 transition hover:border-violet-400/50 hover:bg-violet-900/40"
            {...externalLinkProps()}
          >
            <span className="text-lg">{link.icon === "youtube" ? "▶" : "🔗"}</span>
            <span className="font-medium">{link.label}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
