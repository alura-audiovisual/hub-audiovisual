## 2026-09-18 — Check-up após a reestruturação do card: 5 problemas encontrados

**O quê:** varredura do código depois de reestruturar o card aberto, adicionar
comentários, edição de responsáveis e etiquetas, formulário de criação com
propriedades e a trava de triagem do Inbox.

**Por quê:** funcionalidade nova é onde bug novo nasce. Como o ambiente de
desenvolvimento não alcança a API do ClickUp, a auditoria de código é a única
rede antes do teste com o time — então ela precisa ser feita com método, não por
impressão.

---

**P10 · A trava de triagem travaria a Edição Externa.** A regra "não sai do Inbox sem
etiqueta e sem responsável" foi escrita olhando para a primeira coluna de cada board.
Só que a Edição Externa começa em "Backlog edição externa" e recebe cards por automação,
frequentemente sem etiqueta. A tech lead ficaria impedida de mover card para Editando ou
Pago. *Severidade: crítica — a regra criaria um bloqueio onde não existe triagem.*

**P11 · Criação gravaria campo em formato errado.** O formulário mandava todo valor como
texto. Campo de data espera milissegundos, campo de pessoa espera lista de IDs, campo de
rótulos espera lista. Só campo de texto e dropdown funcionariam; o resto falharia na
gravação. Pior: campo de pessoa aparecia como caixa de texto livre, pedindo que alguém
digitasse um nome que nunca seria aceito. *Severidade: alta.*

**P12 · Data inválida virava "há NaN min".** Se a API devolvesse data em formato
inesperado, a tela mostrava um erro cru no lugar do tempo. *Severidade: baixa, mas é o
tipo de detalhe que faz a interface parecer quebrada.*

**P13 · Botão de excluir comentário aparecia em comentário dos outros.** O ClickUp recusa
a exclusão de comentário alheio — então o botão existia, era clicável, e só falhava
depois. Botão que não funciona é pior que botão ausente. *Severidade: média.*

**P14 · Falha ao carregar pessoas e etiquetas era silenciosa.** Se a busca de metadados
falhasse, o formulário de criação simplesmente aparecia sem os campos e os editores sem
opções — sem nenhuma explicação. *Severidade: média — mesma família dos problemas P2 e P5.*

**Quem tocou:** [seu nome].

**Estado:** 🔎 diagnóstico concluído — correções na entrada seguinte.
