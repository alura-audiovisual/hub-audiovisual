// ============================================================
// lib/types.ts — Tipos compartilhados do Creative Ops Hub
// Regra: zero `any`. Se não sabe o tipo, defina aqui.
// ============================================================

// ------------------------------------------------------------
// Primitivos do ClickUp
// ------------------------------------------------------------
export interface ClickUpUser {
  id: number;
  /**
   * Pode vir null: membro convidado que ainda não ativou a conta aparece
   * sem username, só com e-mail. Use displayName() de lib/ui.ts para exibir.
   */
  username: string | null;
  email?: string;
  initials?: string;
  color?: string;
  profilePicture?: string | null;
}

export interface ClickUpStatus {
  id: string;
  status: string;
  color: string;
  orderindex: number;
  type: string;
}

export interface ClickUpTag {
  name: string;
  tag_fg: string;
  tag_bg: string;
}

export interface ClickUpPriority {
  id: string;
  priority: string; // "urgent" | "high" | "normal" | "low"
  color: string;
  orderindex: string;
}

// ------------------------------------------------------------
// Campos personalizados
// O `value` varia por tipo de campo — por isso é tratado como
// `unknown` e normalizado em lib/fields.ts (nunca com `any`).
// ------------------------------------------------------------
export interface CustomFieldOption {
  id: string;
  name?: string;
  label?: string;
  orderindex?: number;
  color?: string | null;
}

export interface CustomFieldTypeConfig {
  options?: CustomFieldOption[];
  precision?: number;
  currency_type?: string;
  default?: number;
}

export interface ClickUpCustomField {
  id: string;
  name: string;
  type: string;
  type_config?: CustomFieldTypeConfig;
  value?: unknown;
}

// ------------------------------------------------------------
// Tarefa
// ------------------------------------------------------------
export interface ClickUpTask {
  id: string;
  custom_id?: string | null;
  name: string;
  description?: string | null;
  text_content?: string | null;
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
  url: string;
  parent: string | null;
  /** 1 = Marco (Épico) no ClickUp. Ausente/0 = tarefa comum. */
  custom_item_id?: number | null;
  list?: { id: string; name?: string };
  custom_fields: ClickUpCustomField[];
}

export interface ClickUpTasksResponse {
  tasks: ClickUpTask[];
  last_page: boolean;
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
  /** Frase curta que explica a board para quem chega novo. */
  description: string;
  listId: string;
  type: BoardType;
  /** Edição Externa = false. Nenhum botão de criação é renderizado. */
  allowCreate: boolean;
  /** Motivo exibido quando a criação está bloqueada. */
  createBlockedReason?: string;
  /** Status que nunca são renderizados (colunas obsoletas). */
  hiddenStatusIds: string[];
  /** Creative Ops: filtro por squad/competência é obrigatório. */
  hasSquadFilter: boolean;
}

// ------------------------------------------------------------
// Contratos das rotas de API do hub
// ------------------------------------------------------------
export interface MoveTaskPayload {
  taskId: string;
  boardId: BoardId;
  statusId: string;
}

export interface CreateTaskPayload {
  boardId: BoardId;
  name: string;
  statusId: string;
  /** Preenchido só quando é subtarefa de um Épico (Creative Ops). */
  parentId?: string;
}

export interface DeleteTaskPayload {
  taskId: string;
}

export interface ApiError {
  error: string;
}

// ------------------------------------------------------------
// Comentários (a "Atividade" do card)
// ------------------------------------------------------------
export interface ClickUpComment {
  id: string;
  comment_text: string;
  user: ClickUpUser;
  date: string;
  reply_count?: number;
  resolved?: boolean;
}

export interface ClickUpSpaceTag {
  name: string;
  tag_fg: string;
  tag_bg: string;
}

/** Definição de um campo personalizado da lista (sem valor). */
export type ClickUpFieldDefinition = Omit<ClickUpCustomField, "value">;

/** Campo oferecido no formulário de criação de card. */
export interface CreationField {
  key: string;
  label: string;
  fieldId: string;
  type: string;
  options: Array<{ id: string; label: string }>;
}

/** Tudo que o front precisa para editar e criar cards numa board. */
export interface BoardMeta {
  members: ClickUpUser[];
  tags: ClickUpSpaceTag[];
  /** Campos oferecidos no formulário de criação (os que o card exibe). */
  creationFields: CreationField[];
  /** Todos os campos editáveis no modal — inclui os do card. */
  editableFields: CreationField[];
}

export interface CreateTaskProperties {
  assignees?: number[];
  customFields?: Array<{ id: string; value: unknown }>;
  tags?: string[];
}
