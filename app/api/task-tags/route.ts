import { NextResponse } from "next/server";
import { autorizarEscrita } from "@/lib/auth/guarda";
import { addTaskTag, getTask, removeTaskTag } from "@/lib/clickup";
import { invalidateList } from "@/lib/cache";

export async function POST(request: Request) {
  const permitido = await autorizarEscrita();
  if (!permitido.ok) return permitido.resposta;

  const body = (await request.json()) as Partial<{
    taskId: string;
    add: string;
    remove: string;
  }>;

  if (!body.taskId || (!body.add && !body.remove)) {
    return NextResponse.json(
      { error: "taskId e (add ou remove) são obrigatórios." },
      { status: 400 }
    );
  }

  try {
    if (body.add) await addTaskTag(body.taskId, body.add);
    if (body.remove) await removeTaskTag(body.taskId, body.remove);
    const task = await getTask(body.taskId);
    if (task.list?.id) invalidateList(task.list.id);
    return NextResponse.json({ task });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
