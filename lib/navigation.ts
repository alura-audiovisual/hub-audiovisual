// ============================================================
// lib/navigation.ts — estrutura do menu lateral
//
// Fonte única da navegação do hub. Adicionar um item aqui já o faz
// aparecer no menu e ganhar uma página — mesmo que ainda seja a
// página de "em construção".
//
// `status` diz em que pé o item está:
//   "pronto"    -> tem tela de verdade
//   "planejado" -> aparece no menu, abre a página que explica o que virá
// ============================================================

import type { BoardId } from "./types";

export type NavStatus = "pronto" | "planejado";

export interface NavChild {
  id: string;
  label: string;
  href: string;
  status: NavStatus;
  /** O que este item vai ser — mostrado na página de em construção. */
  descricao?: string;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  status: NavStatus;
  icon: string;
  descricao?: string;
  children?: NavChild[];
  /** Board correspondente, quando o item é uma das 6 boards. */
  boardId?: BoardId;
}

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

export const NAVIGATION: NavSection[] = [
  {
    id: "boards",
    label: "Boards de Trabalho",
    items: [
      { id: "producao", label: "Produção", href: "/board/producao", status: "pronto", icon: "video", boardId: "producao" },
      { id: "edicao", label: "Edição", href: "/board/edicao", status: "pronto", icon: "scissors", boardId: "edicao" },
      { id: "edicao-start", label: "Edição START", href: "/board/edicao-start", status: "pronto", icon: "graduation", boardId: "edicao-start" },
      { id: "imersoes", label: "Imersões", href: "/board/imersoes", status: "pronto", icon: "sparkles", boardId: "imersoes" },
      { id: "edicao-externa", label: "Edição Externa", href: "/board/edicao-externa", status: "pronto", icon: "handshake", boardId: "edicao-externa" },
      {
        id: "creative-ops",
        label: "Creative Ops",
        href: "/board/creative-ops",
        status: "pronto",
        icon: "grid",
        boardId: "creative-ops",
        children: [
          { id: "squad-formatos", label: "Formatos", href: "/board/creative-ops?squad=Formatos", status: "pronto" },
          { id: "squad-conteudo", label: "Conteúdo", href: "/board/creative-ops?squad=Conte%C3%BAdo", status: "pronto" },
          { id: "squad-start", label: "START", href: "/board/creative-ops?squad=START", status: "pronto" },
          { id: "squad-gestao", label: "Gestão", href: "/board/creative-ops?squad=Gest%C3%A3o", status: "pronto" },
          { id: "boletim", label: "Boletim", href: "/board/creative-ops/triagem", status: "pronto" },
        ],
      },
    ],
  },
  {
    id: "pedidos",
    label: "Pedidos",
    items: [
      {
        id: "pedidos-creops",
        label: "Pedidos CreOps",
        href: "/em-construcao/pedidos-creops",
        status: "planejado",
        icon: "inbox",
        descricao:
          "Formulário de solicitação para quem está fora do time audiovisual. Hoje as demandas chegam por formulário do ClickUp; a ideia é trazer esse pedido para dentro do hub, já nascendo no Inbox do Creative Ops com os campos certos preenchidos.",
      },
    ],
  },
  {
    id: "acervos",
    label: "Acervos",
    items: [
      {
        id: "documentacao",
        label: "Documentação",
        href: "/em-construcao/documentacao",
        status: "planejado",
        icon: "book",
        descricao:
          "Lugar único para a documentação do time — processos, decisões e guias. Hoje esse material está espalhado entre Drive, Notion e cabeça das pessoas.",
        children: [
          {
            id: "doc-creativeops",
            label: "CreativeOps",
            href: "/em-construcao/doc-creativeops",
            status: "planejado",
            descricao: "Documentação específica do time de Creative Ops.",
          },
        ],
      },
      {
        id: "capacitacao",
        label: "Capacitação Externa",
        href: "/em-construcao/capacitacao",
        status: "planejado",
        icon: "school",
        descricao:
          "Material de capacitação para instrutores e parceiros externos — como usar os estúdios, como gravar em casa, padrões de entrega.",
        children: [
          {
            id: "slides-gamma",
            label: "Slides no Gamma",
            href: "/em-construcao/slides-gamma",
            status: "planejado",
            descricao: "Apresentações de capacitação mantidas no Gamma.",
          },
        ],
      },
    ],
  },
  {
    id: "ferramentas",
    label: "Ferramentas e Assinaturas",
    items: [
      {
        id: "estoque-ferramentas",
        label: "Estoque de Ferramentas",
        href: "/em-construcao/estoque-ferramentas",
        status: "planejado",
        icon: "wrench",
        descricao:
          "Inventário das ferramentas e licenças do time: o que existe, quem usa, quando renova e quanto custa.",
      },
      {
        id: "armazenamento",
        label: "Armazenamento",
        href: "/em-construcao/armazenamento",
        status: "planejado",
        icon: "drive",
        descricao:
          "Panorama do armazenamento — Dropbox, SharePoint, Drive: quanto está em uso, onde está apertando e o que pode ser arquivado.",
      },
    ],
  },
];

/** Acha um item (ou sub-item) pelo trecho final da URL. */
export function findNavEntry(
  slug: string
): { label: string; descricao?: string; secao: string } | null {
  for (const section of NAVIGATION) {
    for (const item of section.items) {
      if (item.href.endsWith(`/${slug}`)) {
        return { label: item.label, descricao: item.descricao, secao: section.label };
      }
      for (const child of item.children ?? []) {
        if (child.href.endsWith(`/${slug}`)) {
          return { label: child.label, descricao: child.descricao, secao: section.label };
        }
      }
    }
  }
  return null;
}
