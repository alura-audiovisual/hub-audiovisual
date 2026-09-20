import { NextResponse } from "next/server";
import { autorizarLeitura } from "@/lib/auth/guarda";
import { getBoardMeta } from "@/lib/board-actions";
import { isValidBoardId } from "@/lib/boards.config";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const permitido = await autorizarLeitura();
  if (!permitido.ok) return permitido.resposta;

  const { boardId } = await params;
  if (!isValidBoardId(boardId)) {
    return NextResponse.json({ error: `Board "${boardId}" não existe.` }, { status: 404 });
  }

  try {
    const meta = await getBoardMeta(boardId);
    return NextResponse.json(meta);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
