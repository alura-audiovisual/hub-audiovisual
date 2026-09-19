"use client";

import { useState, type DragEvent } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import type { BoardId, BoardMeta, ClickUpTask, CreateTaskProperties } from "@/lib/types";
import { getColumnColor } from "@/lib/boards.config";
import type { ColumnDef } from "@/lib/boards.config";
import { cx } from "@/lib/ui";
import { TaskCard } from "@/components/Card/TaskCard";
import { CreateTaskForm } from "./CreateTaskForm";

/** Cards renderizados por vez. Listas grandes travam a tela. */
const PAGE_SIZE = 25;

interface ColumnProps {
  column: ColumnDef;
  boardId: BoardId;
  tasks: ClickUpTask[];
  loading: boolean;
  allowCreate: boolean;
  isDropTarget: boolean;
  draggingTaskId: string | null;
  epicProgressLabel: (task: ClickUpTask) => string | null;
  onOpenTask: (task: ClickUpTask) => void;
  onDragStartTask: (task: ClickUpTask) => void;
  onDragEndTask: () => void;
  onDragEnterColumn: (statusId: string) => void;
  onDropOnColumn: (statusId: string) => void;
  meta: BoardMeta | null;
  loadingMeta: boolean;
  onCreateTask: (
    statusId: string,
    name: string,
    properties: CreateTaskProperties
  ) => Promise<void>;
}

export function Column({
  column,
  boardId,
  tasks,
  loading,
  allowCreate,
  isDropTarget,
  draggingTaskId,
  epicProgressLabel,
  onOpenTask,
  onDragStartTask,
  onDragEndTask,
  onDragEnterColumn,
  onDropOnColumn,
  onCreateTask,
  meta,
  loadingMeta,
}: ColumnProps) {
  const color = getColumnColor(boardId, column.statusId);
  const [collapsed, setCollapsed] = useState(Boolean(column.collapsedByDefault));
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [creating, setCreating] = useState(false);

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  if (collapsed) {
    return (
      <div className="w-12 shrink-0 h-full flex flex-col items-center gap-3 rounded-xl bg-secondary/40 py-3 overflow-hidden">
        <div
          className="h-[3px] w-full -mt-3 mb-1"
          style={{ backgroundColor: color }}
          aria-hidden
        />
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          aria-label={`Expandir coluna ${column.label}`}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
        <span
          className="hub-meta [writing-mode:vertical-rl] whitespace-nowrap"
          title={column.label}
        >
          {column.label}
        </span>
        <span className="hub-number text-[11px] text-muted-foreground">{tasks.length}</span>
      </div>
    );
  }

  return (
    <div
      className={cx(
        "w-[300px] shrink-0 h-full flex flex-col gap-2.5 rounded-xl transition-colors",
        isDropTarget && "hub-lane-ativa"
      )}
      onDragOver={handleDragOver}
      onDragEnter={() => onDragEnterColumn(column.statusId)}
      onDrop={(event) => {
        event.preventDefault();
        onDropOnColumn(column.statusId);
      }}
    >
      {/* Cabeçalho: recolher + nome à esquerda, criar à direita. */}
      <header className="rounded-lg bg-secondary/60 overflow-hidden">
        <div className="h-[3px] w-full" style={{ backgroundColor: color }} aria-hidden />
        <div className="flex items-center gap-2 px-3 py-2.5">
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          aria-label={`Recolher coluna ${column.label}`}
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <ChevronDown className="size-4" aria-hidden />
        </button>

        <h2 className="hub-table-header truncate" title={column.label}>
          {column.label}
        </h2>

        <span className="hub-number text-[11px] text-muted-foreground">
          {loading ? "—" : tasks.length}
        </span>

        {allowCreate && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="ml-auto shrink-0 inline-flex items-center gap-1 text-interactive hub-tab-label !text-[12px] hover:opacity-80 transition-opacity"
          >
            Criar tarefa
            <Plus className="size-3.5" aria-hidden />
          </button>
        )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto hub-scroll space-y-2.5 pr-0.5">
        {creating && (
          <CreateTaskForm
            columnLabel={column.label}
            meta={meta}
            loadingMeta={loadingMeta}
            onSubmit={async (name, properties) => {
              await onCreateTask(column.statusId, name, properties);
              setCreating(false);
            }}
            onCancel={() => setCreating(false)}
          />
        )}

        {loading &&
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-28 rounded-xl bg-white/[0.03] animate-pulse" />
          ))}

        {!loading && tasks.length === 0 && !creating && (
          <p className="hub-meta px-2 py-8 text-center leading-relaxed">
            Nenhuma tarefa aqui.
            <br />
            Arraste um card para esta coluna.
          </p>
        )}

        {!loading &&
          tasks.slice(0, visible).map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              boardId={boardId}
              onOpen={onOpenTask}
              onDragStart={onDragStartTask}
              onDragEnd={onDragEndTask}
              isDragging={draggingTaskId === task.id}
              epicProgressLabel={epicProgressLabel(task)}
            />
          ))}

        {!loading && tasks.length > visible && (
          <button
            type="button"
            onClick={() => setVisible((current) => current + PAGE_SIZE)}
            className="hub-botao-sutil w-full !text-[12px]"
          >
            Mostrar mais {Math.min(PAGE_SIZE, tasks.length - visible)} de {tasks.length - visible}
          </button>
        )}
      </div>
    </div>
  );
}
