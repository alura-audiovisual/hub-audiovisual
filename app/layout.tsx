import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { Encode_Sans, Roboto_Flex, JetBrains_Mono } from "next/font/google";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import "./globals.css";

const encodeSans = Encode_Sans({ variable: "--font-encode-sans", subsets: ["latin"] });
const robotoFlex = Roboto_Flex({ variable: "--font-roboto-flex", subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Creative Ops Hub — Audiovisual Alura",
  description: "Hub operacional do time audiovisual da Alura.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`dark ${encodeSans.variable} ${robotoFlex.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="h-full flex bg-background text-foreground overflow-hidden">
        <Suspense fallback={<div className="w-[236px] shrink-0 h-full bg-sidebar" />}>
          <Sidebar />
        </Suspense>
        <main className="flex-1 min-w-0 h-full">{children}</main>
      </body>
    </html>
  );
}
