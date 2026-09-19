// ============================================================
// lib/boards.config.ts — Mapa oficial das 6 boards do MVP
//
// Fonte de verdade do hub. IDs de status confirmados via API do
// ClickUp em 2026-09-17.
//
// Cada coluna guarda DUAS identidades:
//   statusId  -> identidade interna. Tudo no hub compara por ele.
//   apiStatus -> nome exato do status no ClickUp. Usado SÓ na
//                escrita, porque a API v2 não aceita ID no PUT.
// ============================================================

import type { BoardConfig, BoardId } from "./types";
import type { FieldKey } from "./fields";

/** Espaço [Conteúdo] Audiovisual — fonte das etiquetas disponíveis. */
export const SPACE_ID = "90130783333";

// ------------------------------------------------------------
// IDs de status reais
// ------------------------------------------------------------
export const STATUS = {
  producao: {
    INBOX: "sc901305984877_mDesBSpv",
    BACKLOG: "sc901305984877_yGUW98M8",
    CADASTRO_INSTRUTOR: "sc901305984877_of7QZ3kF",
    TRAVADO: "sc901305984877_FJAGGjW2",
    AGENDAMENTO: "sc901305984877_vH4Hgq3I",
    PEDIR_EQUIPAMENTO: "sc901305984877_R8ZLoFrF",
    EM_ENVIO: "sc901305984877_J6yUTh3b",
    SUPORTE_TESTE: "sc901305984877_v2FwhhQF",
    ACOMPANHAMENTO: "sc901305984877_3Lmh7DDS",
    GRAVACAO_DIURNA: "sc901305984877_Zxdlqh3w",
    GRAVACAO_NOTURNA: "sc901305984877_M97FodJH",
    GRAVACAO: "sc901305984877_PoKSjv0K",
    DEVOLUCAO: "sc901305984877_fbVgYzE2",
    FEITO: "sc901305984877_VarystGW",
    FECHADOS: "sc901305984877_sS9Snx7Y",
  },
  edicao: {
    INBOX: "sc901303719253_558pY16b",
    BACKLOG: "sc901303719253_jGe8epvV",
    FAZENDO: "sc901303719253_0qebFdsU",
    AGUARDANDO_NUVEM: "sc901303719253_N0zQ6ckW",
    FINALIZADO: "sc901303719253_iFlZaKME",
    FECHADOS: "sc901303719253_ujV0XOvM",
  },
  "edicao-start": {
    INBOX: "sc901304846677_VqfcZrSl",
    BACKLOG: "sc901304846677_MGXfQi7S",
    EDICAO_1: "sc901304846677_o03Z4jDa",
    FAZENDO_QA1: "sc901304846677_jUifuhmF",
    EDICAO_2: "sc901304846677_lKLVRGcG",
    AGUARDANDO_NUVEM: "sc901304846677_RLnXCuKd",
    BACKLOG_ICONES: "sc901304846677_aiLfsnIi", // obsoleta
    FAZENDO_ICONES: "sc901304846677_cabjjfXH", // obsoleta
    FINALIZADO: "sc901304846677_7OjiyINg",
    FECHADOS: "sc901304846677_aKpmCKMs",
  },
  imersoes: {
    // Status vêm da pasta CreativeOps (prefixo c90131519837_) — normal no ClickUp.
    INBOX: "c90131519837_Jt2Zv5bs",
    BACKLOG: "c90131519837_Mp7nS4B1",
    PRONTO_INICIAR: "c90131519837_5QD26pDa",
    EM_TRABALHO: "c90131519837_dsRbvswD",
    VALIDACAO: "c90131519837_FLHIV1r0",
    FINALIZADOS: "c90131519837_su7zg1do",
    FECHADOS: "c90131519837_7jdmbiRe",
  },
  "edicao-externa": {
    BACKLOG: "sc901327212474_KTFSxm7M",
    EDITANDO: "sc901327212474_9iCe1Nqo",
    EDITADO: "sc901327212474_8br2YY9y",
    PAGO: "sc901327212474_UaEcTFZR",
    COMPLETE: "sc901327212474_UG5WFFnK",
  },
  "creative-ops": {
    INBOX: "sc901314029949_BHsYzHQN",
    BACKLOG: "sc901314029949_1BYvjWIn",
    EPICOS: "sc901314029949_ddCirsGD",
    PRONTO_INICIAR: "sc901314029949_6gaEueQw",
    EM_TRABALHO: "sc901314029949_LofGZCLV",
    VALIDACAO: "sc901314029949_U97uXxLG",
    FINALIZADOS: "sc901314029949_16RXYqTF",
    FECHADOS: "sc901314029949_wx5hA6t2",
  },
} as const;

