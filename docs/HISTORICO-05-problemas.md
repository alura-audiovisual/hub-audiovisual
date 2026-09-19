## 2026-09-18 — Check-up de preenchimento de campos: 5 problemas

**O quê:** varredura focada nos pontos de entrada de dado do hub — formulário de
criação, editores de responsável e etiqueta, barra de filtros — antes de abrir para
os testes de usabilidade.

**Por quê:** o teste anterior mostrou que a estrutura estava certa, mas o
preenchimento de campo não seguia padrão nenhum. Campo de escolha é onde o trabalho
de verdade acontece; se ele é ruim, o resto não importa.

---

**P15 · Campos de escolha usavam o seletor nativo do navegador.** O `<select>` do HTML
abre com o visual do sistema operacional, não com o nosso: fonte diferente, cores
diferentes, cantos diferentes. Num hub que existe para ter identidade própria, era o
elemento mais usado e o único fora do padrão. *Severidade: alta — quebra a identidade
justamente no ponto de maior uso.*

**P16 · Não dava para buscar digitando.** Escolher responsável numa lista de dezenas
de pessoas exigia rolar até achar. O ClickUp resolve isso deixando digitar nome ou
e-mail e filtrando enquanto se escreve — o hub não fazia nada disso. *Severidade: alta
— é o que torna o campo usável quando a lista é grande.*

**P17 · Barra de rolagem sem identidade.** A `.hub-scroll` só era aplicada em algumas
áreas, e mesmo lá não funcionava no Firefox. O resto da interface usava a barra cinza
padrão do sistema. *Severidade: média.*

**P18 · Etiqueta aparecia no Creative Ops sem ser usada.** A board organiza por
Competência e Tipo de Demanda; a etiqueta ali ocupava espaço no card e no modal sem
significar nada para o time. Pior: a trava de triagem exigia etiqueta para sair do
Inbox numa board onde a etiqueta não faz parte do fluxo. *Severidade: alta — a regra
criaria um bloqueio impossível de satisfazer.*

**P19 · Só dava para filtrar por prazo, prioridade e responsável.** As informações que
o time realmente usa para achar card — tipo de estúdio, pessoa editora, competência,
setor demandante — não eram filtráveis. *Severidade: média.*

**Quem tocou:** [seu nome].

**Estado:** 🔎 diagnóstico concluído — correções na entrada seguinte.
