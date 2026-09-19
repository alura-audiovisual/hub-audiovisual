import { NextResponse } from "next/server";
import { getTask, updateTaskAssignees } from "@/lib/clickup";
import { invalidateList } from "@/lib/cache";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<{
    taskId: string;
    add: number[];
    rem: number[];
  }>;

  if (!body.taskId) {
    return NextResponse.json({ error: "taskId é obrigatório." }, { status: 400 });
  }

  try {
    await updateTaskAssignees(body.taskId, { add: body.add, rem: body.rem });
    const task = await getTask(body.taskId);
    if (task.list?.id) invalidateList(task.list.id);
    return NextResponse.json({ task });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
