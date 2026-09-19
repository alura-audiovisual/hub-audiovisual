"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import type { BoardId, BoardMeta, ClickUpTask } from "@/lib/types";
import {
  BOARDS,
  BOARD_CARDS,
  getInboxStatusId,
  getVisibleColumns,
  showsTags,
  triageRequirements,
} from "@/lib/boards.config";
import { fieldText } from "@/lib/fields";
import { cx, dueUrgency, timeAgo } from "@/lib/ui";
import { TriageRow } from "./TriageRow";

/**
 * Boletim de triagem: mostra o que está parado no Inbox esperando
 * alguém assumir. É a lista das demandas que ainda não podem entrar
 * na esteira porque falta etiqueta ou responsável.
 */
export function TriagePanel({ boardId }: { boardId: BoardId }) {
  const board = BOARDS[boardId];
  const needs = triageRequirements(boardId);

  const [tasks, setTasks] = useState<ClickUpTask[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [meta, setMeta] = useState<BoardMeta | null>(null);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const response = await fetch(`/api/tasks/${boardId}`);
      const data = (await response.json()) as { tasks?: ClickUpTask[]; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Falha ao buscar tarefas.");
      setTasks(data.tasks ?? []);
      setLastSync(new Date());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Erro desconhecido.");
    } finally {
      setRefreshing(false);
    }
  }, [boardId]);

  useEffect(() => {
    setTasks(null);
    void load();
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    setLoadingMeta(true);

    fetch(`/api/board-meta/${boardId}`)
      .then(async (response) => {
        const data = (await response.json()) as BoardMeta & { error?: string };
        if (!response.ok) throw new Error(data.error ?? "Falha ao carregar metadados.");
        if (!cancelled) setMeta(data);
      })
      .catch(() => {
        if (!cancelled) {
          setActionError(
            "Não foi possível carregar pessoas e etiquetas. A triagem fica indisponível até recarregar."
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

  // ----------------------------------------------------------
  // Ações da triagem — escrevem no ClickUp e re-leem de lá.
  // ----------------------------------------------------------
  const replaceTask = useCallback((updated: ClickUpTask) => {
    setTasks((current) =>
      current ? current.map((task) => (task.id === updated.id ? updated : task)) : current
    );
  }, []);

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

  // Coluna seguinte ao Inbox — o destino natural de quem foi triado.
  const destino = getVisibleColumns(boardId)[1];

  const advance = useCallback(
    async (taskId: string) => {
      if (!destino) return;
      setActionError(null);
      try {
        const response = await fetch("/api/move-task", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId, boardId, statusId: destino.statusId }),
        });
        const data = (await response.json()) as {
          task?: ClickUpTask;
          warning?: string;
          error?: string;
        };
        if (!response.ok || !data.task) {
          throw new Error(data.error ?? "Falha ao mover a tarefa.");
        }
        // Sai da lista: não está mais no Inbox.
        replaceTask(data.task);
        if (data.warning) setActionError(data.warning);
      } catch (caught) {
        setActionError(
          caught instanceof Error ? caught.message : "Não foi possível mover a tarefa."
        );
      }
    },
    [boardId, destino, replaceTask]
  );

  const inboxId = getInboxStatusId(boardId);

  const { inbox, pendingCount, readyCount, urgentCount } = useMemo(() => {
    // Mostra TODO o Inbox — pendente primeiro, para quem abre o boletim
    // ver antes o que precisa de ação, sem perder de vista o resto.
    const inboxTasks = (tasks ?? []).filter((task) => task.status.id === inboxId);

    const falta = (task: ClickUpTask) => {
      const semTag = needs.tags && task.tags.length === 0;
      const semDono = needs.assignee && task.assignees.length === 0;
      return semTag || semDono;
    };

    // Ordem de leitura: primeiro o que corre risco de prazo, depois o que
    // está pendente de triagem, e por último o que já pode avançar.
    const urgencyRank = (task: ClickUpTask) => {
      const urgencia = dueUrgency(task.due_date);
      if (urgencia === "overdue") return 0;
      if (urgencia === "soon") return 1;
      return 2;
    };

    const ordered = [...inboxTasks].sort((a, b) => {
      const aUrg = urgencyRank(a);
      const bUrg = urgencyRank(b);
      if (aUrg !== bUrg) return aUrg - bUrg;

      const aFalta = falta(a) ? 0 : 1;
      const bFalta = falta(b) ? 0 : 1;
      if (aFalta !== bFalta) return aFalta - bFalta;

      return Number(b.date_created) - Number(a.date_created);
    });

    const pending = inboxTasks.filter(falta).length;
    const urgent = inboxTasks.filter((task) => {
      const urgencia = dueUrgency(task.due_date);
      return urgencia === "overdue" || urgencia === "soon";
    }).length;

    return {
      inbox: ordered,
      pendingCount: pending,
      readyCount: inboxTasks.length - pending,
      urgentCount: urgent,
    };
  }, [tasks, inboxId, needs]);

  return (
    <div className="h-full overflow-y-auto hub-scroll">
      <header className="px-8 pt-6 pb-5 space-y-4">
        <Link
          href={`/board/${boardId}`}
          className="hub-meta inline-flex items-center gap-1.5 text-interactive"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Voltar para {board.name}
        </Link>

        <div className="flex items-start gap-4 flex-wrap">
          <div>
            <h1 className="hub-page-title">Boletim de triagem</h1>
            <p className="hub-meta mt-1">
              Cards parados no Inbox que ainda não podem entrar na esteira.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void load()}
            disabled={refreshing}
            className="hub-botao-sutil flex items-center gap-2 ml-auto disabled:opacity-60"
          >
            <RefreshCw className={cx("size-4", refreshing && "animate-spin")} aria-hidden />
            <span className="hub-meta">
              {refreshing ? "Atualizando…" : lastSync ? timeAgo(lastSync) : "Atualizar"}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Resumo valor={inbox.length} rotulo="no Inbox" />
          <Resumo valor={pendingCount} rotulo="aguardando triagem" tom="attention" />
          <Resumo valor={readyCount} rotulo="prontos para mover" tom="success" />
          {urgentCount > 0 && (
            <Resumo valor={urgentCount} rotulo="com prazo em 7 dias ou menos" tom="error" />
          )}
        </div>

        <p className="hub-meta leading-relaxed max-w-2xl">
          Para sair do Inbox, um card precisa de{" "}
          {needs.tags ? "ao menos uma etiqueta e " : ""}um responsável.
          {!needs.tags && " Nesta board a etiqueta não é exigida."}
          {" "}Cards com prazo vencido ou a vencer em até sete dias aparecem primeiro,
          marcados na lateral.
        </p>
      </header>

      <div className="px-8 pb-10">
        {actionError && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-error/30 bg-error/10 px-4 py-2.5 flex items-center gap-3"
          >
            <AlertTriangle className="size-4 text-error shrink-0" aria-hidden />
            <p className="text-[13px] text-error flex-1 leading-relaxed">{actionError}</p>
            <button
              type="button"
              onClick={() => setActionError(null)}
              className="hub-meta hover:text-foreground"
            >
              Fechar
            </button>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-error/30 bg-error/10 p-4 max-w-lg">
            <p className="text-[13px] text-error leading-relaxed">{error}</p>
          </div>
        )}

        {tasks === null && !error && (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-16 rounded-xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        )}

        {tasks !== null && inbox.length === 0 && !error && (
          <p className="hub-meta">O Inbox está vazio.</p>
        )}

        <ul className="space-y-2.5">
          {inbox.map((task) => {
            const contexto = BOARD_CARDS[boardId].collapsed
              .map((field) => fieldText(task, field.key))
              .filter(Boolean)
              .join(" · ");

            return (
              <TriageRow
                key={task.id}
                task={task}
                contexto={contexto}
                needs={needs}
                showTags={showsTags(boardId)}
                meta={meta}
                loadingMeta={loadingMeta}
                destinoLabel={destino?.label ?? "próxima coluna"}
                onChangeAssignees={changeAssignees}
                onChangeTags={changeTags}
                onAdvance={advance}
              />
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function Resumo({
  valor,
  rotulo,
  tom = "default",
}: {
  valor: number;
  rotulo: string;
  tom?: "default" | "attention" | "success" | "error";
}) {
  const cor =
    tom === "attention"
      ? "var(--attention)"
      : tom === "success"
        ? "var(--success)"
        : tom === "error"
          ? "var(--error)"
          : undefined;

  return (
    <div className="rounded-xl border border-border bg-card px-4 py-2.5">
      <p className="hub-number text-xl" style={{ color: cor }}>
        {valor}
      </p>
      <p className="hub-meta">{rotulo}</p>
    </div>
  );
}
