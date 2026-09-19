import { NextResponse } from "next/server";
import { deleteTask, getTask } from "@/lib/clickup";
import { invalidateList } from "@/lib/cache";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<{ taskId: string }>;

  if (!body.taskId) {
    return NextResponse.json({ error: "taskId é obrigatório." }, { status: 400 });
  }

  try {
    // Lê antes de excluir só para saber de qual lista limpar o cache.
    const listId = await getTask(body.taskId)
      .then((task) => task.list?.id)
      .catch(() => undefined);

    await deleteTask(body.taskId);
    if (listId) invalidateList(listId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
