"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import {
  ChevronDown,
  ExternalLink,
  GripVertical,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import type { BoardId, BoardMeta, ClickUpTask } from "@/lib/types";
import { BOARD_CARDS, getVisibleColumns, showsTags } from "@/lib/boards.config";
import { fieldText } from "@/lib/fields";
import { cx } from "@/lib/ui";
import { isEpic, isSubtask } from "@/lib/board-actions";
import { EpicBadge, SubtaskBadge } from "@/components/Card/Badges";
import { AssigneeEditor } from "@/components/Editors/AssigneeEditor";
import { TagEditor } from "@/components/Editors/TagEditor";
import { ActivityPanel } from "@/components/Activity/ActivityPanel";
import { FieldEditor } from "@/components/Editors/FieldEditor";
import { DateEditor } from "@/components/Editors/DateEditor";
import { DescriptionEditor } from "@/components/Editors/DescriptionEditor";

interface TaskModalProps {
  task: ClickUpTask;
  boardId: BoardId;
  subtasks: ClickUpTask[];
  meta: BoardMeta | null;
  loadingMeta: boolean;
  onClose: () => void;
  onMove: (taskId: string, statusId: string) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onCreateSubtask: (parentId: string, name: string) => Promise<void>;
  onChangeAssignees: (taskId: string, add: number[], rem: number[]) => Promise<void>;
  onChangeTags: (taskId: string, change: { add?: string; remove?: string }) => Promise<void>;
  onChangeField: (taskId: string, fieldId: string, value: unknown) => Promise<void>;
  onChangeDates: (
    taskId: string,
    dates: { dueDate?: number | null; startDate?: number | null }
  ) => Promise<void>;
  onChangeDescription: (taskId: string, description: string) => Promise<void>;
}

