import { notFound } from "next/navigation";
import { isValidBoardId } from "@/lib/boards.config";
import { TriagePanel } from "@/components/Triage/TriagePanel";

export default async function TriagemPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;
  if (!isValidBoardId(boardId)) notFound();
  return <TriagePanel boardId={boardId} />;
}
