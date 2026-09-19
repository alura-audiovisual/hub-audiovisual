"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, Search } from "lucide-react";
import { cx, normalize } from "@/lib/ui";

export interface ComboboxOption {
  value: string;
  label: string;
  /** Texto secundário que também entra na busca (ex.: e-mail). */
  hint?: string;
  /** Bolinha de cor à esquerda (etiquetas, squads). */
  color?: string;
  /** Iniciais em avatar (pessoas). */
  avatar?: string;
  avatarColor?: string;
}

interface ComboboxProps {
  /** Texto do gatilho quando nada está escolhido. */
  label: string;
  options: ComboboxOption[];
  loading?: boolean;
  disabled?: boolean;
  /** "single" fecha ao escolher · "multi" permite marcar vários. */
  mode?: "single" | "multi";
  value?: string | null;
  selectedValues?: string[];
  onChange?: (value: string | null) => void;
  onToggle?: (value: string) => void;
  allLabel?: string;
  /** Some com a opção "todos" (usado em formulários de criação). */
  hideAllOption?: boolean;
  emptyMessage?: string;
  searchPlaceholder?: string;
  size?: "sm" | "md";
  /** Elemento de gatilho customizado (usado pelos editores do card). */
  renderTrigger?: (open: boolean) => React.ReactNode;
  align?: "left" | "right";
}

/**
 * Campo de escolha com busca por digitação — o padrão que o ClickUp usa:
 * abre, você digita parte do nome ou do e-mail, a lista filtra enquanto
 * escreve, e as setas do teclado navegam. Substitui o <select> nativo,
 * que não filtra e usa o visual do sistema operacional em vez do nosso.
 */
export function Combobox({
  label,
  options,
  loading = false,
  disabled = false,
  mode = "single",
  value = null,
  selectedValues = [],
  onChange,
  onToggle,
  allLabel = "Todos",
  hideAllOption = false,
  emptyMessage = "Nada encontrado com esse texto.",
  searchPlaceholder = "Digite para filtrar",
  size = "md",
  renderTrigger,
  align = "left",
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveIndex(0);
      return;
    }
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const filtered = useMemo(() => {
    const needle = normalize(query.trim());
    if (!needle) return options;
    return options.filter((option) =>
      normalize(`${option.label} ${option.hint ?? ""}`).includes(needle)
    );
  }, [options, query]);

  const selected = options.find((option) => option.value === value);
  const selectedSet = new Set(selectedValues);

  function choose(option: ComboboxOption) {
    if (mode === "multi") {
      onToggle?.(option.value);
      return;
    }
    onChange?.(option.value);
    setOpen(false);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, filtered.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const option = filtered[activeIndex];
      if (option) choose(option);
    }
  }

  useEffect(() => {
    const active = listRef.current?.querySelector<HTMLElement>("[data-active='true']");
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, filtered.length]);

  return (
    <div ref={containerRef} className="relative">
      {renderTrigger ? (
        <button
          type="button"
          onClick={() => !disabled && setOpen((current) => !current)}
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled}
          className="text-left disabled:opacity-60"
        >
          {renderTrigger(open)}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => !disabled && setOpen((current) => !current)}
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled}
          className={cx(
            "flex items-center gap-2 w-full rounded-lg border border-border bg-secondary transition-colors disabled:opacity-60",
            size === "sm" ? "px-2.5 py-1.5 text-[13px]" : "px-3 py-2 text-[13px]",
            value ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {selected?.color && (
            <span
              className="size-2.5 rounded-full shrink-0"
              style={{ backgroundColor: selected.color }}
            />
          )}
          <span className="truncate flex-1 text-left">{selected ? selected.label : label}</span>
          {loading ? (
            <Loader2 className="size-3.5 shrink-0 animate-spin" aria-hidden />
          ) : (
            <ChevronDown
              className={cx("size-3.5 shrink-0 transition-transform", open && "rotate-180")}
              aria-hidden
            />
          )}
        </button>
      )}

      {open && (
        <div
          className={cx(
            "absolute z-50 mt-1.5 w-[260px] rounded-xl border border-border bg-popover shadow-2xl overflow-hidden",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
            <Search className="size-3.5 text-muted-foreground shrink-0" aria-hidden />
            <input
              autoFocus
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={onKeyDown}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="flex-1 bg-transparent text-[13px] focus:outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div
            ref={listRef}
            role="listbox"
            aria-label={label}
            className="max-h-64 overflow-y-auto hub-scroll p-1"
          >
            {loading && (
              <p className="hub-meta px-2.5 py-3 flex items-center gap-2">
                <Loader2 className="size-3 animate-spin" aria-hidden />
                Carregando…
              </p>
            )}

            {!loading && mode === "single" && !hideAllOption && (
              <button
                type="button"
                role="option"
                aria-selected={value === null}
                onClick={() => {
                  onChange?.(null);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-left text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <span className="flex-1 truncate">{allLabel}</span>
                {value === null && <Check className="size-3.5 text-interactive" aria-hidden />}
              </button>
            )}

            {!loading && filtered.length === 0 && (
              <p className="hub-meta px-2.5 py-3 leading-relaxed">{emptyMessage}</p>
            )}

            {!loading &&
              filtered.map((option, index) => {
                const isSelected =
                  mode === "multi" ? selectedSet.has(option.value) : option.value === value;
                const isActive = index === activeIndex;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    data-active={isActive}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => choose(option)}
                    className={cx(
                      "w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-left transition-colors",
                      isActive ? "bg-secondary text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {option.avatar && (
                      <span
                        className="size-6 rounded-full grid place-items-center text-[10px] shrink-0 text-foreground/90"
                        style={{ backgroundColor: option.avatarColor }}
                      >
                        {option.avatar}
                      </span>
                    )}
                    {option.color && (
                      <span
                        className="size-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: option.color }}
                      />
                    )}

                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{option.label}</span>
                      {option.hint && (
                        <span className="hub-meta block truncate">{option.hint}</span>
                      )}
                    </span>

                    {isSelected && <Check className="size-3.5 text-interactive shrink-0" aria-hidden />}
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
