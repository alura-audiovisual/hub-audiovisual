// ============================================================
// lib/auth/guarda.ts — a trava que vale de verdade
//
// A interface esconde botão que a pessoa não pode usar. Isso é
// conforto, não segurança: quem souber montar a requisição passaria
// por cima. Quem recusa é isto aqui, em TODA rota que escreve.
// ============================================================

import { NextResponse } from "next/server";
import { sessaoAtual, type Sessao } from "./sessao";
import { buscarPorId } from "./pessoas";
import { permissoesDe, type Permissoes } from "./papeis";

export interface Autorizado {
  sessao: Sessao;
  permissoes: Permissoes;
}

type Resultado =
  | { ok: true; contexto: Autorizado }
  | { ok: false; resposta: NextResponse };

/**
 * Confere sessão, situação e permissão.
 *
 * A sessão carrega o papel, mas ele é conferido contra o banco a cada
 * escrita: assim suspender alguém ou rebaixar o papel tem efeito na
 * hora, sem esperar o cookie expirar.
 */
export async function autorizar(
  capacidade: keyof Permissoes
): Promise<Resultado> {
  const sessao = await sessaoAtual();

  if (!sessao) {
    return {
      ok: false,
      resposta: NextResponse.json(
        { error: "Entre no hub para continuar.", code: "SEM_SESSAO" },
        { status: 401 }
      ),
    };
  }

  const pessoa = await buscarPorId(sessao.id);

  if (!pessoa || pessoa.situacao !== "ativo") {
    return {
      ok: false,
      resposta: NextResponse.json(
        { error: "Seu acesso não está ativo.", code: "INATIVO" },
        { status: 403 }
      ),
    };
  }

  // Papel trocado ou acesso suspenso invalida o cookie antigo.
  if (pessoa.versao_sessao !== sessao.versao) {
    return {
      ok: false,
      resposta: NextResponse.json(
        { error: "Seu acesso mudou. Entre de novo.", code: "SESSAO_VELHA" },
        { status: 401 }
      ),
    };
  }

  const permissoes = permissoesDe(pessoa.papel);

  if (!permissoes[capacidade]) {
    return {
      ok: false,
      resposta: NextResponse.json(
        {
          error:
            capacidade === "administrar"
              ? "Só administradores podem fazer isso."
              : "Seu papel no hub permite ver, mas não alterar.",
          code: "SEM_PERMISSAO",
        },
        { status: 403 }
      ),
    };
  }

  return {
    ok: true,
    contexto: {
      sessao: { ...sessao, papel: pessoa.papel },
      permissoes,
    },
  };
}

/** Atalho: a rota escreve no ClickUp. */
export function autorizarEscrita() {
  return autorizar("escrever");
}

/** Atalho: a rota é de administração. */
export function autorizarAdmin() {
  return autorizar("administrar");
}

/** Atalho: a rota só lê, mas exige estar autenticado. */
export function autorizarLeitura() {
  return autorizar("ler");
}
