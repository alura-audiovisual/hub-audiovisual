"use client";

import { useState } from "react";
import { Check, Loader2, Plus, X } from "lucide-react";
import { cx, formatDate, isOverdue } from "@/lib/ui";

interface DateEditorProps {
  label: string;
  /** Timestamp do ClickUp (ms em string) ou null. */
  value: string | null;
  onSave: (ms: number | null) => Promise<void>;
  /** Marca em vermelho quando o prazo já passou. */
  warnOverdue?: boolean;
}

/** Converte timestamp do ClickUp para o formato do <input type="date">. */
function toInputValue(raw: string | null): string {
  if (!raw) return "";
  const date = new Date(Number(raw));
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function DateEditor({ label, value, onSave, warnOverdue }: DateEditorProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(ms: number | null) {
    setSaving(true);
    try {
      await onSave(ms);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  function commit() {
    if (!draft) {
      void save(null);
      return;
    }
    // Meio-dia evita o prazo "voltar um dia" por causa de fuso horário.
    const ms = Date.parse(`${draft}T12:00:00`);
    void save(Number.isFinite(ms) ? ms : null);
  }

  if (editing) {
    return (
      <div className="min-w-0">
        <p className="hub-meta mb-1">{label}</p>
        <div className="flex items-center gap-1.5">
          <input
            autoFocus
            type="date"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commit();
              }
              if (event.key === "Escape") setEditing(false);
            }}
            aria-label={label}
            className="hub-input hub-date !py-1.5 !text-[13px] min-w-0"
          />
          <button
            type="button"
            onClick={commit}
            disabled={saving}
            aria-label="Salvar"
            className="text-interactive shrink-0 p-1"
          >
            {saving ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
            ) : (
              <Check className="size-3.5" aria-hidden />
            )}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            aria-label="Cancelar"
            className="text-muted-foreground shrink-0 p-1"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        </div>
      </div>
    );
  }

  const formatted = formatDate(value);
  const late = warnOverdue && isOverdue(value);

  return (
    <div className="min-w-0">
      <p className="hub-meta mb-1">{label}</p>

      {formatted ? (
        <button
          type="button"
          onClick={() => {
            setDraft(toInputValue(value));
            setEditing(true);
          }}
          className={cx(
            "text-[13px] rounded px-1 -mx-1 hover:bg-secondary transition-colors",
            late ? "text-error" : "text-foreground/90"
          )}
        >
          {formatted}
          {late && <span className="hub-meta text-error ml-1.5">vencido</span>}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            setDraft("");
            setEditing(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-2 py-1 text-[12px] text-muted-foreground hover:text-foreground hover:border-interactive/60 transition-colors"
        >
          <Plus className="size-3" aria-hidden />
          Adicionar {label.toLowerCase()}
        </button>
      )}
    </div>
  );
}
