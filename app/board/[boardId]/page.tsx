import { notFound } from "next/navigation";
import { isValidBoardId } from "@/lib/boards.config";
import { Board } from "@/components/Board/Board";

export default async function BoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ boardId: string }>;
  searchParams: Promise<{ squad?: string }>;
}) {
  const { boardId } = await params;
  const { squad } = await searchParams;
  if (!isValidBoardId(boardId)) notFound();
  return <Board boardId={boardId} squad={squad} />;
}
