"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MAX_TEXT_LENGTH, validateBoardText } from "@/lib/moderation";
import type { BoardEvent } from "@/lib/board-events";
import type { BoardItemData, StickerData } from "./types";
import { useBoardSocket, applyBoardEvent } from "./use-board-socket";

const BOARD_W = 1200;
const BOARD_H = 700;

export function StickerBoard() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const isLoggedIn = status === "authenticated";
  const canEdit = isLoggedIn && !!userId;

  const [items, setItems] = useState<BoardItemData[]>([]);
  const [stickers, setStickers] = useState<StickerData[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [textColor, setTextColor] = useState("#ffffff");
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const placeOffsetRef = useRef(0);
  const dragRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const loadBoard = useCallback(() => {
    fetch("/api/board")
      .then((r) => r.json())
      .then(setItems)
      .catch(console.error);
  }, []);

  useEffect(() => {
    loadBoard();
    fetch("/api/stickers")
      .then((r) => r.json())
      .then((packs) => {
        const all: StickerData[] = [];
        for (const p of packs) {
          for (const s of p.stickers ?? []) {
            all.push(s);
          }
        }
        setStickers(all);
      })
      .catch(console.error);
  }, [loadBoard]);

  const handleSocketEvent = useCallback((event: BoardEvent) => {
    setItems((prev) => applyBoardEvent(prev, event));
  }, []);

  useBoardSocket(handleSocketEvent);

  const placeSticker = async (sticker: StickerData) => {
    if (!canEdit) return;
    setError(null);
    placeOffsetRef.current = (placeOffsetRef.current + 47) % 200;
    const ox = placeOffsetRef.current;
    const res = await fetch("/api/board", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "sticker",
        stickerId: sticker.id,
        x: 80 + ox,
        y: 80 + ((ox * 3) % 150),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "배치 실패");
      return;
    }
    setItems((prev) => {
      if (prev.some((i) => i.id === data.id)) return prev;
      return [...prev, data];
    });
  };

  const placeText = async () => {
    if (!canEdit) return;
    const err = validateBoardText(textInput);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    const res = await fetch("/api/board", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "text",
        text: textInput.trim(),
        textColor,
        fontSize: 18,
        x: 120,
        y: 120,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "배치 실패");
      return;
    }
    setTextInput("");
    setItems((prev) => [...prev, data]);
  };

  const deleteSelected = async () => {
    if (!selectedId || !canEdit) return;
    const item = items.find((i) => i.id === selectedId);
    if (!item) return;
    if (item.userId !== userId && session?.user?.role !== "admin") return;
    const res = await fetch(`/api/board?id=${selectedId}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== selectedId));
      setSelectedId(null);
    }
  };

  const reportSelected = async () => {
    if (!selectedId || !canEdit) return;
    await fetch("/api/board/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ boardItemId: selectedId, reason: "부적절" }),
    });
    setError("신고가 접수되었습니다.");
  };

  const onPointerDown = (e: React.PointerEvent, item: BoardItemData) => {
    if (!canEdit) return;
    if (item.userId !== userId) {
      setSelectedId(item.id);
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    setSelectedId(item.id);
    dragRef.current = {
      id: item.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: item.x,
      origY: item.y,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = (e.clientX - d.startX) / zoom;
    const dy = (e.clientY - d.startY) / zoom;
    setItems((prev) =>
      prev.map((i) =>
        i.id === d.id ? { ...i, x: d.origX + dx, y: d.origY + dy } : i,
      ),
    );
  };

  const onPointerUp = async () => {
    const d = dragRef.current;
    if (!d) return;
    dragRef.current = null;
    const item = items.find((i) => i.id === d.id);
    if (!item) return;
    await fetch("/api/board", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: d.id, x: item.x, y: item.y }),
    });
  };

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-violet-100">롤링페이퍼</h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
          >
            +
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
          >
            −
          </Button>
        </div>
      </div>

      {!isLoggedIn && (
        <p className="text-sm text-violet-400">
          로그인하면 스티커와 텍스트로 보드를 꾸밀 수 있어요. 지금은 보기만 가능합니다.
        </p>
      )}
      {isLoggedIn && !userId && (
        <p className="text-sm text-amber-300">
          세션 정보를 불러오지 못했습니다. 로그아웃 후 다시 로그인해 주세요.
        </p>
      )}

      <div
        ref={viewportRef}
        className="relative overflow-hidden rounded-2xl border border-violet-500/30 bg-[#1a1030]"
        style={{ height: 420 }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <div
          className="absolute origin-top-left"
          style={{
            transform: `scale(${zoom})`,
            width: BOARD_W,
            height: BOARD_H,
          }}
        >
          <div
            className="relative h-full w-full rounded-xl"
            style={{
              background:
                "radial-gradient(circle at 20% 30%, #3b2667 0%, transparent 50%), radial-gradient(circle at 80% 70%, #2d1b4e 0%, transparent 45%), #120a22",
            }}
          >
            {items.map((item) => (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onPointerDown={(e) => onPointerDown(e, item)}
                onClick={() => setSelectedId(item.id)}
                className={cn(
                  "absolute cursor-grab touch-none select-none active:cursor-grabbing",
                  selectedId === item.id && "ring-2 ring-violet-400 ring-offset-1 ring-offset-transparent rounded",
                )}
                style={{
                  left: item.x,
                  top: item.y,
                  transform: `rotate(${item.rotation}deg) scale(${item.scale})`,
                  zIndex: item.zIndex,
                }}
              >
                {item.type === "text" ? (
                  <span
                    style={{
                      color: item.textColor ?? "#fff",
                      fontSize: item.fontSize ?? 16,
                      fontWeight: 700,
                      textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                    }}
                  >
                    {item.text}
                  </span>
                ) : item.sticker ? (
                  <Image
                    src={item.sticker.imageUrl}
                    alt={item.sticker.name}
                    width={64}
                    height={64}
                    draggable={false}
                    unoptimized={item.sticker.imageUrl.endsWith(".svg")}
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-amber-300">{error}</p>}

      <div className="sticky bottom-0 z-10 space-y-3 rounded-2xl border border-violet-500/25 bg-[#0f0a1a]/95 p-4 backdrop-blur md:static">
          <div className="flex flex-wrap gap-2">
            {stickers.length === 0 && (
              <p className="text-sm text-violet-400">
                스티커가 없습니다. 터미널에서{" "}
                <code className="text-violet-200">npm run db:seed</code> 실행 후
                새로고침하세요.
              </p>
            )}
            {stickers.map((s) => (
              <button
                key={s.id}
                type="button"
                disabled={!canEdit}
                onClick={() => placeSticker(s)}
                title={canEdit ? s.name : "로그인 후 사용"}
                className="flex h-12 w-12 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-950/50 hover:bg-violet-900/60 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Image
                  src={s.imageUrl}
                  alt={s.name}
                  width={36}
                  height={36}
                  unoptimized={s.imageUrl.endsWith(".svg")}
                />
              </button>
            ))}
          </div>
          {canEdit && (
          <div className="flex flex-wrap gap-2">
            <input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              maxLength={MAX_TEXT_LENGTH}
              placeholder={`텍스트 (최대 ${MAX_TEXT_LENGTH}자)`}
              className="min-w-[160px] flex-1 rounded-lg border border-violet-500/30 bg-violet-950/40 px-3 py-2 text-sm text-violet-50"
            />
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="h-10 w-12 cursor-pointer rounded border-0 bg-transparent"
              title="텍스트 색"
            />
            <Button size="sm" onClick={placeText}>
              텍스트 붙이기
            </Button>
          </div>
          )}
          {selectedId && canEdit && (
            <div className="flex flex-wrap gap-2">
              {(items.find((i) => i.id === selectedId)?.userId === userId ||
                session?.user?.role === "admin") && (
                <Button variant="outline" size="sm" onClick={deleteSelected}>
                  선택 삭제
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={reportSelected}>
                신고
              </Button>
            </div>
          )}
        </div>
    </section>
  );
}
