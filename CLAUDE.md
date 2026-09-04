# Creative Ops Hub — Time Audiovisual (Alura)

Hub operacional do time audiovisual da Alura. Reconstrói os Kanbans das boards
do ClickUp dentro de uma interface única e sob controle visual próprio. O
ClickUp continua sendo o banco de dados (fonte da verdade); o hub é a experiência.

> Este arquivo é a fonte de regras para quem constrói o projeto (humano ou
> Claude Code). Deve ser **enxuto**. Cada linha aqui é lida em toda tarefa —
> só entra o que é decisão, restrição ou armadilha não-óbvia. O "porquê" das
> mudanças, feito para humanos, vive em `docs/HISTORICO.md`.

---

## Decisões-mãe (não reabrir sem discussão explícita)

1. **Modelo Espelho.** O hub reconstrói cada board como Kanban próprio via
   **API v2 do ClickUp**. Sem iframe/embed como solução final.
2. **ClickUp é a fonte da verdade.** Toda ação escreve no ClickUp e re-lê de lá.
   O hub nunca trata estado local como verdade.
3. **Design System = Alura (azul).** Mesmo DS do Hub de Eficiência Operacional,
   para permitir convergência futura entre os hubs.
4. **Independente por enquanto.** Sem login compartilhado com o EfOps ainda.
   Modelo de usuário e visual já nascem compatíveis para integração futura.
5. **Sem automações no MVP.** O hub não cria nem replica automações do ClickUp.
6. **6 boards no MVP.** Outras boards existentes no workspace ficam fora do escopo.
7. **Todas as boards visíveis por todos.** Sem controle de acesso por board no MVP.

---

## Stack

| Camada | Escolha | Observação |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | Mesma base do hub EfOps. |
| UI | **Tailwind CSS + shadcn/ui** | `components/ui/` gerado pelo shadcn — **nunca editar à mão**. |
| Ícones | **lucide-react** | Nomes em https://lucide.dev/icons. |
| Backend | **Next.js API Routes → ClickUp API v2** | Sem banco próprio no MVP. |
| Deploy | **Vercel** | Preview automático por Pull Request. |

Não adicionar banco, ORM ou autenticação sem registrar a decisão em
`docs/HISTORICO.md` primeiro.

---

## Comandos

| Comando | O que faz |
|---|---|
| `npm install` | Instala dependências. |
| `npm run dev` | Sobe local em http://localhost:3000. |
| `npm run build` | Compila para produção (roda checagem de tipos). |
| `npm run lint` | Roda ESLint (regras obrigatórias abaixo). |

---

## Estrutura de pastas

```
app/
  api/                # rotas que falam com o ClickUp (uma pasta por ação)
  layout.tsx          # fontes globais e casca do HTML
  page.tsx            # ponto de entrada
  globals.css         # tokens CSS e classes .hub-*
components/
  ui/                 # shadcn — NUNCA editar manualmente
  Board/              # componente Kanban genérico
  Card/               # card de tarefa (variantes por board)
  Modal/              # modal de detalhe da tarefa
  Sidebar/            # navegação lateral
lib/
  clickup.ts          # ÚNICO lugar que chama a API do ClickUp
  boards.config.ts    # mapa das boards (id, list_id, tipo, regras)
  types.ts            # tipos compartilhados — sem `any`
docs/
  HISTORICO.md        # história do projeto, para humanos
```

---

## Boards — mapeamento oficial

Fonte de verdade do mapeamento. Qualquer mudança de `list_id` ou regra deve
ser feita aqui **e** em `lib/boards.config.ts` ao mesmo tempo.

### Produção (`list_id: 901305984877`) — tipo: `standard`

**O que é:** tarefas unitárias de gravação (cursos, formatos de estúdio,
acompanhamento remoto, suporte). Criadas pelo time de edição a partir de
solicitações de agendamento dos coordenadores de curso.

**Colunas (ordem oficial):**
INBOX → BACKLOG → CADASTRO DE INSTRUTOR → TRAVADO → AGENDAMENTO →
PEDIR EQUIPAMENTO → EM ENVIO/TRANSPORTE → SUPORTE E TESTE →
ACOMPANHAMENTO DE PROJETO → GRAVAÇÃO DIURNA → GRAVAÇÃO NOTURNA →
GRAVAÇÃO → DEVOLUÇÃO DE EQUIPAMENTOS → FINALIZADO

**Campos relevantes para display:**
- Responsáveis (múltiplos)
- Datas: Gravação - início / Gravação - término
- Tipo de estúdio: `Home` · `Estúdio Alura` · `FIAP` · `Externo`
- Instrutor(a)
- Setor Demandante
- Time de Coordenação
- Etiquetas (ex: "gravação liberada", "equipamento enviado")
- Prioridade

