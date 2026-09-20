import { NextResponse } from "next/server";
import { cadastrar } from "@/lib/auth/pessoas";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<{
    nome: string;
    email: string;
    senha: string;
    convite: string;
  }>;

  if (!body.nome || !body.email || !body.senha) {
    return NextResponse.json(
      { error: "Preencha nome, e-mail e senha." },
      { status: 400 }
    );
  }

  const resultado = await cadastrar(body.nome, body.email, body.senha, body.convite);

  if (!resultado.ok || !resultado.pessoa) {
    return NextResponse.json({ error: resultado.erro }, { status: 400 });
  }

  // Cadastro não entra direto: nasce pendente e espera aprovação —
  // exceto quem está na lista de administradores semeados.
  return NextResponse.json({
    situacao: resultado.pessoa.situacao,
    papel: resultado.pessoa.papel,
  });
}
