// ============================================================
// lib/auth/sessao.ts — sessão em cookie assinado
//
// Escolhas e porquês:
// - O cookie é httpOnly: o JavaScript da página não consegue lê-lo,
//   então um script injetado não rouba a sessão.
// - sameSite lax: outro site não consegue disparar ação em nome de
//   quem está logado (proteção contra requisição forjada).
// - Validade curta (8 horas): sessão esquecida não vive para sempre.
// - versao_sessao: suspender alguém ou trocar o papel invalida as
//   sessões antigas sem precisar guardar cada uma no banco.
// ============================================================

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { Papel } from "./papeis";

const COOKIE = "hub_sessao";
const VALIDADE_HORAS = 8;

export interface Sessao {
  id: string;
  email: string;
  nome: string;
  papel: Papel;
  versao: number;
}

function segredo(): Uint8Array {
  const valor = process.env.AUTH_SECRET;
  if (!valor || valor.length < 32) {
    throw new Error(
      "AUTH_SECRET ausente ou curta demais. Gere uma chave de pelo menos 32 caracteres e configure nas variáveis de ambiente."
    );
  }
  return new TextEncoder().encode(valor);
}

export async function criarToken(sessao: Sessao): Promise<string> {
  return new SignJWT({ ...sessao })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${VALIDADE_HORAS}h`)
    .setSubject(sessao.id)
    .sign(segredo());
}

export async function lerToken(token: string): Promise<Sessao | null> {
  try {
    const { payload } = await jwtVerify(token, segredo());
    if (
      typeof payload.id !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.nome !== "string" ||
      typeof payload.papel !== "string" ||
      typeof payload.versao !== "number"
    ) {
      return null;
    }
    return {
      id: payload.id,
      email: payload.email,
      nome: payload.nome,
      papel: payload.papel as Papel,
      versao: payload.versao,
    };
  } catch {
    return null;
  }
}

export async function gravarCookie(sessao: Sessao): Promise<void> {
  const token = await criarToken(sessao);
  const jar = await cookies();

  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: VALIDADE_HORAS * 60 * 60,
  });
}

export async function limparCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

/** Sessão de quem está pedindo — em componentes e rotas do servidor. */
export async function sessaoAtual(): Promise<Sessao | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  return lerToken(token);
}

export const NOME_COOKIE = COOKIE;
