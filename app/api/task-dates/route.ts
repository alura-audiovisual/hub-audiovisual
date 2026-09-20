import { NextResponse } from "next/server";
import { autorizarEscrita } from "@/lib/auth/guarda";
import { getTask, updateTaskDates } from "@/lib/clickup";
import { invalidateList } from "@/lib/cache";

export async function POST(request: Request) {
  const permitido = await autorizarEscrita();
  if (!permitido.ok) return permitido.resposta;

  const body = (await request.json()) as Partial<{
    taskId: string;
    dueDate: number | null;
    startDate: number | null;
  }>;

  if (!body.taskId) {
    return NextResponse.json({ error: "taskId é obrigatório." }, { status: 400 });
  }

  try {
    await updateTaskDates(body.taskId, {
      dueDate: body.dueDate,
      startDate: body.startDate,
    });

    const task = await getTask(body.taskId);
    if (task.list?.id) invalidateList(task.list.id);
    return NextResponse.json({ task });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
