import Link from "next/link";
import { Clock } from "lucide-react";
import { AuthShell } from "@/components/Auth/AuthShell";

export default function AguardandoPage() {
  return (
    <AuthShell titulo="Cadastro em análise">
      <div className="space-y-4">
        <p className="text-[13px] leading-relaxed text-foreground/80 flex items-start gap-2">
          <Clock className="size-4 shrink-0 mt-0.5 text-muted-foreground" aria-hidden />
          Sua senha está correta, mas o acesso ainda não foi aprovado. Um
          administrador precisa liberar sua entrada e definir seu papel no hub.
        </p>

        <p className="hub-meta leading-relaxed">
          Se a espera passar de um dia útil, fale com alguém do time audiovisual —
          pode ser que ninguém tenha visto o pedido.
        </p>

        <Link href="/entrar" className="hub-botao-sutil block text-center">
          Voltar para a entrada
        </Link>
      </div>
    </AuthShell>
  );
}
