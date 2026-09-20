import { NextResponse } from "next/server";
import { autorizarEscrita, autorizarLeitura } from "@/lib/auth/guarda";
import { createCommentReply, deleteComment, getCommentReplies } from "@/lib/clickup";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const permitido = await autorizarLeitura();
  if (!permitido.ok) return permitido.resposta;

  const { commentId } = await params;
  try {
    const replies = await getCommentReplies(commentId);
    return NextResponse.json({ replies });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const permitido = await autorizarEscrita();
  if (!permitido.ok) return permitido.resposta;

  const { commentId } = await params;
  const body = (await request.json()) as Partial<{ text: string }>;

  if (!body.text?.trim()) {
    return NextResponse.json({ error: "A resposta não pode ficar vazia." }, { status: 400 });
  }

  try {
    await createCommentReply(commentId, body.text.trim());
    const replies = await getCommentReplies(commentId);
    return NextResponse.json({ replies });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const permitido = await autorizarEscrita();
  if (!permitido.ok) return permitido.resposta;

  const { commentId } = await params;
  try {
    await deleteComment(commentId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
