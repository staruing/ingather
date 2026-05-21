import { BroadcastSection } from "./broadcast-section";
import { LinksSection } from "./links-section";
import { StickerBoard } from "../sticker-board/sticker-board";

export function HomePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-violet-50 md:text-4xl">
          잉게더 <span className="text-violet-400">Ingather</span>
        </h1>
        <p className="mt-2 text-violet-300">
          별으잉에게 함께 남기는 롤링페이퍼 · 방송 정보 · 링크
        </p>
      </div>

      <StickerBoard />

      <div className="grid gap-6 lg:grid-cols-2">
        <BroadcastSection />
        <LinksSection />
      </div>
    </div>
  );
}
