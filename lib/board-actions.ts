// ============================================================
// lib/board-actions.ts — Regras de negócio das boards
//
// As rotas de API são wrappers finos: validam a entrada e chamam
// uma função daqui. Toda regra (Épico vira Marco, subtarefa nasce
// no Inbox e herda campos do pai, board sem criação) mora aqui.
// ============================================================

import {
  BOARDS,
  BOARD_CARDS,
  SPACE_ID,
  getApiStatusName,
  getCreationFieldKeys,
  getInboxStatusId,
  isEpicColumn,
  requiresTriage,
  showsTags,
  triageRequirements,
} from "./boards.config";
import {
  convertToMilestone,
  createTask,
  getListFields,
  getListMembers,
  getSpaceTags,
  getTask,
  setCustomFieldValue,
  updateTaskStatus,
} from "./clickup";
import { invalidateList } from "./cache";
import { findField, findFieldDefinition, normalize } from "./fields";
import type { FieldKey } from "./fields";
import type {
  BoardId,
  BoardMeta,
  ClickUpCustomField,
  ClickUpTask,
  CreateTaskProperties,
  CreationField,
} from "./types";

/** Erro de regra de negócio (não é falha técnica) — vira 422 na rota. */
export class TriageError extends Error {
  readonly code = "TRIAGE_REQUIRED";
}

/** A tarefa é um Épico? (Marco no ClickUp) */
export function isEpic(task: ClickUpTask): boolean {
  return task.custom_item_id === 1;
}

/** A tarefa é uma subtarefa? */
export function isSubtask(task: ClickUpTask): boolean {
  return Boolean(task.parent);
}

// ------------------------------------------------------------
// Mover card de coluna
// ------------------------------------------------------------
export interface MoveResult {
  task: ClickUpTask;
  /** Preenchido quando a movimentação deu certo mas algo secundário falhou. */
  warning?: string;
}

export async function moveTaskOnBoard(
  boardId: BoardId,
  taskId: string,
  statusId: string
): Promise<MoveResult> {
  const apiStatus = getApiStatusName(boardId, statusId);
  if (!apiStatus) {
    throw new Error(`Status "${statusId}" não pertence à board ${BOARDS[boardId].name}.`);
  }

  // Trava de triagem: sair do Inbox exige etiqueta e responsável.
  // A checagem lê a tarefa no ClickUp — não confia no que o front achava.
  const inboxId = getInboxStatusId(boardId);
  if (statusId !== inboxId) {
    const current = await getTask(taskId);
    if (requiresTriage(boardId, current.status.id, statusId)) {
      const needs = triageRequirements(boardId);
      const missing: string[] = [];
      if (needs.tags && current.tags.length === 0) missing.push("ao menos uma etiqueta");
      if (needs.assignee && current.assignees.length === 0) missing.push("um responsável");
      if (missing.length > 0) {
        throw new TriageError(
          `Este card ainda não foi triado. Antes de sair do Inbox ele precisa de ${missing.join(" e ")}. Abra o card e preencha.`
        );
      }
    }
  }

  const updated = await updateTaskStatus(taskId, apiStatus);
  invalidateList(BOARDS[boardId].listId);

  // Regra Creative Ops: entrar na coluna ÉPICOS converte em Marco.
  // P6: se a conversão falhar (ex.: ClickApp de Marcos desligado na lista),
  // a movimentação continua valendo — ela já aconteceu no ClickUp. Desfazer
  // tudo por causa disso deixava o card "pulando de volta" sem explicação.
  if (isEpicColumn(boardId, statusId) && !isEpic(updated)) {
    try {
      const epic = await convertToMilestone(taskId);
      return { task: epic };
    } catch (error) {
      const detail = error instanceof Error ? error.message : "erro desconhecido";
      return {
        task: updated,
        warning: `O card foi movido para Épicos, mas o ClickUp não aceitou convertê-lo em Marco. Verifique se o ClickApp de Marcos está ativo na lista. Detalhe: ${detail}`,
      };
    }
  }

  return { task: updated };
}

