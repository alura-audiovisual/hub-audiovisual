// ============================================================
// lib/clickup.ts — ÚNICO ponto de contato com a API do ClickUp
//
// Nenhum componente ou rota chama a API diretamente.
//
// ⚠️ Armadilha documentada: a API v2 ACEITA O NOME do status na
// escrita (PUT /task), não o ID. Por isso as funções de escrita
// recebem `statusName`. A identidade interna do hub continua
// sendo o ID (ver lib/boards.config.ts) — o nome só aparece na
// fronteira com a API.
// ============================================================

import type {
  ClickUpComment,
  ClickUpFieldDefinition,
  ClickUpSpaceTag,
  ClickUpTask,
  ClickUpTasksResponse,
  ClickUpUser,
  CreateTaskProperties,
} from "./types";

const BASE_URL = "https://api.clickup.com/api/v2";

function getToken(): string {
  const token = process.env.CLICKUP_API_TOKEN;
  if (!token || token === "placeholder") {
    throw new Error(
      "CLICKUP_API_TOKEN não configurado. Defina o token em .env.local (local) e nas Environment Variables da Vercel (produção)."
    );
  }
  return token;
}

async function clickupFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: getToken(),
      "Content-Type": "application/json",
      ...options.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`ClickUp respondeu ${response.status} em ${path}: ${body.slice(0, 300)}`);
  }

  return response;
}

// ------------------------------------------------------------
// Leitura
// ------------------------------------------------------------

/**
 * Teto de páginas (100 tarefas por página).
 * A Edição START já tem mais de mil tarefas. O teto existe para não
 * pendurar a tela, mas quando é atingido o hub AVISA.
 */
const MAX_PAGES = 30;

/** Páginas buscadas ao mesmo tempo. */
const BATCH_SIZE = 6;

export interface TaskFetchResult {
  tasks: ClickUpTask[];
  /** true quando o teto foi atingido e provavelmente há mais no ClickUp. */
  truncated: boolean;
  /** Quanto tempo a busca levou, em milissegundos. */
  fetchMs: number;
  /** Quantas chamadas foram feitas ao ClickUp. */
  requests: number;
}

async function fetchPage(
  listId: string,
  page: number,
  options?: { includeSubtasks?: boolean; includeClosed?: boolean }
): Promise<ClickUpTasksResponse> {
  const params = new URLSearchParams({
    page: String(page),
    subtasks: String(options?.includeSubtasks ?? false),
    include_closed: String(options?.includeClosed ?? true),
  });
  const response = await clickupFetch(`/list/${listId}/task?${params.toString()}`);
  return (await response.json()) as ClickUpTasksResponse;
}

/**
 * Busca as tarefas de uma lista.
 *
 * Por que em lotes paralelos: a API devolve 100 tarefas por página e não
 * informa o total. Buscar uma página por vez, esperando cada resposta,
 * fazia a Edição START (mais de mil tarefas) precisar de onze idas e
 * voltas em fila — e o tempo de todas se somava. Agora a primeira página
 * vai sozinha e, se houver mais, as seguintes vão em lotes de seis ao
 * mesmo tempo. O tempo passa a ser o da chamada mais lenta de cada lote,
 * não a soma de todas.
 */
export async function getTasksByList(
  listId: string,
  options?: { includeSubtasks?: boolean; includeClosed?: boolean }
): Promise<TaskFetchResult> {
  const startedAt = Date.now();
  const all: ClickUpTask[] = [];
  let truncated = false;
  let requests = 0;

  const first = await fetchPage(listId, 0, options);
  requests += 1;
  all.push(...first.tasks);

  if (!first.last_page && first.tasks.length > 0) {
    let nextPage = 1;
    let done = false;

    while (!done && nextPage < MAX_PAGES) {
      const batch = [];
      for (let offset = 0; offset < BATCH_SIZE && nextPage + offset < MAX_PAGES; offset += 1) {
        batch.push(fetchPage(listId, nextPage + offset, options));
      }

      const results = await Promise.all(batch);
      requests += results.length;

      for (const result of results) {
        all.push(...result.tasks);
        if (result.last_page || result.tasks.length === 0) done = true;
      }

      nextPage += results.length;
    }

    truncated = !done && nextPage >= MAX_PAGES;
  }

  // Deduplica por ID: subtarefas podem voltar repetidas entre páginas.
  const seen = new Set<string>();
  const tasks = all.filter((task) => {
    if (seen.has(task.id)) return false;
    seen.add(task.id);
    return true;
  });

  return { tasks, truncated, fetchMs: Date.now() - startedAt, requests };
}

