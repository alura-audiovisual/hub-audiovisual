# Como aplicar esta entrega

## 1. Copiar por cima

Copie o conteúdo desta pasta por cima da pasta do projeto na sua máquina.
Os arquivos abaixo são **substituídos**; nenhum arquivo de configuração
(package.json, tsconfig, next.config, components/ui do shadcn) é tocado.

```
app/globals.css                      (substitui)
app/layout.tsx                       (substitui)
app/page.tsx                         (substitui)
app/not-found.tsx                    (novo)
app/board/[boardId]/page.tsx         (substitui)
app/api/tasks/[boardId]/route.ts     (substitui)
app/api/task/[taskId]/route.ts       (novo)
app/api/move-task/route.ts           (novo)
app/api/create-task/route.ts         (novo)
app/api/delete-task/route.ts         (novo)
components/Sidebar/Sidebar.tsx       (substitui)
components/Board/Board.tsx           (substitui)
components/Board/Column.tsx          (novo)
components/Board/BoardToolbar.tsx    (novo)
components/Card/TaskCard.tsx         (novo)
components/Card/Badges.tsx           (novo)
components/Card/Avatars.tsx          (novo)
components/Filters/Combobox.tsx      (novo — substitui FilterSelect.tsx)
components/Triage/TriagePanel.tsx    (novo)
components/Triage/TriageRow.tsx      (novo)
components/Editors/FieldEditor.tsx   (novo)
components/Editors/DateEditor.tsx    (novo)
components/Editors/DescriptionEditor.tsx (novo)
app/api/task-description/route.ts    (novo)
lib/linkify.tsx                      (novo)
app/api/task-field/route.ts          (novo)
app/api/task-dates/route.ts          (novo)
app/board/[boardId]/triagem/page.tsx (novo)
components/Board/CreateTaskForm.tsx  (novo)
components/Editors/AssigneeEditor.tsx (novo)
components/Editors/TagEditor.tsx     (novo)
components/Activity/ActivityPanel.tsx (novo)
app/api/board-meta/[boardId]/route.ts (novo)
app/api/task/[taskId]/comments/route.ts (novo)
app/api/comment/[commentId]/route.ts (novo)
app/api/task-assignees/route.ts      (novo)
app/api/task-tags/route.ts           (novo)
app/api/me/route.ts                  (novo)
components/Modal/TaskModal.tsx       (novo)
lib/types.ts                         (substitui)
lib/clickup.ts                       (substitui)
lib/boards.config.ts                 (substitui)
lib/ui.ts                            (novo)
lib/fields.ts                        (novo)
lib/board-actions.ts                 (novo)
docs/                                (novo — colar a entrada no HISTORICO.md)
```

⚠️ Apague estes arquivos antigos se ainda existirem:
- `components/Card/Card.tsx` (substituído por `TaskCard.tsx`)
- `components/Filters/FilterSelect.tsx` (substituído por `Combobox.tsx`)

## 2. Conferir

```bash
npm run build
```

Deve aparecer `✓ Finished TypeScript` sem erros e as rotas:
`/`, `/board/[boardId]`, `/api/tasks/[boardId]`, `/api/task/[taskId]`,
`/api/move-task`, `/api/create-task`, `/api/delete-task`.

## 3. Testar com dados reais

```bash
npm run dev
```

Roteiro de teste sugerido, board por board:

- **Produção** — os cards mostram tipo de estúdio, instrutor e data de gravação?
- **Edição** — aparece a Pessoa Editora (diferente do Responsável)?
- **Edição START** — as colunas BACKLOG ÍCONES e FAZENDO ÍCONES sumiram?
- **Imersões** — a data de entrega final aparece no card?
- **Edição Externa** — nenhum botão de criar em nenhuma coluna?
- **Creative Ops** — o filtro de squad aparece? Épicos com badge roxo? Abrindo um
  Épico dá para criar subtarefa?
- **Qualquer board** — arrastar um card de coluna funciona e persiste ao recarregar?

## 4. Commitar

```bash
git add .
git commit -m "feat: Kanban completo com regras por board, motor de Épicos e UX revisada"
git push
```
