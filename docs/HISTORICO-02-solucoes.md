## 2026-09-17 — Correção dos 9 problemas e mudança de princípio: nada falha em silêncio

**O quê:** corrigimos os nove problemas da auditoria e mudamos uma regra de fundo do
projeto — quando o hub não consegue mostrar algo que existe no ClickUp, ele passa a
dizer isso na tela, com número e motivo.

**Por quê:** cinco dos nove problemas tinham a mesma forma: o hub sabia que algo estava
errado e não contava para ninguém. Card sumia, exclusão não acontecia, busca parava no
meio — tudo sem uma linha de aviso. Corrigir os nove casos e manter o silêncio só
adiaria o próximo susto.

**Significa que:** agora dá para confiar no que a tela mostra, porque ela diz o que
não está mostrando. E o time pode começar os testes de usabilidade sabendo que
divergência de dado vira aviso visível, não mistério.

---

### Correções

**P1 · Subtarefas voltaram ao Creative Ops.** A regra passou a ser por tipo de board:
onde há motor de Épicos, a subtarefa é card da esteira e aparece na coluna com o badge
laranja. Nas boards padrão elas continuam fora — lá são ruído.

**P2 · Contador de divergência.** A board agora compara o que veio do ClickUp com o que
conseguiu colocar em coluna. Sobrou tarefa? Aparece uma faixa dizendo quantas são e em
qual status elas estão. Separa dois casos: status que o hub não mapeou (precisa de
ação nossa) e coluna oculta de propósito (as obsoletas do START).

**P3 · Teto de busca elevado e declarado.** Subiu de 1.200 para 3.000 tarefas por board,
e quando o teto é atingido a tela avisa que está vendo um recorte. Antes truncava calado.

**P4 · Exclusão por arraste consertada.** A zona de destino agora existe desde que o
modal abre. Antes ela só nascia depois que o arraste começava — e o navegador, que
procura um destino válido no instante em que o arraste inicia, não encontrava nada.
Era por isso que soltar não fazia efeito.

**P5 · Erro passou a aparecer onde a pessoa está olhando.** Falha de exclusão aparece
dentro do próprio modal; os demais avisos viraram um aviso flutuante que fica por cima
do modal. Antes o aviso era desenhado atrás dele.

**P6 · Conversão em Épico virou aviso, não fracasso.** Mover um card para a coluna
Épicos primeiro grava a movimentação, depois tenta converter em Marco. Se o ClickUp
recusar a conversão, o card fica onde foi solto e o hub explica o que não deu — em vez
de desfazer a movimentação inteira e parecer que o card "pulou de volta" sozinho.

**P7 · Exclusão por teclado.** Além do arraste, há um caminho de dois passos
("Excluir" → "Confirmar exclusão"). Continua sem `confirm()` nativo, como manda o
CLAUDE.md, e continua exigindo intenção deliberada.

**P8 · Movimentação deixou de usar retrato velho.** O desfazer agora guarda só o status
anterior daquele card, não uma cópia da lista inteira. Mover vários cards em sequência
rápida não se atropela mais.

**P9 · Aviso quando o card novo nasce fora da vista.** Criar tarefa com filtro ativo
agora avisa que ela pode não aparecer por causa do filtro.

### Mudança de princípio

O hub não deve nunca mostrar menos do que existe sem dizer que está fazendo isso.
Toda diferença entre o que a API devolveu e o que a tela renderizou vira número na
interface. Essa regra vale para as próximas construções.

### O que continua sem verificação automática

O ambiente onde o código é escrito não alcança `api.clickup.com`. Nenhum teste contra
dados reais roda de lá — só a checagem de tipos, que não pega nada disso. O contador de
divergência (P2) existe justamente porque a verificação real acontece com o time usando.

### Em aberto para o próximo ciclo

- Confirmar se o Backlog do Creative Ops no ClickUp está sendo visto pela **lista CreOps**
  ou pela **visão da pasta CreativeOps** — a pasta junta CreOps e Imersões, então a
  contagem das duas não bate por definição.
- Auditar os nomes reais dos campos personalizados (ver `docs/AUDITORIA-CAMPOS.md`).
- Confirmar se o ClickApp de Marcos está ativo na lista do Creative Ops.

**Quem tocou:** [seu nome].

**Estado:** ✅ concluído — liberado para testes de usabilidade.
