"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Info, RotateCcw, X } from "lucide-react";
import type { BoardId, BoardMeta, ClickUpTask, CreateTaskProperties } from "@/lib/types";
import {
  BOARDS,
  BOARD_CARDS,
  BOARD_FILTER_FIELDS,
  getInboxStatusId,
  getVisibleColumns,
  showsTags,
  triageRequirements,
} from "@/lib/boards.config";
import { distinctFieldValues, fieldText } from "@/lib/fields";
import type { FieldKey } from "@/lib/fields";
import { epicProgress, isEpic, isSubtask } from "@/lib/board-actions";
import { avatarTone, cx, displayName, initials, normalize } from "@/lib/ui";
import { Column } from "./Column";
import {
  BoardToolbar,
  EMPTY_FILTERS,
  type BoardFilters,
  type FieldFilterDef,
} from "./BoardToolbar";
import type { ComboboxOption } from "@/components/Filters/Combobox";
import { TaskModal } from "@/components/Modal/TaskModal";

export function Board({ boardId, squad }: { boardId: BoardId; squad?: string }) {
  const board = BOARDS[boardId];
  const columns = useMemo(() => getVisibleColumns(boardId), [boardId]);

  const [tasks, setTasks] = useState<ClickUpTask[] | null>(null);
  const tasksRef = useRef<ClickUpTask[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<BoardFilters>(EMPTY_FILTERS);

  const [draggingTask, setDraggingTask] = useState<ClickUpTask | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [truncated, setTruncated] = useState(false);
  const [fetchInfo, setFetchInfo] = useState<{ label: string; ms: number } | null>(null);
  const [meta, setMeta] = useState<BoardMeta | null>(null);
  const [loadingMeta, setLoadingMeta] = useState(false);

  // ----------------------------------------------------------
  // Carregamento
  // ----------------------------------------------------------
  const load = useCallback(
    async (silent = false) => {
      if (silent) setRefreshing(true);
      else setTasks(null);
      setError(null);

      try {
        const response = await fetch(`/api/tasks/${boardId}${silent ? "?fresh=1" : ""}`);
        const data = (await response.json()) as {
          tasks?: ClickUpTask[];
          truncated?: boolean;
          fetchMs?: number;
          requests?: number;
          cached?: boolean;
          error?: string;
        };
        if (!response.ok) throw new Error(data.error ?? "Falha ao buscar tarefas.");
        setTasks(data.tasks ?? []);
        setTruncated(Boolean(data.truncated));
        setLastSync(new Date());
        setFetchInfo(
          data.cached
            ? { label: "do cache", ms: 0 }
            : {
                label: `${((data.fetchMs ?? 0) / 1000).toFixed(1)} s · ${data.requests ?? 0} chamada(s) ao ClickUp`,
                ms: data.fetchMs ?? 0,
              }
        );
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Erro desconhecido.");
      } finally {
        setRefreshing(false);
      }
    },
    [boardId]
  );

  // Metadados (pessoas, etiquetas, campos) — usados para editar e criar.
  useEffect(() => {
    let cancelled = false;
    setMeta(null);
    setLoadingMeta(true);

    fetch(`/api/board-meta/${boardId}`)
      .then(async (response) => {
        const data = (await response.json()) as BoardMeta & { error?: string };
        if (!response.ok) throw new Error(data.error ?? "Falha ao carregar metadados.");
        if (!cancelled) setMeta(data);
      })
      .catch(() => {
        // P14: sem metadados o hub continua exibindo a board, mas avisa —
        // antes os campos de criação simplesmente sumiam sem explicação.
        if (!cancelled) {
          setMeta(null);
          setNotice(
            "Não foi possível carregar pessoas e etiquetas desta board. Criar e editar card fica limitado até recarregar."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingMeta(false);
      });

    return () => {
      cancelled = true;
    };
  }, [boardId]);

  useEffect(() => {
    setQuery("");
    setFilters(EMPTY_FILTERS);
    setOpenTaskId(null);
    setActionError(null);
    setNotice(null);
    void load();
  }, [boardId, load]);

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  const hasActiveFilters =
    query.trim().length > 0 ||
    [filters.priority, filters.assignee, filters.dueBucket, filters.hierarchy, filters.tag].some(
      (value) => value !== null
    ) ||
    Object.values(filters.fields).some((value) => Boolean(value));

  // ----------------------------------------------------------
  // Ações — o ClickUp manda: toda ação escreve lá e re-lê de lá.
  // ----------------------------------------------------------
  const replaceTask = useCallback((updated: ClickUpTask) => {
    setTasks((current) =>
      current ? current.map((task) => (task.id === updated.id ? updated : task)) : current
    );
  }, []);

  const moveTask = useCallback(
    async (taskId: string, statusId: string) => {
      const column = columns.find((item) => item.statusId === statusId);
      if (!column) return;

      // Trava de triagem, checada antes de sair do Inbox: dá resposta
      // imediata em vez de esperar a API recusar. O servidor checa de novo.
      const task = tasksRef.current?.find((item) => item.id === taskId);
      const inboxId = getInboxStatusId(boardId);
      if (task && task.status.id === inboxId && statusId !== inboxId) {
        const needs = triageRequirements(boardId);
        const missing: string[] = [];
        if (needs.tags && task.tags.length === 0) missing.push("ao menos uma etiqueta");
        if (needs.assignee && task.assignees.length === 0) missing.push("um responsável");
        if (missing.length > 0) {
          setActionError(
            `Este card ainda não foi triado. Antes de sair do Inbox ele precisa de ${missing.join(" e ")}. Abra o card para preencher.`
          );
          return;
        }
      }

      // P8: guarda só o status anterior deste card, não um retrato da lista
      // inteira. Assim mover vários cards em sequência não se atropela.
      let previousStatus: ClickUpTask["status"] | null = null;

      setTasks((current) => {
        if (!current) return current;
        return current.map((task) => {
          if (task.id !== taskId) return task;
          previousStatus = task.status;
          return { ...task, status: { ...task.status, id: statusId, status: column.label } };
        });
      });
      setActionError(null);

      try {
        const response = await fetch("/api/move-task", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId, boardId, statusId }),
        });
        const data = (await response.json()) as {
          task?: ClickUpTask;
          warning?: string;
          error?: string;
        };
        if (!response.ok || !data.task) throw new Error(data.error ?? "Falha ao mover a tarefa.");
        replaceTask(data.task);
        setLastSync(new Date());
        // P6: a conversão em Épico pode falhar sem invalidar a movimentação.
        if (data.warning) setActionError(data.warning);
      } catch (caught) {
        // Desfaz só este card.
        setTasks((current) => {
          if (!current || !previousStatus) return current;
          return current.map((task) =>
            task.id === taskId ? { ...task, status: previousStatus as ClickUpTask["status"] } : task
          );
        });
        setActionError(
          caught instanceof Error ? caught.message : "Não foi possível mover a tarefa."
        );
      }
    },
    [columns, boardId, replaceTask]
  );

  const createTask = useCallback(
    async (statusId: string, name: string, properties: CreateTaskProperties) => {
      setActionError(null);
      try {
        const response = await fetch("/api/create-task", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ boardId, statusId, name, ...properties }),
        });
        const data = (await response.json()) as { task?: ClickUpTask; error?: string };
        if (!response.ok || !data.task) throw new Error(data.error ?? "Falha ao criar a tarefa.");
        setTasks((current) => (current ? [data.task as ClickUpTask, ...current] : current));
        setLastSync(new Date());
        // P9: se há filtro ativo, o card novo pode nascer fora da vista.
        if (hasActiveFilters) {
          setNotice(
            "Tarefa criada. Ela pode não aparecer agora porque há filtros ativos."
          );
        }
      } catch (caught) {
        setActionError(
          caught instanceof Error ? caught.message : "Não foi possível criar a tarefa."
        );
      }
    },
    [boardId, hasActiveFilters]
  );

  const createSubtask = useCallback(
    async (parentId: string, name: string) => {
      setActionError(null);
      try {
        const response = await fetch("/api/create-task", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ boardId, parentId, name, statusId: columns[0].statusId }),
        });
        const data = (await response.json()) as { task?: ClickUpTask; error?: string };
        if (!response.ok || !data.task) throw new Error(data.error ?? "Falha ao criar a subtarefa.");
        setTasks((current) => (current ? [data.task as ClickUpTask, ...current] : current));
        setLastSync(new Date());
        setNotice("Subtarefa criada no Inbox, herdando as informações do Épico. Falta definir o responsável para ela sair do Inbox.");
      } catch (caught) {
        setActionError(
          caught instanceof Error ? caught.message : "Não foi possível criar a subtarefa."
        );
      }
    },
    [boardId, columns]
  );

  const changeAssignees = useCallback(
    async (taskId: string, add: number[], rem: number[]) => {
      setActionError(null);
      try {
        const response = await fetch("/api/task-assignees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId, add, rem }),
        });
        const data = (await response.json()) as { task?: ClickUpTask; error?: string };
        if (!response.ok || !data.task) {
          throw new Error(data.error ?? "Falha ao atualizar responsáveis.");
        }
        replaceTask(data.task);
      } catch (caught) {
        setActionError(
          caught instanceof Error ? caught.message : "Não foi possível atualizar responsáveis."
        );
      }
    },
    [replaceTask]
  );

  const changeTags = useCallback(
    async (taskId: string, change: { add?: string; remove?: string }) => {
      setActionError(null);
      try {
        const response = await fetch("/api/task-tags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId, ...change }),
        });
        const data = (await response.json()) as { task?: ClickUpTask; error?: string };
        if (!response.ok || !data.task) {
          throw new Error(data.error ?? "Falha ao atualizar etiquetas.");
        }
        replaceTask(data.task);
      } catch (caught) {
        setActionError(
          caught instanceof Error ? caught.message : "Não foi possível atualizar etiquetas."
        );
      }
    },
    [replaceTask]
  );

  const changeField = useCallback(
    async (taskId: string, fieldId: string, value: unknown) => {
      setActionError(null);
      try {
        const response = await fetch("/api/task-field", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId, fieldId, value }),
        });
        const data = (await response.json()) as { task?: ClickUpTask; error?: string };
        if (!response.ok || !data.task) {
          throw new Error(data.error ?? "Falha ao salvar o campo.");
        }
        replaceTask(data.task);
      } catch (caught) {
        setActionError(
          caught instanceof Error ? caught.message : "Não foi possível salvar o campo."
        );
      }
    },
    [replaceTask]
  );

  const changeDates = useCallback(
    async (
      taskId: string,
      dates: { dueDate?: number | null; startDate?: number | null }
    ) => {
      setActionError(null);
      try {
        const response = await fetch("/api/task-dates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId, ...dates }),
        });
        const data = (await response.json()) as { task?: ClickUpTask; error?: string };
        if (!response.ok || !data.task) {
          throw new Error(data.error ?? "Falha ao salvar a data.");
        }
        replaceTask(data.task);
      } catch (caught) {
        setActionError(
          caught instanceof Error ? caught.message : "Não foi possível salvar a data."
        );
      }
    },
    [replaceTask]
  );

  const changeDescription = useCallback(
    async (taskId: string, description: string) => {
      setActionError(null);
      try {
        const response = await fetch("/api/task-description", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId, description }),
        });
        const data = (await response.json()) as { task?: ClickUpTask; error?: string };
        if (!response.ok || !data.task) {
          throw new Error(data.error ?? "Falha ao salvar a descrição.");
        }
        replaceTask(data.task);
      } catch (caught) {
        setActionError(
          caught instanceof Error ? caught.message : "Não foi possível salvar a descrição."
        );
      }
    },
    [replaceTask]
  );

  const removeTask = useCallback(async (taskId: string) => {
    setActionError(null);
    try {
      const response = await fetch("/api/delete-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Falha ao excluir a tarefa.");
      setTasks((current) => (current ? current.filter((task) => task.id !== taskId) : current));
      setOpenTaskId(null);
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Não foi possível excluir a tarefa.";
      setActionError(message);
      throw caught instanceof Error ? caught : new Error(message);
    }
  }, []);

  // ----------------------------------------------------------
  // Filtros
  // ----------------------------------------------------------
  const assigneeOptions = useMemo<ComboboxOption[]>(() => {
    if (!tasks) return [];
    const people = new Map<string, { label: string; hint?: string }>();
    for (const task of tasks) {
      for (const user of task.assignees) {
        people.set(String(user.id), { label: displayName(user), hint: user.email });
      }
    }
    return Array.from(people.entries())
      .map(([value, person]) => ({
        value,
        label: person.label,
        hint: person.hint,
        avatar: initials(person.label),
        avatarColor: avatarTone(person.label),
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
  }, [tasks]);

  const tagOptions = useMemo<ComboboxOption[]>(() => {
    if (!tasks || !showsTags(boardId)) return [];
    const found = new Map<string, string>();
    for (const task of tasks) {
      for (const tag of task.tags) found.set(tag.name, tag.tag_bg);
    }
    return Array.from(found.entries())
      .map(([name, color]) => ({ value: name, label: name, color: color || undefined }))
      .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
  }, [tasks, boardId]);

  // Filtros por campo da board — as opções saem dos próprios dados,
  // então só aparece filtro que tem valor de verdade nas tarefas.
  const fieldFilters = useMemo<FieldFilterDef[]>(() => {
    if (!tasks) return [];
    const labels = new Map(
      [...BOARD_CARDS[boardId].collapsed, ...BOARD_CARDS[boardId].expanded].map((field) => [
        field.key,
        field.label,
      ])
    );

    return BOARD_FILTER_FIELDS[boardId]
      .map((key) => {
        const values = distinctFieldValues(tasks, key);
        return {
          key,
          label: labels.get(key) ?? key,
          options: values.map((value) => ({ value, label: value })),
        };
      })
      .filter((field) => field.options.length > 1);
  }, [tasks, boardId]);

  const visibleTasks = useMemo(() => {
    if (!tasks) return null;
    const needle = normalize(query.trim());
    const weekAhead = Date.now() + 7 * 24 * 60 * 60 * 1000;

    return tasks.filter((task) => {
      if (needle && !normalize(task.name).includes(needle)) return false;

      // Sub-visão por squad (vem da navegação, não da barra de filtros).
      if (squad && fieldText(task, "competencia") !== squad) return false;

      if (filters.priority && task.priority?.priority !== filters.priority) return false;

      if (
        filters.assignee &&
        !task.assignees.some((user) => String(user.id) === filters.assignee)
      ) {
        return false;
      }

      if (filters.tag && !task.tags.some((tag) => tag.name === filters.tag)) return false;

      if (filters.hierarchy === "epic" && !isEpic(task)) return false;
      if (filters.hierarchy === "task" && isEpic(task)) return false;

      for (const [key, wanted] of Object.entries(filters.fields)) {
        if (!wanted) continue;
        if (fieldText(task, key as FieldKey) !== wanted) return false;
      }

      if (filters.dueBucket) {
        const due = task.due_date ? Number(task.due_date) : null;
        if (filters.dueBucket === "none" && due !== null) return false;
        if (filters.dueBucket === "overdue" && (due === null || due >= Date.now())) return false;
        if (
          filters.dueBucket === "week" &&
          (due === null || due < Date.now() || due > weekAhead)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, query, filters, squad]);

  // P2: toda tarefa que não cai em nenhuma coluna visível é contada e
  // explicada na tela. Silêncio aqui foi o que escondeu bugs antes.
  const unmapped = useMemo(() => {
    if (!tasks) return { hidden: 0, unknown: 0, unknownStatuses: [] as string[] };

    const visibleIds = new Set(columns.map((column) => column.statusId));
    const hiddenIds = new Set(board.hiddenStatusIds);
    const unknownStatuses = new Map<string, number>();
    let hidden = 0;

    for (const task of tasks) {
      if (visibleIds.has(task.status.id)) continue;
      if (hiddenIds.has(task.status.id)) {
        hidden += 1;
        continue;
      }
      unknownStatuses.set(
        task.status.status,
        (unknownStatuses.get(task.status.status) ?? 0) + 1
      );
    }

    return {
      hidden,
      unknown: Array.from(unknownStatuses.values()).reduce((sum, n) => sum + n, 0),
      unknownStatuses: Array.from(unknownStatuses.entries()).map(
        ([status, count]) => `${status} (${count})`
      ),
    };
  }, [tasks, columns, board.hiddenStatusIds]);

  const openTask = useMemo(
    () => (tasks && openTaskId ? tasks.find((task) => task.id === openTaskId) ?? null : null),
    [tasks, openTaskId]
  );

  const openTaskSubtasks = useMemo(
    () => (tasks && openTask ? tasks.filter((task) => task.parent === openTask.id) : []),
    [tasks, openTask]
  );

  const epicLabel = useCallback(
    (task: ClickUpTask): string | null => {
      if (!tasks || !isEpic(task)) return null;
      const progress = epicProgress(task, tasks);
      return progress.total === 0 ? null : `${progress.done}/${progress.total}`;
    },
    [tasks]
  );

  // ----------------------------------------------------------
  // Erro de carregamento
  // ----------------------------------------------------------
  if (error) {
    return (
      <div className="h-full grid place-items-center p-8">
        <div className="max-w-lg rounded-2xl border border-error/30 bg-error/10 p-5 space-y-3">
          <p className="hub-table-header text-error flex items-center gap-2">
            <AlertTriangle className="size-4" aria-hidden />
            Não foi possível carregar a board {board.name}
          </p>
          <p className="text-[13px] text-muted-foreground leading-relaxed">{error}</p>
          <p className="hub-meta leading-relaxed">
            Verifique se CLICKUP_API_TOKEN está definido no .env.local (local) e nas
            Environment Variables da Vercel (produção).
          </p>
          <button
            type="button"
            onClick={() => void load()}
            className="hub-botao-primario inline-flex items-center gap-2"
          >
            <RotateCcw className="size-4" aria-hidden />
            Tentar de novo
          </button>
        </div>
      </div>
    );
  }

  const loading = tasks === null;

  return (
    <div className="h-full flex flex-col">
      <BoardToolbar
        board={board}
        subtitle={squad ?? null}
        total={tasks?.length ?? 0}
        filtered={visibleTasks?.length ?? 0}
        query={query}
        onQueryChange={setQuery}
        filters={filters}
        onFilterChange={(key, value) =>
          setFilters((current) => ({ ...current, [key]: value }))
        }
        onFieldFilterChange={(fieldKey, value) =>
          setFilters((current) => ({
            ...current,
            fields: { ...current.fields, [fieldKey]: value },
          }))
        }
        onClearFilters={() => {
          setQuery("");
          setFilters(EMPTY_FILTERS);
        }}
        assigneeOptions={assigneeOptions}
        tagOptions={tagOptions}
        fieldFilters={fieldFilters}
        showTags={showsTags(boardId)}
        lastSync={lastSync}
        fetchInfo={fetchInfo}
        refreshing={refreshing}
        onRefresh={() => void load(true)}
      />

      {truncated && (
        <div className="mx-6 mb-3 rounded-lg border border-attention/30 bg-attention/10 px-4 py-2.5 flex items-start gap-3">
          <AlertTriangle className="size-4 text-attention shrink-0 mt-0.5" aria-hidden />
          <p className="text-[13px] text-attention leading-relaxed">
            Esta board tem mais tarefas do que o hub busca de uma vez. O que está na tela
            é um recorte — use os filtros para encontrar o que procura.
          </p>
        </div>
      )}

      {/* P2: divergência entre o que veio do ClickUp e o que a tela mostra. */}
      {(unmapped.unknown > 0 || unmapped.hidden > 0) && (
        <div className="mx-6 mb-3 rounded-lg border border-attention/30 bg-attention/10 px-4 py-2.5 flex items-start gap-3">
          <AlertTriangle className="size-4 text-attention shrink-0 mt-0.5" aria-hidden />
          <div className="text-[13px] leading-relaxed">
            {unmapped.unknown > 0 && (
              <p className="text-attention">
                <span className="hub-number">{unmapped.unknown}</span> tarefa(s) não
                aparecem: estão em status que o hub ainda não mapeou —{" "}
                {unmapped.unknownStatuses.join(", ")}.
              </p>
            )}
            {unmapped.hidden > 0 && (
              <p className="text-muted-foreground">
                <span className="hub-number">{unmapped.hidden}</span> tarefa(s) estão em
                colunas ocultas de propósito (obsoletas).
              </p>
            )}
          </div>
        </div>
      )}

      <div
        className="flex-1 min-h-0 overflow-x-auto hub-scroll px-6 pb-6"
        onDragEnd={() => {
          setDraggingTask(null);
          setDropTarget(null);
        }}
      >
        <div className="flex gap-3 h-full min-w-max">
          {columns.map((column) => {
            // P1: no Creative Ops a subtarefa corre a esteira como qualquer
            // card, então aparece na coluna. Nas boards padrão nem buscamos
            // subtarefas (ver rota /api/tasks), o filtro é só cinto de segurança.
            const columnTasks = (visibleTasks ?? []).filter((task) => {
              if (task.status.id !== column.statusId) return false;
              if (board.type !== "epics" && isSubtask(task)) return false;
              return true;
            });

            return (
              <Column
                key={column.statusId}
                column={column}
                boardId={boardId}
                tasks={columnTasks}
                loading={loading}
                allowCreate={board.allowCreate}
                isDropTarget={dropTarget === column.statusId && draggingTask !== null}
                draggingTaskId={draggingTask?.id ?? null}
                epicProgressLabel={epicLabel}
                onOpenTask={(task) => setOpenTaskId(task.id)}
                onDragStartTask={setDraggingTask}
                onDragEndTask={() => {
                  setDraggingTask(null);
                  setDropTarget(null);
                }}
                onDragEnterColumn={setDropTarget}
                onDropOnColumn={(statusId) => {
                  const dragged = draggingTask;
                  setDraggingTask(null);
                  setDropTarget(null);
                  if (dragged && dragged.status.id !== statusId) {
                    void moveTask(dragged.id, statusId);
                  }
                }}
                onCreateTask={createTask}
                meta={meta}
                loadingMeta={loadingMeta}
              />
            );
          })}
        </div>
      </div>

      {(actionError || notice) && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[min(560px,90vw)]">
          <div
            role="alert"
            className={cx(
              "rounded-xl border px-4 py-3 flex items-start gap-3 shadow-2xl backdrop-blur",
              actionError
                ? "border-error/40 bg-error/15"
                : "border-interactive/40 bg-interactive/15"
            )}
          >
            {actionError ? (
              <AlertTriangle className="size-4 text-error shrink-0 mt-0.5" aria-hidden />
            ) : (
              <Info className="size-4 text-interactive shrink-0 mt-0.5" aria-hidden />
            )}
            <p
              className={cx(
                "text-[13px] flex-1 leading-relaxed",
                actionError ? "text-error" : "text-interactive"
              )}
            >
              {actionError ?? notice}
            </p>
            <button
              type="button"
              onClick={() => {
                setActionError(null);
                setNotice(null);
              }}
              aria-label="Fechar aviso"
              className="text-muted-foreground hover:text-foreground shrink-0"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      )}

      {openTask && (
        <TaskModal
          task={openTask}
          boardId={boardId}
          subtasks={openTaskSubtasks}
          onClose={() => setOpenTaskId(null)}
          onMove={moveTask}
          onDelete={removeTask}
          onCreateSubtask={createSubtask}
          meta={meta}
          loadingMeta={loadingMeta}
          onChangeAssignees={changeAssignees}
          onChangeTags={changeTags}
          onChangeField={changeField}
          onChangeDates={changeDates}
          onChangeDescription={changeDescription}
        />
      )}
    </div>
  );
}
