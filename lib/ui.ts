// ============================================================
// lib/ui.ts — utilitários de apresentação (sem dependência externa)
// ============================================================

/** Junta classes condicionais sem precisar de biblioteca. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/**
 * Nome para exibir de um usuário do ClickUp.
 * Cai para o e-mail quando o username vem vazio, e só então para um rótulo
 * genérico — nunca deixa a interface mostrar "null" nem quebrar.
 */
export function displayName(user: {
  username?: string | null;
  email?: string | null;
}): string {
  const name = user.username?.trim();
  if (name) return name;
  const email = user.email?.trim();
  if (email) return email;
  return "Sem nome";
}

/** Iniciais de um nome, para avatar (máx. 2 letras). */
export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Cor estável de avatar derivada do nome — só tons neutros do DS. */
export function avatarTone(name: string | null | undefined): string {
  const tones = ["#2a2d33", "#33363d", "#2f3540", "#383b42", "#2c3138"];
  let sum = 0;
  for (const char of name ?? "?") sum += char.charCodeAt(0);
  return tones[sum % tones.length];
}

/** Timestamp do ClickUp (ms em string) -> "12 mar". */
export function formatDate(raw: string | number | null | undefined): string | null {
  if (raw === null || raw === undefined || raw === "") return null;
  const ms = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(ms)) return null;
  return new Date(ms).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

/** Timestamp -> "12 mar 2026, 14:30". */
export function formatDateTime(raw: string | number | null | undefined): string | null {
  if (raw === null || raw === undefined || raw === "") return null;
  const ms = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(ms)) return null;
  return new Date(ms).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** "há 3 min", "há 2 h", "há 5 d" — para mostrar frescor dos dados. */
export function timeAgo(date: Date): string {
  // P12: data inválida vinda da API virava "há NaN min" na tela.
  if (Number.isNaN(date.getTime())) return "";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "agora";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  return `há ${Math.floor(hours / 24)} d`;
}

/** Valor numérico -> R$ 1.234,00 */
export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Prazo vencido? (usado para sinalizar atraso no card) */
export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const ms = Number(dueDate);
  return Number.isFinite(ms) && ms < Date.now();
}

/** Normaliza nome de etiqueta para comparação (ClickUp trata como minúsculo). */
export function normalizeTag(value: string): string {
  return value.trim().toLowerCase();
}

/** Normaliza texto para busca: sem acento, minúsculo, sem espaço duplo. */
export function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export type DueUrgency = "overdue" | "soon" | "normal" | "none";

/**
 * Classifica o prazo de uma tarefa para alerta visual.
 * "soon" = vence em uma semana ou menos (inclui hoje e amanhã).
 */
export function dueUrgency(dueDate: string | null | undefined): DueUrgency {
  if (!dueDate) return "none";
  const ms = Number(dueDate);
  if (!Number.isFinite(ms)) return "none";

  const now = Date.now();
  if (ms < now) return "overdue";
  if (ms - now <= 7 * 24 * 60 * 60 * 1000) return "soon";
  return "normal";
}

/** Quantos dias faltam para o prazo (negativo = já passou). */
export function daysUntil(dueDate: string | null | undefined): number | null {
  if (!dueDate) return null;
  const ms = Number(dueDate);
  if (!Number.isFinite(ms)) return null;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const target = new Date(ms);
  target.setHours(0, 0, 0, 0);

  return Math.round((target.getTime() - startOfToday.getTime()) / 86_400_000);
}

/** "vence hoje", "vence amanhã", "3 dias", "venceu há 2 dias". */
export function dueLabel(dueDate: string | null | undefined): string | null {
  const days = daysUntil(dueDate);
  if (days === null) return null;
  if (days === 0) return "vence hoje";
  if (days === 1) return "vence amanhã";
  if (days > 1) return `${days} dias`;
  if (days === -1) return "venceu ontem";
  return `venceu há ${Math.abs(days)} dias`;
}
