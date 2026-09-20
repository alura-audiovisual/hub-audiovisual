import type { ReactNode } from "react";

/** Moldura comum das telas de entrada — fora da casca do hub. */
export function AuthShell({
  titulo,
  subtitulo,
  children,
  rodape,
}: {
  titulo: string;
  subtitulo?: string;
  children: ReactNode;
  rodape?: ReactNode;
}) {
  return (
    <div className="min-h-screen grid place-items-center p-6 bg-background">
      <div className="w-full max-w-sm">
        <div className="mb-7">
          <p className="hub-page-title text-lg">Hub do Audiovisual</p>
          <p className="hub-meta mt-1">Alura</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
          <div className="space-y-1.5">
            <h1 className="hub-page-title !text-xl">{titulo}</h1>
            {subtitulo && (
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                {subtitulo}
              </p>
            )}
          </div>

          {children}
        </div>

        {rodape && <div className="mt-5 text-center">{rodape}</div>}
      </div>
    </div>
  );
}
