## 2026-09-18 — Etiqueta fora do Creative Ops e herança completa nas subtarefas

**O quê:** a propriedade Etiquetas deixou de existir na board Creative Ops — não
aparece no card, não aparece no modal e não é exigida para mover card do Inbox. E a
subtarefa criada dentro de um Épico passou a herdar todas as informações visíveis do
pai, não só três campos.

**Por quê:** o time não usa etiqueta no Creative Ops; lá a organização é por
Competência e Tipo de Demanda. Manter o campo ali gastava espaço no card e, pior,
a trava de triagem exigia uma etiqueta que ninguém ia preencher — o card ficaria
preso no Inbox sem saída. Sobre a herança: quem cria dez subtarefas de um Épico não
deveria reescrever o mesmo contexto dez vezes.

**Significa que:** no Creative Ops, triar um card é só definir o responsável. E cada
subtarefa nasce já legível na board, com competência, tipo de demanda, setor,
solicitante e os links do projeto vindos do Épico.

### Etiqueta: só no Creative Ops

O ajuste vale para essa propriedade e só para ela. As outras cinco boards seguem
exatamente como estavam, exibindo e exigindo etiqueta. Nenhum outro campo do Creative
Ops foi tocado.

Como a etiqueta não existe mais naquela board, a trava de triagem lá passou a pedir
apenas o responsável. Nas demais continua pedindo etiqueta e responsável.

### Herança: tudo que é visível, menos duas coisas

A subtarefa herda todos os campos que o Épico exibe — competência, tipo de demanda de
design, setor demandante, solicitante, ID visual e documentação. Duas exceções, e só
duas:

- **Responsável não herda.** É exatamente o que a triagem existe para definir antes
  do card sair do Inbox.
- **Datas não herdam.** Cada subtarefa tem prazo próprio.

A etiqueta também deixou de ser copiada do Épico para a subtarefa no Creative Ops,
pela mesma razão: ela não é usada nem exibida ali. Nas boards que usam etiqueta, a
herança continua.

**Quem tocou:** [seu nome].

**Estado:** ✅ concluído.

---

### Ajuste posterior — Tipo de demanda de design não herda mais

**O quê:** no Creative Ops, a subtarefa deixou de herdar o "Tipo de demanda de
design" do Épico pai. O campo continua aparecendo no card e no formulário de
criação da subtarefa — só não vem preenchido automaticamente.

**Por quê:** um Épico pode reunir subtarefas de tipos de demanda diferentes entre
si (por exemplo, um Épico de "Identidade Visual" pode ter subtarefas de Ilustração
e de Animação). Herdar o tipo do pai faria a subtarefa nascer com uma classificação
que talvez nem seja a dela.

**Significa que:** dos campos que o card do Creative Ops exibe — competência, tipo
de demanda, setor demandante e solicitante — só o tipo de demanda ficou de fora da
herança. Os outros três continuam vindo prontos do Épico.

**Quem tocou:** [seu nome].

**Estado:** ✅ concluído.
