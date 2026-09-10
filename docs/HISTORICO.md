# Histórico do Projeto — Creative Ops Hub

Este documento conta a **história do projeto para humanos**. Não é changelog
técnico. Cada entrada explica: o que mudou, por que mudou, e o que isso
significa para o time. É a fonte para relatórios de checkpoint e apresentações.

**Como usar:** a cada entrega relevante, adicione uma entrada nova no topo
(mais recente primeiro), seguindo o modelo abaixo.

---

## Modelo de entrada

```
## AAAA-MM-DD — Título curto da entrega

**O quê:** o que foi feito, em 1-2 frases sem jargão.
**Por quê:** a motivação — que dor resolve ou que decisão representa.
**Significa que:** o impacto prático para o time no dia a dia.
**Quem tocou:** nome(s) de quem trabalhou nisso.
**Estado:** ✅ concluído · 🚧 em andamento · 🔎 em validação
```

---

2026-09-10 — Infraestrutura base: deploy no Vercel e arquivos lib/

O quê: colocamos o projeto no ar via Vercel (hub-audiovisual.vercel.app) e criamos os três arquivos que formam a fundação técnica do hub: lib/types.ts, lib/boards.config.ts e lib/clickup.ts.

Por quê: sem esses arquivos nenhum componente visual pode ser construído com segurança. Eles definem as "regras da fiação": como os dados se parecem, onde cada board vive, e que toda chamada ao ClickUp passa por um único lugar.

Significa que: o time agora tem uma URL pública para acompanhar o progresso (cada push atualiza automaticamente). E qualquer desenvolvedor que entrar no projeto vai encontrar uma base tipada, sem any, com as regras de negócio das 6 boards já mapeadas em código.

O que foi entregue:

Deploy contínuo no Vercel — cada push na main atualiza o site automaticamente
Cada Pull Request gera um link de preview próprio
Repositório público em github.com/alura-audiovisual/hub-audiovisual
Colaboradores adicionados: Thiago Botelho e Denis Santos
lib/types.ts — tipagem completa de tarefas, épicos, subtarefas, boards e payloads (zero any)
lib/boards.config.ts — mapa oficial das 6 boards com list_ids, regras de ocultação e restrições
lib/clickup.ts — porta única para a API do ClickUp (getTasksByList, getTask, moveTask, createTask, convertToEpic, updateCustomField, deleteTask, getListStatuses)

Pendências registradas no código (⚠️ confirmar com o time):

IDs reais de status de cada board (hoje são placeholders — precisam ser buscados via API)
Confirmar automações ativas na board Produção
Confirmar de quais boards vêm as automações que criam cards em Edição e Edição Externa
Confirmar que o list_id 901314029949 é mesmo o do Creative Ops (tipo: epics)

Quem tocou: [seu nome].

Estado: ✅ concluído.

---

## 2026-09-03 — Mapeamento completo das 6 boards e definição das regras de negócio

**O quê:** levantamos board por board como elas funcionam de verdade —
colunas, campos, regras de criação, restrições e particularidades de cada uma.
Isso resultou na primeira versão sólida do `CLAUDE.md`, o documento de regras
que vai guiar toda a construção do hub.

**Por quê:** o projeto anterior não tinha essas regras escritas em lugar nenhum.
O código tentava adivinhar coisas que deveriam estar documentadas — como qual
board usa Épicos, ou quais campos uma subtarefa herda do pai. Qualquer mudança
pequena quebrava outra coisa porque não havia uma "constituição" do projeto.

**Significa que:** agora qualquer pessoa do time (ou o Claude Code) pode
consultar o `CLAUDE.md` e entender exatamente como cada board funciona antes
de tocar no código. As regras de negócio saíram da cabeça de quem sabe e
foram para um documento vivo.

**Boards mapeadas:**
1. **Produção** — tarefas de gravação, 14 colunas, 4 tipos de estúdio
2. **Edição** — conteúdos complexos, chegam por automação, distinção Responsável × Editora
3. **Edição START** — produto de ensino público, grade curricular brasileira, 2 colunas obsoletas identificadas e bloqueadas
4. **Imersões** — formato intensivo de lançamento, criado pelo marketing inbound
5. **Edição Externa** — gestão de fornecedores terceiros, criação bloqueada, dimensão financeira
6. **Creative Ops** — board mais complexa, motor de Épicos/Subtarefas, 4 squads, filtro por competência

**Decisões tomadas nesta fase:**
- Modelo Espelho (hub reconstrói os Kanbans, não apenas emoldura o ClickUp)
- Design System azul Alura (mesma identidade do Hub de Eficiência Operacional)
- Sem automações no MVP
- Sem controle de acesso por board no MVP
- Herança de campos nas subtarefas do Creative Ops definida com precisão

**Quem tocou:** [seu nome].

**Estado:** ✅ concluído.

---

## 2026-09-03 — Diagnóstico do legado e definição de rumo

**O quê:** analisamos a primeira versão do hub (construída com o Gemini) e
identificamos a causa raiz da "deterioração": dois projetos com arquiteturas
incompatíveis conviviam na mesma pasta — um que emoldurava o ClickUp via
iframe, outro que tentava recriar os Kanbans do zero. Isso fazia qualquer
mudança quebrar outra coisa sem aviso.

**Por quê:** antes de reconstruir, era essencial entender o que afundou a
versão anterior para não repetir os mesmos erros.

**Significa que:** o conhecimento valioso do legado — as regras de negócio
das boards e a lógica de Épicos/Subtarefas — foi preservado. O código
problemático foi descartado. Partimos de uma fundação clara.

**Quem tocou:** [seu nome].

**Estado:** ✅ concluído.
