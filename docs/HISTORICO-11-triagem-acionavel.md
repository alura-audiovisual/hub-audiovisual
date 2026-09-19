## 2026-09-19 — Boletim de triagem virou ferramenta de trabalho

**O quê:** o boletim deixou de ser só um relatório do que está parado. Agora cada
linha permite definir o que falta e mover o card para o Backlog sem sair da página.

**Por quê:** o boletim mostrava a pendência e mandava a pessoa resolver em outro
lugar — abrir a board, achar o card, abrir o modal, definir responsável, fechar,
arrastar. Cinco passos para uma decisão que é uma só: "este card é seu, pode andar".

**Significa que:** dá para triar uma fila inteira de uma sentada. Abre o boletim,
define responsável em cada card, clica em mover. O card sai da lista e entra na
esteira.

### Como funciona

Cada linha traz os mesmos editores do card aberto: responsável com busca por nome ou
e-mail, e etiquetas nas boards que as usam. O que falta aparece marcado em amarelo
ao lado do rótulo do campo.

O botão de mover fica desabilitado enquanto os requisitos não estão cumpridos, e o
texto ao passar o mouse diz exatamente o que falta. **A regra vira estado da
interface, não erro depois do clique** — a pessoa vê que não pode antes de tentar,
em vez de tentar e ser recusada.

Quando os requisitos são cumpridos, a borda da linha fica verde e o botão libera. O
destino é sempre a coluna seguinte ao Inbox — Backlog em todas as boards que têm
triagem.

### Detalhe de comportamento

O hub grava no ClickUp e re-lê de lá a cada alteração, então o card na linha reflete
o estado real, não o que o navegador supõe. A mesma trava de triagem do servidor
continua valendo: mesmo que algo escape da interface, a API recusa mover card não
triado.

**Quem tocou:** [seu nome].

**Estado:** ✅ concluído.

---

### Adendo — Alerta de prazo na triagem

**O quê:** cards com prazo vencido ou a vencer em uma semana ou menos passaram a
aparecer primeiro no boletim, com marcação visual.

**Por quê:** um card sem responsável e com prazo em dois dias é um problema
diferente de um card sem responsável e sem prazo. A lista tratava os dois igual, e a
pessoa triando não tinha como saber por onde começar.

**Como aparece:**
- Faixa vertical na lateral esquerda da linha — vermelha para vencido, amarela para
  o que vence em até sete dias.
- Selo abaixo do nome dizendo quanto falta em linguagem de gente: "vence hoje",
  "vence amanhã", "3 dias", "venceu há 2 dias", seguido da data.
- Borda da linha acompanha a cor do alerta.
- Novo número no resumo do topo, contando os cards nessa situação. Ele só aparece
  quando há algum — resumo com zero permanente vira ruído.

**Ordem da lista:** vencidos primeiro, depois os que vencem em até sete dias, depois
os pendentes de triagem sem pressa de prazo, e por último os que já podem avançar.
Dentro de cada grupo, o mais recente primeiro.

**Detalhe de cálculo:** a contagem de dias compara datas no início do dia, não o
instante exato. Sem isso um prazo para amanhã de manhã apareceria como "0 dias"
porque faltam menos de 24 horas.

**Estado:** ✅ concluído.
