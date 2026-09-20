import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { Encode_Sans, Roboto_Flex, JetBrains_Mono } from "next/font/google";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { SessaoProvider, type SessaoCliente } from "@/components/Sessao/SessaoProvider";
import { sessaoAtual } from "@/lib/auth/sessao";
import { buscarPorId } from "@/lib/auth/pessoas";
import { permissoesDe } from "@/lib/auth/papeis";
import "./globals.css";

const encodeSans = Encode_Sans({ variable: "--font-encode-sans", subsets: ["latin"] });
const robotoFlex = Roboto_Flex({ variable: "--font-roboto-flex", subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hub do Audiovisual — Alura",
  description: "Hub operacional do time audiovisual da Alura.",
};

/**
 * A sessão é lida no servidor e entregue pronta ao cliente. O papel vem
 * do banco, não do cookie: quem foi rebaixado ou suspenso perde o acesso
 * na próxima navegação, sem esperar o cookie expirar.
 */
async function carregarSessao(): Promise<SessaoCliente | null> {
  const sessao = await sessaoAtual();
  if (!sessao) return null;

  try {
    const pessoa = await buscarPorId(sessao.id);
    if (!pessoa || pessoa.situacao !== "ativo") return null;

    return {
      nome: pessoa.nome,
      email: pessoa.email,
      papel: pessoa.papel,
      permissoes: permissoesDe(pessoa.papel),
    };
  } catch {
    // Banco fora do ar não pode deixar a tela em branco.
    return null;
  }
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const sessao = await carregarSessao();

  return (
    <html
      lang="pt-BR"
      className={`dark ${encodeSans.variable} ${robotoFlex.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="h-full flex bg-background text-foreground overflow-hidden">
        <SessaoProvider sessao={sessao}>
          {sessao ? (
            <>
              <Suspense
                fallback={<div className="w-[240px] shrink-0 h-full bg-sidebar" />}
              >
                <Sidebar />
              </Suspense>
              <main className="flex-1 min-w-0 h-full">{children}</main>
            </>
          ) : (
            // Telas de entrada e cadastro não usam a casca do hub.
            <main className="flex-1 min-w-0 h-full overflow-y-auto">{children}</main>
          )}
        </SessaoProvider>
      </body>
    </html>
  );
}