**Regras:**
- Qualquer membro do time audiovisual pode mover cards.
- TRAVADO = qualquer impedimento (principal causa: reagendamento).
- Gravação Diurna / Noturna / Gravação = turnos de estúdio para organização de agenda.

⚠️ **Confirmar antes de construir:** verificar se há automações ativas nessa
board no ClickUp que precisem ser respeitadas.

---

### Edição (`list_id: 901303719253`) — tipo: `standard`

**O que é:** conteúdos que precisam de edição profissional (não é todo conteúdo
gravado — só casos complexos + formatos como imersões). Cards chegam
principalmente por automação de outras boards; criação manual é exceção.

**Colunas (ordem oficial):**
INBOX PÓS-PRODUÇÃO → BACKLOG EDIÇÃO → FAZENDO EDIÇÃO →
AGUARDANDO NUVEM → FINALIZADO → FECHADOS

**Campos relevantes para display:**
- Responsáveis (coordenador/instrutor do conteúdo)
- Pessoa Editora (quem edita de fato — campo separado de Responsáveis)
- Carreira/Trilha
- Instrutor(a)
- Categoria / Nível
- Setor Demandante
- Tipo de produto/demanda
- Links: SharePoint, Dropbox-Edição, admin
- Etiquetas (ex: "dependência técnica", "em validação", "edição externa")
- Prioridade

**Regras:**
- "Aguardando Nuvem" = editor terminou, aguardando upload para Dropbox.
- "Edição externa" = conteúdo terceirizado por decisão do coordenador de
  didática ou do audiovisual por questão técnica.
- Responsável ≠ Pessoa Editora: responsável é o dono do conteúdo;
  editora é quem executa a edição.

⚠️ **Confirmar antes de construir:** de quais boards exatamente vêm as
automações que criam cards aqui.

---

### Edição START (`list_id: 901304846677`) — tipo: `standard`

**O que é:** conteúdos do produto START (ensino público, infantil ao técnico —
negócio separado da Alura). Fluxo similar à Edição mas com campos e etiquetas
próprios da grade curricular brasileira.

**Colunas ativas (ordem oficial):**
INBOX PÓS-PRODUÇÃO → BACKLOG EDIÇÃO → EDIÇÃO 1 → FAZENDO QA 1 →
EDIÇÃO 2 → AGUARDANDO NUVEM → FINALIZADO → FECHADOS

❌ **Colunas a ocultar no hub (obsoletas):** BACKLOG ÍCONES · FAZENDO ÍCONES

**Campos relevantes para display:**
- Responsáveis
- Pessoa Editora
- Designer Instrucional (papel exclusivo do START)
- [START] Time/Categoria (ex: EFAI)
- Setor Demandante (sempre "Start")
- Etiquetas de grade curricular: trimestre, ano escolar, série + "Técnico"
- Links coloridos no corpo do card: Drive, Dropbox vídeos brutos,
  Notas de edição, QA da unidade

**Regras:**
- Colunas BACKLOG ÍCONES e FAZENDO ÍCONES **nunca** devem ser renderizadas
  no hub, mesmo que existam no ClickUp.

---

### Imersões (`list_id: 901310922355`) — tipo: `standard`

**O que é:** tarefas de produção de imersões (formato intensivo com lógica de
lançamento/inbound). Não são eventos ao vivo. Independente das outras boards.
Cards criados pelos próprios solicitantes (time de marketing inbound) direto
no INBOX.

**Colunas (ordem oficial):**
INBOX CREATIVEOPS → BACKLOG → PRONTO PARA INICIAR →
EM TRABALHO → VALIDAÇÃO → FINALIZADOS → FECHADOS

**Campos relevantes para display:**
- Responsáveis
- Data de entrega final
- Briefing / Kick-off / Cronograma
- Documento de informações
- Link do Dropbox
- Material de arte
- Webséries

**Tipologia de entregas recorrentes** (referência para checklist):
overlays e gráficos de identidade · elementos de cenário ·
biblioteca de assets de edição · thumbs · materiais extras por imersão

---

### Edição Externa (`list_id: 901327212474`) — tipo: `standard` + somente leitura

**O que é:** painel de gestão de fornecedores externos de edição. Operada
internamente pela tech lead e senior — parceiros externos não acessam o hub.
Cards criados **exclusivamente por automação** vinda de board dos coordenadores
de didática (fora do time audiovisual).

**Colunas (ordem oficial):**
BACKLOG EDIÇÃO EXTERNA → EDITANDO → EDITADO → PAGO → CONCLUÍDO

