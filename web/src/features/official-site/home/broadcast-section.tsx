"use client";

import { useEffect, useState } from "react";
import { externalLinkProps, cn } from "@/lib/utils"; // cn for badge

type Broadcast = {
  status: string;
  title: string;
  platformUrl: string | null;
  scheduledAt: string | null;
};

export function BroadcastSection() {
  const [data, setData] = useState<Broadcast | null>(null);

  useEffect(() => {
    fetch("/api/broadcast")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) return null;

  const isLive = data.status === "live";

  return (
    <section className="rounded-2xl border border-violet-500/25 bg-violet-950/30 p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold",
            isLive
              ? "bg-red-500/20 text-red-300"
              : "bg-violet-500/20 text-violet-300",
          )}
        >
          {isLive ? "LIVE" : "OFFLINE"}
        </span>
        <h2 className="text-xl font-bold text-violet-50">{data.title}</h2>
      </div>
      {data.scheduledAt && (
        <p className="mt-2 text-sm text-violet-300">
          예정: {new Date(data.scheduledAt).toLocaleString("ko-KR")}
        </p>
      )}
      {data.platformUrl && (
        <a
          href={data.platformUrl}
          className="mt-3 inline-block text-sm text-violet-400 underline hover:text-violet-200"
          {...externalLinkProps()}
        >
          방송 보러 가기 →
        </a>
      )}
    </section>
  );
}
