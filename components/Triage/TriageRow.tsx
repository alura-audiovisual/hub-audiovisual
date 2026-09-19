"use client";

import { useState } from "react";
import { AlarmClock, AlertTriangle, ArrowRight, CalendarClock, Check, ExternalLink, Loader2 } from "lucide-react";
import type { BoardMeta, ClickUpTask } from "@/lib/types";
import { cx, dueLabel, dueUrgency, formatDate } from "@/lib/ui";
import { linkify } from "@/lib/linkify";
import { AssigneeEditor } from "@/components/Editors/AssigneeEditor";
import { TagEditor } from "@/components/Editors/TagEditor";

interface TriageRowProps {
  task: ClickUpTask;
  contexto: string;
  needs: { tags: boolean; assignee: boolean };
  showTags: boolean;
  meta: BoardMeta | null;
  loadingMeta: boolean;
  destinoLabel: string;
  onChangeAssignees: (taskId: string, add: number[], rem: number[]) => Promise<void>;
  onChangeTags: (taskId: string, change: { add?: string; remove?: string }) => Promise<void>;
  onAdvance: (taskId: string) => Promise<void>;
}

/**
 * Uma linha do boletim que também é o lugar de resolver a pendência.
 *
 * Em vez de mandar a pessoa abrir o card, definir o responsável, voltar e
 * arrastar, a triagem inteira acontece aqui: define o que falta e avança.
 * O botão só libera quando os requisitos estão cumpridos — assim a regra
 * aparece como estado da interface, não como erro depois do clique.
 */
export function TriageRow({
  task,
  contexto,
  needs,
  showTags,
  meta,
  loadingMeta,
  destinoLabel,
  onChangeAssignees,
  onChangeTags,
  onAdvance,
}: TriageRowProps) {
  const [advancing, setAdvancing] = useState(false);

  const semDono = needs.assignee && task.assignees.length === 0;
  const semTag = needs.tags && task.tags.length === 0;
  const pronto = !semDono && !semTag;

  // Alerta de prazo: o que vence em uma semana ou menos precisa aparecer
  // antes de tudo. Um card sem responsável e com prazo em dois dias é um
  // problema diferente de um card sem responsável e sem prazo.
  const urgencia = dueUrgency(task.due_date);
  const prazo = dueLabel(task.due_date);
  const urgente = urgencia === "overdue" || urgencia === "soon";

  async function advance() {
    if (!pronto || advancing) return;
    setAdvancing(true);
    try {
      await onAdvance(task.id);
    } finally {
      setAdvancing(false);
    }
  }

  return (
    <li
      className={cx(
        "rounded-xl border bg-card px-4 py-3.5 space-y-3 relative overflow-hidden",
        urgencia === "overdue"
          ? "border-error/40"
          : urgencia === "soon"
            ? "border-attention/40"
            : pronto
              ? "border-success/25"
              : "border-border"
      )}
    >
      {urgente && (
        <span
          className="absolute left-0 top-0 bottom-0 w-[3px]"
          style={{
            backgroundColor:
              urgencia === "overdue" ? "var(--error)" : "var(--attention)",
          }}
          aria-hidden
        />
      )}

      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="hub-card-title !text-[14px] break-words">{task.name}</p>
          {contexto && (
            <p className="hub-meta line-clamp-2 break-words">{linkify(contexto)}</p>
          )}

          {prazo && urgente && (
            <span
              className="hub-tag inline-flex items-center gap-1.5"
              style={{
                backgroundColor:
                  urgencia === "overdue"
                    ? "rgba(211,61,68,0.15)"
                    : "rgba(243,175,16,0.15)",
                color: urgencia === "overdue" ? "var(--error)" : "var(--attention)",
              }}
            >
              {urgencia === "overdue" ? (
                <AlarmClock className="size-2.5" aria-hidden />
              ) : (
                <CalendarClock className="size-2.5" aria-hidden />
              )}
              {urgencia === "overdue" ? `Prazo ${prazo}` : `Prazo ${prazo}`}
              {" · "}
              {formatDate(task.due_date)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="hub-meta whitespace-nowrap">
            criada {formatDate(task.date_created) ?? ""}
          </span>
          <a
            href={task.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-interactive"
            aria-label={`Abrir ${task.name} no ClickUp`}
          >
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
        </div>
      </div>

      <div className="flex items-end gap-5 flex-wrap">
        <div className="min-w-0">
          <p className="hub-meta mb-1.5">
            Responsável
            {semDono && (
              <span className="text-attention ml-1.5 inline-flex items-center gap-1">
                <AlertTriangle className="size-2.5" aria-hidden />
                falta
              </span>
            )}
          </p>
          <AssigneeEditor
            assignees={task.assignees}
            members={meta?.members ?? []}
            loadingMembers={loadingMeta}
            onChange={(add, rem) => onChangeAssignees(task.id, add, rem)}
          />
        </div>

        {showTags && (
          <div className="min-w-0 flex-1">
            <p className="hub-meta mb-1.5">
              Etiquetas
              {semTag && (
                <span className="text-attention ml-1.5 inline-flex items-center gap-1">
                  <AlertTriangle className="size-2.5" aria-hidden />
                  falta
                </span>
              )}
            </p>
            <TagEditor
              tags={task.tags}
              available={meta?.tags ?? []}
              loadingTags={loadingMeta}
              onChange={(change) => onChangeTags(task.id, change)}
            />
          </div>
        )}

        <button
          type="button"
          onClick={() => void advance()}
          disabled={!pronto || advancing}
          title={
            pronto
              ? `Mover para ${destinoLabel}`
              : semDono && semTag
                ? "Defina responsável e etiqueta para avançar"
                : semDono
                  ? "Defina o responsável para avançar"
                  : "Adicione ao menos uma etiqueta para avançar"
          }
          className={cx(
            "ml-auto inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] transition-colors shrink-0",
            pronto
              ? "hub-botao-primario"
              : "border border-dashed border-border text-muted-foreground cursor-not-allowed"
          )}
        >
          {advancing ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : pronto ? (
            <Check className="size-4" aria-hidden />
          ) : (
            <AlertTriangle className="size-4" aria-hidden />
          )}
          Mover para {destinoLabel}
          {pronto && !advancing && <ArrowRight className="size-4" aria-hidden />}
        </button>
      </div>
    </li>
  );
}
