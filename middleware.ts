// ============================================================
// middleware.ts — trava na borda
//
// Primeira barreira: quem não tem sessão válida nem chega nas telas.
// Ela confere só a assinatura do cookie, porque roda antes do banco.
// A conferência de papel e situação acontece nas rotas de API, que
// leem o banco a cada escrita. As duas camadas juntas é que valem.
// ============================================================

import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PUBLICAS = ["/entrar", "/cadastro", "/aguardando"];

function ehPublica(pathname: string): boolean {
  if (PUBLICAS.some((rota) => pathname.startsWith(rota))) return true;
  if (pathname.startsWith("/api/auth/")) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (ehPublica(pathname)) return NextResponse.next();

  const token = request.cookies.get("hub_sessao")?.value;
  let valido = false;

  if (token && process.env.AUTH_SECRET) {
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET));
      valido = true;
    } catch {
      valido = false;
    }
  }

  if (valido) return NextResponse.next();

  // Chamada de API responde em JSON; navegação vai para a tela de entrada.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Entre no hub para continuar.", code: "SEM_SESSAO" },
      { status: 401 }
    );
  }

  const destino = request.nextUrl.clone();
  destino.pathname = "/entrar";
  destino.search = `?de=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(destino);
}

export const config = {
  matcher: [
    // Tudo, menos arquivos estáticos e o favicon.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
