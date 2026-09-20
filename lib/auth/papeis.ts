// ============================================================
// lib/auth/papeis.ts — o que cada papel pode fazer
//
// Fonte única das permissões. A interface esconde o que a pessoa
// não pode fazer, mas quem decide de verdade é o servidor: toda
// rota que escreve chama uma guarda daqui antes de agir.
// ============================================================

export type Papel = "admin" | "usuario" | "visitante";
export type Situacao = "pendente" | "ativo" | "recusado" | "suspenso";

export interface Permissoes {
  /** Ver boards, cards e acervos. */
  ler: boolean;
  /** Mover, criar, editar e excluir cards; comentar. */
  escrever: boolean;
  /** Editar links e conteúdo dos acervos. */
  editarAcervos: boolean;
  /** Enviar pedido pelo formulário. */
  pedir: boolean;
  /** Aprovar cadastros, mudar papéis, ver o registro de ações. */
  administrar: boolean;
}

export const PERMISSOES: Record<Papel, Permissoes> = {
  admin: {
    ler: true,
    escrever: true,
    editarAcervos: true,
    pedir: true,
    administrar: true,
  },
  usuario: {
    ler: true,
    escrever: true,
    editarAcervos: true,
    pedir: true,
    administrar: false,
  },
  visitante: {
    ler: true,
    escrever: false,
    editarAcervos: false,
    pedir: true,
    administrar: false,
  },
};

export function permissoesDe(papel: Papel): Permissoes {
  return PERMISSOES[papel] ?? PERMISSOES.visitante;
}

export const ROTULO_PAPEL: Record<Papel, string> = {
  admin: "Administrador",
  usuario: "Usuário",
  visitante: "Visitante",
};

export const ROTULO_SITUACAO: Record<Situacao, string> = {
  pendente: "Aguardando aprovação",
  ativo: "Ativo",
  recusado: "Recusado",
  suspenso: "Suspenso",
};

export function ehPapelValido(value: string): value is Papel {
  return value === "admin" || value === "usuario" || value === "visitante";
}