// ------------------------------------------------------------
// Boards
// ------------------------------------------------------------
export const BOARDS: Record<BoardId, BoardConfig> = {
  producao: {
    id: "producao",
    name: "Produção",
    description: "Gravações: agendamento, equipamento, estúdio e acompanhamento.",
    listId: "901305984877",
    type: "standard",
    allowCreate: true,
    hiddenStatusIds: [],
    hasSquadFilter: false,
  },
  edicao: {
    id: "edicao",
    name: "Edição",
    description: "Conteúdos que passam por edição profissional.",
    listId: "901303719253",
    type: "standard",
    allowCreate: true,
    hiddenStatusIds: [],
    hasSquadFilter: false,
  },
  "edicao-start": {
    id: "edicao-start",
    name: "Edição START",
    description: "Edição do produto START, com grade curricular e QA por unidade.",
    listId: "901304846677",
    type: "standard",
    allowCreate: true,
    hiddenStatusIds: [
      STATUS["edicao-start"].BACKLOG_ICONES,
      STATUS["edicao-start"].FAZENDO_ICONES,
    ],
    hasSquadFilter: false,
  },
  imersoes: {
    id: "imersoes",
    name: "Imersões",
    description: "Produção das imersões — formato intensivo de lançamento.",
    listId: "901310922355",
    type: "standard",
    allowCreate: true,
    hiddenStatusIds: [],
    hasSquadFilter: false,
  },
  "edicao-externa": {
    id: "edicao-externa",
    name: "Edição Externa",
    description: "Gestão dos fornecedores externos de edição e seus pagamentos.",
    listId: "901327212474",
    type: "standard",
    allowCreate: false,
    createBlockedReason:
      "Os cards desta board chegam só por automação, vinda da board dos coordenadores de didática.",
    hiddenStatusIds: [],
    hasSquadFilter: false,
  },
  "creative-ops": {
    id: "creative-ops",
    name: "Creative Ops",
    description: "Demandas de design, motion e afins — com motor de Épicos e subtarefas.",
    listId: "901314029949",
    type: "epics",
    allowCreate: true,
    hiddenStatusIds: [],
    hasSquadFilter: true,
  },
};

// ------------------------------------------------------------
// Colunas
// tone controla o ponto colorido da coluna, usando SÓ tokens do DS:
//   success -> etapa concluída · error -> impedimento
//   attention -> etapa financeira · default -> fluxo normal
// ------------------------------------------------------------
export interface ColumnDef {
  statusId: string;
  apiStatus: string;
  label: string;
  tone: "default" | "success" | "error" | "attention";
  /** Cor do topo da coluna. Omitida = calculada pela posição no fluxo. */
  color?: string;
  /** Colunas de arquivo morto começam recolhidas — não competem com o fluxo ativo. */
  collapsedByDefault?: boolean;
}

