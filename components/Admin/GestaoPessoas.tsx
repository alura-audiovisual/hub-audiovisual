"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, Copy, Loader2, UserPlus, X } from "lucide-react";
import type { Papel, Situacao } from "@/lib/auth/papeis";
import { ROTULO_PAPEL, ROTULO_SITUACAO } from "@/lib/auth/papeis";
import { avatarTone, cx, formatDateTime, initials } from "@/lib/ui";
import { Combobox } from "@/components/Filters/Combobox";

interface Pessoa {
  id: string;
  email: string;
  nome: string;
  papel: Papel;
  situacao: Situacao;
  criado_em: string;
  ultimo_acesso: string | null;
}

const PAPEIS = [
  { value: "admin", label: "Administrador" },
  { value: "usuario", label: "Usuário" },
  { value: "visitante", label: "Visitante" },
];

export function GestaoPessoas({ meuId }: { meuId: string }) {
  const [pessoas, setPessoas] = useState<Pessoa[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState<string | null>(null);

  const [conviteEmail, setConviteEmail] = useState("");
  const [convitePapel, setConvitePapel] = useState<string | null>("visitante");
  const [conviteGerado, setConviteGerado] = useState<{ email: string; link: string } | null>(null);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      const resposta = await fetch("/api/admin/pessoas");
      const dados = (await resposta.json()) as { pessoas?: Pessoa[]; error?: string };
      if (!resposta.ok) throw new Error(dados.error ?? "Falha ao carregar pessoas.");
      setPessoas(dados.pessoas ?? []);
    } catch (caught) {
      setErro(caught instanceof Error ? caught.message : "Erro desconhecido.");
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function decidir(pessoa: Pessoa, situacao: Situacao, papel: Papel) {
    setSalvando(pessoa.id);
    setErro(null);
    try {
      const resposta = await fetch("/api/admin/pessoas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pessoa.id, situacao, papel }),
      });
      const dados = (await resposta.json()) as { pessoas?: Pessoa[]; error?: string };
      if (!resposta.ok) throw new Error(dados.error ?? "Falha ao salvar.");
      setPessoas(dados.pessoas ?? []);
    } catch (caught) {
      setErro(caught instanceof Error ? caught.message : "Erro desconhecido.");
    } finally {
      setSalvando(null);
    }
  }

  async function gerarConvite() {
    if (!conviteEmail.trim() || !convitePapel) return;
    setErro(null);
    try {
      const resposta = await fetch("/api/admin/convites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: conviteEmail, papel: convitePapel }),
      });
      const dados = (await resposta.json()) as {
        codigo?: string;
        email?: string;
        error?: string;
      };
      if (!resposta.ok || !dados.codigo) {
        throw new Error(dados.error ?? "Falha ao criar convite.");
      }

      const link = `${window.location.origin}/cadastro?convite=${dados.codigo}`;
      setConviteGerado({ email: dados.email ?? conviteEmail, link });
      setConviteEmail("");
    } catch (caught) {
      setErro(caught instanceof Error ? caught.message : "Erro desconhecido.");
    }
  }

  const pendentes = useMemo(
    () => (pessoas ?? []).filter((pessoa) => pessoa.situacao === "pendente"),
    [pessoas]
  );
  const demais = useMemo(
    () => (pessoas ?? []).filter((pessoa) => pessoa.situacao !== "pendente"),
    [pessoas]
  );

  return (
    <div className="h-full overflow-y-auto hub-scroll">
      <header className="px-8 pt-6 pb-5 space-y-1">
        <h1 className="hub-page-title">Pessoas e acessos</h1>
        <p className="hub-meta">
          Quem pode entrar no hub, com qual papel, e quem ainda espera aprovação.
        </p>
      </header>

      <div className="px-8 pb-10 space-y-8 max-w-4xl">
        {erro && (
          <div
            role="alert"
            className="rounded-lg border border-error/30 bg-error/10 px-4 py-2.5 flex items-center gap-3"
          >
            <AlertTriangle className="size-4 text-error shrink-0" aria-hidden />
            <p className="text-[13px] text-error flex-1">{erro}</p>
          </div>
        )}

        {/* Fila de aprovação */}
        <section className="space-y-3">
          <h2 className="hub-table-header">
            Aguardando aprovação{" "}
            <span className="hub-number text-muted-foreground font-normal">
              {pendentes.length}
            </span>
          </h2>

          {pessoas === null && (
            <div className="h-20 rounded-xl bg-white/[0.03] animate-pulse" />
          )}

          {pessoas !== null && pendentes.length === 0 && (
            <p className="hub-meta">Ninguém na fila.</p>
          )}

          <ul className="space-y-2">
            {pendentes.map((pessoa) => (
              <li
                key={pessoa.id}
                className="rounded-xl border border-attention/30 bg-card px-4 py-3 flex items-center gap-4 flex-wrap"
              >
                <Avatar nome={pessoa.nome} />

                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium truncate">{pessoa.nome}</p>
                  <p className="hub-meta truncate">{pessoa.email}</p>
                </div>

                <span className="hub-meta whitespace-nowrap">
                  pediu em {formatDateTime(new Date(pessoa.criado_em).getTime())}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void decidir(pessoa, "ativo", "usuario")}
                    disabled={salvando === pessoa.id}
                    className="hub-botao-primario !py-1.5 !text-[12px] disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    {salvando === pessoa.id ? (
                      <Loader2 className="size-3.5 animate-spin" aria-hidden />
                    ) : (
                      <Check className="size-3.5" aria-hidden />
                    )}
                    Aprovar como usuário
                  </button>

                  <button
                    type="button"
                    onClick={() => void decidir(pessoa, "ativo", "visitante")}
                    disabled={salvando === pessoa.id}
                    className="hub-botao-sutil !py-1.5 !text-[12px]"
                  >
                    Como visitante
                  </button>

                  <button
                    type="button"
                    onClick={() => void decidir(pessoa, "recusado", pessoa.papel)}
                    disabled={salvando === pessoa.id}
                    className="hub-botao-sutil !py-1.5 !text-[12px] hover:!text-error"
                  >
                    <X className="size-3.5" aria-hidden />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Quem já tem acesso */}
        <section className="space-y-3">
          <h2 className="hub-table-header">Com acesso</h2>

          <ul className="space-y-2">
            {demais.map((pessoa) => {
              const euMesmo = pessoa.id === meuId;
              return (
                <li
                  key={pessoa.id}
                  className="rounded-xl border border-border bg-card px-4 py-3 flex items-center gap-4 flex-wrap"
                >
                  <Avatar nome={pessoa.nome} />

                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium truncate">
                      {pessoa.nome}
                      {euMesmo && <span className="hub-meta ml-2">você</span>}
                    </p>
                    <p className="hub-meta truncate">{pessoa.email}</p>
                  </div>

                  <span
                    className={cx(
                      "hub-tag",
                      pessoa.situacao === "ativo"
                        ? "bg-success/15 text-success"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {ROTULO_SITUACAO[pessoa.situacao]}
                  </span>

                  <div className="w-[150px]">
                    <Combobox
                      label={ROTULO_PAPEL[pessoa.papel]}
                      size="sm"
                      hideAllOption
                      disabled={euMesmo || salvando === pessoa.id}
                      value={pessoa.papel}
                      onChange={(papel) => {
                        if (papel) void decidir(pessoa, pessoa.situacao, papel as Papel);
                      }}
                      options={PAPEIS}
                    />
                  </div>

                  {!euMesmo && (
                    <button
                      type="button"
                      onClick={() =>
                        void decidir(
                          pessoa,
                          pessoa.situacao === "suspenso" ? "ativo" : "suspenso",
                          pessoa.papel
                        )
                      }
                      disabled={salvando === pessoa.id}
                      className="hub-botao-sutil !py-1.5 !text-[12px]"
                    >
                      {pessoa.situacao === "suspenso" ? "Reativar" : "Suspender"}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* Convite para quem é de fora */}
        <section className="space-y-3">
          <h2 className="hub-table-header">Convidar pessoa de fora da Alura</h2>
          <p className="hub-meta leading-relaxed">
            Quem não tem e-mail @alura.com.br só se cadastra por convite. O link vale
            sete dias e serve uma vez só.
          </p>

          <div className="flex items-end gap-2 flex-wrap">
            <div className="flex-1 min-w-[220px]">
              <label htmlFor="convite-email" className="hub-meta block mb-1.5">
                E-mail
              </label>
              <input
                id="convite-email"
                type="email"
                value={conviteEmail}
                onChange={(event) => setConviteEmail(event.target.value)}
                placeholder="parceiro@empresa.com"
                className="hub-input"
              />
            </div>

            <div className="w-[160px]">
              <p className="hub-meta mb-1.5">Papel</p>
              <Combobox
                label="Papel"
                hideAllOption
                value={convitePapel}
                onChange={setConvitePapel}
                options={PAPEIS}
              />
            </div>

            <button
              type="button"
              onClick={() => void gerarConvite()}
              disabled={!conviteEmail.trim()}
              className="hub-botao-primario inline-flex items-center gap-2 disabled:opacity-50"
            >
              <UserPlus className="size-4" aria-hidden />
              Gerar convite
            </button>
          </div>

          {conviteGerado && (
            <div className="rounded-xl border border-interactive/30 bg-interactive/10 p-4 space-y-2">
              <p className="text-[13px] text-interactive">
                Convite criado para {conviteGerado.email}. Copie o link e envie — ele
                aparece uma vez só.
              </p>
              <div className="flex items-center gap-2">
                <code className="hub-tag bg-secondary text-foreground/80 flex-1 break-all">
                  {conviteGerado.link}
                </code>
                <button
                  type="button"
                  onClick={() => void navigator.clipboard.writeText(conviteGerado.link)}
                  className="hub-botao-sutil !py-1.5 !text-[12px] inline-flex items-center gap-1.5 shrink-0"
                >
                  <Copy className="size-3.5" aria-hidden />
                  Copiar
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Avatar({ nome }: { nome: string }) {
  return (
    <span
      className="size-9 rounded-full grid place-items-center text-[12px] shrink-0"
      style={{ backgroundColor: avatarTone(nome) }}
    >
      {initials(nome)}
    </span>
  );
}
