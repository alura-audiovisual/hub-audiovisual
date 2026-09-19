import { NextResponse } from "next/server";
import { getAuthorizedUser } from "@/lib/clickup";

export async function GET() {
  try {
    const user = await getAuthorizedUser();
    return NextResponse.json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