export const BOARD_COLUMNS: Record<BoardId, ColumnDef[]> = {
  producao: [
    { statusId: STATUS.producao.INBOX, apiStatus: "inbox", label: "Inbox", tone: "default" },
    { statusId: STATUS.producao.BACKLOG, apiStatus: "backlog", label: "Backlog", tone: "default" },
    { statusId: STATUS.producao.CADASTRO_INSTRUTOR, apiStatus: "cadastro de instrutor", label: "Cadastro de instrutor", tone: "default" },
    { statusId: STATUS.producao.TRAVADO, apiStatus: "travado", label: "Travado", tone: "error" },
    { statusId: STATUS.producao.AGENDAMENTO, apiStatus: "agendamento", label: "Agendamento", tone: "default" },
    { statusId: STATUS.producao.PEDIR_EQUIPAMENTO, apiStatus: "pedir equipamento", label: "Pedir equipamento", tone: "default" },
    { statusId: STATUS.producao.EM_ENVIO, apiStatus: "em envio/transporte", label: "Em envio / transporte", tone: "default" },
    { statusId: STATUS.producao.SUPORTE_TESTE, apiStatus: "suporte e teste", label: "Suporte e teste", tone: "default" },
    { statusId: STATUS.producao.ACOMPANHAMENTO, apiStatus: "acompanhamento de projeto", label: "Acompanhamento de projeto", tone: "default" },
    { statusId: STATUS.producao.GRAVACAO_DIURNA, apiStatus: "gravação diurna", label: "Gravação diurna", tone: "default" },
    { statusId: STATUS.producao.GRAVACAO_NOTURNA, apiStatus: "gravação noturna", label: "Gravação noturna", tone: "default" },
    { statusId: STATUS.producao.GRAVACAO, apiStatus: "gravação", label: "Gravação", tone: "default" },
    { statusId: STATUS.producao.DEVOLUCAO, apiStatus: "devolução de equipamentos", label: "Devolução de equipamentos", tone: "default" },
    { statusId: STATUS.producao.FEITO, apiStatus: "feito", label: "Finalizado", tone: "success" },
    { statusId: STATUS.producao.FECHADOS, apiStatus: "fechados", label: "Fechados", tone: "success", collapsedByDefault: true },
  ],
  edicao: [
    { statusId: STATUS.edicao.INBOX, apiStatus: "inbox - pós-produção", label: "Inbox pós-produção", tone: "default" },
    { statusId: STATUS.edicao.BACKLOG, apiStatus: "backlog - edição", label: "Backlog edição", tone: "default" },
    { statusId: STATUS.edicao.FAZENDO, apiStatus: "fazendo - edição", label: "Fazendo edição", tone: "default" },
    { statusId: STATUS.edicao.AGUARDANDO_NUVEM, apiStatus: "aguardando nuvem", label: "Aguardando nuvem", tone: "default" },
    { statusId: STATUS.edicao.FINALIZADO, apiStatus: "finalizado", label: "Finalizado", tone: "success" },
    { statusId: STATUS.edicao.FECHADOS, apiStatus: "fechados", label: "Fechados", tone: "success", collapsedByDefault: true },
  ],
  "edicao-start": [
    { statusId: STATUS["edicao-start"].INBOX, apiStatus: "inbox - pós-produção", label: "Inbox pós-produção", tone: "default" },
    { statusId: STATUS["edicao-start"].BACKLOG, apiStatus: "backlog - edição", label: "Backlog edição", tone: "default" },
    { statusId: STATUS["edicao-start"].EDICAO_1, apiStatus: "edição 1", label: "Edição 1", tone: "default" },
    { statusId: STATUS["edicao-start"].FAZENDO_QA1, apiStatus: "fazendo qa 1", label: "Fazendo QA 1", tone: "default" },
    { statusId: STATUS["edicao-start"].EDICAO_2, apiStatus: "edição 2", label: "Edição 2", tone: "default" },
    { statusId: STATUS["edicao-start"].AGUARDANDO_NUVEM, apiStatus: "aguardando nuvem", label: "Aguardando nuvem", tone: "default" },
    { statusId: STATUS["edicao-start"].FINALIZADO, apiStatus: "finalizado", label: "Finalizado", tone: "success" },
    { statusId: STATUS["edicao-start"].FECHADOS, apiStatus: "fechados", label: "Fechados", tone: "success", collapsedByDefault: true },
    // BACKLOG ÍCONES e FAZENDO ÍCONES ficam fora de propósito (obsoletas).
  ],
  imersoes: [
    { statusId: STATUS.imersoes.INBOX, apiStatus: "inbox - creativeops", label: "Inbox CreativeOps", tone: "default" },
    { statusId: STATUS.imersoes.BACKLOG, apiStatus: "backlog", label: "Backlog", tone: "default" },
    { statusId: STATUS.imersoes.PRONTO_INICIAR, apiStatus: "pronto para iniciar", label: "Pronto para iniciar", tone: "default" },
    { statusId: STATUS.imersoes.EM_TRABALHO, apiStatus: "em trabalho", label: "Em trabalho", tone: "default" },
    { statusId: STATUS.imersoes.VALIDACAO, apiStatus: "validação", label: "Validação", tone: "default" },
    { statusId: STATUS.imersoes.FINALIZADOS, apiStatus: "finalizados", label: "Finalizados", tone: "success" },
    { statusId: STATUS.imersoes.FECHADOS, apiStatus: "fechados", label: "Fechados", tone: "success", collapsedByDefault: true },
  ],
  "edicao-externa": [
    { statusId: STATUS["edicao-externa"].BACKLOG, apiStatus: "backlog - edição externa", label: "Backlog edição externa", tone: "default" },
    { statusId: STATUS["edicao-externa"].EDITANDO, apiStatus: "editando", label: "Editando", tone: "default" },
    { statusId: STATUS["edicao-externa"].EDITADO, apiStatus: "editado", label: "Editado", tone: "attention" },
    { statusId: STATUS["edicao-externa"].PAGO, apiStatus: "pago", label: "Pago", tone: "success" },
    { statusId: STATUS["edicao-externa"].COMPLETE, apiStatus: "complete", label: "Concluído", tone: "success", collapsedByDefault: true },
  ],
  "creative-ops": [
    { statusId: STATUS["creative-ops"].INBOX, apiStatus: "inbox", label: "Inbox", tone: "default" },
    { statusId: STATUS["creative-ops"].BACKLOG, apiStatus: "backlog", label: "Backlog", tone: "default" },
    { statusId: STATUS["creative-ops"].EPICOS, apiStatus: "épicos", label: "Épicos", tone: "default" },
    { statusId: STATUS["creative-ops"].PRONTO_INICIAR, apiStatus: "pronto para iniciar", label: "Pronto para iniciar", tone: "default" },
    { statusId: STATUS["creative-ops"].EM_TRABALHO, apiStatus: "em trabalho", label: "Em trabalho", tone: "default" },
    { statusId: STATUS["creative-ops"].VALIDACAO, apiStatus: "validação", label: "Validação", tone: "default" },
    { statusId: STATUS["creative-ops"].FINALIZADOS, apiStatus: "finalizados", label: "Finalizados", tone: "success" },
    { statusId: STATUS["creative-ops"].FECHADOS, apiStatus: "fechados", label: "Fechados", tone: "success", collapsedByDefault: true },
  ],
};

