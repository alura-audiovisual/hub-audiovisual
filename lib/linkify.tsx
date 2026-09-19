import type { ReactNode } from "react";

/**
 * Transforma URLs soltas no meio de um texto em links clicáveis.
 *
 * Por que existe: descrição e comentários do ClickUp trazem links colados
 * como texto puro (Figma, Drive, SharePoint, Dropbox). Sem isso a pessoa
 * precisa selecionar, copiar e colar na barra do navegador.
 *
 * ⚠️ Armadilha corrigida: a versão anterior guardava a expressão regular
 * com o flag /g numa constante compartilhada. Expressão com /g memoriza
 * onde parou a última busca, então `.test()` alternava entre verdadeiro e
 * falso a cada chamada — metade dos links ficava sem virar link. A regra
 * agora é criada nova a cada uso e a varredura é feita com matchAll, que
 * não depende desse estado.
 */
const URL_SOURCE = "https?://[^\\s<>\"')\\]]+";

export function linkify(text: string): ReactNode[] {
  if (!text) return [];

  const pattern = new RegExp(URL_SOURCE, "gi");
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let key = 0;

  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0;
    const raw = match[0];

    if (start > cursor) nodes.push(text.slice(cursor, start));

    // Pontuação final costuma pertencer à frase, não ao endereço.
    const url = raw.replace(/[.,;:!?]+$/, "");
    const trailing = raw.slice(url.length);

    nodes.push(
      <a
        key={`link-${key++}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-interactive underline underline-offset-2 break-all"
      >
        {url}
      </a>
    );

    if (trailing) nodes.push(trailing);
    cursor = start + raw.length;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));

  return nodes;
}

/** O texto inteiro é um link? (usado para decidir como exibir um campo) */
export function isUrl(value: string): boolean {
  return new RegExp(`^${URL_SOURCE}$`, "i").test(value.trim());
}
