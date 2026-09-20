import { NextResponse } from "next/server";
import { limparCookie, sessaoAtual } from "@/lib/auth/sessao";
import { registrar } from "@/lib/auth/registro";

export async function POST() {
  const sessao = await sessaoAtual();
  if (sessao) {
    await registrar({ pessoaId: sessao.id, email: sessao.email, acao: "saida" });
  }
  await limparCookie();
  return NextResponse.json({ ok: true });
}
