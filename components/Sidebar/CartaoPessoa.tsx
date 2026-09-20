"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Shield } from "lucide-react";
import { useSessao } from "@/components/Sessao/SessaoProvider";
import { ROTULO_PAPEL } from "@/lib/auth/papeis";
import { avatarTone, initials } from "@/lib/ui";

export function CartaoPessoa() {
  const sessao = useSessao();
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);

  if (!sessao) return null;

  async function sair() {
    setSaindo(true);
    await fetch("/api/auth/sair", { method: "POST" });
    router.push("/entrar");
    router.refresh();
  }

  return (
    <div className="px-3 py-3 border-t border-border/40 space-y-2">
      <div className="flex items-center gap-2.5 px-2">
        <span
          className="size-8 rounded-full grid place-items-center text-[11px] shrink-0"
          style={{ backgroundColor: avatarTone(sessao.nome) }}
        >
          {initials(sessao.nome)}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium truncate">{sessao.nome}</p>
          <p className="hub-meta truncate">{ROTULO_PAPEL[sessao.papel]}</p>
        </div>

        <button
          type="button"
          onClick={() => void sair()}
          disabled={saindo}
          aria-label="Sair do hub"
          title="Sair"
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0 p-1"
        >
          <LogOut className="size-4" aria-hidden />
        </button>
      </div>

      {sessao.permissoes.administrar && (
        <Link
          href="/admin/pessoas"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
        >
          <Shield className="size-3.5 shrink-0" aria-hidden />
          Pessoas e acessos
        </Link>
      )}

      {!sessao.permissoes.escrever && (
        <p className="hub-meta px-2 leading-relaxed">
          Seu papel permite ver, mas não alterar.
        </p>
      )}
    </div>
  );
}
