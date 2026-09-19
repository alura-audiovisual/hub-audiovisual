import { NextResponse } from "next/server";
import { createTaskOnBoard } from "@/lib/board-actions";
import { isValidBoardId } from "@/lib/boards.config";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<{
    boardId: string;
    name: string;
    statusId: string;
    parentId: string;
    assignees: number[];
    customFields: Array<{ id: string; value: unknown }>;
    tags: string[];
  }>;

  if (!body.boardId || !body.name || !body.statusId) {
    return NextResponse.json(
      { error: "boardId, name e statusId são obrigatórios." },
      { status: 400 }
    );
  }
  if (!isValidBoardId(body.boardId)) {
    return NextResponse.json({ error: `Board "${body.boardId}" não existe.` }, { status: 404 });
  }

  try {
    const task = await createTaskOnBoard(
      body.boardId,
      body.name,
      body.statusId,
      body.parentId,
      {
        assignees: body.assignees,
        customFields: body.customFields,
        tags: body.tags,
      }
    );
    return NextResponse.json({ task });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
