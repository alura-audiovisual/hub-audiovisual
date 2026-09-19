## 2026-09-18 — Campos com busca por digitação, filtros por informação da board e sub-visões por squad

**O quê:** todo campo de escolha do hub virou um componente único, com busca por
digitação e navegação por teclado. A barra de filtros passou a oferecer as
informações que cada board realmente usa. E o Creative Ops ganhou sub-visões por
squad na navegação, mais um boletim de triagem.

**Por quê:** preenchimento de campo é onde o trabalho acontece. Enquanto escolher um
responsável exigia rolar uma lista comprida num seletor com cara de sistema
operacional, o hub continuava parecendo um protótipo — por mais correta que fosse a
estrutura por trás.

**Significa que:** dá para achar uma pessoa digitando três letras do nome ou do
e-mail, achar uma etiqueta digitando parte dela, e filtrar a board por qualquer
informação que o time usa no dia a dia. E cada squad do Creative Ops tem sua própria
entrada na navegação, já filtrada.

---

### Um componente para todo campo de escolha

Criamos o `Combobox`: abre, você digita, a lista filtra enquanto escreve, as setas
navegam e Enter escolhe. A busca ignora acento e maiúscula, e nas pessoas procura
tanto no nome quanto no e-mail — como no ClickUp. Ele substituiu todos os seletores
nativos do hub: responsável, etiqueta, campos do formulário de criação e todos os
filtros da barra. Um único componente significa que qualquer melhoria futura chega em
todos os campos de uma vez.

**P15 · Nenhum seletor nativo restou.** Conferido por varredura: zero `<select>` no
código.

**P16 · Busca por digitação em todo lugar.** Inclusive nos editores dentro do card.

**P17 · Barra de rolagem virou parte da identidade.** Agora vale para a janela inteira
e para toda área rolável, em Chrome, Edge, Safari e Firefox. O ícone do campo de data,
que vinha claro e destoava do tema escuro, também foi acertado.

### Filtros pelas informações de cada board

A barra monta os filtros a partir dos dados que chegaram: Produção filtra por tipo de
estúdio, instrutor, setor e time de coordenação; Edição por pessoa editora, tipo de
produto e trilha; START por time/categoria, editora e designer instrucional; Edição
Externa por editor e tipo de editor; Creative Ops por competência, tipo de demanda,
setor e solicitante. Um filtro só aparece quando existe mais de um valor distinto nas
tarefas — filtro com uma opção só não ajuda ninguém.

### Sub-visões do Creative Ops

Na navegação, o Creative Ops agora abre em quatro entradas — Formatos, Conteúdo,
START e Gestão — cada uma levando à board já filtrada por aquela competência. O
cabeçalho mostra qual squad está em vista.

### Boletim de triagem

Nova página, ligada abaixo das squads: lista os cards parados no Inbox que ainda não
podem avançar, cada um dizendo o que falta (sem responsável, sem etiqueta), com três
números no topo — quantos estão no Inbox, quantos aguardam triagem e quantos já estão
prontos para mover.

### P18 · Etiqueta saiu do Creative Ops

**Decisão que precisa da sua confirmação:** entendi que a etiqueta não faz parte do
vocabulário do Creative Ops, então ela deixou de aparecer no card e no modal daquela
board. Como consequência necessária, a trava de triagem lá passou a exigir apenas
responsável — exigir etiqueta numa board onde ela nem é exibida criaria um bloqueio
impossível de resolver pelo hub. As outras cinco boards seguem exigindo etiqueta e
responsável.

**Quem tocou:** [seu nome].

**Estado:** ✅ concluído — liberado para testes de usabilidade.
