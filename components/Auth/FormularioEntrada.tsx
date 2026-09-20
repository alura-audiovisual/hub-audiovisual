"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, Loader2 } from "lucide-react";

export function FormularioEntrada() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const destino = searchParams.get("de") ?? "/board/producao";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function entrar(event: React.FormEvent) {
    event.preventDefault();
    if (enviando) return;

    setEnviando(true);
    setErro(null);

    try {
      const resposta = await fetch("/api/auth/entrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      const dados = (await resposta.json()) as { error?: string; code?: string };

      if (!resposta.ok) {
        if (dados.code === "PENDENTE") {
          router.push("/aguardando");
          return;
        }
        throw new Error(dados.error ?? "Não foi possível entrar.");
      }

      router.push(destino);
      router.refresh();
    } catch (caught) {
      setErro(caught instanceof Error ? caught.message : "Erro desconhecido.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={entrar} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="email" className="hub-meta block">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="voce@alura.com.br"
          className="hub-input"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="senha" className="hub-meta block">
          Senha
        </label>
        <input
          id="senha"
          type="password"
          autoComplete="current-password"
          required
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
          className="hub-input"
        />
      </div>

      {erro && (
        <p
          role="alert"
          className="text-[13px] text-error leading-relaxed flex items-start gap-2"
        >
          <AlertTriangle className="size-3.5 shrink-0 mt-0.5" aria-hidden />
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="hub-botao-primario w-full flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {enviando && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {enviando ? "Entrando…" : "Entrar"}
      </button>

      <p className="hub-meta text-center leading-relaxed pt-1">
        Ainda não tem acesso?{" "}
        <Link href="/cadastro" className="text-interactive">
          Pedir cadastro
        </Link>
      </p>
    </form>
  );
}