**Campos relevantes para display:**
- Editor externo
- Tipo editor: `Ferramenta de edição` (maioria) · `Raiz` (minoria)
- Valor editor ferramenta
- Valor editor raiz
- Previsão de pagamento
- Feedback Técnico
- Setor Demandante
- Link Dropbox-Edição
- Rastreamento de tempo

**Tipos de editor:**
- **Ferramenta de edição:** colaborador externo não-profissional que usa
  a ferramenta simplificada da Alura.
- **Raiz:** editor profissional colaborador externo (uso minoritário).

**Regras (inegociáveis):**
- ❌ Botões de criação de card **nunca** são renderizados nesta board.
- Quem marca como PAGO: a tech lead.

⚠️ **Confirmar antes de construir:** de qual board exatamente vem a automação
que cria os cards aqui.

---

### Creative Ops (`list_id: 901314029949`) — tipo: `epics`

**O que é:** board multidisciplinar do time de Creative Ops. Cobre design,
motion, animação, ilustração, ads, slides, ferramentas, interfaces criativas,
gestão de fluxo, research, ícones e outros formatos. Solicitantes externos
via formulário; criação interna para C-level, subtarefas de épico ou acordos
diretos com solicitante.

**Colunas (ordem oficial):**
INBOX → BACKLOG → ÉPICOS → PRONTO PARA INICIAR →
EM TRABALHO → VALIDAÇÃO → FINALIZADOS → FECHADOS

**Squads / Competências (usado para filtro e herança):**
- **Formatos** — motion, desenvolvimento, edição de formatos novos
- **Conteúdo** — designers e motion para conteúdo Alura
- **START** — designers e motion para o produto START
- **Gestão** — design, automações, fluxos, documentação, liderança, infraestrutura

**Campos relevantes para display:**
- Responsáveis
- Competência (squad)
- Tipo de Demanda de Design
- Setor Demandante
- Solicitante
- ID Visual
- Documentação
- Timestamps
- Prioridade
- Tags (ex: Animações para cursos, Ilustração, Thumb, Identidade Visual...)

**Campos a ignorar:** Pontualidade, Didática, Comunicação (estrelas herdadas
do workspace, não utilizadas pelo time).

**Regras do motor de Épicos/Subtarefas:**

1. Toda demanda nasce na coluna **INBOX**.
2. Triagem feita por quem assume a responsabilidade pelo card.
3. Demanda simples refinada + com responsável → **BACKLOG** → corre a esteira.
4. Demanda complexa → coluna **ÉPICOS**. Ao entrar nessa coluna, o backend
   converte a tarefa em Marco no ClickUp (`custom_type: milestone`).
5. **Subtarefas** só podem ser criadas de dentro do modal de um Épico.
6. Ao nascer, a subtarefa vai obrigatoriamente para **INBOX**.
7. **Herança de campos do Épico pai para a subtarefa:**

| Campo | Herança | Editável na subtarefa? |
|---|---|---|
| Competência | ✅ herda | ❌ não |
| Tipo de Demanda de Design | ✅ herda como ponto de partida | ✅ sim |
| Setor Demandante | ✅ herda | ❌ não |
| Tags | ✅ herda | ❌ não |
| Responsáveis | ❌ não herda | ✅ sim (refinamento) |
| Datas | ❌ não herda | ✅ sim (prazo próprio) |

8. Um Épico só é resolvido quando **todas** as suas subtarefas são concluídas.
9. **Filtro por squad/competência** é obrigatório nesta board.

**Badges visuais obrigatórios nos cards:**
- 🟣 Badge roxo → ÉPICO
- 🟠 Badge laranja → SUBTAREFA (com ícone de hierarquia)

⚠️ **CONFIRMAR antes de construir:** o `list_id` `901314029949` é o correto
para Creative Ops. O legado tinha esse id marcado como `standard` — confirmar
que deve ser `epics` antes de buildar.

---

## UX inegociável

- **Drag-to-delete:** exclusão de cards não usa `confirm()` nativo do navegador.
  No modal, o botão de exclusão exige arrastar até zona de lixeira (fricção
  positiva). Zona aparece ao iniciar o drag, some se soltar fora.
- **Criação inline:** `+ Adicionar Tarefa` no rodapé de cada coluna, exceto
  na board Edição Externa (onde não existe).

---

## Padrão de código (não negociável)

- **Zero `any`.** Todo dado tem tipo em `lib/types.ts`.
- **Uma única porta para o ClickUp.** Toda chamada à API passa por
  `lib/clickup.ts`. Nenhum componente chama `fetch` do ClickUp direto.
