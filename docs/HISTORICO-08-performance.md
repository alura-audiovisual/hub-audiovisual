## 2026-09-18 — Bug de criação, boletim completo e carregamento paralelo

**O quê:** corrigimos um erro que derrubava a board inteira ao abrir o formulário de
criação, o boletim passou a listar todo o Inbox (não só o que está pendente), e o
carregamento das tarefas foi reescrito — de sequencial para paralelo, com cache curto
e medição visível.

---

### Bug · Membro sem nome derrubava a board

**O que acontecia:** ao abrir o formulário de criação, a tela quebrava com
"Cannot read properties of null (reading 'split')".

**Por quê:** o ClickUp devolve `username: null` para quem foi convidado para a lista
mas ainda não completou o cadastro. O hub tentava extrair as iniciais desse nome
inexistente e a board inteira caía junto — um dado incomum de uma pessoa derrubava a
página de todo mundo.

**Correção em duas camadas:**
1. Na origem, quem vem sem nome passa a ser exibido pela parte do e-mail antes do @ —
   a pessoa aparece na lista em vez de sumir.
2. Nas funções de exibição, nome vazio virou caso previsto, não exceção. Todos os
   pontos que mostram nome de pessoa passaram a usar o mesmo helper.

---

### Boletim de triagem agora mostra o Inbox inteiro

Os três números no topo continuam iguais — total no Inbox, aguardando triagem,
prontos para mover. Mudou a lista abaixo: antes só os pendentes, agora todos, com os
pendentes primeiro e os prontos marcados em verde. Assim o boletim serve tanto para
agir quanto para ter a visão do que está entrando.

---

### Carregamento: o que era, o que virou

**Medição do problema.** A API do ClickUp devolve 100 tarefas por página e não informa
o total — então é preciso pedir página por página até uma vir vazia. O hub fazia isso
em fila: pedia a página 1, esperava a resposta, pedia a 2, esperava… Com os volumes
reais de cada board:

| Board | Tarefas | Páginas | Antes (em fila) | Agora (em lotes) |
|---|---|---|---|---|
| Imersões | 84 | 1 | 1 chamada | 1 chamada |
| Edição Externa | 105 | 2 | 2 em fila | 2 juntas |
| Produção | 149 | 2 | 2 em fila | 2 juntas |
| Creative Ops | 387 | 4 | 4 em fila | 4 juntas |
| Edição | 422 | 5 | 5 em fila | 5 juntas |
| Edição START | 1.065 | 11 | **11 em fila** | 2 rodadas de até 6 |

**Resposta à pergunta "a espera é normal e herdada do ClickUp?"** Em parte. O limite
de 100 tarefas por página é do ClickUp e não dá para contornar. O que era nosso — e
foi corrigido — é o fato de esperarmos cada página antes de pedir a seguinte. Na
Edição START, onze esperas viravam a soma de onze; agora o tempo é o da chamada mais
lenta de cada lote. Na prática a board mais pesada deve cair para algo próximo de um
quinto do que era.

**Cache curto.** Trocar de board e voltar refazia tudo. Agora a resposta fica guardada
por 45 segundos. É curto de propósito: o ClickUp continua sendo a fonte da verdade, e
cache longo faria o hub mostrar estado velho — o que o CLAUDE.md proíbe. Além do
tempo, **toda escrita invalida a lista afetada na hora**: mover, criar, excluir,
etiquetar ou trocar responsável limpa o cache daquela board imediatamente. O botão
"Atualizar" sempre ignora o cache e vai direto ao ClickUp.

**Medição visível.** Passar o mouse sobre o botão "Atualizar" mostra quanto a última
carga levou e quantas chamadas foram feitas — ou que veio do cache. Sem isso, qualquer
conversa sobre lentidão vira impressão; com isso, vira número.

**Quem tocou:** [seu nome].

**Estado:** ✅ concluído — falta confirmar os ganhos com dados reais na máquina do time.
