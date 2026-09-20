# Decisão pendente — Autenticação e governança de usuários

> Este documento existe porque o `CLAUDE.md` determina que banco, ORM ou
> autenticação não entram sem a decisão registrada antes. Não é burocracia:
> as três coisas mudam a fundação do projeto e são caras de desfazer.

## O que muda em relação ao que foi decidido no começo

Três decisões-mãe do projeto são afetadas:

| Decisão original | O que acontece com ela |
|---|---|
| "Sem banco próprio no MVP" | **Cai.** Login exige guardar usuários, senhas e permissões em algum lugar. |
| "Independente por enquanto. Sem login compartilhado com o EfOps" | **Continua.** O login nasce próprio do hub, mas preparado para virar compartilhado. |
| "Todas as boards visíveis por todos. Sem controle de acesso por board" | **Continua verdadeira**, só que agora "todos" significa "todos os autenticados". |

## O problema de segurança que existe hoje

Vale ser direto: **o hub hoje está aberto**. Qualquer pessoa com o endereço
consegue mover card, criar, excluir e comentar — porque o token do ClickUp vive
no servidor e toda rota do hub o usa sem perguntar quem está pedindo. O
endereço não está divulgado, mas isso é obscuridade, não proteção.

Isso significa que o login não é uma melhoria: é o fechamento de um buraco.

## Os três papéis

| Pode… | Administrador | Usuário | Visitante |
|---|---|---|---|
| Ver as boards e os cards | ✅ | ✅ | ✅ |
| Mover, criar, editar e excluir cards | ✅ | ✅ | ❌ |
| Comentar nos cards | ✅ | ✅ | ❌ |
| Ver acervos e links | ✅ | ✅ | ✅ |
| Editar acervos e links | ✅ | ✅ | ❌ |
| Enviar pedido pelo formulário | ✅ | ✅ | ✅ |
| Aprovar novos cadastros | ✅ | ❌ | ❌ |
| Mudar o papel de outras pessoas | ✅ | ❌ | ❌ |
| Ver o registro de quem fez o quê | ✅ | ❌ | ❌ |

**Regra de ouro da implementação:** a permissão é verificada **no servidor**, em
toda rota que escreve. Esconder o botão na tela é conforto, não segurança —
quem souber montar a requisição passaria por cima. A interface esconde o que a
pessoa não pode fazer; o servidor é quem recusa.

## Decisão 1 — Como as pessoas entram

### Opção A · Entrar com a conta Google da Alura *(recomendada)*

A pessoa clica em "Entrar com Google" e usa a conta `@alura.com.br` que já tem.

**A favor:** ninguém cria mais uma senha; o hub nunca guarda senha nenhuma;
quem sai da empresa perde o acesso automaticamente quando o TI desativa a conta;
o segundo fator que a Alura já exige continua valendo; some a necessidade de
"esqueci minha senha", que é onde a maioria dos vazamentos acontece.

**Contra:** depende de alguém com acesso ao Google Cloud da Alura criar uma
credencial (uns 10 minutos de configuração, feita uma vez). Parceiro externo
sem conta Alura precisaria de um caminho alternativo.

### Opção B · E-mail e senha próprios do hub

Como você descreveu: tela de login, cadastro, aprovação do administrador.

**A favor:** independe do TI da Alura; funciona para qualquer pessoa, interna
ou externa; controle total do fluxo.

**Contra:** o hub passa a guardar senhas — mesmo cifradas, é responsabilidade
que não existia; precisa de fluxo de recuperação de senha por e-mail, o que
exige um serviço de envio; quem sai da empresa continua entrando até alguém
lembrar de desativar.

### Opção C · As duas

Google para quem é da Alura, e-mail e senha para parceiros externos.

**Minha recomendação:** começar pela **A**, e acrescentar a B depois se
aparecer necessidade real de acesso externo. Menos peça, menos risco, e o
cadastro com aprovação continua existindo — só que aprovando quem entrou pelo
Google em vez de quem criou senha.

## Decisão 2 — Onde guardar os usuários

Qualquer banco PostgreSQL serve, e o código fica igual nos três casos. O que
muda é de quem é a conta:

- **Neon** — integra direto pelo painel da Vercel, tem plano gratuito
  suficiente para dezenas de usuários. É o caminho de menor atrito.
- **Supabase** — gratuito também, útil se o time já usa para outra coisa.
- **Vercel Postgres** — mesma tecnologia do Neon por dentro.

Precisamos de uma conta criada por vocês; eu não consigo criar. O que vem de
lá é um endereço de conexão que entra nas variáveis de ambiente — nunca no
código, nunca no repositório.

⚠️ **Lembrete importante:** o repositório é **público**. Isso não é um problema
em si — o código pode ser público sem risco. Mas significa que nenhum segredo
pode escapar para dentro dele: nem endereço de banco, nem chave de sessão, nem
token do ClickUp. Tudo continua em variável de ambiente.

## Decisão 3 — Quem pode pedir cadastro

- **Só quem tem e-mail `@alura.com.br`** — parceiro externo entra por convite
  feito por um administrador.
- **Qualquer pessoa pode pedir**, e a aprovação do administrador filtra.

A primeira é mais segura: quem não é da casa nem chega à fila de aprovação.
A segunda é mais flexível para os editores externos e instrutores.

## Decisão 4 — Quem é o primeiro administrador

Alguém precisa aprovar o primeiro cadastro, e essa pessoa não pode depender de
aprovação. A forma mais limpa: uma variável de ambiente com os e-mails que
nascem administradores. Quem estiver nessa lista entra já aprovado e com poder
de aprovar os outros.

Sugestão: os e-mails do Thiago, do Denis e o seu.

## O que será construído, uma vez decidido

1. **Banco** com três tabelas: pessoas, sessões e registro de ações.
2. **Tela de entrada** e, se for a opção B, tela de cadastro.
3. **Fila de aprovação** para administradores: quem pediu acesso, quando, e os
   botões de aprovar, recusar e definir o papel.
4. **Guarda no servidor** em toda rota que escreve — sem exceção.
5. **Trava na borda** (middleware) redirecionando quem não entrou.
6. **Interface consciente do papel**: visitante não vê botão de criar, não
   arrasta card, não comenta. E, de novo: o servidor recusa mesmo assim.
7. **Registro de ações** para os administradores: quem moveu, criou, excluiu e
   quando. Útil para operação, não só para auditoria.
8. **Boas práticas**: senha cifrada com algoritmo lento e proposital (se houver
   senha), sessão em cookie que o JavaScript não alcança, expiração automática,
   limite de tentativas de entrada, e proteção contra requisição forjada de
   outro site.

## O que fica de fora por enquanto

- Controle de acesso **por board**. O `CLAUDE.md` decidiu que todas são
  visíveis por todos, e essa decisão não mudou. O papel controla o que a pessoa
  **faz**, não o que ela **vê**.
- Login compartilhado com o Hub de Eficiência Operacional. Continua planejado,
  e o modelo de usuário nasce compatível para quando for a hora.