- **Rota de API = wrapper fino.** Valida entrada, chama `lib/clickup.ts`,
  devolve resposta. Sem lógica de negócio dentro da rota.
- **Status identificados por ID**, nunca por comparação de texto. Registrar
  os IDs de status de cada board em `lib/boards.config.ts`.

Exemplo de rota (referência de estilo):

```ts
// app/api/update-task-status/route.ts
import { NextResponse } from "next/server";
import { updateTaskStatus } from "@/lib/clickup";

export async function POST(request: Request) {
  const { taskId, newStatus } = await request.json();
  if (!taskId || !newStatus)
    return NextResponse.json({ error: "taskId e newStatus obrigatórios" }, { status: 400 });
  const result = await updateTaskStatus(taskId, newStatus);
  return NextResponse.json(result);
}
```

### Regras de lint obrigatórias (`eslint.config.mjs`)

`eqeqeq: always` · `no-explicit-any: error` · `no-unused-vars: warn`
(prefixo `_` para ignorar) · `react-hooks/rules-of-hooks: error` ·
`react-hooks/exhaustive-deps: warn` · `no-console: warn` (permite
`warn`/`error`) · `no-unreachable: error`

---

## Design System (Alura)

Três fontes via `next/font/google`:

| Variável CSS | Fonte | Uso |
|---|---|---|
| `--font-encode-sans` | Encode Sans | Títulos de página, card, tabela. |
| `--font-roboto-flex` | Roboto Flex | Corpo, labels, botões. |
| `--font-jetbrains-mono` | JetBrains Mono | Tags, datas, números, código. |

Classes semânticas (definidas em `globals.css`, **sempre usar**):
`hub-page-title` · `hub-card-title` · `hub-table-header` ·
`hub-tab-label` · `hub-tag` · `hub-number`

**Paleta dark (DS oficial Alura):**

| Token | Cor | Uso |
|---|---|---|
| sidebar | `#131416` | Fundo da sidebar, sem borda. |
| corpo | `#1b1c1e` | Fundo do conteúdo. |
| card | `#0c0d0e` | Fundo de card. |
| primário | `#052fd3` | Apenas botões de criação e badges de status. |
| hover azul | `#4878ea` | Hover do primário. |
| texto interativo | `#5f8bec` | Texto azul clicável (`text-interactive`, nunca `text-primary`). |

Feedback: `success` / `error` / `attention` / `info` do DS —
**nunca** `emerald` / `rose` / `amber` genéricos do Tailwind.

**Regras visuais:**
- Aba ativa = sublinhado branco inferior.
- Card que abre algo = corpo inteiro clicável (`.hub-card-clicavel`), sem botão redundante.
- Card com múltiplas ações = contêiner; botões carregam a interação.

---

## O que NÃO fazer

- ❌ Misturar dois modelos de arquitetura na mesma pasta. (Foi o que matou o legado.)
- ❌ Usar `any`. Se não sabe o tipo, defina o tipo.
- ❌ Chamar a API do ClickUp fora de `lib/clickup.ts`.
- ❌ Identificar status por comparação de texto — usar ID de status do ClickUp.
- ❌ Guardar estado de tarefa localmente como verdade — o ClickUp manda.
- ❌ Editar arquivos em `components/ui/` à mão (são do shadcn).
- ❌ Renderizar botões de criação na board **Edição Externa**.
- ❌ Renderizar colunas **BACKLOG ÍCONES** e **FAZENDO ÍCONES** na board **Edição START**.
- ❌ Usar cores de feedback genéricas do Tailwind — só tokens do DS.
- ❌ Usar `confirm()` nativo do navegador para exclusão de cards.
- ❌ Replicar ou criar automações do ClickUp no MVP.
- ❌ Adicionar dependência nova sem registrar o porquê em `docs/HISTORICO.md`.
- ❌ Commitar `CLICKUP_API_TOKEN` ou qualquer chave — vão em `.env.local`.

---

## Variáveis de ambiente

| Variável | Para que serve |
|---|---|
| `CLICKUP_API_TOKEN` | Token de acesso à API v2 do ClickUp. Nunca versionar. |

---

## Deploy (Vercel)

- Cada PR gera um **preview** visualizável antes de ir pro ar.
- `main` só recebe código via PR aprovado.
- Variáveis de ambiente ficam no painel da Vercel, não no código.

---

## Histórico vivo

A cada entrega relevante, registrar em `docs/HISTORICO.md` — o quê mudou,
por quê e o que significa para o time, em linguagem de gente. Essa é a
fonte para relatórios de checkpoint e apresentações.
