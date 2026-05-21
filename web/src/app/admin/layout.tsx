import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-violet-100">관리자</h1>
      <nav className="mb-8 flex flex-wrap gap-4 text-sm">
        <Link href="/admin" className="text-violet-300 hover:text-violet-100">
          개요
        </Link>
        <Link
          href="/admin/broadcast"
          className="text-violet-300 hover:text-violet-100"
        >
          방송
        </Link>
        <Link href="/admin/links" className="text-violet-300 hover:text-violet-100">
          링크·이미지
        </Link>
        <Link
          href="/admin/stickers"
          className="text-violet-300 hover:text-violet-100"
        >
          스티커
        </Link>
        <Link
          href="/admin/moderation"
          className="text-violet-300 hover:text-violet-100"
        >
          신고
        </Link>
      </nav>
      {children}
    </div>
  );
}
