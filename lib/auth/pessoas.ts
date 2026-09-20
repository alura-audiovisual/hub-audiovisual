// ============================================================
// lib/auth/pessoas.ts — cadastro, entrada e governança de acesso
// ============================================================

import bcrypt from "bcryptjs";
import { db, ensureSchema } from "./db";
import { registrar } from "./registro";
import type { Papel, Situacao } from "./papeis";

/** Custo do algoritmo de senha. Lento de propósito: 12 ≈ 250ms. */
const CUSTO_SENHA = 12;

/**
 * Hash real de uma senha que não pertence a ninguém. Serve só para
 * gastar tempo quando o e-mail não existe (ver `autenticar`). Precisa
 * ser um hash válido: um valor inventado faria o bcrypt responder na
 * hora, justamente o que queremos evitar.
 */
const HASH_DESCARTE =
  "$2b$12$k79Sv6RhbNuRw2tQxrKm3uSooXPplSa6.ZdVOtwe18fccQE5cL1ku";
const MAX_TENTATIVAS = 5;
const BLOQUEIO_MINUTOS = 15;

export interface Pessoa {
  id: string;
  email: string;
  nome: string;
  papel: Papel;
  situacao: Situacao;
  versao_sessao: number;
  criado_em: string;
  aprovado_em: string | null;
  ultimo_acesso: string | null;
}

/** Domínio que pode pedir cadastro sozinho. Outros entram por convite. */
const DOMINIO_INTERNO = "@alura.com.br";

export function ehEmailInterno(email: string): boolean {
  return email.trim().toLowerCase().endsWith(DOMINIO_INTERNO);
}

function emailsAdministradores(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

/** Senha fraca entra hoje e vira incidente depois. */
export function problemaNaSenha(senha: string): string | null {
  if (senha.length < 12) return "A senha precisa de pelo menos 12 caracteres.";
  if (!/[a-zA-Z]/.test(senha)) return "A senha precisa de pelo menos uma letra.";
  if (!/[0-9]/.test(senha)) return "A senha precisa de pelo menos um número.";
  if (/^(.)\1+$/.test(senha)) return "Essa senha é previsível demais.";
  return null;
}

export async function buscarPorEmail(email: string): Promise<Pessoa & { senha_hash: string; tentativas: number; bloqueado_ate: string | null } | null> {
  await ensureSchema();
  const sql = db();
  const linhas = await sql<Array<Pessoa & { senha_hash: string; tentativas: number; bloqueado_ate: string | null }>>`
    SELECT * FROM pessoas WHERE email = ${email.trim().toLowerCase()} LIMIT 1
  `;
  return linhas[0] ?? null;
}

export async function buscarPorId(id: string): Promise<Pessoa | null> {
  await ensureSchema();
  const sql = db();
  const linhas = await sql<Pessoa[]>`
    SELECT id, email, nome, papel, situacao, versao_sessao, criado_em, aprovado_em, ultimo_acesso
    FROM pessoas WHERE id = ${id} LIMIT 1
  `;
  return linhas[0] ?? null;
}

export interface ResultadoCadastro {
  ok: boolean;
  erro?: string;
  pessoa?: Pessoa;
}

export async function cadastrar(
  nome: string,
  email: string,
  senha: string,
  codigoConvite?: string
): Promise<ResultadoCadastro> {
  await ensureSchema();
  const sql = db();

  const emailLimpo = email.trim().toLowerCase();
  const nomeLimpo = nome.trim();

  if (nomeLimpo.length < 2) return { ok: false, erro: "Informe seu nome." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailLimpo)) {
    return { ok: false, erro: "E-mail inválido." };
  }

  const problema = problemaNaSenha(senha);
  if (problema) return { ok: false, erro: problema };

  // Quem não é da Alura só entra com convite de um administrador.
  let papelInicial: Papel = "usuario";
  if (!ehEmailInterno(emailLimpo)) {
    if (!codigoConvite) {
      return {
        ok: false,
        erro: "Cadastro aberto apenas para e-mails @alura.com.br. Peça um convite a um administrador.",
      };
    }
    const convite = await validarConvite(emailLimpo, codigoConvite);
    if (!convite) return { ok: false, erro: "Convite inválido, expirado ou já usado." };
    papelInicial = convite.papel;
  }

  const jaExiste = await buscarPorEmail(emailLimpo);
  if (jaExiste) {
    // Mensagem igual para e-mail existente e novo evitaria descobrir quem
    // tem conta, mas aqui o cadastro é interno e a clareza ajuda mais.
    return { ok: false, erro: "Já existe cadastro com esse e-mail." };
  }

  const hash = await bcrypt.hash(senha, CUSTO_SENHA);

  // O primeiro administrador não pode depender de aprovação: quem está na
  // lista de e-mails administradores entra já ativo.
  const ehAdminSemeado = emailsAdministradores().includes(emailLimpo);
  const papel: Papel = ehAdminSemeado ? "admin" : papelInicial;
  const situacao: Situacao = ehAdminSemeado ? "ativo" : "pendente";

  const linhas = await sql<Pessoa[]>`
    INSERT INTO pessoas (email, nome, senha_hash, papel, situacao, aprovado_em)
    VALUES (
      ${emailLimpo}, ${nomeLimpo}, ${hash}, ${papel}, ${situacao},
      ${ehAdminSemeado ? new Date() : null}
    )
    RETURNING id, email, nome, papel, situacao, versao_sessao, criado_em, aprovado_em, ultimo_acesso
  `;

  const pessoa = linhas[0];
  if (codigoConvite) await consumirConvite(emailLimpo);

  await registrar({
    pessoaId: pessoa.id,
    email: emailLimpo,
    acao: "cadastro",
    detalhe: { papel, situacao },
  });

  return { ok: true, pessoa };
}

