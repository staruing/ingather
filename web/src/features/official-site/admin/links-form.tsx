"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Link = { id: string; label: string; url: string; icon: string | null; sortOrder: number; isActive: boolean };
type Asset = { id: string; type: string; url: string; alt: string | null };

export function LinksAdminForm() {
  const [links, setLinks] = useState<Link[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [heroUrl, setHeroUrl] = useState("/stickers/moon.svg");

  const load = () => {
    fetch("/api/admin/links")
      .then((r) => r.json())
      .then((d) => {
        setLinks(d.links ?? []);
        setAssets(d.assets ?? []);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const addLink = async () => {
    await fetch("/api/admin/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, url }),
    });
    setLabel("");
    setUrl("");
    load();
  };

  const addHero = async () => {
    await fetch("/api/admin/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "asset", assetType: "hero", url: heroUrl, alt: "별으잉" }),
    });
    load();
  };

  const removeLink = async (id: string) => {
    await fetch(`/api/admin/links?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-8">
      <section className="space-y-3 rounded-xl border border-violet-500/25 p-4">
        <h2 className="font-semibold text-violet-100">링크 추가</h2>
        <input
          placeholder="라벨"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full rounded-lg border border-violet-500/30 bg-violet-950/50 px-3 py-2 text-violet-50"
        />
        <input
          placeholder="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full rounded-lg border border-violet-500/30 bg-violet-950/50 px-3 py-2 text-violet-50"
        />
        <Button onClick={addLink}>링크 추가</Button>
        <ul className="space-y-2">
          {links.map((l) => (
            <li key={l.id} className="flex justify-between text-sm text-violet-200">
              <span>
                {l.label} — {l.url}
              </span>
              <button
                type="button"
                onClick={() => removeLink(l.id)}
                className="text-red-400 hover:underline"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section className="space-y-3 rounded-xl border border-violet-500/25 p-4">
        <h2 className="font-semibold text-violet-100">히어로 이미지 URL</h2>
        <input
          value={heroUrl}
          onChange={(e) => setHeroUrl(e.target.value)}
          className="w-full rounded-lg border border-violet-500/30 bg-violet-950/50 px-3 py-2 text-violet-50"
        />
        <Button onClick={addHero}>히어로 추가</Button>
        <ul className="text-sm text-violet-300">
          {assets.map((a) => (
            <li key={a.id}>
              {a.type}: {a.url}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
