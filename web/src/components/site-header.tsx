"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-violet-500/20 bg-[#0f0a1a]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold text-violet-100">
          잉게더 <span className="text-violet-400 font-normal text-sm">별으잉</span>
        </Link>
        <nav className="flex items-center gap-3">
          {session?.user?.role === "admin" && (
            <Link
              href="/admin"
              className="text-sm text-violet-300 hover:text-violet-100"
            >
              관리
            </Link>
          )}
          {status === "loading" ? (
            <span className="text-sm text-violet-400">...</span>
          ) : session ? (
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-violet-200 sm:inline">
                {session.user.name}
              </span>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                로그아웃
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={() => signIn("naver")}>
              네이버 로그인
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
