import { NextResponse } from "next/server";
import { autorizarAdmin } from "@/lib/auth/guarda";
import { ultimasAcoes } from "@/lib/auth/registro";

export async function GET() {
  const permitido = await autorizarAdmin();
  if (!permitido.ok) return permitido.resposta;

  const acoes = await ultimasAcoes(150);
  return NextResponse.json({ acoes });
}
