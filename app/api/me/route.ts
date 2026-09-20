import { NextResponse } from "next/server";
import { autorizarLeitura } from "@/lib/auth/guarda";
import { getAuthorizedUser } from "@/lib/clickup";

export async function GET() {
  const permitido = await autorizarLeitura();
  if (!permitido.ok) return permitido.resposta;

  try {
    const user = await getAuthorizedUser();
    return NextResponse.json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
