// ============================================================
// lib/fields.ts — Tradutor de campos personalizados do ClickUp
//
// O ClickUp devolve os campos personalizados como uma lista solta
// de {id, name, type, value}. Este arquivo é o ÚNICO lugar que
// conhece os nomes reais desses campos: o resto do hub pede o
// campo por uma chave semântica (ex: "tipoEstudio") e recebe um
// valor já formatado para exibição.
//
// Por que por nome e não por ID: os IDs dos campos personalizados
// mudam de board para board e não estão documentados. O nome é
// estável e legível. A comparação é tolerante — ignora acento,
// caixa, pontuação e espaços extras.
// ============================================================

import type {
  ClickUpFieldDefinition,
  ClickUpCustomField,
  ClickUpTask,
  ClickUpUser,
  CustomFieldOption,
} from "./types";
import { formatCurrency, formatDate } from "./ui";

export type FieldKey =
  // Produção
  | "tipoEstudio"
  | "estudio"
  | "instrutor"
  | "emailInstrutor"
  | "celularInstrutor"
  | "pessoaProdutora"
  | "gravacaoInicio"
  | "gravacaoTermino"
  | "timeCoordenacao"
  | "linkUploadDropbox"
  // Edição / comum
  | "pessoaEditora"
  | "carreiraTrilha"
  | "categoria"
  | "nivel"
  | "setorDemandante"
  | "tipoProduto"
  | "linkSharepoint"
  | "linkDropboxEdicao"
  | "linkAdmin"
  // Edição START
  | "designerInstrucional"
  | "startTimeCategoria"
  | "linkDrive"
  | "linkDropboxBrutos"
  | "notasEdicao"
  | "qaUnidade"
  // Imersões
  | "dataEntregaFinal"
  | "briefing"
  | "kickoff"
  | "cronograma"
  | "documentoInformacoes"
  | "linkDropbox"
  | "materialArte"
  | "webseries"
  // Edição Externa
  | "editorExterno"
  | "tipoEditor"
  | "valorFerramenta"
  | "valorRaiz"
  | "previsaoPagamento"
  | "feedbackTecnico"
  // Creative Ops
  | "competencia"
  | "tipoDemandaDesign"
  | "solicitante"
  | "idVisual"
  | "documentacao";

/**
 * Nomes aceitos para cada chave. Vários apelidos por campo porque
 * a grafia varia entre boards (acento, "(a)", abreviação).
 * Ao confirmar os nomes exatos com o time, basta enxugar esta lista.
 */
const FIELD_ALIASES: Record<FieldKey, string[]> = {
  tipoEstudio: ["tipo de estudio", "tipo estudio"],
  estudio: ["estudio", "sala", "estudio especifico"],
  instrutor: ["instrutor(a)", "instrutor", "instrutora"],
  emailInstrutor: ["email do instrutor(a):", "email do instrutor", "e-mail do instrutor"],
  celularInstrutor: ["celular do instrutor(a):", "celular do instrutor", "telefone do instrutor"],
  pessoaProdutora: ["pessoa produtora", "produtor", "produtora"],
  gravacaoInicio: ["gravacao - inicio", "gravacao inicio", "inicio da gravacao"],
  gravacaoTermino: ["gravacao - termino", "gravacao termino", "termino da gravacao"],
  timeCoordenacao: ["time de coordenacao", "time coordenacao"],
  linkUploadDropbox: ["link upload dropbox", "upload dropbox"],

  pessoaEditora: ["pessoa editora", "editora", "editor(a)"],
  carreiraTrilha: ["carreira/trilha", "carreira", "trilha"],
  categoria: ["categoria"],
  nivel: ["nivel"],
  setorDemandante: ["setor demandante", "setor solicitante"],
  tipoProduto: ["tipo de produto/demanda", "tipo de produto", "tipo de demanda"],
  linkSharepoint: ["sharepoint", "link sharepoint"],
  linkDropboxEdicao: ["dropbox-edicao", "dropbox edicao", "link dropbox-edicao"],
  linkAdmin: ["admin", "link admin"],

  designerInstrucional: ["designer instrucional", "di"],
  startTimeCategoria: ["[start] time/categoria", "start time/categoria", "time/categoria"],
  linkDrive: ["drive", "link drive"],
  linkDropboxBrutos: ["dropbox videos brutos", "videos brutos", "brutos"],
  notasEdicao: ["notas de edicao", "notas edicao"],
  qaUnidade: ["qa da unidade", "qa unidade"],

  dataEntregaFinal: ["data de entrega final", "entrega final", "data de entrega"],
  briefing: ["briefing"],
  kickoff: ["kick-off", "kick off", "kickoff"],
  cronograma: ["cronograma"],
  documentoInformacoes: ["documento de informacoes", "documento de informacao"],
  linkDropbox: ["link do dropbox", "dropbox"],
  materialArte: ["material de arte", "material arte"],
  webseries: ["webseries", "webserie"],

  editorExterno: ["editor externo"],
  tipoEditor: ["tipo editor", "tipo de editor"],
  valorFerramenta: ["valor editor ferramenta", "valor ferramenta"],
  valorRaiz: ["valor editor raiz", "valor raiz"],
  previsaoPagamento: ["previsao de pagamento", "previsao pagamento"],
  feedbackTecnico: ["feedback tecnico"],

  competencia: ["competencia", "squad"],
  tipoDemandaDesign: ["tipo de demanda de design", "tipo de demanda design"],
  solicitante: ["solicitante"],
  idVisual: ["id visual", "identidade visual"],
  documentacao: ["documentacao", "documentacao do projeto"],
};

