## 2026-09-18 — Card aberto reestruturado, conversa no card e criação com propriedades

**O quê:** o card aberto foi reorganizado conforme o desenho do time: badges e título no
topo, "Mover para" e "Abrir no ClickUp" logo abaixo, e o corpo dividido em Informações à
esquerda e Atividade à direita. Responsáveis e etiquetas agora se editam dentro do hub.
O card ganhou conversa. A criação passou a pedir as propriedades que o card exibe. E um
card não sai mais do Inbox sem triagem.

**Por quê:** até aqui o hub era uma vitrine — mostrava o ClickUp bonito, mas qualquer
alteração real exigia sair dele. Sem editar responsável, sem etiquetar e sem conversar no
card, o time continuaria trabalhando no ClickUp e olhando o hub. Essas três coisas são o
que transforma o hub em lugar de trabalho.

**Significa que:** dá para triar uma demanda inteira sem abrir o ClickUp — pegar o card
no Inbox, definir responsável, etiquetar, comentar com o solicitante e mover para o
Backlog. Era esse o ciclo que faltava.

---

### O que entrou

**Atividade no card.** Lista os comentários do ClickUp, permite comentar, responder e
excluir o próprio comentário. Enter envia, Shift+Enter quebra linha.

**Limitação registrada:** a API v2 do ClickUp expõe os comentários, mas **não expõe o log
de atividades** — "fulano moveu de Backlog para Em trabalho" não está disponível para
quem consome a API. O painel mostra o que a API entrega de verdade: data de criação,
data da última atualização e a conversa. Prometer mais do que isso seria inventar dado.

**Responsáveis editáveis.** Clicar nos avatares abre a lista de membros da lista;
clicar adiciona ou remove, e a gravação é imediata no ClickUp.

**Etiquetas editáveis.** Clicar em "+ Etiqueta" abre as etiquetas do espaço
[Conteúdo] Audiovisual, com busca. O hub só aplica etiqueta que já existe no espaço —
criar etiqueta nova continua sendo no ClickUp, de propósito, para não poluir o espaço
com variações digitadas na pressa.

**"Mover para" virou dropdown no topo**, ao lado de "Abrir no ClickUp", como no desenho.

**Criação com propriedades.** O formulário de cada coluna agora pede, além do nome, o
responsável e as mesmas propriedades que aquele card vai exibir na board: Produção pede
tipo de estúdio e instrutor; Edição pede pessoa editora e tipo de produto; START pede
pessoa editora e time/categoria; Imersões pede data de entrega; Creative Ops pede
competência e tipo de demanda. Os campos são descobertos na própria lista do ClickUp —
se um campo não existir lá, ele não aparece no formulário em vez de quebrar.

**Trava de triagem no Inbox.** Tentar mover um card do Inbox sem etiqueta ou sem
responsável agora é impedido, com a mensagem dizendo exatamente o que falta. A checagem
acontece duas vezes: no hub, para responder na hora, e no servidor lendo o card no
ClickUp, porque o que o navegador acha pode estar desatualizado.

### Correções do check-up

**P10 · Trava de triagem restrita a quem tem Inbox de verdade.** A regra passou a valer
só onde a primeira coluna é um Inbox. A Edição Externa ficou de fora — lá os cards chegam
por automação e a triagem acontece em outro lugar.

**P11 · Cada tipo de campo grava no formato certo.** Data vai em milissegundos, pessoa
vai como lista de ID, rótulos vão como lista, texto e dropdown vão como estão. Campo de
pessoa virou seletor de membros, não mais caixa de texto.

**P12 · Data inválida deixou de virar "NaN" na tela.**

**P13 · Excluir comentário só aparece no próprio comentário.** O hub descobre quem é o
dono do token e esconde o botão nos comentários dos outros, em vez de deixar clicar e
falhar.

**P14 · Falha ao carregar pessoas e etiquetas virou aviso.** A board continua utilizável;
o hub diz que criar e editar ficou limitado até recarregar.

### Em aberto

- Auditar os nomes reais dos campos personalizados (`docs/AUDITORIA-CAMPOS.md`). Enquanto
  isso não é feito, um campo com nome diferente do mapeado simplesmente não aparece no
  formulário nem no card.
- Confirmar se a trava de triagem deve valer também para a Imersões, onde o Inbox recebe
  cards do marketing inbound.

**Quem tocou:** [seu nome].

**Estado:** ✅ concluído — liberado para testes de usabilidade.
