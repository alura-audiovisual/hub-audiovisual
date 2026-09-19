"use client";

import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import type { ClickUpSpaceTag, ClickUpTag } from "@/lib/types";
import { normalizeTag } from "@/lib/ui";
import { Combobox } from "@/components/Filters/Combobox";

interface TagEditorProps {
  tags: ClickUpTag[];
  available: ClickUpSpaceTag[];
  loadingTags: boolean;
  onChange: (change: { add?: string; remove?: string }) => Promise<void>;
}

export function TagEditor({ tags, available, loadingTags, onChange }: TagEditorProps) {
  const [saving, setSaving] = useState<string | null>(null);
  const applied = new Set(tags.map((tag) => normalizeTag(tag.name)));

  async function toggle(name: string) {
    setSaving(name);
    try {
      if (applied.has(normalizeTag(name))) await onChange({ remove: name });
      else await onChange({ add: name });
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag.name}
          className="hub-tag inline-flex items-center gap-1"
          style={{
            backgroundColor: tag.tag_bg ? `${tag.tag_bg}2e` : "var(--secondary)",
            color: tag.tag_bg || "var(--muted-foreground)",
          }}
        >
          {tag.name}
          <button
            type="button"
            onClick={() => void toggle(tag.name)}
            aria-label={`Remover etiqueta ${tag.name}`}
            className="hover:opacity-70"
          >
            {saving === tag.name ? (
              <Loader2 className="size-2.5 animate-spin" aria-hidden />
            ) : (
              <X className="size-2.5" aria-hidden />
            )}
          </button>
        </span>
      ))}

      <Combobox
        label="Etiqueta"
        mode="multi"
        selectedValues={tags.map((tag) => tag.name)}
        onToggle={(value) => void toggle(value)}
        loading={loadingTags}
        searchPlaceholder="Digite para filtrar"
        emptyMessage="Nenhuma etiqueta com esse nome no espaço. Crie no ClickUp primeiro — o hub só aplica etiquetas que já existem."
        options={available.map((tag) => ({
          value: tag.name,
          label: tag.name,
          color: tag.tag_bg || "var(--muted-foreground)",
        }))}
        renderTrigger={() => (
          <span className="hub-tag inline-flex items-center gap-1 border border-dashed border-border text-muted-foreground hover:text-foreground transition-colors">
            <Plus className="size-2.5" aria-hidden />
            Etiqueta
          </span>
        )}
      />
    </div>
  );
}
