import { NextResponse } from "next/server";
import { autorizarAdmin } from "@/lib/auth/guarda";
import { criarConvite } from "@/lib/auth/pessoas";
import { ehPapelValido } from "@/lib/auth/papeis";

export async function POST(request: Request) {
  const permitido = await autorizarAdmin();
  if (!permitido.ok) return permitido.resposta;

  const body = (await request.json()) as Partial<{ email: string; papel: string }>;

  if (!body.email || !body.papel) {
    return NextResponse.json({ error: "email e papel são obrigatórios." }, { status: 400 });
  }
  if (!ehPapelValido(body.papel)) {
    return NextResponse.json({ error: "Papel inválido." }, { status: 400 });
  }

  const codigo = await criarConvite(
    body.email,
    body.papel,
    permitido.contexto.sessao.id,
    permitido.contexto.sessao.email
  );

  // O código aparece uma vez só, para o administrador repassar.
  // O banco guarda só o resumo cifrado dele.
  return NextResponse.json({ codigo, email: body.email.trim().toLowerCase() });
}
