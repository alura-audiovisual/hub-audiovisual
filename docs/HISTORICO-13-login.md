## 2026-09-20 — Login, papéis e governança de acesso

**O quê:** o hub deixou de ser aberto. Passa a exigir entrada com e-mail e senha,
cadastro com aprovação de administrador, e três papéis com poderes diferentes.

**Por quê:** até hoje qualquer pessoa com o endereço conseguia mover, criar e
excluir card — porque o token do ClickUp vive no servidor e as rotas o usavam sem
perguntar quem estava pedindo. O endereço não estava divulgado, mas isso é
obscuridade, não proteção. O login não é melhoria: é o fechamento de um buraco.

**Significa que:** o time pode divulgar o endereço internamente sem risco, e cada
ação no ClickUp passa a ter dono identificado.

### Decisões-mãe afetadas

| Decisão original | O que aconteceu |
|---|---|
| "Sem banco próprio no MVP" | **Caiu.** Login exige guardar pessoas e permissões. |
| "Todas as boards visíveis por todos" | **Continua** — agora "todos" significa "todos os autenticados". O papel controla o que a pessoa **faz**, não o que **vê**. |
| "Independente do EfOps por enquanto" | **Continua.** O modelo de usuário nasce compatível para a integração futura. |

As escolhas foram do time: e-mail e senha próprios (não SSO do Google), banco no
Neon pela Vercel, e cadastro aberto só para `@alura.com.br` — quem é de fora entra
por convite.

### Os três papéis

**Administrador** faz tudo, mais aprovar cadastros, mudar papéis e ver o registro
de ações. **Usuário** move, cria, edita, exclui e comenta. **Visitante** só lê:
não vê botão de criar, não consegue arrastar card e não comenta.

### Onde a segurança realmente mora

A interface esconde o que a pessoa não pode fazer, mas **quem recusa é o
servidor**. Toda rota que escreve — são treze — chama uma guarda que confere
sessão, situação e permissão antes de agir. Esconder o botão sem travar a rota
seria teatro: quem soubesse montar a requisição passaria por cima.

São duas camadas: uma trava na borda, que confere a assinatura do cookie antes da
página carregar, e a guarda nas rotas, que lê o banco a cada escrita. A segunda
existe porque a primeira não alcança o banco — e é ela que faz suspender alguém
ter efeito imediato, sem esperar o cookie expirar.

### Cuidados que entraram

- Senha guardada como resumo cifrado por algoritmo lento de propósito.
- Cookie que o JavaScript da página não alcança, com validade de oito horas.
- Cinco erros bloqueiam a conta por quinze minutos.
- Resposta de erro sempre igual e com a mesma demora, exista ou não a conta —
  senão daria para descobrir quais e-mails têm cadastro medindo o tempo.
- Mudança de papel ou suspensão invalida as sessões abertas da pessoa.
- Administrador não consegue rebaixar nem suspender a si mesmo. É assim que uma
  organização acorda sem ninguém que possa aprovar ninguém.
- Registro de ações: entradas, tentativas negadas, aprovações, mudanças de papel
  e convites.

### Duas armadilhas encontradas durante a construção

**O truque de tempo estava frágil.** Para não denunciar pela velocidade da
resposta que um e-mail não existe, o código comparava a senha contra um hash
inventado. Testando, descobriu-se que funciona por acaso — depende de um
comportamento não documentado da biblioteca. Trocado por um hash real de descarte,
que gasta o tempo certo por construção, não por sorte.

**Havia SQL montado por concatenação** no cálculo do bloqueio por tentativas.
Mesmo com valor controlado por nós, é o caminho mais curto para uma injeção.
O instante de desbloqueio passou a ser calculado antes e gravado como data.

### Configuração necessária

Ver `docs/CONFIGURAR-LOGIN.md`. Resumo: três dependências novas, um banco Neon
criado pelo painel da Vercel, e duas variáveis de ambiente (`AUTH_SECRET` e
`ADMIN_EMAILS`).

**Quem tocou:** [seu nome].

**Estado:** 🔎 em validação — precisa do banco criado e do primeiro administrador
entrando para virar concluído.