// ------------------------------------------------------------
// Campos exibidos no card (colapsado) e no modal (expandido)
//
// Princípio de UX: o card colapsado responde "o que é, de quem é,
// pra quando". No máximo 3 campos — acima disso a leitura em
// varredura (scanning) quebra. Todo o resto vive no modal.
// ------------------------------------------------------------
export interface CardField {
  key: FieldKey;
  label: string;
  /** Renderiza como link clicável quando o valor for uma URL. */
  asLink?: boolean;
}

export interface BoardCardConfig {
  collapsed: CardField[];
  expanded: CardField[];
}

/**
 * Boards onde a etiqueta faz parte do vocabulário do time.
 * No Creative Ops a organização é por Competência e Tipo de Demanda —
 * etiqueta ali só polui o card, então não é exibida nem editada.
 */
export const BOARDS_WITH_TAGS: Record<BoardId, boolean> = {
  producao: true,
  edicao: true,
  "edicao-start": true,
  imersoes: true,
  "edicao-externa": true,
  "creative-ops": false,
};

export function showsTags(boardId: BoardId): boolean {
  return BOARDS_WITH_TAGS[boardId];
}

/**
 * Campos que viram filtro na barra da board. São os mesmos que o card
 * exibe mais os do modal que têm valor fechado (dropdown), porque só
 * esses geram lista útil de opções.
 */
export const BOARD_FILTER_FIELDS: Record<BoardId, FieldKey[]> = {
  producao: ["tipoEstudio", "instrutor", "setorDemandante", "timeCoordenacao"],
  edicao: ["pessoaEditora", "tipoProduto", "carreiraTrilha", "setorDemandante"],
  "edicao-start": ["startTimeCategoria", "pessoaEditora", "designerInstrucional"],
  imersoes: ["setorDemandante"],
  "edicao-externa": ["editorExterno", "tipoEditor", "setorDemandante"],
  "creative-ops": ["competencia", "tipoDemandaDesign", "setorDemandante", "solicitante"],
};

