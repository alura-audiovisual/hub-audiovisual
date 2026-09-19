"use client";

import { useState } from "react";
import { Loader2, Pencil, Plus } from "lucide-react";
import { linkify } from "@/lib/linkify";

interface DescriptionEditorProps {
  description: string | null | undefined;
  onSave: (description: string) => Promise<void>;
}

/**
 * Descrição do card — lê e edita no mesmo lugar.
 *
 * Vazia, aparece como convite em traço pontilhado, igual aos outros campos.
 * Assim a ausência de descrição fica visível, em vez de o assunto
 * simplesmente não existir na tela.
 *
 * O texto é gravado como texto simples. O ClickUp aceita markdown num campo
 * separado, mas misturar os dois faz um sobrescrever o outro — então o hub
 * usa só o campo de texto, que é o que aparece no ClickUp de qualquer jeito.
 */
export function DescriptionEditor({ description, onSave }: DescriptionEditorProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const current = description?.trim() ?? "";

  async function save() {
    if (saving) return;
    setSaving(true);
    try {
      await onSave(draft);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  function startEditing() {
    setDraft(current);
    setEditing(true);
  }

  if (editing) {
    return (
      <section>
        <h3 className="hub-table-header mb-2.5">Descrição</h3>

        <textarea
          autoFocus
          rows={8}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setEditing(false);
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              void save();
            }
          }}
          placeholder="Descreva a demanda, cole links, liste o que é preciso…"
          aria-label="Descrição da tarefa"
          className="hub-input !text-[13px] leading-relaxed resize-y min-h-32"
        />

        <div className="flex items-center gap-2 mt-2">
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="hub-botao-primario !py-1.5 !text-[12px] disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            {saving && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
            {saving ? "Salvando…" : "Salvar descrição"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="hub-botao-sutil !py-1.5 !text-[12px]"
          >
            Cancelar
          </button>
          <span className="hub-meta ml-auto">Ctrl+Enter salva · Esc cancela</span>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-2.5">
        <h3 className="hub-table-header">Descrição</h3>
        {current && (
          <button
            type="button"
            onClick={startEditing}
            aria-label="Editar descrição"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Pencil className="size-3.5" aria-hidden />
          </button>
        )}
      </div>

      {current ? (
        <p className="text-[13px] leading-relaxed text-foreground/80 whitespace-pre-wrap break-words">
          {linkify(current)}
        </p>
      ) : (
        <button
          type="button"
          onClick={startEditing}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-2.5 py-1.5 text-[12px] text-muted-foreground hover:text-foreground hover:border-interactive/60 transition-colors"
        >
          <Plus className="size-3" aria-hidden />
          Adicionar descrição
        </button>
      )}
    </section>
  );
}
