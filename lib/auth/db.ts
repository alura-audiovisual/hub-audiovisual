// ============================================================
// lib/auth/db.ts — conexão com o banco e criação do esquema
//
// O hub passou a ter banco próprio por causa do login. Ele guarda
// só o que o ClickUp não guarda: quem pode entrar, com qual papel,
// e o registro do que cada um fez. Card continua sendo do ClickUp.
// ============================================================

import postgres from "postgres";

let client: ReturnType<typeof postgres> | null = null;

export function db() {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL não configurada. Crie o banco no painel da Vercel (Storage → Neon) e adicione a variável."
      );
    }
    // ssl require: bancos gerenciados exigem conexão cifrada.
    client = postgres(url, { ssl: "require", max: 5, idle_timeout: 20 });
  }
  return client;
}

let schemaReady: Promise<void> | null = null;

/**
 * Cria as tabelas na primeira vez que o banco é usado.
 * Idempotente: rodar de novo não faz nada.
 */
export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      const sql = db();

      await sql`
        CREATE TABLE IF NOT EXISTS pessoas (
          id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          email          text UNIQUE NOT NULL,
          nome           text NOT NULL,
          senha_hash     text NOT NULL,
          papel          text NOT NULL DEFAULT 'usuario',
          situacao       text NOT NULL DEFAULT 'pendente',
          versao_sessao  integer NOT NULL DEFAULT 1,
          tentativas     integer NOT NULL DEFAULT 0,
          bloqueado_ate  timestamptz,
          criado_em      timestamptz NOT NULL DEFAULT now(),
          aprovado_em    timestamptz,
          aprovado_por   uuid,
          ultimo_acesso  timestamptz
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS convites (
          id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          email        text NOT NULL,
          papel        text NOT NULL DEFAULT 'visitante',
          codigo_hash  text NOT NULL,
          criado_por   uuid,
          criado_em    timestamptz NOT NULL DEFAULT now(),
          expira_em    timestamptz NOT NULL,
          usado_em     timestamptz
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS registro_acoes (
          id         bigserial PRIMARY KEY,
          pessoa_id  uuid,
          email      text,
          acao       text NOT NULL,
          alvo       text,
          detalhe    jsonb,
          criado_em  timestamptz NOT NULL DEFAULT now()
        )
      `;

      await sql`CREATE INDEX IF NOT EXISTS idx_registro_criado ON registro_acoes (criado_em DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_pessoas_situacao ON pessoas (situacao)`;
    })();
  }
  return schemaReady;
}