export const BOARD_CARDS: Record<BoardId, BoardCardConfig> = {
  producao: {
    collapsed: [
      { key: "tipoEstudio", label: "Estúdio" },
      { key: "instrutor", label: "Instrutor(a)" },
      { key: "gravacaoInicio", label: "Gravação" },
    ],
    expanded: [
      { key: "tipoEstudio", label: "Tipo de estúdio" },
      { key: "estudio", label: "Estúdio" },
      { key: "gravacaoInicio", label: "Gravação — início" },
      { key: "gravacaoTermino", label: "Gravação — término" },
      { key: "instrutor", label: "Instrutor(a)" },
      { key: "emailInstrutor", label: "E-mail do instrutor(a)" },
      { key: "celularInstrutor", label: "Celular do instrutor(a)" },
      { key: "pessoaProdutora", label: "Pessoa produtora" },
      { key: "setorDemandante", label: "Setor demandante" },
      { key: "timeCoordenacao", label: "Time de coordenação" },
      { key: "tipoProduto", label: "Tipo de produto/demanda" },
      { key: "linkUploadDropbox", label: "Upload Dropbox", asLink: true },
    ],
  },
  edicao: {
    collapsed: [
      { key: "pessoaEditora", label: "Editora" },
      { key: "tipoProduto", label: "Tipo" },
      { key: "carreiraTrilha", label: "Trilha" },
    ],
    expanded: [
      { key: "pessoaEditora", label: "Pessoa editora" },
      { key: "instrutor", label: "Instrutor(a)" },
      { key: "carreiraTrilha", label: "Carreira / Trilha" },
      { key: "categoria", label: "Categoria" },
      { key: "nivel", label: "Nível" },
      { key: "setorDemandante", label: "Setor demandante" },
      { key: "tipoProduto", label: "Tipo de produto/demanda" },
      { key: "linkSharepoint", label: "SharePoint", asLink: true },
      { key: "linkDropboxEdicao", label: "Dropbox — Edição", asLink: true },
      { key: "linkAdmin", label: "Admin", asLink: true },
    ],
  },
  "edicao-start": {
    collapsed: [
      { key: "startTimeCategoria", label: "Time" },
      { key: "pessoaEditora", label: "Editora" },
      { key: "designerInstrucional", label: "DI" },
    ],
    expanded: [
      { key: "startTimeCategoria", label: "[START] Time / Categoria" },
      { key: "pessoaEditora", label: "Pessoa editora" },
      { key: "designerInstrucional", label: "Designer instrucional" },
      { key: "setorDemandante", label: "Setor demandante" },
      { key: "linkDrive", label: "Drive", asLink: true },
      { key: "linkDropboxBrutos", label: "Dropbox — vídeos brutos", asLink: true },
      { key: "notasEdicao", label: "Notas de edição", asLink: true },
      { key: "qaUnidade", label: "QA da unidade", asLink: true },
    ],
  },
  imersoes: {
    collapsed: [
      { key: "dataEntregaFinal", label: "Entrega" },
      { key: "setorDemandante", label: "Setor" },
    ],
    expanded: [
      { key: "dataEntregaFinal", label: "Data de entrega final" },
      { key: "setorDemandante", label: "Setor demandante" },
      { key: "briefing", label: "Briefing", asLink: true },
      { key: "kickoff", label: "Kick-off", asLink: true },
      { key: "cronograma", label: "Cronograma", asLink: true },
      { key: "documentoInformacoes", label: "Documento de informações", asLink: true },
      { key: "linkDropbox", label: "Dropbox", asLink: true },
      { key: "materialArte", label: "Material de arte", asLink: true },
      { key: "webseries", label: "Webséries" },
    ],
  },
  "edicao-externa": {
    collapsed: [
      { key: "editorExterno", label: "Editor" },
      { key: "tipoEditor", label: "Tipo" },
      { key: "previsaoPagamento", label: "Pagamento" },
    ],
    expanded: [
      { key: "editorExterno", label: "Editor externo" },
      { key: "tipoEditor", label: "Tipo de editor" },
      { key: "valorFerramenta", label: "Valor — ferramenta de edição" },
      { key: "valorRaiz", label: "Valor — raiz" },
      { key: "previsaoPagamento", label: "Previsão de pagamento" },
      { key: "feedbackTecnico", label: "Feedback técnico" },
      { key: "setorDemandante", label: "Setor demandante" },
      { key: "linkDropboxEdicao", label: "Dropbox — Edição", asLink: true },
    ],
  },
  "creative-ops": {
    collapsed: [
      { key: "competencia", label: "Squad" },
      { key: "tipoDemandaDesign", label: "Demanda" },
      { key: "solicitante", label: "Solicitante" },
    ],
    expanded: [
      { key: "competencia", label: "Competência (squad)" },
      { key: "tipoDemandaDesign", label: "Tipo de demanda de design" },
      { key: "setorDemandante", label: "Setor demandante" },
      { key: "solicitante", label: "Solicitante" },
      { key: "idVisual", label: "ID visual", asLink: true },
      { key: "documentacao", label: "Documentação", asLink: true },
    ],
  },
};

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
export function getBoardConfig(boardId: BoardId): BoardConfig {
  return BOARDS[boardId];
}

/** Colunas visíveis de uma board (já sem as obsoletas). */
export function getVisibleColumns(boardId: BoardId): ColumnDef[] {
  const hidden = BOARDS[boardId].hiddenStatusIds;
  return BOARD_COLUMNS[boardId].filter((column) => !hidden.includes(column.statusId));
}

