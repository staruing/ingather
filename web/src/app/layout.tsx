import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "잉게더 · 별으잉",
  description:
    "Ingather — 별으잉에게 함께 남기는 롤링페이퍼. 스티커, 글, 그림으로 한 장을 꾸며요.",
  openGraph: {
    title: "잉게더 · 별으잉",
    description: "함께 꾸미는 롤링페이퍼 · 방송 정보 · 링크",
    type: "website",
    locale: "ko_KR",
    images: [{ url: "/stickers/moon.svg", width: 64, height: 64, alt: "별으잉" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[#0f0a1a] text-violet-50">
        <Providers>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
