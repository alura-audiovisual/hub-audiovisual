"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Video,
  Scissors,
  GraduationCap,
  Sparkles,
  Handshake,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";
import { BOARDS } from "@/lib/boards.config";
import type { BoardId } from "@/lib/types";

// Ícone de cada board — escolhido pelo que ela representa no fluxo real.
const BOARD_ICONS: Record<BoardId, LucideIcon> = {
  producao: Video,
  edicao: Scissors,
  "edicao-start": GraduationCap,
  imersoes: Sparkles,
  "edicao-externa": Handshake,
  "creative-ops": LayoutGrid,
};

const BOARD_ORDER: BoardId[] = [
  "producao",
  "edicao",
  "edicao-start",
  "imersoes",
  "edicao-externa",
  "creative-ops",
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col bg-sidebar">
      <div className="px-5 py-6">
        <p className="hub-page-title text-lg leading-tight">Creative Ops</p>
        <p className="text-xs text-muted-foreground mt-0.5">Hub Audiovisual · Alura</p>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {BOARD_ORDER.map((boardId) => {
          const board = BOARDS[boardId];
          const Icon = BOARD_ICONS[boardId];
          const href = `/board/${boardId}`;
          const isActive = pathname === href;

          return (
            <Link
              key={boardId}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 hub-tab-label transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-interactive"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <Icon className="size-4 shrink-0" strokeWidth={2} />
              <span className="truncate">{board.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 text-xs text-muted-foreground">
        Sincronizado com o ClickUp
      </div>
    </aside>
  );
}
