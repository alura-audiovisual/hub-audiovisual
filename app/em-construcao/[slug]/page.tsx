import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, HardHat } from "lucide-react";
import { findNavEntry } from "@/lib/navigation";

export default async function EmConstrucaoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = findNavEntry(slug);
  if (!entry) notFound();

  return (
    <div className="h-full grid place-items-center p-8">
      <div className="max-w-lg space-y-5">
        <Link
          href="/board/producao"
          className="hub-meta inline-flex items-center gap-1.5 text-interactive"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Voltar para as boards
        </Link>

        <div className="space-y-3">
          <span
            className="hub-tag inline-flex items-center gap-1.5 bg-secondary text-muted-foreground"
          >
            <HardHat className="size-3" aria-hidden />
            {entry.secao} · em construção
          </span>

          <h1 className="hub-page-title !text-2xl">{entry.label}</h1>

          {entry.descricao && (
            <p className="text-[14px] leading-relaxed text-foreground/75">
              {entry.descricao}
            </p>
          )}
        </div>

        <p className="hub-meta leading-relaxed">
          Esta área está no mapa do hub mas ainda não foi construída. Ela aparece no
          menu de propósito: o time vê para onde o projeto está indo, e quem entra
          novo entende o escopo inteiro sem precisar perguntar.
        </p>
      </div>
    </div>
  );
}
