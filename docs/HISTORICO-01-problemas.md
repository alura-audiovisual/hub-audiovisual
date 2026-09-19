## 2026-09-17 — Auditoria: 9 problemas encontrados na primeira versão do Kanban

**O quê:** varredura completa do código do hub depois que o teste com dados reais
revelou dois bugs. A auditoria encontrou mais sete, sendo cinco deles do mesmo tipo:
o hub falhava em silêncio, sem avisar ninguém.

**Por quê:** a entrega anterior foi verificada só por compilação — o TypeScript passava
sem erro, o que criou uma falsa sensação de que estava certo. Compilar não é funcionar.
Nenhum dos nove problemas abaixo apareceria numa checagem de tipos.

**Significa que:** antes de qualquer teste de usabilidade, esses problemas precisam cair.
Testar usabilidade em cima de dados errados só produz conclusão errada.

---

### Problemas de dado — o hub mostra menos do que existe

**P1 · Creative Ops esconde todas as subtarefas.** A board filtrava subtarefas de todas
as colunas. Como no Creative Ops a subtarefa é cidadã da board (nasce no Inbox e corre a
esteira), o Backlog aparecia vazio mesmo com 22 tarefas no ClickUp. *Severidade: crítica
— a board mais complexa mostrava dado incompleto.*

**P2 · Tarefa em status não mapeado some sem avisar.** Se uma tarefa está num status que
não está no mapa de colunas do hub, ela simplesmente não é renderizada em lugar nenhum.
Nenhuma mensagem, nenhum contador. *Severidade: crítica — é a família de bug que gera
"sumiu um card" sem explicação.*

**P3 · Paginação com teto silencioso.** A busca parava na página 12 (cerca de 1.200
tarefas) sem avisar que havia mais. A Edição START já tem 1.065 tarefas. *Severidade:
alta — a board mais carregada estava a uma pequena folga do corte.*

### Problemas de ação — o hub não faz o que promete

**P4 · Exclusão por arraste não funciona.** A zona de lixeira só era criada depois que o
arraste começava. Quando o navegador procura um destino válido, ela ainda não existe —
então soltar não fazia nada. *Severidade: crítica — a única forma de excluir estava
quebrada.*

**P5 · Erro de ação fica invisível atrás do modal.** O aviso de falha era renderizado na
página, e o modal cobre a página inteira. Uma exclusão que falhou na API parecia
simplesmente não ter acontecido. *Severidade: crítica — é o que transforma um erro
comum em bug misterioso.*

**P6 · Conversão em Épico derruba a movimentação inteira.** Ao mover um card para a
coluna ÉPICOS, o hub tenta converter a tarefa em Marco no ClickUp. Se essa conversão
falha (por exemplo, se o ClickApp de Marcos estiver desligado na lista), a movimentação
inteira é desfeita — mesmo tendo dado certo. *Severidade: alta.*

**P7 · Exclusão só existe por arraste.** Sem alternativa por teclado, a função fica
inacessível para quem não consegue arrastar. *Severidade: média — acessibilidade.*

### Problemas de estado

**P8 · Movimentação usa retrato velho do estado.** Ao mover dois cards em sequência
rápida, o desfazer do segundo pode restaurar um estado anterior ao primeiro. *Severidade:
média — só aparece em uso rápido, mas corrompe a tela quando aparece.*

**P9 · Card criado pode nascer invisível.** Se houver filtro ativo, a tarefa recém-criada
entra na lista mas não passa no filtro — e some da vista sem explicação. *Severidade:
média.*

---

**Limitação registrada:** o ambiente onde o código é escrito não alcança
`api.clickup.com`. Isso significa que nenhuma verificação automática contra dados reais
é possível daqui — o teste real acontece sempre na máquina do time. A resposta a essa
limitação não é prometer mais cuidado: é fazer o hub relatar em tela toda divergência
entre o que veio do ClickUp e o que ele conseguiu exibir (ver P2).

**Quem tocou:** [seu nome].

**Estado:** 🔎 diagnóstico concluído — correções na entrada seguinte.
