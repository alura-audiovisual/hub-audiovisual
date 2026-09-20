import { NextResponse } from "next/server";
import { autorizarEscrita } from "@/lib/auth/guarda";
import { clearCustomFieldValue, getTask, setCustomFieldValue } from "@/lib/clickup";
import { invalidateList } from "@/lib/cache";

export async function POST(request: Request) {
  const permitido = await autorizarEscrita();
  if (!permitido.ok) return permitido.resposta;

  const body = (await request.json()) as Partial<{
    taskId: string;
    fieldId: string;
    value: unknown;
  }>;

  if (!body.taskId || !body.fieldId) {
    return NextResponse.json(
      { error: "taskId e fieldId são obrigatórios." },
      { status: 400 }
    );
  }

  try {
    // value null ou vazio = limpar o campo.
    if (body.value === null || body.value === "") {
      await clearCustomFieldValue(body.taskId, body.fieldId);
    } else {
      await setCustomFieldValue(body.taskId, body.fieldId, body.value);
    }

    const task = await getTask(body.taskId);
    if (task.list?.id) invalidateList(task.list.id);
    return NextResponse.json({ task });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
