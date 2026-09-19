## 2026-09-17 — Varredura completa: Kanban funcional, correções de API e UX revisada

**O quê:** reconstruímos o hub inteiro a partir de uma varredura completa. As boards
agora carregam de verdade do ClickUp, os cards mostram os campos certos de cada board,
dá para arrastar card entre colunas, criar tarefa direto na coluna, abrir o detalhe num
modal e excluir arrastando até a lixeira. O motor de Épicos do Creative Ops entrou.

**Por quê:** a primeira versão do Kanban provava que a busca de dados funcionava, mas
não tinha nem as regras de cada board nem qualidade de uso. Além disso, a varredura
encontrou três erros que fariam a escrita no ClickUp falhar silenciosamente.

**Significa que:** o time já consegue operar as boards pelo hub, não só olhar. E as
particularidades de cada board — colunas obsoletas escondidas, criação bloqueada na
Edição Externa, herança de campos nas subtarefas — deixaram de ser documento e viraram
comportamento.

### Três correções de API (armadilhas que o legado não tinha mapeado)

1. **Status na escrita vai por nome, não por ID.** A API v2 do ClickUp recusa o ID no
   `PUT /task`. Agora cada coluna guarda as duas identidades: o `statusId` (que o hub
   usa para comparar e agrupar, conforme a regra do CLAUDE.md) e o `apiStatus` (nome
   exato, usado só no instante de falar com a API).
2. **Épico usa `custom_item_id: 1`.** O CLAUDE.md registrava `custom_type: milestone`,
   que não existe na v2.
3. **Subtarefa não tem endpoint próprio.** Cria-se na lista passando `parent` — não
   existe `POST /task/{id}/subtask`.

### Fonte de informação dos cards

Criamos `lib/fields.ts`: o único lugar que conhece os nomes reais dos campos
personalizados do ClickUp. O resto do hub pede o campo por chave semântica
(ex: `pessoaEditora`) e recebe o valor já formatado — dropdown resolvido para o rótulo,
data em formato brasileiro, moeda em reais, campo de pessoa virando nome. A comparação
de nomes ignora acento, caixa e pontuação, então pequenas diferenças de grafia entre
boards não quebram nada.

### Decisões de UX (heurísticas de Nielsen aplicadas)

- **Visibilidade do status do sistema:** contador por coluna, "atualizado há X min",
  esqueleto de carregamento, estado de salvando ao mover.
- **Controle e liberdade:** mover card é otimista e se a API falhar o card volta
  sozinho para a coluna de origem, com aviso. Esc fecha o modal.
- **Prevenção de erro:** exclusão exige arrastar até a zona de lixeira (sem `confirm()`
  nativo); criação nem é renderizada na Edição Externa, e o motivo aparece escrito.
- **Reconhecer em vez de lembrar:** cada card mostra no máximo 3 campos da board, além
  de responsáveis, prazo e etiquetas. Prazo vencido fica vermelho.
- **Estética e minimalismo:** só prioridade urgente e alta viram sinal visual; colunas
  de arquivo (Fechados/Concluído) nascem recolhidas para não competir com o fluxo ativo.
- **Recuperação de erro:** banner explica o que houve, o que verificar e oferece
  "tentar de novo".
- **Acessibilidade:** foco sempre visível, cards operáveis por teclado, modal com
  `role="dialog"`, e uma lista "Mover para" dentro do modal — caminho de teclado para
  quem não consegue arrastar. `prefers-reduced-motion` respeitado.
- **Desempenho:** cada coluna renderiza 25 cards por vez (a Edição START tem mais de
  mil tarefas) com "mostrar mais" sob demanda.

### Entregue

- `lib/ui.ts`, `lib/fields.ts`, `lib/board-actions.ts` (novos)
- `lib/types.ts`, `lib/clickup.ts`, `lib/boards.config.ts` (reescritos)
- Rotas: `tasks/[boardId]`, `task/[taskId]`, `move-task`, `create-task`, `delete-task`
- Componentes: `Board`, `Column`, `BoardToolbar`, `TaskCard`, `Badges`, `Avatars`,
  `TaskModal`, `Sidebar`
- `app/globals.css` com a paleta completa do DS e tokens novos para Épico e Subtarefa

**Quem tocou:** [seu nome].

**Estado:** 🔎 em validação — precisa de teste com dados reais antes de virar concluído.
