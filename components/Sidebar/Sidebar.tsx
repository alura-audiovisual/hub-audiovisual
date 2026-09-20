"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  HardDrive,
  Handshake,
  Inbox,
  LayoutGrid,
  Lock,
  School,
  Scissors,
  Sparkles,
  Video,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { NAVIGATION, type NavItem, type NavSection } from "@/lib/navigation";
import { BOARDS } from "@/lib/boards.config";
import { cx } from "@/lib/ui";
import { CartaoPessoa } from "./CartaoPessoa";

const ICONS: Record<string, LucideIcon> = {
  video: Video,
  scissors: Scissors,
  graduation: GraduationCap,
  sparkles: Sparkles,
  handshake: Handshake,
  grid: LayoutGrid,
  inbox: Inbox,
  book: BookOpen,
  school: School,
  wrench: Wrench,
  drive: HardDrive,
};

/** A seção contém a página aberta agora? */
function sectionHasPath(section: NavSection, pathname: string): boolean {
  return section.items.some((item) => {
    if (pathname.startsWith(item.href.split("?")[0])) return true;
    return (item.children ?? []).some((child) =>
      pathname.startsWith(child.href.split("?")[0])
    );
  });
}

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const squad = searchParams.get("squad");

  // Seções são toggles. Abre a que contém a página atual; as outras
  // ficam recolhidas, para o menu caber inteiro na tela sem rolagem.
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const section of NAVIGATION) {
      initial[section.id] = sectionHasPath(section, pathname);
    }
    return initial;
  });

  const [openItems, setOpenItems] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const section of NAVIGATION) {
      for (const item of section.items) {
        if (item.children?.length) {
          initial[item.id] = pathname.startsWith(item.href.split("?")[0]);
        }
      }
    }
    return initial;
  });

  function isItemActive(item: NavItem): boolean {
    const base = item.href.split("?")[0];
    if (pathname !== base) return false;
    // Pai e filho não acendem juntos: com squad escolhida, o ativo é o filho.
    if (item.children?.length && squad) return false;
    return true;
  }

  function isChildActive(href: string): boolean {
    const [base, query] = href.split("?");
    if (pathname !== base) return false;
    if (!query) return !squad;
    return query === `squad=${encodeURIComponent(squad ?? "")}`;
  }

  return (
    <aside className="w-[240px] shrink-0 h-full flex flex-col bg-sidebar">
      <div className="px-5 pt-6 pb-5 shrink-0">
        <p className="hub-page-title text-base leading-tight">Hub do Audiovisual</p>
        <p className="hub-meta mt-1">Alura</p>
      </div>

      <nav aria-label="Navegação principal" className="flex-1 overflow-y-auto hub-scroll px-2.5 pb-4">
        {NAVIGATION.map((section) => {
          const sectionOpen = openSections[section.id];

          return (
            <section key={section.id} className="mb-1">
              {/* Nível 1 — a seção é um toggle */}
              <button
                type="button"
                onClick={() =>
                  setOpenSections((current) => ({
                    ...current,
                    [section.id]: !current[section.id],
                  }))
                }
                aria-expanded={sectionOpen}
                className="w-full flex items-center gap-2 rounded-lg px-2.5 py-2.5 text-left transition-colors hover:bg-sidebar-accent group"
              >
                {sectionOpen ? (
                  <ChevronDown
                    className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors"
                    aria-hidden
                  />
                ) : (
                  <ChevronRight
                    className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors"
                    aria-hidden
                  />
                )}
                <span
                  className="hub-table-header truncate"
                  style={{ fontFamily: "var(--font-encode-sans)" }}
                >
                  {section.label}
                </span>
              </button>

              {/* Nível 2 — itens da seção */}
              {sectionOpen && (
                <div className="ml-[9px] pl-2.5 border-l border-border/50 space-y-0.5 my-1">
                  {section.items.map((item) => {
                    const Icon = ICONS[item.icon] ?? LayoutGrid;
                    const active = isItemActive(item);
                    const hasChildren = Boolean(item.children?.length);
                    const itemOpen = openItems[item.id];
                    const board = item.boardId ? BOARDS[item.boardId] : null;

                    return (
                      <div key={item.id}>
                        <div className="flex items-center">
                          <Link
                            href={item.href}
                            aria-current={active ? "page" : undefined}
                            title={board?.description ?? item.descricao}
                            className={cx(
                              "flex-1 flex items-center gap-2.5 rounded-lg px-2.5 py-2 hub-tab-label transition-colors min-w-0",
                              active
                                ? "bg-sidebar-accent text-interactive"
                                : item.status === "planejado"
                                  ? "text-sidebar-foreground/45 hover:bg-sidebar-accent hover:text-sidebar-foreground/70"
                                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                            )}
                          >
                            <Icon className="size-4 shrink-0" strokeWidth={1.9} aria-hidden />
                            <span className="truncate">{item.label}</span>

                            {board && !board.allowCreate && (
                              <Lock
                                className="size-3 ml-auto shrink-0 text-muted-foreground"
                                aria-label="Somente leitura"
                              />
                            )}
                            {item.status === "planejado" && (
                              <span
                                className="ml-auto shrink-0 size-1.5 rounded-full bg-muted-foreground/40"
                                title="Em construção"
                                aria-label="Em construção"
                              />
                            )}
                          </Link>

                          {hasChildren && (
                            <button
                              type="button"
                              onClick={() =>
                                setOpenItems((current) => ({
                                  ...current,
                                  [item.id]: !current[item.id],
                                }))
                              }
                              aria-expanded={itemOpen}
                              aria-label={
                                itemOpen ? `Recolher ${item.label}` : `Expandir ${item.label}`
                              }
                              className="p-1 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                            >
                              {itemOpen ? (
                                <ChevronDown className="size-3.5" aria-hidden />
                              ) : (
                                <ChevronRight className="size-3.5" aria-hidden />
                              )}
                            </button>
                          )}
                        </div>

                        {/* Nível 3 — sub-itens */}
                        {hasChildren && itemOpen && (
                          <div className="ml-[19px] pl-2.5 border-l border-border/50 space-y-0.5 my-1">
                            {item.children?.map((child) => {
                              const childActive = isChildActive(child.href);
                              return (
                                <Link
                                  key={child.id}
                                  href={child.href}
                                  aria-current={childActive ? "page" : undefined}
                                  title={child.descricao}
                                  className={cx(
                                    "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] transition-colors",
                                    childActive
                                      ? "bg-sidebar-accent text-interactive"
                                      : child.status === "planejado"
                                        ? "text-sidebar-foreground/40 hover:bg-sidebar-accent hover:text-sidebar-foreground/65"
                                        : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                                  )}
                                >
                                  <span className="truncate flex-1">{child.label}</span>
                                  {child.status === "planejado" && (
                                    <span
                                      className="shrink-0 size-1.5 rounded-full bg-muted-foreground/40"
                                      aria-label="Em construção"
                                    />
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </nav>

      <div className="shrink-0">
        <CartaoPessoa />
      </div>
    </aside>
  );
}
