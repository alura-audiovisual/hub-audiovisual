# Configurar o login — passo a passo

São quatro etapas. A ordem importa: sem o banco e as variáveis, o hub não sobe.

## 1 · Instalar as três dependências novas

Na pasta do projeto:

```bash
npm install postgres bcryptjs jose
npm install -D @types/bcryptjs
```

| Pacote | Para quê |
|---|---|
| `postgres` | Conversa com o banco. |
| `bcryptjs` | Cifra as senhas. Versão em JavaScript puro, sem compilar nada. |
| `jose` | Assina o cookie de sessão. Funciona também na borda, onde roda a trava. |

## 2 · Criar o banco no Neon

1. No painel da Vercel, abra o projeto **hub-audiovisual**
2. Aba **Storage** → **Create Database** → **Neon (Postgres)**
3. Escolha a região mais próxima (`São Paulo` ou `Washington D.C.`)
4. Confirme. A Vercel cria a variável `DATABASE_URL` sozinha no projeto

As tabelas são criadas pelo próprio hub no primeiro acesso. Não precisa rodar
script nenhum.

## 3 · Criar as duas variáveis restantes

Ainda na Vercel: **Settings** → **Environment Variables**.

### `AUTH_SECRET`

A chave que assina os cookies de sessão. Gere uma aleatória — no terminal:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

Cole o resultado. **Nunca reaproveite essa chave em outro projeto e nunca a
coloque no repositório.** Trocar essa chave desconecta todo mundo, o que é útil
se algum dia houver suspeita de vazamento.

### `ADMIN_EMAILS`

Os e-mails que nascem administradores, separados por vírgula:

```
thiago.botelho@alura.com.br,denis.santos@alura.com.br,seu.email@alura.com.br
```

Quem está nessa lista entra já aprovado e com poder de aprovar os outros. Sem
isso, o primeiro cadastro ficaria esperando uma aprovação que ninguém poderia
dar.

## 4 · Rodar localmente

No arquivo `.env.local`, acrescente as mesmas três variáveis:

```
CLICKUP_API_TOKEN=pk_seu_token
DATABASE_URL=postgres://...          # copie do painel do Neon
AUTH_SECRET=a-chave-que-voce-gerou
ADMIN_EMAILS=seu.email@alura.com.br
```

Depois:

```bash
npm run build
npm run dev
```

Abra `http://localhost:3000` — você será levado para a tela de entrada. Clique em
**Pedir cadastro**, use um e-mail que esteja em `ADMIN_EMAILS`, e você entra já
como administrador.

---

## Como funciona na prática

**Alguém novo da Alura quer acesso:** vai em `/cadastro`, usa o e-mail
`@alura.com.br`, cria senha. O cadastro nasce **pendente**. Um administrador
abre **Pessoas e acessos** na barra lateral, vê o pedido na fila e escolhe
aprovar como Usuário ou como Visitante.

**Alguém de fora da Alura:** não consegue se cadastrar sozinho. Um administrador
vai em **Pessoas e acessos**, gera um convite para o e-mail dela e envia o link.
O link vale sete dias e funciona uma vez só.

**Tirar o acesso de alguém:** na mesma tela, botão **Suspender**. O efeito é
imediato — a sessão aberta dela para de funcionar na próxima ação.

**Mudar o papel de alguém:** o seletor de papel na linha da pessoa. Também tem
efeito imediato, pelo mesmo mecanismo.

⚠️ Um administrador não consegue rebaixar nem suspender a si mesmo. É proposital:
é assim que uma organização acorda sem ninguém que possa aprovar ninguém.

## O que muda para quem usa

| Papel | O que vê | O que faz |
|---|---|---|
| **Administrador** | Tudo | Tudo, mais aprovar cadastros e mudar papéis |
| **Usuário** | Tudo | Move, cria, edita, exclui e comenta |
| **Visitante** | Tudo | Só lê. Não vê botão de criar, não arrasta card, não comenta |

## Sobre segurança, em linguagem simples

**As senhas não são guardadas.** O que fica no banco é um resumo embaralhado
delas, feito por um algoritmo lento de propósito — mesmo com o banco na mão,
ninguém descobre a senha de ninguém em tempo útil.

**O cookie de sessão não é acessível pelo JavaScript da página.** Se algum dia um
script malicioso entrar na página, ele não consegue roubar a sessão.

**Cinco erros de senha bloqueiam a conta por quinze minutos.** Isso derruba a
tentativa de descobrir senha por força bruta.

**A resposta de erro é sempre a mesma** — "e-mail ou senha incorretos" — e demora
o mesmo tanto, exista ou não a conta. Mensagem diferente entregaria quais e-mails
têm cadastro.

**A permissão é conferida no servidor, em toda ação que escreve.** Esconder o
botão na tela é conforto; quem recusa de verdade é o servidor. As duas coisas
existem, e a segunda é a que importa.

**Fica registrado quem fez o quê:** entradas, tentativas negadas, aprovações,
mudanças de papel e convites criados.
