import { NextResponse } from "next/server";
import { getTask, updateTaskDescription } from "@/lib/clickup";
import { invalidateList } from "@/lib/cache";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<{
    taskId: string;
    description: string;
  }>;

  if (!body.taskId || body.description === undefined) {
    return NextResponse.json(
      { error: "taskId e description são obrigatórios." },
      { status: 400 }
    );
  }

  try {
    await updateTaskDescription(body.taskId, body.description);
    const task = await getTask(body.taskId);
    if (task.list?.id) invalidateList(task.list.id);
    return NextResponse.json({ task });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
