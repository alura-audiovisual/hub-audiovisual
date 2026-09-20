import { NextResponse } from "next/server";
import { sessaoAtual } from "@/lib/auth/sessao";
import { buscarPorId } from "@/lib/auth/pessoas";
import { permissoesDe } from "@/lib/auth/papeis";

export async function GET() {
  const sessao = await sessaoAtual();
  if (!sessao) return NextResponse.json({ pessoa: null });

  const pessoa = await buscarPorId(sessao.id);
  if (!pessoa || pessoa.situacao !== "ativo") {
    return NextResponse.json({ pessoa: null });
  }

  return NextResponse.json({
    pessoa: {
      nome: pessoa.nome,
      email: pessoa.email,
      papel: pessoa.papel,
    },
    permissoes: permissoesDe(pessoa.papel),
  });
}
