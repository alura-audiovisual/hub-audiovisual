import { Suspense } from "react";
import { AuthShell } from "@/components/Auth/AuthShell";
import { FormularioCadastro } from "@/components/Auth/FormularioCadastro";

export default function CadastroPage() {
  return (
    <AuthShell
      titulo="Pedir cadastro"
      subtitulo="Seu acesso passa pela aprovação de um administrador antes de valer."
    >
      <Suspense fallback={<p className="hub-meta">Carregando…</p>}>
        <FormularioCadastro />
      </Suspense>
    </AuthShell>
  );
}
