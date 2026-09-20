import { NextResponse } from "next/server";
import { autorizarEscrita, autorizarLeitura } from "@/lib/auth/guarda";
import { createComment, getComments } from "@/lib/clickup";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const permitido = await autorizarLeitura();
  if (!permitido.ok) return permitido.resposta;

  const { taskId } = await params;
  try {
    const comments = await getComments(taskId);
    return NextResponse.json({ comments });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const permitido = await autorizarEscrita();
  if (!permitido.ok) return permitido.resposta;

  const { taskId } = await params;
  const body = (await request.json()) as Partial<{ text: string }>;

  if (!body.text?.trim()) {
    return NextResponse.json({ error: "O comentário não pode ficar vazio." }, { status: 400 });
  }

  try {
    await createComment(taskId, body.text.trim());
    const comments = await getComments(taskId);
    return NextResponse.json({ comments });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
