// ============================================================
// lib/clickup.ts — ÚNICO ponto de contato com a API do ClickUp
//
// Regras:
// - Nenhum componente ou rota chama fetch do ClickUp diretamente.
// - Todo acesso à API passa por funções deste arquivo.
// - Erros são tratados aqui e re-lançados com mensagem clara.
// ============================================================

import type {
  ClickUpTask,
  ClickUpTasksResponse,
  CreateTaskPayload,
  MoveTaskPayload,
} from "./types";

const BASE_URL = "https://api.clickup.com/api/v2";

// ------------------------------------------------------------
// Cliente base — adiciona o token em toda requisição
// ------------------------------------------------------------
async function clickupFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = process.env.CLICKUP_API_TOKEN;

  if (!token || token === "placeholder") {
    throw new Error(
      "CLICKUP_API_TOKEN não configurado. Adicione o token real no .env.local."
    );
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `ClickUp API error ${response.status} em ${path}: ${body}`
    );
  }

  return response;
}

// ------------------------------------------------------------
// Busca tarefas de uma lista (paginado)
// Retorna todas as páginas automaticamente.
// ------------------------------------------------------------
export async function getTasksByList(
  listId: string,
  options?: {
    page?: number;
    statusIds?: string[];
    includeSubtasks?: boolean;
  }
): Promise<ClickUpTask[]> {
  const params = new URLSearchParams({
    page: String(options?.page ?? 0),
    subtasks: String(options?.includeSubtasks ?? false),
    include_closed: "true",
  });

  if (options?.statusIds?.length) {
    options.statusIds.forEach((id) => params.append("statuses[]", id));
  }

  const response = await clickupFetch(
    `/list/${listId}/task?${params.toString()}`
  );
  const data = (await response.json()) as ClickUpTasksResponse;

  // Busca recursiva se houver mais páginas
  if (!data.last_page) {
    const nextPage = await getTasksByList(listId, {
      ...options,
      page: (options?.page ?? 0) + 1,
    });
    return [...data.tasks, ...nextPage];
  }

  return data.tasks;
}

// ------------------------------------------------------------
// Busca uma tarefa específica pelo ID
// ------------------------------------------------------------
export async function getTask(taskId: string): Promise<ClickUpTask> {
  const response = await clickupFetch(`/task/${taskId}`);
  return response.json() as Promise<ClickUpTask>;
}

// ------------------------------------------------------------
// Move uma tarefa de coluna (atualiza o status pelo ID)
// ------------------------------------------------------------
export async function moveTask({
  taskId,
  newStatusId,
}: MoveTaskPayload): Promise<ClickUpTask> {
  const response = await clickupFetch(`/task/${taskId}`, {
    method: "PUT",
    body: JSON.stringify({ status: newStatusId }),
  });
  return response.json() as Promise<ClickUpTask>;
}

// ------------------------------------------------------------
// Cria uma tarefa em uma lista
// ------------------------------------------------------------
export async function createTask(
  payload: CreateTaskPayload
): Promise<ClickUpTask> {
  const body: Record<string, unknown> = {
    name: payload.name,
    ...(payload.statusId && { status: payload.statusId }),
    ...(payload.assignees && { assignees: payload.assignees }),
    ...(payload.priority && { priority: payload.priority }),
    ...(payload.customFields && { custom_fields: payload.customFields }),
  };

  // Subtarefa do Creative Ops: usa endpoint de tarefa pai
  const path = payload.parentId
    ? `/task/${payload.parentId}/subtask`
    : `/list/${payload.listId}/task`;

  const response = await clickupFetch(path, {
    method: "POST",
    body: JSON.stringify(body),
  });

  return response.json() as Promise<ClickUpTask>;
}

// ------------------------------------------------------------
// Converte uma tarefa em Marco/Épico (Creative Ops)
// custom_type: "milestone" é o que define um Épico no ClickUp
// ------------------------------------------------------------
export async function convertToEpic(taskId: string): Promise<ClickUpTask> {
  const response = await clickupFetch(`/task/${taskId}`, {
    method: "PUT",
    body: JSON.stringify({ custom_type: "milestone" }),
  });
  return response.json() as Promise<ClickUpTask>;
}

// ------------------------------------------------------------
// Atualiza campos personalizados de uma tarefa
// ------------------------------------------------------------
export async function updateCustomField(
  taskId: string,
  fieldId: string,
  value: unknown
): Promise<void> {
  await clickupFetch(`/task/${taskId}/field/${fieldId}`, {
    method: "POST",
    body: JSON.stringify({ value }),
  });
}

// ------------------------------------------------------------
// Exclui uma tarefa
// ------------------------------------------------------------
export async function deleteTask(taskId: string): Promise<void> {
  await clickupFetch(`/task/${taskId}`, {
    method: "DELETE",
  });
}

// ------------------------------------------------------------
// Busca os status disponíveis em uma lista (para popular boards.config.ts)
// Útil para descobrir os IDs reais de status durante o setup.
// ------------------------------------------------------------
export async function getListStatuses(
  listId: string
): Promise<Array<{ id: string; status: string; color: string }>> {
  const response = await clickupFetch(`/list/${listId}`);
  const data = await response.json() as { statuses: Array<{ id: string; status: string; color: string }> };
  return data.statuses;
}