/** Traduz statusId -> nome exato do ClickUp (só para escrita na API). */
export function getApiStatusName(boardId: BoardId, statusId: string): string | null {
  const column = BOARD_COLUMNS[boardId].find((item) => item.statusId === statusId);
  return column ? column.apiStatus : null;
}

/** Coluna onde toda demanda nasce — INBOX de cada board. */
export function getInboxStatusId(boardId: BoardId): string {
  return BOARD_COLUMNS[boardId][0].statusId;
}

/** Creative Ops: a coluna ÉPICOS converte a tarefa em Marco ao receber card. */
export function isEpicColumn(boardId: BoardId, statusId: string): boolean {
  return boardId === "creative-ops" && statusId === STATUS["creative-ops"].EPICOS;
}

export function isValidBoardId(value: string): value is BoardId {
  return value in BOARDS;
}

/** Ordem de exibição das boards na navegação. */
export const BOARD_ORDER: BoardId[] = [
  "producao",
  "edicao",
  "edicao-start",
  "imersoes",
  "edicao-externa",
  "creative-ops",
];


/**
 * Trava de triagem: um card não sai do Inbox sem etiqueta e sem responsável.
 * Regra do time — evita que demanda crua entre na esteira.
 *
 * P10: a regra vale só onde a primeira coluna é de fato um Inbox. A Edição
 * Externa começa em "Backlog edição externa" e recebe cards por automação,
 * muitas vezes sem etiqueta — aplicar a trava lá travaria o trabalho da
 * tech lead sem motivo.
 */
export function hasInboxTriage(boardId: BoardId): boolean {
  const first = BOARD_COLUMNS[boardId][0];
  return first.label.toLowerCase().startsWith("inbox");
}

export function requiresTriage(boardId: BoardId, fromStatusId: string, toStatusId: string): boolean {
  if (!hasInboxTriage(boardId)) return false;
  const inbox = getInboxStatusId(boardId);
  return fromStatusId === inbox && toStatusId !== inbox;
}

/** O que a triagem exige nesta board antes de o card sair do Inbox. */
export function triageRequirements(boardId: BoardId): { tags: boolean; assignee: boolean } {
  return { tags: showsTags(boardId), assignee: true };
}

/** Campos oferecidos no formulário de criação — os mesmos que o card exibe. */
export function getCreationFieldKeys(boardId: BoardId): FieldKey[] {
  return BOARD_CARDS[boardId].collapsed.map((field) => field.key);
}


/** Squads do Creative Ops — viram sub-visões filtradas na navegação. */
export const CREATIVE_OPS_SQUADS = ["Formatos", "Conteúdo", "START", "Gestão"] as const;


// ------------------------------------------------------------
// Cor do topo de cada coluna
//
// Serve para diferenciar as colunas de relance, sem competir com o
// conteúdo. A cor acompanha o avanço do fluxo: começa neutra no Inbox,
// esquenta no meio da esteira e fecha em verde quando termina.
//
// O tom semântico manda: coluna de impedimento é vermelha e coluna de
// conclusão é verde, esteja onde estiver na ordem.
// ------------------------------------------------------------
const FLOW_RAMP = [
  "#6b7280", // entrada — neutro
  "#3b6fd4", // refino
  "#5f55ee", // preparação
  "#8b5cf6", // execução
  "#b660e0", // execução avançada
  "#e16b16", // ajuste final
  "#f3af10", // validação
];

export function getColumnColor(boardId: BoardId, statusId: string): string {
  const columns = BOARD_COLUMNS[boardId];
  const index = columns.findIndex((column) => column.statusId === statusId);
  const column = columns[index];
  if (!column) return FLOW_RAMP[0];

  if (column.color) return column.color;
  if (column.tone === "error") return "var(--error)";
  if (column.tone === "success") return "var(--success)";
  if (column.tone === "attention") return "var(--attention)";

  // Distribui as colunas restantes ao longo da rampa, para que boards
  // curtas e longas usem a mesma progressão visual.
  const flowColumns = columns.filter((item) => item.tone === "default");
  const position = flowColumns.findIndex((item) => item.statusId === statusId);
  if (position < 0) return FLOW_RAMP[0];

  const step =
    flowColumns.length <= 1
      ? 0
      : Math.round((position / (flowColumns.length - 1)) * (FLOW_RAMP.length - 1));

  return FLOW_RAMP[step];
}
