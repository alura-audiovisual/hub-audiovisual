"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

export function FormularioCadastro() {
  const searchParams = useSearchParams();
  const convite = searchParams.get("convite") ?? undefined;

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pronto, setPronto] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function cadastrar(event: React.FormEvent) {
    event.preventDefault();
    if (enviando) return;

    if (senha !== confirmacao) {
      setErro("As senhas não são iguais.");
      return;
    }

    setEnviando(true);
    setErro(null);

    try {
      const resposta = await fetch("/api/auth/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha, convite }),
      });
      const dados = (await resposta.json()) as { error?: string; situacao?: string };

      if (!resposta.ok) throw new Error(dados.error ?? "Não foi possível cadastrar.");

      setPronto(true);
    } catch (caught) {
      setErro(caught instanceof Error ? caught.message : "Erro desconhecido.");
    } finally {
      setEnviando(false);
    }
  }

  if (pronto) {
    return (
      <div className="space-y-4">
        <p className="text-[13px] leading-relaxed text-foreground/80 flex items-start gap-2">
          <CheckCircle2
            className="size-4 shrink-0 mt-0.5"
            style={{ color: "var(--success)" }}
            aria-hidden
          />
          Cadastro enviado. Um administrador precisa aprovar seu acesso — você recebe
          o aviso assim que isso acontecer.
        </p>
        <Link href="/entrar" className="hub-botao-sutil block text-center">
          Voltar para a entrada
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={cadastrar} className="space-y-4">
      {convite && (
        <p className="hub-tag bg-interactive/15 text-interactive inline-block">
          Cadastro por convite
        </p>
      )}

      <div className="space-y-1.5">
        <label htmlFor="nome" className="hub-meta block">
          Nome
        </label>
        <input
          id="nome"
          required
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          autoComplete="name"
          className="hub-input"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="hub-meta block">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="voce@alura.com.br"
          autoComplete="email"
          className="hub-input"
        />
        {!convite && (
          <p className="hub-meta leading-relaxed">
            Cadastro aberto para e-mails @alura.com.br. Quem é de fora entra por
            convite de um administrador.
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="senha" className="hub-meta block">
          Senha
        </label>
        <input
          id="senha"
          type="password"
          required
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
          autoComplete="new-password"
          className="hub-input"
        />
        <p className="hub-meta">Pelo menos 12 caracteres, com letra e número.</p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirmacao" className="hub-meta block">
          Repita a senha
        </label>
        <input
          id="confirmacao"
          type="password"
          required
          value={confirmacao}
          onChange={(event) => setConfirmacao(event.target.value)}
          autoComplete="new-password"
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
        {enviando ? "Enviando…" : "Pedir cadastro"}
      </button>

      <p className="hub-meta text-center pt-1">
        Já tem acesso?{" "}
        <Link href="/entrar" className="text-interactive">
          Entrar
        </Link>
      </p>
    </form>
  );
}