export function TaskModal({
  task,
  boardId,
  subtasks,
  meta,
  loadingMeta,
  onClose,
  onMove,
  onDelete,
  onCreateSubtask,
  onChangeAssignees,
  onChangeTags,
  onChangeField,
  onChangeDates,
  onChangeDescription,
}: TaskModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const moveRef = useRef<HTMLDivElement>(null);

  const [moveOpen, setMoveOpen] = useState(false);
  const [movingTo, setMovingTo] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [overTrash, setOverTrash] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [subtaskDraft, setSubtaskDraft] = useState("");
  const [creatingSubtask, setCreatingSubtask] = useState(false);

  const epic = isEpic(task);
  const columns = getVisibleColumns(boardId);
  const currentColumn = columns.find((column) => column.statusId === task.status.id);

  useEffect(() => {
    dialogRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!moveOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (!moveRef.current?.contains(event.target as Node)) setMoveOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [moveOpen]);

  async function handleMove(statusId: string) {
    if (statusId === task.status.id) return;
    setMovingTo(statusId);
    setMoveOpen(false);
    try {
      await onMove(task.id, statusId);
    } finally {
      setMovingTo(null);
    }
  }

  async function runDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await onDelete(task.id);
    } catch (caught) {
      setDeleteError(
        caught instanceof Error ? caught.message : "Não foi possível excluir a tarefa."
      );
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  async function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setOverTrash(false);
    setDragging(false);
    await runDelete();
  }

  async function submitSubtask() {
    const name = subtaskDraft.trim();
    if (!name || creatingSubtask) return;
    setCreatingSubtask(true);
    try {
      await onCreateSubtask(task.id, name);
      setSubtaskDraft("");
    } finally {
      setCreatingSubtask(false);
    }
  }

  // Todo campo que a board exibe aparece aqui — vazio inclusive. Campo
  // ausente da tela é campo que ninguém lembra de preencher.
  const infoFields = BOARD_CARDS[boardId].expanded.map((field) => ({
    key: field.key,
    label: field.label,
    value: fieldText(task, field.key),
    definition: meta?.editableFields.find((item) => item.key === field.key),
  }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 md:p-8 bg-black/70 overflow-y-auto"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={task.name}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-5xl rounded-2xl bg-popover border border-border my-auto"
      >
        {/* Cabeçalho */}
        <header className="px-7 pt-6 pb-5 space-y-4">
          <div className="flex items-start gap-4">
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                {epic && <EpicBadge />}
                {isSubtask(task) && <SubtaskBadge />}
                <span className="hub-tag bg-secondary text-muted-foreground">
                  {currentColumn?.label ?? task.status.status}
                </span>
              </div>

              <h2 className="hub-page-title !text-2xl break-words">{task.name}</h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="hub-botao-sutil !px-2 !py-2 shrink-0"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>

          {/* Mover para + abrir no ClickUp */}
          <div className="flex items-center gap-6 flex-wrap">
            <div ref={moveRef} className="relative">
              <span className="hub-meta block mb-1">Mover para</span>
              <button
                type="button"
                onClick={() => setMoveOpen((current) => !current)}
                aria-haspopup="listbox"
                aria-expanded={moveOpen}
                disabled={movingTo !== null}
                className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-[13px] min-w-[200px] disabled:opacity-60"
              >
                {movingTo ? (
                  <Loader2 className="size-3.5 animate-spin shrink-0" aria-hidden />
                ) : (
                  <ChevronDown
                    className={cx("size-3.5 shrink-0 transition-transform", moveOpen && "rotate-180")}
                    aria-hidden
                  />
                )}
                <span className="truncate flex-1 text-left">
                  {currentColumn?.label ?? task.status.status}
                </span>
              </button>

              {moveOpen && (
                <div
                  role="listbox"
                  aria-label="Mover para"
                  className="absolute z-40 mt-1.5 w-full min-w-[220px] max-h-72 overflow-y-auto hub-scroll rounded-lg border border-border bg-popover p-1 shadow-xl"
                >
                  {columns.map((column) => {
                    const current = column.statusId === task.status.id;
                    return (
                      <button
                        key={column.statusId}
                        type="button"
                        role="option"
                        aria-selected={current}
                        disabled={current}
                        onClick={() => void handleMove(column.statusId)}
                        className={cx(
                          "w-full flex items-center gap-2 rounded-md px-2.5 py-2 text-[13px] text-left transition-colors",
                          current
                            ? "bg-secondary text-foreground cursor-default"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}
                      >
                        <span className="flex-1 truncate">{column.label}</span>
                        {current && <span className="hub-meta">atual</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <a
              href={task.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-interactive text-[13px] inline-flex items-center gap-1.5 self-end pb-2"
            >
              Abrir no ClickUp
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          </div>
        </header>

        <div className="border-t border-border" />

        {/* Corpo: informações à esquerda, atividade à direita */}
        <div className="px-7 py-6 grid lg:grid-cols-2 gap-8">
          <div className="space-y-6 min-w-0">
            <section>
              <h3 className="hub-table-header mb-3">Informações</h3>

              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4 min-w-0">
                <div className="min-w-0">
                  <p className="hub-meta mb-1.5">Responsáveis</p>
                  <AssigneeEditor
                    assignees={task.assignees}
                    members={meta?.members ?? []}
                    loadingMembers={loadingMeta}
                    onChange={(add, rem) => onChangeAssignees(task.id, add, rem)}
                  />
                </div>

                {showsTags(boardId) && (
                  <div className="min-w-0">
                    <p className="hub-meta mb-1.5">Etiquetas</p>
                    <TagEditor
                      tags={task.tags}
                      available={meta?.tags ?? []}
                      loadingTags={loadingMeta}
                      onChange={(change) => onChangeTags(task.id, change)}
                    />
                  </div>
                )}

                <div className="min-w-0"><DateEditor
                  label="Início"
                  value={task.start_date}
                  onSave={(ms) => onChangeDates(task.id, { startDate: ms })}
                /></div>

                <div className="min-w-0"><DateEditor
                  label="Prazo"
                  value={task.due_date}
                  warnOverdue
                  onSave={(ms) => onChangeDates(task.id, { dueDate: ms })}
                /></div>

                {infoFields.map((field) => (
                  <FieldEditor
                    key={field.key}
                    label={field.label}
                    value={field.value}
                    field={field.definition}
                    members={meta?.members ?? []}
                    loadingMeta={loadingMeta}
                    onSave={(fieldId, value) => onChangeField(task.id, fieldId, value)}
                  />
                ))}
              </div>
            </section>

            <DescriptionEditor
              description={task.description}
              onSave={(description) => onChangeDescription(task.id, description)}
            />

            {epic && (
              <section>
                <h3 className="hub-table-header mb-2.5">
                  Subtarefas{" "}
                  <span className="hub-number text-muted-foreground font-normal">
                    {subtasks.filter((item) => ["done", "closed"].includes(item.status.type)).length}
                    /{subtasks.length}
                  </span>
                </h3>

                <ul className="space-y-1.5 mb-3">
                  {subtasks.length === 0 && (
                    <li className="hub-meta leading-relaxed">
                      Nenhuma subtarefa ainda. Toda subtarefa nasce no Inbox herdando
                      as informações deste Épico — só o responsável e o prazo ficam em
                      branco, para serem definidos na triagem.
                    </li>
                  )}
                  {subtasks.map((subtask) => (
                    <li
                      key={subtask.id}
                      className="flex items-center gap-2 rounded-lg bg-card border border-border px-3 py-2"
                    >
                      <span className="text-[13px] flex-1 min-w-0 break-words">{subtask.name}</span>
                      <span className="hub-tag bg-secondary text-muted-foreground shrink-0">
                        {subtask.status.status}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center gap-2">
                  <input
                    value={subtaskDraft}
                    onChange={(event) => setSubtaskDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void submitSubtask();
                      }
                    }}
                    placeholder="Nome da subtarefa"
                    aria-label="Nome da nova subtarefa"
                    className="hub-input flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => void submitSubtask()}
                    disabled={creatingSubtask || subtaskDraft.trim().length === 0}
                    className="hub-botao-primario flex items-center gap-1.5 disabled:opacity-50 shrink-0"
                  >
                    {creatingSubtask ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : (
                      <Plus className="size-4" aria-hidden />
                    )}
                    Criar
                  </button>
                </div>
              </section>
            )}

            {/* Exclusão — fricção positiva, zona sempre presente */}
            <section className="pt-2 border-t border-border">
              <h3 className="hub-table-header mb-2.5">Excluir</h3>

              {deleting ? (
                <p className="hub-meta flex items-center gap-2">
                  <Loader2 className="size-3 animate-spin" aria-hidden />
                  Excluindo…
                </p>
              ) : (
                <div className="flex items-start gap-3 flex-wrap">
                  <div
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", task.id);
                      setDragging(true);
                    }}
                    onDragEnd={() => {
                      setDragging(false);
                      setOverTrash(false);
                    }}
                    aria-label="Arraste este item até a zona de exclusão"
                    className="rounded-lg border border-error/40 text-error text-[13px] px-3 py-2 cursor-grab active:cursor-grabbing flex items-center gap-2"
                  >
                    <GripVertical className="size-4" aria-hidden />
                    Arraste para excluir
                  </div>

                  <div
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                      setOverTrash(true);
                    }}
                    onDragLeave={() => setOverTrash(false)}
                    onDrop={(event) => void handleDrop(event)}
                    className={cx(
                      "rounded-lg border-2 border-dashed px-6 py-2 text-[13px] transition-colors flex items-center gap-2",
                      overTrash
                        ? "border-error bg-error/15 text-error"
                        : dragging
                          ? "border-error/60 text-error/80"
                          : "border-border text-muted-foreground"
                    )}
                  >
                    <Trash2 className="size-4" aria-hidden />
                    {overTrash ? "Solte para excluir" : "Solte aqui"}
                  </div>

                  {confirming ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void runDelete()}
                        className="rounded-lg px-3 py-2 text-[13px] text-white"
                        style={{ backgroundColor: "var(--error)" }}
                      >
                        Confirmar exclusão
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirming(false)}
                        className="hub-botao-sutil !py-2 !text-[13px]"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirming(true)}
                      className="hub-botao-sutil !py-2 !text-[12px]"
                    >
                      Ou excluir pelo teclado
                    </button>
                  )}
                </div>
              )}

              {deleteError && (
                <p className="mt-2 text-[13px] text-error leading-relaxed" role="alert">
                  {deleteError}
                </p>
              )}
            </section>
          </div>

          <div className="min-w-0">
            <ActivityPanel task={task} />
          </div>
        </div>
      </div>
    </div>
  );
}