/** Campos que o time não usa — nunca exibidos (herdados do workspace). */
const IGNORED_FIELDS = ["pontualidade", "didatica", "comunicacao"];

/** Normaliza para comparação: sem acento, minúsculo, sem espaço duplo. */
export function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function isIgnoredField(field: ClickUpCustomField): boolean {
  return IGNORED_FIELDS.includes(normalize(field.name));
}

/** Acha o campo bruto de uma tarefa a partir da chave semântica. */
export function findField(
  task: ClickUpTask,
  key: FieldKey
): ClickUpCustomField | undefined {
  const aliases = FIELD_ALIASES[key];
  return task.custom_fields?.find((field) =>
    aliases.includes(normalize(field.name))
  );
}

function optionLabel(option: CustomFieldOption): string {
  return option.name ?? option.label ?? "";
}

/** Resolve o rótulo de uma opção de dropdown (valor pode vir como id ou índice). */
function resolveOption(
  field: ClickUpCustomField,
  raw: unknown
): string | null {
  const options = field.type_config?.options ?? [];
  if (typeof raw === "number") {
    const byIndex = options.find((option) => option.orderindex === raw) ?? options[raw];
    return byIndex ? optionLabel(byIndex) : null;
  }
  if (typeof raw === "string") {
    const byId = options.find((option) => option.id === raw);
    if (byId) return optionLabel(byId);
    return raw;
  }
  return null;
}

function isUserLike(value: unknown): value is ClickUpUser {
  return (
    typeof value === "object" &&
    value !== null &&
    "username" in value &&
    typeof (value as { username: unknown }).username === "string"
  );
}

/**
 * Converte o valor bruto de um campo em texto pronto para exibir.
 * Devolve null quando o campo está vazio — quem chama decide se
 * esconde a linha ou mostra um placeholder.
 */
export function fieldText(task: ClickUpTask, key: FieldKey): string | null {
  const field = findField(task, key);
  if (!field) return null;

  const raw = field.value;
  if (raw === undefined || raw === null || raw === "") return null;

  switch (field.type) {
    case "drop_down":
      return resolveOption(field, raw);

    case "labels": {
      if (!Array.isArray(raw)) return null;
      const labels = raw
        .map((item) => resolveOption(field, item))
        .filter((item): item is string => Boolean(item));
      return labels.length > 0 ? labels.join(", ") : null;
    }

    case "users": {
      if (!Array.isArray(raw)) return null;
      const names = raw.filter(isUserLike).map((user) => user.username);
      return names.length > 0 ? names.join(", ") : null;
    }

    case "date":
      return formatDate(typeof raw === "string" || typeof raw === "number" ? raw : null);

    case "currency": {
      const amount = typeof raw === "number" ? raw : Number(raw);
      return Number.isFinite(amount) ? formatCurrency(amount) : null;
    }

    case "checkbox":
      return raw === true || raw === "true" ? "Sim" : "Não";

    case "number": {
      const amount = typeof raw === "number" ? raw : Number(raw);
      return Number.isFinite(amount) ? String(amount) : null;
    }

    default:
      if (typeof raw === "string") return raw;
      if (typeof raw === "number" || typeof raw === "boolean") return String(raw);
      return null;
  }
}

/** Devolve a URL quando o campo é um link (ou texto que parece link). */
export function fieldUrl(task: ClickUpTask, key: FieldKey): string | null {
  const text = fieldText(task, key);
  if (!text) return null;
  if (/^https?:\/\//i.test(text)) return text;
  if (/^[\w-]+\.[\w.-]+\//.test(text)) return `https://${text}`;
  return null;
}

/** Pessoas atribuídas a um campo do tipo "users". */
export function fieldUsers(task: ClickUpTask, key: FieldKey): ClickUpUser[] {
  const field = findField(task, key);
  if (!field || !Array.isArray(field.value)) return [];
  return field.value.filter(isUserLike);
}

/** Todos os valores distintos de um campo, entre várias tarefas (para filtros). */
export function distinctFieldValues(
  tasks: ClickUpTask[],
  key: FieldKey
): string[] {
  const values = new Set<string>();
  for (const task of tasks) {
    const text = fieldText(task, key);
    if (text) values.add(text);
  }
  return Array.from(values).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

/** Acha a definição de um campo na lista (usado no formulário de criação). */
export function findFieldDefinition(
  fields: ClickUpFieldDefinition[],
  key: FieldKey
): ClickUpFieldDefinition | undefined {
  const aliases = FIELD_ALIASES[key];
  return fields.find((field) => aliases.includes(normalize(field.name)));
}
