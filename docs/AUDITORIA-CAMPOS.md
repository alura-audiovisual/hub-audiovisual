# Auditoria dos campos personalizados — pendente

O hub descobre os campos personalizados **pelo nome** (ver `lib/fields.ts`).
A comparação é tolerante: ignora acento, caixa e espaços. Mas se o nome real
no ClickUp for muito diferente do que está mapeado, o campo simplesmente não
aparece no card — sem erro, só vazio.

## Como auditar

Rode este comando (um por board) e compare os nomes que voltarem com os
apelidos listados em `lib/fields.ts`:

```bash
curl -s -H "Authorization: SEU_TOKEN" "https://api.clickup.com/api/v2/list/901305984877/field"
curl -s -H "Authorization: SEU_TOKEN" "https://api.clickup.com/api/v2/list/901303719253/field"
curl -s -H "Authorization: SEU_TOKEN" "https://api.clickup.com/api/v2/list/901304846677/field"
curl -s -H "Authorization: SEU_TOKEN" "https://api.clickup.com/api/v2/list/901310922355/field"
curl -s -H "Authorization: SEU_TOKEN" "https://api.clickup.com/api/v2/list/901327212474/field"
curl -s -H "Authorization: SEU_TOKEN" "https://api.clickup.com/api/v2/list/901314029949/field"
```

O que interessa em cada resposta é o par `"name"` + `"type"` de cada campo.

## Pendências herdadas do CLAUDE.md

- Automações ativas na board Produção — confirmar quais precisam ser respeitadas.
- De quais boards vêm as automações que criam cards em Edição.
- De qual board vem a automação que cria cards em Edição Externa.
- Campo de e-mail do coordenador (pendência do projeto do Slateboard).
