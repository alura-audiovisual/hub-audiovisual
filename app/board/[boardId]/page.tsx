import { notFound } from "next/navigation";
import { BOARDS } from "@/lib/boards.config";
import type { BoardId } from "@/lib/types";

function isValidBoardId(value: string): value is BoardId {
  return value in BOARDS;
}

export default async function BoardPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;

  if (!isValidBoardId(boardId)) {
    notFound();
  }

  const board = BOARDS[boardId];

  return (
    <div className="p-8">
      <h1 className="hub-page-title">{board.name}</h1>
      <p className="text-sm text-muted-foreground mt-2">
        Kanban ainda não construído — próximo passo da lista.
      </p>

      <div className="mt-6 hub-tag bg-secondary text-secondary-foreground inline-block">
        list_id: {board.listId}
      </div>

      {!board.allowCreate && (
        <p className="hub-tag bg-error/15 text-error inline-block mt-3 ml-2">
          Criação de card desabilitada nesta board
        </p>
      )}
    </div>
  );
}
