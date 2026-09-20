import { redirect } from "next/navigation";
import { sessaoAtual } from "@/lib/auth/sessao";
import { buscarPorId } from "@/lib/auth/pessoas";
import { GestaoPessoas } from "@/components/Admin/GestaoPessoas";

export default async function PessoasPage() {
  const sessao = await sessaoAtual();
  if (!sessao) redirect("/entrar");

  // Conferência no servidor: chegar pela URL não basta.
  const pessoa = await buscarPorId(sessao.id);
  if (!pessoa || pessoa.papel !== "admin" || pessoa.situacao !== "ativo") {
    redirect("/board/producao");
  }

  return <GestaoPessoas meuId={sessao.id} />;
}
