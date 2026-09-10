// ============================================================
// lib/boards.config.ts — Mapa oficial das 6 boards do MVP
//
// IMPORTANTE: Status são identificados por ID (statusId),
// nunca por comparação de texto. Quando os IDs reais do
// ClickUp forem confirmados via API, substituir os
// placeholders "status_XXX" pelos IDs numéricos reais.
//
// Qualquer mudança de list_id ou regra deve ser feita aqui
// E em docs/HISTORICO.md ao mesmo tempo.
// ============================================================

import type { BoardConfig, BoardId } from "./types";

// ------------------------------------------------------------
// IDs de status — placeholders até confirmação via API
// Formato real do ClickUp: string numérica (ex: "p90130598_abc123")
// Substituir após chamar GET /list/{listId}/field
// ------------------------------------------------------------

// Produção (list_id: 901305984877)
const PRODUCAO_STATUS = {
  INBOX: "status_producao_inbox",
  BACKLOG: "status_producao_backlog",
  CADASTRO_INSTRUTOR: "status_producao_cadastro_instrutor",
  TRAVADO: "status_producao_travado",
  AGENDAMENTO: "status_producao_agendamento",
  PEDIR_EQUIPAMENTO: "status_producao_pedir_equipamento",
  EM_ENVIO: "status_producao_em_envio",
  SUPORTE_TESTE: "status_producao_suporte_teste",
  ACOMPANHAMENTO: "status_producao_acompanhamento",
  GRAVACAO_DIURNA: "status_producao_gravacao_diurna",
  GRAVACAO_NOTURNA: "status_producao_gravacao_noturna",
  GRAVACAO: "status_producao_gravacao",
  DEVOLUCAO: "status_producao_devolucao",
  FINALIZADO: "status_producao_finalizado",
} as const;

// Edição (list_id: 901303719253)
const EDICAO_STATUS = {
  INBOX: "status_edicao_inbox",
  BACKLOG: "status_edicao_backlog",
  FAZENDO: "status_edicao_fazendo",
  AGUARDANDO_NUVEM: "status_edicao_aguardando_nuvem",
  FINALIZADO: "status_edicao_finalizado",
  FECHADOS: "status_edicao_fechados",
} as const;

// Edição START (list_id: 901304846677)
const EDICAO_START_STATUS = {
  INBOX: "status_start_inbox",
  BACKLOG: "status_start_backlog",
  EDICAO_1: "status_start_edicao1",
  FAZENDO_QA1: "status_start_fazendo_qa1",
  EDICAO_2: "status_start_edicao2",
  AGUARDANDO_NUVEM: "status_start_aguardando_nuvem",
  FINALIZADO: "status_start_finalizado",
  FECHADOS: "status_start_fechados",
  // Obsoletas — NUNCA renderizar no hub:
  BACKLOG_ICONES: "status_start_backlog_icones",
  FAZENDO_ICONES: "status_start_fazendo_icones",
} as const;

// Imersões (list_id: 901310922355)
const IMERSOES_STATUS = {
  INBOX: "status_imersoes_inbox",
  BACKLOG: "status_imersoes_backlog",
  PRONTO_INICIAR: "status_imersoes_pronto_iniciar",
  EM_TRABALHO: "status_imersoes_em_trabalho",
  VALIDACAO: "status_imersoes_validacao",
  FINALIZADOS: "status_imersoes_finalizados",
  FECHADOS: "status_imersoes_fechados",
} as const;

// Edição Externa (list_id: 901327212474)
const EDICAO_EXTERNA_STATUS = {
  BACKLOG: "status_externa_backlog",
  EDITANDO: "status_externa_editando",
  EDITADO: "status_externa_editado",
  PAGO: "status_externa_pago",
  CONCLUIDO: "status_externa_concluido",
} as const;

// Creative Ops (list_id: 901314029949)
const CREATIVE_OPS_STATUS = {
  INBOX: "status_cops_inbox",
  BACKLOG: "status_cops_backlog",
  EPICOS: "status_cops_epicos",
  PRONTO_INICIAR: "status_cops_pronto_iniciar",
  EM_TRABALHO: "status_cops_em_trabalho",
  VALIDACAO: "status_cops_validacao",
  FINALIZADOS: "status_cops_finalizados",
  FECHADOS: "status_cops_fechados",
} as const;

// ------------------------------------------------------------
// Configuração das boards
// ------------------------------------------------------------
export const BOARDS: Record<BoardId, BoardConfig> = {
  producao: {
    id: "producao",
    name: "Produção",
    listId: "901305984877",
    type: "standard",
    allowCreate: true,
    hiddenStatusIds: [],
    // ⚠️ Confirmar: há automações ativas nessa board que precisem ser respeitadas?
  },

  edicao: {
    id: "edicao",
    name: "Edição",
    listId: "901303719253",
    type: "standard",
    allowCreate: true,
    hiddenStatusIds: [],
    // ⚠️ Confirmar: de quais boards exatamente vêm as automações que criam cards aqui?
  },

  "edicao-start": {
    id: "edicao-start",
    name: "Edição START",
    listId: "901304846677",
    type: "standard",
    allowCreate: true,
    hiddenStatusIds: [
      EDICAO_START_STATUS.BACKLOG_ICONES,
      EDICAO_START_STATUS.FAZENDO_ICONES,
    ],
  },

  imersoes: {
    id: "imersoes",
    name: "Imersões",
    listId: "901310922355",
    type: "standard",
    allowCreate: true,
    hiddenStatusIds: [],
  },

  "edicao-externa": {
    id: "edicao-externa",
    name: "Edição Externa",
    listId: "901327212474",
    type: "standard",
    allowCreate: false, // ❌ NUNCA renderizar botão de criação nesta board
    hiddenStatusIds: [],
    // ⚠️ Confirmar: de qual board exatamente vem a automação que cria os cards aqui?
  },

  "creative-ops": {
    id: "creative-ops",
    name: "Creative Ops",
    listId: "901314029949",
    type: "epics",
    allowCreate: true,
    hiddenStatusIds: [],
    // ⚠️ Confirmar: list_id 901314029949 é o correto para Creative Ops?
    // O legado tinha esse id marcado como standard — confirmar que é epics.
  },
};

// Exporta também os objetos de status para uso nas rotas de API
export const STATUS_IDS = {
  producao: PRODUCAO_STATUS,
  edicao: EDICAO_STATUS,
  "edicao-start": EDICAO_START_STATUS,
  imersoes: IMERSOES_STATUS,
  "edicao-externa": EDICAO_EXTERNA_STATUS,
  "creative-ops": CREATIVE_OPS_STATUS,
} as const;

// Helper: retorna a config de uma board pelo ID
export function getBoardConfig(boardId: BoardId): BoardConfig {
  return BOARDS[boardId];
}

// Helper: verifica se um statusId deve ser ocultado em uma board
export function isHiddenStatus(boardId: BoardId, statusId: string): boolean {
  return BOARDS[boardId].hiddenStatusIds.includes(statusId);
}
