import { Suspense } from "react";
import { AuthShell } from "@/components/Auth/AuthShell";
import { FormularioEntrada } from "@/components/Auth/FormularioEntrada";

export default function EntrarPage() {
  return (
    <AuthShell titulo="Entrar" subtitulo="Use seu e-mail e senha do hub.">
      <Suspense fallback={<p className="hub-meta">Carregando…</p>}>
        <FormularioEntrada />
      </Suspense>
    </AuthShell>
  );
}