export async function getTask(taskId: string): Promise<ClickUpTask> {
  const response = await clickupFetch(`/task/${taskId}?include_subtasks=true`);
  return (await response.json()) as ClickUpTask;
}

// ------------------------------------------------------------
// Escrita
// ------------------------------------------------------------

/** Move a tarefa de coluna. `statusName` é o nome exato do status no ClickUp. */
export async function updateTaskStatus(
  taskId: string,
  statusName: string
): Promise<ClickUpTask> {
  const response = await clickupFetch(`/task/${taskId}`, {
    method: "PUT",
    body: JSON.stringify({ status: statusName }),
  });
  return (await response.json()) as ClickUpTask;
}

export interface CreateTaskInput extends CreateTaskProperties {
  name: string;
  /** Nome exato do status (fronteira com a API). */
  statusName: string;
  /** Preenchido só em subtarefa. */
  parentId?: string;
}

/**
 * Cria tarefa (ou subtarefa) numa lista.
 * Subtarefa na API v2 = tarefa criada na lista com `parent` preenchido.
 * Não existe endpoint /task/{id}/subtask.
 */
export async function createTask(
  listId: string,
  input: CreateTaskInput
): Promise<ClickUpTask> {
  const body: Record<string, unknown> = {
    name: input.name,
    status: input.statusName,
  };
  if (input.parentId) body.parent = input.parentId;
  if (input.tags?.length) body.tags = input.tags;
  if (input.assignees?.length) body.assignees = input.assignees;
  if (input.customFields?.length) body.custom_fields = input.customFields;

  const response = await clickupFetch(`/list/${listId}/task`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return (await response.json()) as ClickUpTask;
}

/**
 * Converte a tarefa em Marco (Épico) no ClickUp.
 * ⚠️ O campo real da API v2 é `custom_item_id: 1` — não `custom_type`.
 */
export async function convertToMilestone(taskId: string): Promise<ClickUpTask> {
  const response = await clickupFetch(`/task/${taskId}`, {
    method: "PUT",
    body: JSON.stringify({ custom_item_id: 1 }),
  });
  return (await response.json()) as ClickUpTask;
}

export async function setCustomFieldValue(
  taskId: string,
  fieldId: string,
  value: unknown
): Promise<void> {
  await clickupFetch(`/task/${taskId}/field/${fieldId}`, {
    method: "POST",
    body: JSON.stringify({ value }),
  });
}

export async function deleteTask(taskId: string): Promise<void> {
  await clickupFetch(`/task/${taskId}`, { method: "DELETE" });
}

/** Status reais de uma lista — usado para auditar o mapa de colunas. */
export async function getListStatuses(
  listId: string
): Promise<Array<{ id: string; status: string; orderindex: number }>> {
  const response = await clickupFetch(`/list/${listId}`);
  const data = (await response.json()) as {
    statuses: Array<{ id: string; status: string; orderindex: number }>;
  };
  return data.statuses;
}

// ------------------------------------------------------------
// Pessoas, etiquetas e definições de campo
// ------------------------------------------------------------

export async function getListMembers(listId: string): Promise<ClickUpUser[]> {
  const response = await clickupFetch(`/list/${listId}/member`);
  const data = (await response.json()) as { members: ClickUpUser[] };
  return data.members ?? [];
}

export async function getSpaceTags(spaceId: string): Promise<ClickUpSpaceTag[]> {
  const response = await clickupFetch(`/space/${spaceId}/tag`);
  const data = (await response.json()) as { tags: ClickUpSpaceTag[] };
  return data.tags ?? [];
}

export async function getListFields(listId: string): Promise<ClickUpFieldDefinition[]> {
  const response = await clickupFetch(`/list/${listId}/field`);
  const data = (await response.json()) as { fields: ClickUpFieldDefinition[] };
  return data.fields ?? [];
}

/** Adiciona e remove responsáveis numa tarefa. */
export async function updateTaskAssignees(
  taskId: string,
  change: { add?: number[]; rem?: number[] }
): Promise<ClickUpTask> {
  const response = await clickupFetch(`/task/${taskId}`, {
    method: "PUT",
    body: JSON.stringify({
      assignees: { add: change.add ?? [], rem: change.rem ?? [] },
    }),
  });
  return (await response.json()) as ClickUpTask;
}

export async function addTaskTag(taskId: string, tagName: string): Promise<void> {
  await clickupFetch(`/task/${taskId}/tag/${encodeURIComponent(tagName)}`, {
    method: "POST",
  });
}

export async function removeTaskTag(taskId: string, tagName: string): Promise<void> {
  await clickupFetch(`/task/${taskId}/tag/${encodeURIComponent(tagName)}`, {
    method: "DELETE",
  });
}

// ------------------------------------------------------------
// Comentários
// ------------------------------------------------------------

export async function getComments(taskId: string): Promise<ClickUpComment[]> {
  const response = await clickupFetch(`/task/${taskId}/comment`);
  const data = (await response.json()) as { comments: ClickUpComment[] };
  return data.comments ?? [];
}

export async function createComment(taskId: string, text: string): Promise<void> {
  await clickupFetch(`/task/${taskId}/comment`, {
    method: "POST",
    body: JSON.stringify({ comment_text: text, notify_all: false }),
  });
}

export async function deleteComment(commentId: string): Promise<void> {
  await clickupFetch(`/comment/${commentId}`, { method: "DELETE" });
}

export async function getCommentReplies(commentId: string): Promise<ClickUpComment[]> {
  const response = await clickupFetch(`/comment/${commentId}/reply`);
  const data = (await response.json()) as { comments: ClickUpComment[] };
  return data.comments ?? [];
}

export async function createCommentReply(commentId: string, text: string): Promise<void> {
  await clickupFetch(`/comment/${commentId}/reply`, {
    method: "POST",
    body: JSON.stringify({ comment_text: text, notify_all: false }),
  });
}

/** Quem é o dono do token — usado para saber quais comentários são "meus". */
export async function getAuthorizedUser(): Promise<ClickUpUser> {
  const response = await clickupFetch("/user");
  const data = (await response.json()) as { user: ClickUpUser };
  return data.user;
}

/** Define prazo e/ou início da tarefa (milissegundos, ou null para limpar). */
export async function updateTaskDates(
  taskId: string,
  dates: { dueDate?: number | null; startDate?: number | null }
): Promise<ClickUpTask> {
  const body: Record<string, unknown> = {};
  if (dates.dueDate !== undefined) body.due_date = dates.dueDate;
  if (dates.startDate !== undefined) body.start_date = dates.startDate;

  const response = await clickupFetch(`/task/${taskId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return (await response.json()) as ClickUpTask;
}

/** Limpa o valor de um campo personalizado. */
export async function clearCustomFieldValue(
  taskId: string,
  fieldId: string
): Promise<void> {
  await clickupFetch(`/task/${taskId}/field/${fieldId}`, { method: "DELETE" });
}

/** Grava a descrição da tarefa. String vazia limpa o campo. */
export async function updateTaskDescription(
  taskId: string,
  description: string
): Promise<ClickUpTask> {
  const response = await clickupFetch(`/task/${taskId}`, {
    method: "PUT",
    body: JSON.stringify({ description }),
  });
  return (await response.json()) as ClickUpTask;
}
