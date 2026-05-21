"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Report = {
  id: string;
  status: string;
  reason: string | null;
  boardItem: { id: string; type: string; text: string | null; user: { nickname: string } };
  reporter: { nickname: string };
};

export function ModerationPanel() {
  const [reports, setReports] = useState<Report[]>([]);

  const load = () => {
    fetch("/api/admin/reports")
      .then((r) => r.json())
      .then(setReports);
  };

  useEffect(() => {
    load();
  }, []);

  const resolve = async (id: string) => {
    await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "resolved" }),
    });
    load();
  };

  const deleteItem = async (itemId: string) => {
    await fetch(`/api/board?id=${itemId}`, { method: "DELETE" });
    load();
  };

  return (
    <ul className="space-y-4">
      {reports.length === 0 && (
        <p className="text-violet-400">신고 내역이 없습니다.</p>
      )}
      {reports.map((r) => (
        <li
          key={r.id}
          className="rounded-xl border border-violet-500/25 p-4 text-sm text-violet-200"
        >
          <p>
            신고자: {r.reporter.nickname} · 상태: {r.status}
          </p>
          <p>
            대상: {r.boardItem.user.nickname} —{" "}
            {r.boardItem.type === "text"
              ? r.boardItem.text
              : "(스티커)"}
          </p>
          {r.reason && <p>사유: {r.reason}</p>}
          <div className="mt-2 flex gap-2">
            <Button size="sm" variant="outline" onClick={() => resolve(r.id)}>
              처리 완료
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => deleteItem(r.boardItem.id)}
            >
              항목 삭제
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
