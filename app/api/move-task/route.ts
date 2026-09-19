import { NextResponse } from "next/server";
import { TriageError, moveTaskOnBoard } from "@/lib/board-actions";
import { isValidBoardId } from "@/lib/boards.config";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<{
    taskId: string;
    boardId: string;
    statusId: string;
  }>;

  if (!body.taskId || !body.boardId || !body.statusId) {
    return NextResponse.json(
      { error: "taskId, boardId e statusId são obrigatórios." },
      { status: 400 }
    );
  }
  if (!isValidBoardId(body.boardId)) {
    return NextResponse.json({ error: `Board "${body.boardId}" não existe.` }, { status: 404 });
  }

  try {
    const { task, warning } = await moveTaskOnBoard(
      body.boardId,
      body.taskId,
      body.statusId
    );
    return NextResponse.json({ task, warning });
  } catch (error) {
    if (error instanceof TriageError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 422 });
    }
    const message = error instanceof Error ? error.message : "Erro desconhecido.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
