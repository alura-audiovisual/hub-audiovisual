"use client";

import type { DragEvent } from "react";
import { Calendar, CheckCircle2, Flag, Tag as TagIcon, Users } from "lucide-react";
import type { BoardId, ClickUpTask } from "@/lib/types";
import { BOARD_CARDS, showsTags } from "@/lib/boards.config";
import { fieldText } from "@/lib/fields";
import { cx, formatDate, isOverdue } from "@/lib/ui";
import { isEpic, isSubtask } from "@/lib/board-actions";
import { usePodeEscrever } from "@/components/Sessao/SessaoProvider";
import { Avatars } from "./Avatars";
import { EpicBadge, SubtaskBadge } from "./Badges";

const PRIORITY_COLOR: Record<string, string> = {
  urgent: "var(--error)",
  high: "var(--attention)",
  normal: "var(--info)",
  low: "var(--muted-foreground)",
};

const PRIORITY_LABEL: Record<string, string> = {
  urgent: "Urgente",
  high: "Alta",
  normal: "Normal",
  low: "Baixa",
};

interface TaskCardProps {
  task: ClickUpTask;
  boardId: BoardId;
  onOpen: (task: ClickUpTask) => void;
  onDragStart: (task: ClickUpTask) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  epicProgressLabel?: string | null;
}

export function TaskCard({
  task,
  boardId,
  onOpen,
  onDragStart,
  onDragEnd,
  isDragging,
  epicProgressLabel,
}: TaskCardProps) {
  const podeEscrever = usePodeEscrever();
  const fields = BOARD_CARDS[boardId].collapsed
    .map((field) => ({ label: field.label, value: fieldText(task, field.key) }))
    .filter((field): field is { label: string; value: string } => Boolean(field.value));

  const epic = isEpic(task);
  const subtask = isSubtask(task);
  const due = formatDate(task.due_date);
  const late = isOverdue(task.due_date);
  const done = task.status.type === "done" || task.status.type === "closed";
  const priority = task.priority?.priority;

  // Linha de contexto: os campos da board, em sequência legível.
  const context = fields.map((field) => field.value).join(" · ");

  function handleDragStart(event: DragEvent<HTMLDivElement>) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", task.id);
    onDragStart(task);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      draggable={podeEscrever}
      aria-label={`Abrir tarefa ${task.name}`}
      onClick={() => onOpen(task)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(task);
        }
      }}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      className={cx(
        "hub-card-clicavel rounded-xl bg-card border border-border p-3.5 space-y-3 select-none",
        isDragging && "opacity-40"
      )}
    >
      {(epic || subtask) && (
        <div className="flex items-center gap-2">
          {epic && <EpicBadge />}
          {subtask && <SubtaskBadge />}
        </div>
      )}

      <h3 className="hub-card-title !text-[15px] line-clamp-2 break-words">{task.name}</h3>

      {(context || due) && (
        <div className="flex items-start gap-3">
          <p className="hub-meta flex-1 min-w-0 line-clamp-2 leading-relaxed break-words">
            {context}
          </p>
          {due && (
            <span className={cx("hub-meta shrink-0", late && "text-error")}>{due}</span>
          )}
        </div>
      )}

      {showsTags(boardId) && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {task.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.name}
              className="hub-tag truncate max-w-[120px]"
              style={{
                backgroundColor: tag.tag_bg ? `${tag.tag_bg}2e` : "var(--secondary)",
                color: tag.tag_bg || "var(--muted-foreground)",
              }}
            >
              {tag.name}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="hub-tag bg-secondary text-muted-foreground">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-0.5">
        <div className="flex items-center gap-3 text-muted-foreground">
          <span
            className="inline-flex items-center gap-1"
            title={`${task.assignees.length} responsável(is)`}
          >
            <Users className="size-3.5" aria-hidden />
            <span className="hub-number text-[11px]">{task.assignees.length}</span>
          </span>

          <span
            className={cx("inline-flex items-center gap-1", late && "text-error")}
            title={due ? (late ? "Prazo vencido" : "Prazo") : "Sem prazo"}
          >
            <Calendar className="size-3.5" aria-hidden />
            <span className="hub-number text-[11px]">{due ?? "—"}</span>
          </span>

          {priority && (
            <span
              className="inline-flex items-center"
              title={`Prioridade: ${PRIORITY_LABEL[priority] ?? priority}`}
            >
              <Flag
                className="size-3.5"
                style={{ color: PRIORITY_COLOR[priority] }}
                aria-hidden
              />
            </span>
          )}

          {showsTags(boardId) && task.tags.length > 0 && (
            <span
              className="inline-flex items-center gap-1"
              title={`${task.tags.length} etiqueta(s)`}
            >
              <TagIcon className="size-3.5" aria-hidden />
              <span className="hub-number text-[11px]">{task.tags.length}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {epicProgressLabel && (
            <span className="hub-meta" style={{ color: "var(--epic)" }}>
              {epicProgressLabel}
            </span>
          )}
          {done && (
            <CheckCircle2
              className="size-4"
              style={{ color: "var(--success)" }}
              aria-label="Concluída"
            />
          )}
          <Avatars users={task.assignees} max={2} />
        </div>
      </div>
    </div>
  );
}
