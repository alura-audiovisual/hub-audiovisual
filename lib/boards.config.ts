// ============================================================
// lib/boards.config.ts — Mapa oficial das 6 boards do MVP
//
// IDs de status confirmados via API do ClickUp em 2026-09-17.
// Qualquer mudança de list_id ou regra deve ser feita aqui
// E em docs/HISTORICO.md ao mesmo tempo.
// ============================================================

import type { BoardConfig, BoardId } from "./types";

// ------------------------------------------------------------
// IDs de status reais (confirmados via API)
// ------------------------------------------------------------

// Produção (list_id: 901305984877)
const PRODUCAO_STATUS = {
  INBOX:               "sc901305984877_mDesBSpv",
  BACKLOG:             "sc901305984877_yGUW98M8",
  CADASTRO_INSTRUTOR:  "sc901305984877_of7QZ3kF",
  TRAVADO:             "sc901305984877_FJAGGjW2",
  AGENDAMENTO:         "sc901305984877_vH4Hgq3I",
  PEDIR_EQUIPAMENTO:   "sc901305984877_R8ZLoFrF",
  EM_ENVIO:            "sc901305984877_J6yUTh3b",
  SUPORTE_TESTE:       "sc901305984877_v2FwhhQF",
  ACOMPANHAMENTO:      "sc901305984877_3Lmh7DDS",
  GRAVACAO_DIURNA:     "sc901305984877_Zxdlqh3w",
  GRAVACAO_NOTURNA:    "sc901305984877_M97FodJH",
  GRAVACAO:            "sc901305984877_PoKSjv0K",
  DEVOLUCAO:           "sc901305984877_fbVgYzE2",
  FEITO:               "sc901305984877_VarystGW",
  FECHADOS:            "sc901305984877_sS9Snx7Y",
} as const;

// Edição (list_id: 901303719253)
const EDICAO_STATUS = {
  INBOX:           "sc901303719253_558pY16b",
  BACKLOG:         "sc901303719253_jGe8epvV",
  FAZENDO:         "sc901303719253_0qebFdsU",
  AGUARDANDO_NUVEM:"sc901303719253_N0zQ6ckW",
  FINALIZADO:      "sc901303719253_iFlZaKME",
  FECHADOS:        "sc901303719253_ujV0XOvM",
} as const;

// Edição START (list_id: 901304846677)
const EDICAO_START_STATUS = {
  INBOX:            "sc901304846677_VqfcZrSl",
  BACKLOG:          "sc901304846677_MGXfQi7S",
  EDICAO_1:         "sc901304846677_o03Z4jDa",
  FAZENDO_QA1:      "sc901304846677_jUifuhmF",
  EDICAO_2:         "sc901304846677_lKLVRGcG",
  AGUARDANDO_NUVEM: "sc901304846677_RLnXCuKd",
  // Obsoletas — NUNCA renderizar no hub:
  BACKLOG_ICONES:   "sc901304846677_aiLfsnIi",
  FAZENDO_ICONES:   "sc901304846677_cabjjfXH",
  FINALIZADO:       "sc901304846677_7OjiyINg",
  FECHADOS:         "sc901304846677_aKpmCKMs",
} as const;

// Imersões (list_id: 901310922355)
// Nota: status são da pasta CreativeOps (prefixo c90131519837_) — comportamento normal do ClickUp
const IMERSOES_STATUS = {
  INBOX:          "c90131519837_Jt2Zv5bs",
  BACKLOG:        "c90131519837_Mp7nS4B1",
  PRONTO_INICIAR: "c90131519837_5QD26pDa",
  EM_TRABALHO:    "c90131519837_dsRbvswD",
  VALIDACAO:      "c90131519837_FLHIV1r0",
  FINALIZADOS:    "c90131519837_su7zg1do",
  FECHADOS:       "c90131519837_7jdmbiRe",
} as const;

// Edição Externa (list_id: 901327212474)
const EDICAO_EXTERNA_STATUS = {
  BACKLOG:   "sc901327212474_KTFSxm7M",
  EDITANDO:  "sc901327212474_9iCe1Nqo",
  EDITADO:   "sc901327212474_8br2YY9y",
  PAGO:      "sc901327212474_UaEcTFZR",
  COMPLETE:  "sc901327212474_UG5WFFnK",
} as const;

// Creative Ops (list_id: 901314029949) — confirmado: tipo epics ✅
const CREATIVE_OPS_STATUS = {
  INBOX:          "sc901314029949_BHsYzHQN",
  BACKLOG:        "sc901314029949_1BYvjWIn",
  EPICOS:         "sc901314029949_ddCirsGD",
  PRONTO_INICIAR: "sc901314029949_6gaEueQw",
  EM_TRABALHO:    "sc901314029949_LofGZCLV",
  VALIDACAO:      "sc901314029949_U97uXxLG",
  FINALIZADOS:    "sc901314029949_16RXYqTF",
  FECHADOS:       "sc901314029949_wx5hA6t2",
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
  },

  edicao: {
    id: "edicao",
    name: "Edição",
    listId: "901303719253",
    type: "standard",
    allowCreate: true,
    hiddenStatusIds: [],
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
  },

  "creative-ops": {
    id: "creative-ops",
    name: "Creative Ops",
    listId: "901314029949",
    type: "epics",
    allowCreate: true,
    hiddenStatusIds: [],
  },
};

// Exporta os objetos de status para uso nas rotas de API
export const STATUS_IDS = {
  producao:        PRODUCAO_STATUS,
  edicao:          EDICAO_STATUS,
  "edicao-start":  EDICAO_START_STATUS,
  imersoes:        IMERSOES_STATUS,
  "edicao-externa":EDICAO_EXTERNA_STATUS,
  "creative-ops":  CREATIVE_OPS_STATUS,
} as const;

// Helper: retorna a config de uma board pelo ID
export function getBoardConfig(boardId: BoardId): BoardConfig {
  return BOARDS[boardId];
}

// Helper: verifica se um statusId deve ser ocultado em uma board
export function isHiddenStatus(boardId: BoardId, statusId: string): boolean {
  return BOARDS[boardId].hiddenStatusIds.includes(statusId);
}