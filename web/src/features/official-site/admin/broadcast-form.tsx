"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function BroadcastAdminForm() {
  const [status, setStatus] = useState("offline");
  const [title, setTitle] = useState("");
  const [platformUrl, setPlatformUrl] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/broadcast")
      .then((r) => r.json())
      .then((d) => {
        setStatus(d.status);
        setTitle(d.title);
        setPlatformUrl(d.platformUrl ?? "");
        setScheduledAt(
          d.scheduledAt ? new Date(d.scheduledAt).toISOString().slice(0, 16) : "",
        );
      });
  }, []);

  const save = async () => {
    const res = await fetch("/api/admin/broadcast", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        title,
        platformUrl: platformUrl || null,
        scheduledAt: scheduledAt || null,
      }),
    });
    setMsg(res.ok ? "저장됨" : "저장 실패");
  };

  return (
    <div className="space-y-4 rounded-xl border border-violet-500/25 p-4">
      <label className="block text-sm text-violet-300">
        상태
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-1 w-full rounded-lg border border-violet-500/30 bg-violet-950/50 px-3 py-2 text-violet-50"
        >
          <option value="offline">offline</option>
          <option value="live">live</option>
        </select>
      </label>
      <label className="block text-sm text-violet-300">
        제목
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-lg border border-violet-500/30 bg-violet-950/50 px-3 py-2 text-violet-50"
        />
      </label>
      <label className="block text-sm text-violet-300">
        플랫폼 URL
        <input
          value={platformUrl}
          onChange={(e) => setPlatformUrl(e.target.value)}
          className="mt-1 w-full rounded-lg border border-violet-500/30 bg-violet-950/50 px-3 py-2 text-violet-50"
        />
      </label>
      <label className="block text-sm text-violet-300">
        예정 일시
        <input
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className="mt-1 w-full rounded-lg border border-violet-500/30 bg-violet-950/50 px-3 py-2 text-violet-50"
        />
      </label>
      <Button onClick={save}>저장</Button>
      {msg && <p className="text-sm text-violet-400">{msg}</p>}
    </div>
  );
}
