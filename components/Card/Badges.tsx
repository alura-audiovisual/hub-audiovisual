import { GitBranch, Milestone } from "lucide-react";

/** Badge roxo — Épico. Badge laranja — Subtarefa. Regra do CLAUDE.md. */
export function EpicBadge() {
  return (
    <span
      className="hub-tag inline-flex items-center gap-1"
      style={{ backgroundColor: "rgba(160,110,245,0.16)", color: "var(--epic)" }}
    >
      <Milestone className="size-3" aria-hidden />
      Épico
    </span>
  );
}

export function SubtaskBadge() {
  return (
    <span
      className="hub-tag inline-flex items-center gap-1"
      style={{ backgroundColor: "rgba(224,129,47,0.16)", color: "var(--subtask)" }}
    >
      <GitBranch className="size-3" aria-hidden />
      Subtarefa
    </span>
  );
}

const PRIORITY: Record<string, { label: string; color: string }> = {
  urgent: { label: "Urgente", color: "var(--error)" },
  high: { label: "Alta", color: "var(--attention)" },
};

/** Só urgente e alta viram sinal visual — o resto é ruído no card. */
export function PriorityFlag({ priority }: { priority: string | null | undefined }) {
  if (!priority) return null;
  const config = PRIORITY[priority];
  if (!config) return null;

  return (
    <span className="inline-flex items-center gap-1.5" title={`Prioridade: ${config.label}`}>
      <span className="size-1.5 rounded-full" style={{ backgroundColor: config.color }} />
      <span className="hub-meta" style={{ color: config.color }}>
        {config.label}
      </span>
    </span>
  );
}
