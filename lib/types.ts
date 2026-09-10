// ============================================================
// lib/types.ts — Tipos compartilhados do Creative Ops Hub
// Regra: zero `any`. Se não sabe o tipo, defina aqui.
// ============================================================

// ------------------------------------------------------------
// Usuário do ClickUp
// ------------------------------------------------------------
export interface ClickUpUser {
  id: number;
  username: string;
  email: string;
  profilePicture: string | null;
}

// ------------------------------------------------------------
// Status (identificado por ID — nunca por texto)
// ------------------------------------------------------------
export interface ClickUpStatus {
  id: string;
  status: string; // nome legível, só para display
  color: string;
  orderindex: number;
  type: string;
}

// ------------------------------------------------------------
// Campo personalizado (custom field)
// ------------------------------------------------------------
export type CustomFieldValue = string | number | boolean | ClickUpUser | ClickUpUser[] | null;

export interface ClickUpCustomField {
  id: string;
  name: string;
  type: string;
  value: CustomFieldValue;
}

// ------------------------------------------------------------
// Tag
// ------------------------------------------------------------
export interface ClickUpTag {
  name: string;
  tag_fg: string;
  tag_bg: string;
}

// ------------------------------------------------------------
// Prioridade
// ------------------------------------------------------------
export interface ClickUpPriority {
  id: string;
  priority: "urgent" | "high" | "normal" | "low";
  color: string;
  orderindex: string;
}

// ------------------------------------------------------------
// Tarefa base do ClickUp
// ------------------------------------------------------------
export interface ClickUpTask {
  id: string;
  name: string;
  status: ClickUpStatus;
  orderindex: string;
  date_created: string;
  date_updated: string;
  date_closed: string | null;
  due_date: string | null;
  start_date: string | null;
  assignees: ClickUpUser[];
  tags: ClickUpTag[];
  priority: ClickUpPriority | null;
  description: string | null;
  url: string;
  list: { id: string; name: string };
  custom_fields: ClickUpCustomField[];
  parent: string | null; // ID da tarefa pai (subtarefas)
  subtasks?: ClickUpTask[];
}

// ------------------------------------------------------------
// Tarefa enriquecida para boards standard
// ------------------------------------------------------------
export interface HubTask extends ClickUpTask {
  boardType: BoardType;
}

// ------------------------------------------------------------
// Épico e Subtarefa (Creative Ops)
// ------------------------------------------------------------
export interface EpicTask extends HubTask {
  boardType: "epics";
  custom_type: "milestone";
  subtasks: SubTask[];
  squad: Squad;
}

export interface SubTask extends HubTask {
  boardType: "epics";
  parent: string; // sempre preenchido em subtarefas
  inheritedFields: {
    competencia: string;
    setorDemandante: string;
    tags: ClickUpTag[];
  };
}

// ------------------------------------------------------------
// Boards
// ------------------------------------------------------------
export type BoardId =
  | "producao"
  | "edicao"
  | "edicao-start"
  | "imersoes"
  | "edicao-externa"
  | "creative-ops";

export type BoardType = "standard" | "epics";

export type Squad = "Formatos" | "Conteúdo" | "START" | "Gestão";

export interface BoardConfig {
  id: BoardId;
  name: string;
  listId: string;
  type: BoardType;
  allowCreate: boolean; // false na Edição Externa
  hiddenStatusIds: string[]; // colunas a ocultar (ex: Edição START)
}

// ------------------------------------------------------------
// Coluna do Kanban (agrupamento de tarefas por status)
// ------------------------------------------------------------
export interface KanbanColumn {
  statusId: string;
  statusName: string;
  color: string;
  tasks: HubTask[];
}

// ------------------------------------------------------------
// Resposta paginada da API do ClickUp
// ------------------------------------------------------------
export interface ClickUpTasksResponse {
  tasks: ClickUpTask[];
  last_page: boolean;
}

// ------------------------------------------------------------
// Payload para mover uma tarefa de coluna
// ------------------------------------------------------------
export interface MoveTaskPayload {
  taskId: string;
  newStatusId: string;
}

// ------------------------------------------------------------
// Payload para criar uma tarefa
// ------------------------------------------------------------
export interface CreateTaskPayload {
  listId: string;
  name: string;
  statusId?: string;
  assignees?: number[];
  priority?: number;
  customFields?: Array<{ id: string; value: CustomFieldValue }>;
  parentId?: string; // só para subtarefas do Creative Ops
}

// ------------------------------------------------------------
// Payload para criar um Épico (Creative Ops)
// ------------------------------------------------------------
export interface CreateEpicPayload extends CreateTaskPayload {
  squad: Squad;
  tipoDemanda?: string;
  setorDemandante?: string;
  tags?: string[];
}
