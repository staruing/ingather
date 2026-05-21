"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

type Sticker = { id: string; name: string; imageUrl: string };

export function StickersAdminForm() {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const load = () => {
    fetch("/api/admin/stickers")
      .then((r) => r.json())
      .then((packs) => {
        const custom = packs.find((p: { type: string }) => p.type === "custom");
        setStickers(custom?.stickers ?? []);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const upload = async () => {
    const fd = new FormData();
    fd.append("name", name || "스티커");
    if (file) fd.append("file", file);
    const res = await fetch("/api/admin/stickers", { method: "POST", body: fd });
    if (res.ok) {
      setName("");
      setFile(null);
      load();
    }
  };

  const remove = async (id: string) => {
    await fetch(`/api/admin/stickers?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-4 rounded-xl border border-violet-500/25 p-4">
      <input
        placeholder="스티커 이름"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg border border-violet-500/30 bg-violet-950/50 px-3 py-2 text-violet-50"
      />
      <input
        type="file"
        accept=".png,.webp,.svg"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="text-sm text-violet-300"
      />
      <Button onClick={upload}>업로드</Button>
      <div className="flex flex-wrap gap-4">
        {stickers.map((s) => (
          <div key={s.id} className="text-center">
            <Image src={s.imageUrl} alt={s.name} width={48} height={48} unoptimized />
            <p className="text-xs text-violet-300">{s.name}</p>
            <button
              type="button"
              onClick={() => remove(s.id)}
              className="text-xs text-red-400"
            >
              삭제
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
