import { NextResponse } from "next/server";
import { autorizarLeitura } from "@/lib/auth/guarda";
import { getTask } from "@/lib/clickup";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const permitido = await autorizarLeitura();
  if (!permitido.ok) return permitido.resposta;

  const { taskId } = await params;

  try {
    const task = await getTask(taskId);
    return NextResponse.json({ task });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
