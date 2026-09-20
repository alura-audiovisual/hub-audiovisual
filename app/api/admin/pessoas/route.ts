import { NextResponse } from "next/server";
import { autorizarAdmin } from "@/lib/auth/guarda";
import { decidirCadastro, listarPessoas } from "@/lib/auth/pessoas";
import { ehPapelValido } from "@/lib/auth/papeis";

export async function GET() {
  const permitido = await autorizarAdmin();
  if (!permitido.ok) return permitido.resposta;

  const pessoas = await listarPessoas();
  return NextResponse.json({ pessoas });
}

export async function POST(request: Request) {
  const permitido = await autorizarAdmin();
  if (!permitido.ok) return permitido.resposta;

  const body = (await request.json()) as Partial<{
    id: string;
    situacao: string;
    papel: string;
  }>;

  if (!body.id || !body.situacao || !body.papel) {
    return NextResponse.json(
      { error: "id, situacao e papel são obrigatórios." },
      { status: 400 }
    );
  }
  if (!ehPapelValido(body.papel)) {
    return NextResponse.json({ error: "Papel inválido." }, { status: 400 });
  }

  // Um administrador não pode rebaixar ou suspender a si mesmo —
  // é assim que uma organização fica sem ninguém que possa aprovar.
  if (body.id === permitido.contexto.sessao.id && body.papel !== "admin") {
    return NextResponse.json(
      { error: "Você não pode remover seu próprio acesso de administrador." },
      { status: 400 }
    );
  }

  const situacoes = ["pendente", "ativo", "recusado", "suspenso"] as const;
  type Situacao = (typeof situacoes)[number];
  if (!situacoes.includes(body.situacao as Situacao)) {
    return NextResponse.json({ error: "Situação inválida." }, { status: 400 });
  }

  await decidirCadastro(
    body.id,
    body.situacao as Situacao,
    body.papel,
    permitido.contexto.sessao.id,
    permitido.contexto.sessao.email
  );

  const pessoas = await listarPessoas();
  return NextResponse.json({ pessoas });
}
