"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cx } from "@/lib/ui";

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  label: string;
  options: FilterOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  /** Rótulo do estado "sem filtro". */
  allLabel?: string;
}

export function FilterSelect({
  label,
  options,
  value,
  onChange,
  allLabel = "Todos",
}: FilterSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = options.find((option) => option.value === value);
  const active = value !== null;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cx(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] min-w-[150px] transition-colors",
          "border border-border bg-secondary",
          active ? "text-interactive" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <span className="truncate flex-1 text-left">
          {selected ? selected.label : label}
        </span>
        <ChevronDown
          className={cx("size-3.5 shrink-0 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={label}
          className="absolute z-40 mt-1.5 w-full min-w-[190px] max-h-72 overflow-y-auto hub-scroll rounded-lg border border-border bg-popover p-1 shadow-xl"
        >
          <button
            type="button"
            role="option"
            aria-selected={value === null}
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 rounded-md px-2.5 py-2 text-[13px] text-left text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <span className="flex-1 truncate">{allLabel}</span>
            {value === null && <Check className="size-3.5 text-interactive" aria-hidden />}
          </button>

          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cx(
                  "w-full flex items-center gap-2 rounded-md px-2.5 py-2 text-[13px] text-left transition-colors",
                  isSelected
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <span className="flex-1 truncate">{option.label}</span>
                {isSelected && <Check className="size-3.5 text-interactive" aria-hidden />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