// ------------------------------------------------------------
// Criar card
// ------------------------------------------------------------

/**
 * O que a subtarefa herda do Épico pai.
 *
 * Regra do time: a subtarefa nasce carregando as informações que o Épico
 * exibe — competência, setor, solicitante e os links do projeto. Assim ela
 * já chega no Inbox legível, sem ninguém ter que reescrever o contexto a
 * cada subtarefa.
 *
 * Exceções que NÃO herdam, mesmo aparecendo no card:
 * - Responsável: é o que a triagem precisa definir antes do card sair do Inbox.
 * - Datas: cada subtarefa tem prazo próprio.
 * - Tipo de demanda de design (Creative Ops): o Épico e suas subtarefas podem
 *   ser tipos de demanda diferentes entre si — cada subtarefa define o seu.
 */
const NEVER_INHERITED: readonly FieldKey[] = ["tipoDemandaDesign"];

function inheritedFieldKeys(boardId: BoardId): FieldKey[] {
  const seen = new Set<FieldKey>();
  const keys: FieldKey[] = [];

  for (const field of [...BOARD_CARDS[boardId].collapsed, ...BOARD_CARDS[boardId].expanded]) {
    if (seen.has(field.key)) continue;
    if (NEVER_INHERITED.includes(field.key)) continue;
    seen.add(field.key);
    keys.push(field.key);
  }

  return keys;
}

/** Resolve o valor a enviar de volta num campo dropdown (a API espera o id da opção). */
function outgoingValue(field: ClickUpCustomField): unknown {
  const raw = field.value;
  if (field.type !== "drop_down") return raw;

  const options = field.type_config?.options ?? [];
  if (typeof raw === "string") {
    const byId = options.find((option) => option.id === raw);
    if (byId) return byId.id;
    const byName = options.find(
      (option) => normalize(option.name ?? option.label ?? "") === normalize(raw)
    );
    return byName ? byName.id : raw;
  }
  if (typeof raw === "number") {
    const byIndex = options.find((option) => option.orderindex === raw) ?? options[raw];
    return byIndex ? byIndex.id : raw;
  }
  return raw;
}

export async function createTaskOnBoard(
  boardId: BoardId,
  name: string,
  statusId: string,
  parentId?: string,
  properties?: CreateTaskProperties
): Promise<ClickUpTask> {
  const board = BOARDS[boardId];

  if (!board.allowCreate) {
    throw new Error(
      `A board ${board.name} não permite criação de cards pelo hub. ${board.createBlockedReason ?? ""}`.trim()
    );
  }

  const trimmed = name.trim();
  if (!trimmed) throw new Error("O nome da tarefa não pode ficar em branco.");

  // Subtarefa: nasce sempre no INBOX e herda campos do Épico pai.
  if (parentId) {
    if (board.type !== "epics") {
      throw new Error("Subtarefas só existem na board Creative Ops.");
    }

    const parent = await getTask(parentId);
    if (!isEpic(parent)) {
      throw new Error("Subtarefas só podem ser criadas a partir de um Épico.");
    }

    const inboxStatusId = getInboxStatusId(boardId);
    const inboxApiStatus = getApiStatusName(boardId, inboxStatusId);
    if (!inboxApiStatus) throw new Error("Coluna Inbox não encontrada nesta board.");

    const subtask = await createTask(board.listId, {
      name: trimmed,
      statusName: inboxApiStatus,
      parentId,
      // Etiqueta só é herdada onde a board de fato usa etiqueta.
      // No Creative Ops ela não é exibida nem exigida, então não entra.
      tags: showsTags(boardId) ? parent.tags.map((tag) => tag.name) : undefined,
    });

    // Herança dos campos visíveis do Épico.
    for (const key of inheritedFieldKeys(boardId)) {
      const parentField = findField(parent, key);
      if (!parentField || parentField.value === undefined || parentField.value === null) continue;
      try {
        await setCustomFieldValue(subtask.id, parentField.id, outgoingValue(parentField));
      } catch {
        // Herança é melhor-esforço: se um campo falhar, a subtarefa
        // continua criada. O usuário consegue ajustar no modal.
      }
    }

    invalidateList(board.listId);
    return getTask(subtask.id);
  }

  // Tarefa comum.
  const apiStatus = getApiStatusName(boardId, statusId);
  if (!apiStatus) throw new Error(`Status "${statusId}" não pertence à board ${board.name}.`);

  const created = await createTask(board.listId, {
    name: trimmed,
    statusName: apiStatus,
    assignees: properties?.assignees,
    customFields: properties?.customFields,
    tags: properties?.tags,
  });

  invalidateList(board.listId);

  // Nasceu direto na coluna ÉPICOS: já vira Marco.
  if (isEpicColumn(boardId, statusId)) {
    return convertToMilestone(created.id);
  }

  return created;
}

