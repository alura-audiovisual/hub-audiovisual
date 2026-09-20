"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Papel, Permissoes } from "@/lib/auth/papeis";

export interface SessaoCliente {
  nome: string;
  email: string;
  papel: Papel;
  permissoes: Permissoes;
}

const Contexto = createContext<SessaoCliente | null>(null);

export function SessaoProvider({
  sessao,
  children,
}: {
  sessao: SessaoCliente | null;
  children: ReactNode;
}) {
  return <Contexto.Provider value={sessao}>{children}</Contexto.Provider>;
}

export function useSessao(): SessaoCliente | null {
  return useContext(Contexto);
}

/**
 * Pode alterar o conteúdo? Usado para esconder botão e desligar arraste.
 *
 * ⚠️ Isto é conforto de interface, não segurança. Quem decide de verdade
 * é a guarda no servidor (lib/auth/guarda.ts), que roda em toda rota que
 * escreve. Esconder o botão sem travar a rota seria teatro.
 */
export function usePodeEscrever(): boolean {
  return useContext(Contexto)?.permissoes.escrever ?? false;
}

export function useEhAdmin(): boolean {
  return useContext(Contexto)?.permissoes.administrar ?? false;
}