export interface ResultadoEntrada {
  ok: boolean;
  erro?: string;
  pessoa?: Pessoa;
}

export async function autenticar(email: string, senha: string): Promise<ResultadoEntrada> {
  await ensureSchema();
  const sql = db();
  const emailLimpo = email.trim().toLowerCase();

  const pessoa = await buscarPorEmail(emailLimpo);

  // Mensagem genérica de propósito: dizer "e-mail não existe" entrega
  // a quem tenta invadir quais contas existem.
  const generica = "E-mail ou senha incorretos.";

  if (!pessoa) {
    // Gasta o mesmo tempo de uma verificação real. Sem isso, a resposta
    // instantânea denunciaria que o e-mail não existe — e alguém poderia
    // descobrir quem tem conta só medindo o tempo das respostas.
    await bcrypt.compare(senha, HASH_DESCARTE);
    return { ok: false, erro: generica };
  }

  if (pessoa.bloqueado_ate && new Date(pessoa.bloqueado_ate) > new Date()) {
    return {
      ok: false,
      erro: `Muitas tentativas. Tente de novo em ${BLOQUEIO_MINUTOS} minutos.`,
    };
  }

  const confere = await bcrypt.compare(senha, pessoa.senha_hash);

  if (!confere) {
    const tentativas = pessoa.tentativas + 1;
    const bloquear = tentativas >= MAX_TENTATIVAS;

    // O instante do desbloqueio é calculado aqui e gravado como data.
    // Montar trecho de SQL por concatenação é o caminho mais curto para
    // uma injeção — mesmo quando o valor parece controlado.
    const desbloqueio = bloquear
      ? new Date(Date.now() + BLOQUEIO_MINUTOS * 60 * 1000)
      : null;

    await sql`
      UPDATE pessoas
      SET tentativas = ${bloquear ? 0 : tentativas},
          bloqueado_ate = ${desbloqueio}
      WHERE id = ${pessoa.id}
    `;

    await registrar({
      pessoaId: pessoa.id,
      email: emailLimpo,
      acao: "entrada_negada",
      detalhe: { tentativas, bloqueado: bloquear },
    });

    return { ok: false, erro: generica };
  }

  if (pessoa.situacao === "pendente") {
    return { ok: false, erro: "PENDENTE" };
  }
  if (pessoa.situacao === "recusado" || pessoa.situacao === "suspenso") {
    return { ok: false, erro: "Seu acesso não está ativo. Fale com um administrador." };
  }

  await sql`
    UPDATE pessoas SET tentativas = 0, bloqueado_ate = NULL, ultimo_acesso = now()
    WHERE id = ${pessoa.id}
  `;

  await registrar({ pessoaId: pessoa.id, email: emailLimpo, acao: "entrada" });

  return { ok: true, pessoa };
}

// ------------------------------------------------------------
// Governança — só administradores
// ------------------------------------------------------------

export async function listarPessoas(): Promise<Pessoa[]> {
  await ensureSchema();
  const sql = db();
  return sql<Pessoa[]>`
    SELECT id, email, nome, papel, situacao, versao_sessao, criado_em, aprovado_em, ultimo_acesso
    FROM pessoas
    ORDER BY
      CASE situacao WHEN 'pendente' THEN 0 ELSE 1 END,
      criado_em DESC
  `;
}

export async function decidirCadastro(
  id: string,
  situacao: Situacao,
  papel: Papel,
  adminId: string,
  adminEmail: string
): Promise<void> {
  await ensureSchema();
  const sql = db();

  // Mudar papel ou suspender invalida as sessões antigas da pessoa.
  await sql`
    UPDATE pessoas
    SET situacao = ${situacao},
        papel = ${papel},
        aprovado_em = ${situacao === "ativo" ? new Date() : null},
        aprovado_por = ${adminId},
        versao_sessao = versao_sessao + 1
    WHERE id = ${id}
  `;

  await registrar({
    pessoaId: adminId,
    email: adminEmail,
    acao: "decisao_cadastro",
    alvo: id,
    detalhe: { situacao, papel },
  });
}

// ------------------------------------------------------------
// Convites para quem não é da Alura
// ------------------------------------------------------------

export async function criarConvite(
  email: string,
  papel: Papel,
  adminId: string,
  adminEmail: string
): Promise<string> {
  await ensureSchema();
  const sql = db();

  const codigo = crypto.randomUUID().replace(/-/g, "");
  const hash = await bcrypt.hash(codigo, 10);

  await sql`
    INSERT INTO convites (email, papel, codigo_hash, criado_por, expira_em)
    VALUES (${email.trim().toLowerCase()}, ${papel}, ${hash}, ${adminId}, now() + interval '7 days')
  `;

  await registrar({
    pessoaId: adminId,
    email: adminEmail,
    acao: "convite_criado",
    alvo: email,
    detalhe: { papel },
  });

  return codigo;
}

async function validarConvite(
  email: string,
  codigo: string
): Promise<{ papel: Papel } | null> {
  const sql = db();
  const linhas = await sql<Array<{ codigo_hash: string; papel: Papel }>>`
    SELECT codigo_hash, papel FROM convites
    WHERE email = ${email} AND usado_em IS NULL AND expira_em > now()
    ORDER BY criado_em DESC
  `;

  for (const linha of linhas) {
    if (await bcrypt.compare(codigo, linha.codigo_hash)) {
      return { papel: linha.papel };
    }
  }
  return null;
}

async function consumirConvite(email: string): Promise<void> {
  const sql = db();
  await sql`
    UPDATE convites SET usado_em = now()
    WHERE email = ${email} AND usado_em IS NULL
  `;
}
