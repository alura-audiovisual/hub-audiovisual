"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { BoardMeta, ClickUpUser, CreateTaskProperties } from "@/lib/types";
import { avatarTone, displayName, initials } from "@/lib/ui";
import { Combobox } from "@/components/Filters/Combobox";

interface CreateTaskFormProps {
  columnLabel: string;
  meta: BoardMeta | null;
  loadingMeta: boolean;
  onSubmit: (name: string, properties: CreateTaskProperties) => Promise<void>;
  onCancel: () => void;
}

/**
 * Formulário de criação: além do nome, pede as mesmas propriedades que o
 * card vai exibir na board. Assim o card já nasce legível, sem precisar
 * abrir e completar depois.
 */
export function CreateTaskForm({
  columnLabel,
  meta,
  loadingMeta,
  onSubmit,
  onCancel,
}: CreateTaskFormProps) {
  const [name, setName] = useState("");
  const [assignee, setAssignee] = useState<string>("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  async function submit() {
    const trimmed = name.trim();
    if (!trimmed || saving) return;

    setSaving(true);
    try {
      // P11: cada tipo de campo tem um formato próprio na API.
      // Texto vai como está; data vai em milissegundos; pessoa e rótulos
      // vão como lista. Mandar tudo como texto fazia a gravação falhar.
      const customFields = (meta?.creationFields ?? [])
        .filter((field) => values[field.key])
        .map((field) => {
          const raw = values[field.key];
          if (field.type === "date") {
            const ms = Date.parse(`${raw}T12:00:00`);
            return { id: field.fieldId, value: Number.isFinite(ms) ? ms : raw };
          }
          if (field.type === "users") {
            return { id: field.fieldId, value: { add: [Number(raw)] } };
          }
          if (field.type === "labels") {
            return { id: field.fieldId, value: [raw] };
          }
          return { id: field.fieldId, value: raw };
        });

      await onSubmit(trimmed, {
        assignees: assignee ? [Number(assignee)] : undefined,
        customFields: customFields.length > 0 ? customFields : undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  function renderField(field: NonNullable<BoardMeta["creationFields"]>[number]) {
    const value = values[field.key] ?? "";
    const setValue = (next: string | null) =>
      setValues((current) => ({ ...current, [field.key]: next ?? "" }));

    if (field.type === "users") {
      return (
        <Combobox
          label={field.label}
          size="sm"
          hideAllOption
          loading={loadingMeta}
          value={value || null}
          onChange={setValue}
          searchPlaceholder="Nome ou e-mail"
          emptyMessage="Ninguém com esse nome ou e-mail."
          options={(meta?.members ?? []).map((member) => ({
            value: String(member.id),
            label: displayName(member),
            hint: member.email,
            avatar: initials(displayName(member)),
            avatarColor: avatarTone(displayName(member)),
          }))}
        />
      );
    }

    if (field.options.length > 0) {
      return (
        <Combobox
          label={field.label}
          size="sm"
          hideAllOption
          value={value || null}
          onChange={setValue}
          options={field.options.map((option) => ({
            value: option.id,
            label: option.label,
          }))}
        />
      );
    }

    if (field.type === "date") {
      return (
        <input
          type="date"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-label={field.label}
          className="hub-input hub-date !py-1.5 !text-[13px]"
        />
      );
    }

    return (
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={field.label}
        aria-label={field.label}
        className="hub-input !py-1.5 !text-[13px]"
      />
    );
  }

  return (
    <div className="rounded-xl bg-card border border-border p-3 space-y-2.5">
      <textarea
        autoFocus
        rows={2}
        value={name}
        onChange={(event) => setName(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") onCancel();
        }}
        placeholder="Nome da tarefa"
        aria-label={`Nome da nova tarefa em ${columnLabel}`}
        className="w-full bg-transparent text-[14px] resize-none focus:outline-none placeholder:text-muted-foreground"
      />

      <div className="space-y-2">
        <Combobox
          label="Responsável"
          size="sm"
          hideAllOption
          loading={loadingMeta}
          value={assignee || null}
          onChange={(next) => setAssignee(next ?? "")}
          searchPlaceholder="Nome ou e-mail"
          emptyMessage="Ninguém com esse nome ou e-mail nesta lista."
          options={(meta?.members ?? []).map((member: ClickUpUser) => ({
            value: String(member.id),
            label: displayName(member),
            hint: member.email,
            avatar: initials(displayName(member)),
            avatarColor: avatarTone(displayName(member)),
          }))}
        />

        {(meta?.creationFields ?? []).map((field) => (
          <div key={field.key}>{renderField(field)}</div>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-0.5">
        <button
          type="button"
          onClick={() => void submit()}
          disabled={saving || name.trim().length === 0}
          className="hub-botao-primario !py-1.5 !text-[12px] disabled:opacity-50 inline-flex items-center gap-1.5"
        >
          {saving && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
          {saving ? "Criando…" : "Criar tarefa"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="hub-botao-sutil !py-1.5 !text-[12px]"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
