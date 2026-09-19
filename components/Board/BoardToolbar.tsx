"use client";

import { Info, RefreshCw, Search, X } from "lucide-react";
import type { BoardConfig } from "@/lib/types";
import { cx, timeAgo } from "@/lib/ui";
import { Combobox, type ComboboxOption } from "@/components/Filters/Combobox";

export interface BoardFilters {
  priority: string | null;
  assignee: string | null;
  dueBucket: string | null;
  hierarchy: string | null;
  tag: string | null;
  /** Filtros por campo da board — chave do campo -> valor escolhido. */
  fields: Record<string, string | null>;
}

export const EMPTY_FILTERS: BoardFilters = {
  priority: null,
  assignee: null,
  dueBucket: null,
  hierarchy: null,
  tag: null,
  fields: {},
};

export const DUE_OPTIONS: ComboboxOption[] = [
  { value: "overdue", label: "Prazo vencido" },
  { value: "week", label: "Próximos 7 dias" },
  { value: "none", label: "Sem prazo" },
];

export const PRIORITY_OPTIONS: ComboboxOption[] = [
  { value: "urgent", label: "Urgente" },
  { value: "high", label: "Alta" },
  { value: "normal", label: "Normal" },
  { value: "low", label: "Baixa" },
];

export const HIERARCHY_OPTIONS: ComboboxOption[] = [
  { value: "epic", label: "Só Épicos" },
  { value: "task", label: "Só tarefas" },
];

export interface FieldFilterDef {
  key: string;
  label: string;
  options: ComboboxOption[];
}

interface BoardToolbarProps {
  board: BoardConfig;
  subtitle?: string | null;
  total: number;
  filtered: number;
  query: string;
  onQueryChange: (value: string) => void;
  filters: BoardFilters;
  onFilterChange: (key: keyof Omit<BoardFilters, "fields">, value: string | null) => void;
  onFieldFilterChange: (fieldKey: string, value: string | null) => void;
  onClearFilters: () => void;
  assigneeOptions: ComboboxOption[];
  tagOptions: ComboboxOption[];
  fieldFilters: FieldFilterDef[];
  showTags: boolean;
  lastSync: Date | null;
  fetchInfo?: { label: string; ms: number } | null;
  refreshing: boolean;
  onRefresh: () => void;
}

export function BoardToolbar({
  board,
  subtitle,
  total,
  filtered,
  query,
  onQueryChange,
  filters,
  onFilterChange,
  onFieldFilterChange,
  onClearFilters,
  assigneeOptions,
  tagOptions,
  fieldFilters,
  showTags,
  lastSync,
  fetchInfo,
  refreshing,
  onRefresh,
}: BoardToolbarProps) {
  const activeCount =
    (query.trim() ? 1 : 0) +
    [filters.priority, filters.assignee, filters.dueBucket, filters.hierarchy, filters.tag].filter(
      (value) => value !== null
    ).length +
    Object.values(filters.fields).filter((value) => value !== null && value !== "").length;

  return (
    <header className="px-6 pt-5 pb-4 space-y-4 shrink-0">
      <div className="flex items-start gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="hub-page-title">
            {board.name}
            {subtitle && (
              <span className="text-muted-foreground font-normal"> · {subtitle}</span>
            )}
          </h1>
          <p className="hub-meta mt-1">{board.description}</p>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <span className="hub-meta">
            {activeCount > 0 ? (
              <>
                <span className="hub-number text-foreground">{filtered}</span> de {total}
              </>
            ) : (
              <>
                <span className="hub-number text-foreground">{total}</span> tarefas
              </>
            )}
          </span>

          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="hub-botao-sutil flex items-center gap-2 disabled:opacity-60"
            title={
              fetchInfo
                ? `Última carga: ${fetchInfo.label}`
                : lastSync
                  ? `Atualizado ${timeAgo(lastSync)}`
                  : "Atualizar"
            }
          >
            <RefreshCw className={cx("size-4", refreshing && "animate-spin")} aria-hidden />
            <span className="hub-meta">
              {refreshing ? "Atualizando…" : lastSync ? timeAgo(lastSync) : "Atualizar"}
            </span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <Search
            className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Buscar pelo nome"
            aria-label="Buscar tarefas pelo nome"
            className="hub-input !w-56 !pl-9 !pr-8 !py-2"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="Limpar busca"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          )}
        </div>

        <div className="w-[150px]">
          <Combobox
            label="Responsável"
            allLabel="Todos os responsáveis"
            options={assigneeOptions}
            value={filters.assignee}
            onChange={(value) => onFilterChange("assignee", value)}
            searchPlaceholder="Nome ou e-mail"
          />
        </div>

        {fieldFilters.map((field) => (
          <div key={field.key} className="w-[150px]">
            <Combobox
              label={field.label}
              allLabel={`Todos — ${field.label}`}
              options={field.options}
              value={filters.fields[field.key] ?? null}
              onChange={(value) => onFieldFilterChange(field.key, value)}
            />
          </div>
        ))}

        {showTags && tagOptions.length > 0 && (
          <div className="w-[150px]">
            <Combobox
              label="Etiqueta"
              allLabel="Todas as etiquetas"
              options={tagOptions}
              value={filters.tag}
              onChange={(value) => onFilterChange("tag", value)}
            />
          </div>
        )}

        <div className="w-[140px]">
          <Combobox
            label="Prazo"
            allLabel="Qualquer prazo"
            options={DUE_OPTIONS}
            value={filters.dueBucket}
            onChange={(value) => onFilterChange("dueBucket", value)}
          />
        </div>

        <div className="w-[140px]">
          <Combobox
            label="Prioridade"
            allLabel="Qualquer prioridade"
            options={PRIORITY_OPTIONS}
            value={filters.priority}
            onChange={(value) => onFilterChange("priority", value)}
          />
        </div>

        {board.hasSquadFilter && (
          <div className="w-[140px]">
            <Combobox
              label="Épicos"
              allLabel="Épicos e tarefas"
              options={HIERARCHY_OPTIONS}
              value={filters.hierarchy}
              onChange={(value) => onFilterChange("hierarchy", value)}
            />
          </div>
        )}

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClearFilters}
            className="hub-botao-sutil !text-[12px] flex items-center gap-1.5"
          >
            <X className="size-3.5" aria-hidden />
            Limpar {activeCount} filtro(s)
          </button>
        )}

        {!board.allowCreate && (
          <span
            className="hub-meta inline-flex items-center gap-1.5 ml-auto"
            title={board.createBlockedReason}
          >
            <Info className="size-3.5" aria-hidden />
            Somente leitura
          </span>
        )}
      </div>
    </header>
  );
}
