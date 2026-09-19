## 2026-09-19 — Menu lateral reestruturado em seções

**O quê:** o menu deixou de ser uma lista de boards e virou o mapa do hub inteiro,
organizado em quatro seções: Boards de Trabalho, Pedidos, Acervos, Ferramentas e
Assinaturas. As seis boards continuam exatamente como estavam, agora aninhadas sob a
primeira seção.

**Por quê:** o hub nasceu como espelho das boards, mas o escopo dele sempre foi
maior — pedidos, documentação, capacitação, controle de ferramentas. Enquanto o menu
mostrava só as boards, esse escopo vivia na cabeça de quem pensou o projeto.

**Significa que:** o time vê para onde o hub está indo, e quem entra novo entende o
tamanho da coisa sem precisar perguntar. As áreas que ainda não existem aparecem no
menu com um ponto discreto e abrem uma página explicando o que virão a ser.

### Decisão: mostrar o que ainda não existe

A alternativa seria esconder os itens até estarem prontos. Preferimos mostrar por
dois motivos. Primeiro, um menu que cresce a cada entrega faz o time reaprender a
navegação toda vez. Segundo, um item visível e marcado como futuro é uma conversa
aberta: se alguém achar que "Armazenamento" deveria ser outra coisa, fala agora e
não depois de construído.

Cada item futuro leva a uma página que diz o que ele vai ser — não uma tela vazia
nem um link morto.

### Três níveis, todos recolhíveis

O menu funciona em três níveis, e cada um abre e fecha:

1. **Seção** — "Boards de Trabalho", "Pedidos", "Acervos", "Ferramentas e
   Assinaturas". Clicar no nome abre ou fecha a seção inteira.
2. **Item** — as boards, os acervos, as ferramentas. Itens com sub-itens têm seu
   próprio toggle.
3. **Sub-item** — as squads do Creative Ops, o Boletim, os acervos específicos.

Ao abrir o hub, só a seção que contém a página atual vem expandida. As outras ficam
recolhidas — assim o menu inteiro cabe na tela sem rolagem, e quem quiser ver o resto
abre o que interessa. Um menu com tudo aberto de uma vez obriga a pessoa a procurar
a board no meio de quinze linhas todos os dias.

### Estrutura

| Seção | Itens |
|---|---|
| Boards de Trabalho | As 6 boards. Creative Ops mantém as sub-visões por squad e o Boletim. |
| Pedidos | Pedidos CreOps *(futuro)* |
| Acervos | Documentação → CreativeOps · Capacitação Externa → Slides no Gamma *(futuros)* |
| Ferramentas e Assinaturas | Estoque de Ferramentas · Armazenamento *(futuros)* |

### Nota técnica

A navegação virou um arquivo só, `lib/navigation.ts`. Adicionar item ali já faz ele
aparecer no menu e ganhar página. Quando uma dessas áreas for construída de verdade,
muda-se o `status` de "planejado" para "pronto" e aponta-se para a tela real.

**Quem tocou:** [seu nome].

**Estado:** ✅ concluído.
