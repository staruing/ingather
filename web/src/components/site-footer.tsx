import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-violet-500/20 bg-[#0f0a1a] py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-sm text-violet-400">
        <p>© Ingather · 별으잉</p>
        <div className="flex gap-4">
          <Link href="/terms" className="hover:text-violet-200">
            이용약관
          </Link>
          <Link href="/privacy" className="hover:text-violet-200">
            개인정보처리방침
          </Link>
        </div>
      </div>
    </footer>
  );
}
