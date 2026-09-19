"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import type { ClickUpUser } from "@/lib/types";
import { avatarTone, displayName, initials } from "@/lib/ui";
import { Combobox } from "@/components/Filters/Combobox";

interface AssigneeEditorProps {
  assignees: ClickUpUser[];
  members: ClickUpUser[];
  loadingMembers: boolean;
  onChange: (add: number[], rem: number[]) => Promise<void>;
}

export function AssigneeEditor({
  assignees,
  members,
  loadingMembers,
  onChange,
}: AssigneeEditorProps) {
  const [saving, setSaving] = useState(false);
  const assignedIds = new Set(assignees.map((user) => user.id));

  async function toggle(value: string) {
    const id = Number(value);
    setSaving(true);
    try {
      if (assignedIds.has(id)) await onChange([], [id]);
      else await onChange([id], []);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Combobox
      label="Definir responsável"
      mode="multi"
      selectedValues={assignees.map((user) => String(user.id))}
      onToggle={(value) => void toggle(value)}
      loading={loadingMembers}
      searchPlaceholder="Nome ou e-mail"
      emptyMessage="Ninguém com esse nome ou e-mail nesta lista."
      options={members.map((member) => ({
        value: String(member.id),
        label: displayName(member),
        hint: member.email,
        avatar: initials(displayName(member)),
        avatarColor: avatarTone(displayName(member)),
      }))}
      renderTrigger={() => (
        <span className="flex items-center gap-1.5 rounded-lg px-1 py-1 -mx-1 hover:bg-secondary transition-colors">
          {assignees.length === 0 ? (
            <span className="hub-meta">Definir responsável</span>
          ) : (
            <span className="flex items-center -space-x-1.5">
              {assignees.slice(0, 4).map((user) => (
                <span
                  key={user.id}
                  title={displayName(user)}
                  className="size-7 rounded-full grid place-items-center text-[11px] font-medium ring-2 ring-popover"
                  style={{ backgroundColor: avatarTone(displayName(user)) }}
                >
                  {initials(displayName(user))}
                </span>
              ))}
              {assignees.length > 4 && (
                <span className="size-7 rounded-full grid place-items-center bg-secondary text-[11px] text-muted-foreground ring-2 ring-popover">
                  +{assignees.length - 4}
                </span>
              )}
            </span>
          )}
          <span className="size-6 rounded-full grid place-items-center border border-dashed border-border text-muted-foreground">
            {saving ? (
              <Loader2 className="size-3 animate-spin" aria-hidden />
            ) : (
              <Plus className="size-3" aria-hidden />
            )}
          </span>
        </span>
      )}
    />
  );
}
