// ============================================================
// lib/auth/registro.ts — quem fez o quê
//
// Serve para operação antes de servir para auditoria: quando um card
// some ou muda sozinho, é aqui que se descobre o que aconteceu.
// ============================================================

import { db, ensureSchema } from "./db";

export interface EntradaRegistro {
  pessoaId?: string | null;
  email?: string | null;
  acao: string;
  alvo?: string | null;
  detalhe?: Record<string, unknown>;
}

export async function registrar(entrada: EntradaRegistro): Promise<void> {
  try {
    await ensureSchema();
    const sql = db();
    await sql`
      INSERT INTO registro_acoes (pessoa_id, email, acao, alvo, detalhe)
      VALUES (
        ${entrada.pessoaId ?? null},
        ${entrada.email ?? null},
        ${entrada.acao},
        ${entrada.alvo ?? null},
        ${entrada.detalhe ? JSON.stringify(entrada.detalhe) : null}
      )
    `;
  } catch {
    // Falha ao registrar não pode derrubar a ação da pessoa.
  }
}

export interface LinhaRegistro {
  id: string;
  email: string | null;
  acao: string;
  alvo: string | null;
  detalhe: Record<string, unknown> | null;
  criado_em: string;
}

export async function ultimasAcoes(limite = 100): Promise<LinhaRegistro[]> {
  await ensureSchema();
  const sql = db();
  return sql<LinhaRegistro[]>`
    SELECT id::text, email, acao, alvo, detalhe, criado_em
    FROM registro_acoes
    ORDER BY criado_em DESC
    LIMIT ${limite}
  `;
}
