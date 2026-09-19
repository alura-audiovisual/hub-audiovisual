"use client";

import { useState } from "react";
import { Check, ExternalLink, Loader2, Plus, X } from "lucide-react";
import type { ClickUpUser, CreationField } from "@/lib/types";
import { avatarTone, cx, displayName, initials } from "@/lib/ui";
import { isUrl, linkify } from "@/lib/linkify";
import { Combobox } from "@/components/Filters/Combobox";

interface FieldEditorProps {
  label: string;
  /** Valor já formatado para exibição (null = vazio). */
  value: string | null;
  /** Definição do campo no ClickUp. Ausente = campo não existe nesta lista. */
  field?: CreationField;
  members: ClickUpUser[];
  loadingMeta: boolean;
  onSave: (fieldId: string, value: unknown) => Promise<void>;
}

/**
 * Uma linha de informação do card, que também é o lugar de preenchê-la.
 *
 * Campo vazio não desaparece: aparece como "Adicionar <campo>" em traço
 * pontilhado. Quem abre o card vê o que falta, em vez de ter que adivinhar
 * quais informações existiriam se estivessem preenchidas.
 */
export function FieldEditor({
  label,
  value,
  field,
  members,
  loadingMeta,
  onSave,
}: FieldEditorProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const editable = Boolean(field);

  async function save(next: unknown) {
    if (!field) return;
    setSaving(true);
    try {
      await onSave(field.fieldId, next);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  function startEditing() {
    setDraft(value ?? "");
    setEditing(true);
  }

  // --- modo edição ---
  if (editing && field) {
    if (field.type === "users") {
      return (
        <Wrapper label={label}>
          <Combobox
            label="Escolher pessoa"
            size="sm"
            hideAllOption
            loading={loadingMeta}
            value={null}
            onChange={(next) => void save(next ? { add: [Number(next)] } : null)}
            searchPlaceholder="Nome ou e-mail"
            options={members.map((member) => ({
              value: String(member.id),
              label: displayName(member),
              hint: member.email,
              avatar: initials(displayName(member)),
              avatarColor: avatarTone(displayName(member)),
            }))}
          />
        </Wrapper>
      );
    }

    if (field.options.length > 0) {
      return (
        <Wrapper label={label}>
          <Combobox
            label="Escolher"
            size="sm"
            hideAllOption
            value={null}
            onChange={(next) => void save(next)}
            options={field.options.map((option) => ({
              value: option.id,
              label: option.label,
            }))}
          />
        </Wrapper>
      );
    }

    const isDate = field.type === "date";

    return (
      <Wrapper label={label}>
        <div className="flex items-center gap-1.5">
          <input
            autoFocus
            type={isDate ? "date" : "text"}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                const parsed = isDate ? Date.parse(`${draft}T12:00:00`) : draft;
                void save(isDate && Number.isFinite(parsed) ? parsed : draft);
              }
              if (event.key === "Escape") setEditing(false);
            }}
            aria-label={label}
            className={cx("hub-input !py-1.5 !text-[13px] min-w-0", isDate && "hub-date")}
          />
          <button
            type="button"
            onClick={() => {
              const parsed = isDate ? Date.parse(`${draft}T12:00:00`) : draft;
              void save(isDate && Number.isFinite(parsed) ? parsed : draft);
            }}
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
      </Wrapper>
    );
  }

  // --- campo vazio ---
  if (!value) {
    return (
      <Wrapper label={label}>
        {editable ? (
          <button
            type="button"
            onClick={startEditing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-2 py-1 text-[12px] text-muted-foreground hover:text-foreground hover:border-interactive/60 transition-colors"
          >
            <Plus className="size-3" aria-hidden />
            Adicionar {label.toLowerCase()}
          </button>
        ) : (
          <span className="hub-meta">Campo não existe nesta lista</span>
        )}
      </Wrapper>
    );
  }

  // --- campo preenchido ---
  return (
    <Wrapper label={label}>
      <div className="group flex items-start gap-1.5 min-w-0">
        <span className="text-[13px] text-foreground/90 min-w-0 break-words">
          {isUrl(value) ? (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-interactive inline-flex items-center gap-1 break-all"
            >
              {value}
              <ExternalLink className="size-3 shrink-0" aria-hidden />
            </a>
          ) : (
            linkify(value)
          )}
        </span>

        {editable && (
          <button
            type="button"
            onClick={startEditing}
            aria-label={`Alterar ${label}`}
            className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity text-muted-foreground hover:text-foreground shrink-0"
          >
            <Plus className="size-3 rotate-45" aria-hidden />
          </button>
        )}
      </div>
    </Wrapper>
  );
}

function Wrapper({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="hub-meta mb-1">{label}</p>
      {children}
    </div>
  );
}