// ------------------------------------------------------------
// Épico só é resolvido quando todas as subtarefas terminam
// ------------------------------------------------------------
export interface EpicProgress {
  total: number;
  done: number;
  /** Todas as subtarefas concluídas? */
  complete: boolean;
}

export function epicProgress(epic: ClickUpTask, allTasks: ClickUpTask[]): EpicProgress {
  const subtasks = allTasks.filter((task) => task.parent === epic.id);
  const done = subtasks.filter(
    (task) => task.status.type === "done" || task.status.type === "closed"
  ).length;
  return {
    total: subtasks.length,
    done,
    complete: subtasks.length > 0 && done === subtasks.length,
  };
}


// ------------------------------------------------------------
// Metadados da board: quem pode ser responsável, quais etiquetas
// existem e quais propriedades entram no formulário de criação.
// ------------------------------------------------------------
export async function getBoardMeta(boardId: BoardId): Promise<BoardMeta> {
  const board = BOARDS[boardId];

  const [rawMembers, tags, fields] = await Promise.all([
    getListMembers(board.listId),
    getSpaceTags(SPACE_ID),
    getListFields(board.listId),
  ]);

  // Quem foi convidado e ainda não completou o cadastro vem sem username.
  // Em vez de descartar a pessoa, mostramos a parte do e-mail antes do @.
  const members = rawMembers.map((member) => ({
    ...member,
    username: member.username || member.email?.split("@")[0] || `Usuário ${member.id}`,
  }));

  const labels = new Map(
    BOARD_CARDS[boardId].collapsed.map((field) => [field.key, field.label])
  );

  const allLabels = new Map(
    [...BOARD_CARDS[boardId].collapsed, ...BOARD_CARDS[boardId].expanded].map((field) => [
      field.key,
      field.label,
    ])
  );

  function resolve(key: FieldKey, labelMap: Map<string, string>): CreationField | null {
    const definition = findFieldDefinition(fields, key);
    if (!definition) return null; // campo não existe nesta lista — não é oferecido

    return {
      key,
      label: labelMap.get(key) ?? definition.name,
      fieldId: definition.id,
      type: definition.type,
      options: (definition.type_config?.options ?? []).map((option) => ({
        id: option.id,
        label: option.name ?? option.label ?? "",
      })),
    };
  }

  const creationFields = getCreationFieldKeys(boardId)
    .map((key) => resolve(key, labels))
    .filter((field): field is CreationField => field !== null);

  // No modal, todo campo que a board exibe pode ser preenchido — inclusive
  // os que estão vazios. É assim que o card sai do estado incompleto.
  const editableKeys: FieldKey[] = [];
  const seen = new Set<FieldKey>();
  for (const field of [...BOARD_CARDS[boardId].collapsed, ...BOARD_CARDS[boardId].expanded]) {
    if (seen.has(field.key)) continue;
    seen.add(field.key);
    editableKeys.push(field.key);
  }

  const editableFields = editableKeys
    .map((key) => resolve(key, allLabels))
    .filter((field): field is CreationField => field !== null);

  return { members, tags, creationFields, editableFields };
}
