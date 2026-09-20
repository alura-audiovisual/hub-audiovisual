import { NextResponse } from "next/server";
import { autenticar } from "@/lib/auth/pessoas";
import { gravarCookie } from "@/lib/auth/sessao";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<{ email: string; senha: string }>;

  if (!body.email || !body.senha) {
    return NextResponse.json({ error: "Informe e-mail e senha." }, { status: 400 });
  }

  const resultado = await autenticar(body.email, body.senha);

  if (!resultado.ok || !resultado.pessoa) {
    // "PENDENTE" não é erro de credencial: a pessoa acertou a senha,
    // mas o cadastro ainda espera aprovação.
    if (resultado.erro === "PENDENTE") {
      return NextResponse.json({ error: "PENDENTE", code: "PENDENTE" }, { status: 403 });
    }
    return NextResponse.json({ error: resultado.erro }, { status: 401 });
  }

  const pessoa = resultado.pessoa;
  await gravarCookie({
    id: pessoa.id,
    email: pessoa.email,
    nome: pessoa.nome,
    papel: pessoa.papel,
    versao: pessoa.versao_sessao,
  });

  return NextResponse.json({
    pessoa: { nome: pessoa.nome, email: pessoa.email, papel: pessoa.papel },
  });
}
