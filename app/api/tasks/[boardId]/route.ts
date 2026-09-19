import { NextResponse } from "next/server";
import { getTasksByList } from "@/lib/clickup";
import { readCache, writeCache } from "@/lib/cache";
import { BOARDS, isValidBoardId } from "@/lib/boards.config";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { boardId } = await params;

  if (!isValidBoardId(boardId)) {
    return NextResponse.json({ error: `Board "${boardId}" não existe.` }, { status: 404 });
  }

  const board = BOARDS[boardId];
  // Subtarefas só vêm soltas no Creative Ops, onde são parte do motor de
  // Épicos. Nas outras boards elas viram card fantasma.
  const includeSubtasks = board.type === "epics";
  const cacheKey = `${board.listId}:${includeSubtasks}`;

  // O botão "Atualizar" manda fresh=1 e passa por cima do cache.
  const fresh = new URL(request.url).searchParams.get("fresh") === "1";

  if (!fresh) {
    const cached = readCache(cacheKey);
    if (cached) {
      return NextResponse.json({
        tasks: cached.tasks,
        truncated: cached.truncated,
        fetchMs: 0,
        requests: 0,
        cached: true,
      });
    }
  }

  try {
    const result = await getTasksByList(board.listId, { includeSubtasks });
    writeCache(cacheKey, {
      tasks: result.tasks,
      truncated: result.truncated,
      requests: result.requests,
    });

    return NextResponse.json({
      tasks: result.tasks,
      truncated: result.truncated,
      fetchMs: result.fetchMs,
      requests: result.requests,
      cached: false,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
