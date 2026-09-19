import Link from "next/link";

export default function NotFound() {
  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="max-w-md text-center space-y-3">
        <h1 className="hub-page-title">Esta página não existe</h1>
        <p className="text-sm text-muted-foreground">
          O endereço pode ter mudado, ou a board saiu do escopo do hub.
        </p>
        <Link href="/board/producao" className="text-interactive hub-tab-label inline-block">
          Ir para a board Produção
        </Link>
      </div>
    </div>
  );
}
