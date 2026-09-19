## 2026-09-18 — Campo vazio virou convite para preencher

**O quê:** todo campo que a board exibe agora aparece no card aberto, preenchido ou
não. Vazio, ele mostra "Adicionar <campo>" em traço pontilhado e abre para
preenchimento ali mesmo. Datas de início e prazo entraram como campos editáveis. E
link colado em texto virou link clicável.

**Por quê:** até aqui o modal escondia o que estava em branco. Um card sem prazo não
mostrava "prazo" em lugar nenhum — mostrava a ausência do assunto. Para preencher,
a pessoa precisava saber de cor quais campos existiriam e ir ao ClickUp. Esconder
campo vazio economiza pixel e cobra da memória de quem usa.

**Significa que:** dá para completar um card inteiro dentro do hub. Abrir, ver o que
está faltando marcado, clicar e preencher.

### Como ficou

**Campo vazio não some.** Aparece com o rótulo e um botão pontilhado. Campo
preenchido mostra o valor e revela o lápis ao passar o mouse.

**Cada tipo abre do jeito certo.** Lista fechada abre o campo de busca com as opções
do ClickUp; campo de pessoa abre a lista de membros com busca por nome ou e-mail;
data abre calendário; texto abre caixa de texto. Enter salva, Esc cancela.

**Datas.** Início e prazo viraram campos de verdade, preenchíveis e alteráveis. Prazo
vencido aparece em vermelho com a marca "vencido". A data é gravada ao meio-dia de
propósito — gravar à meia-noite faz o prazo aparecer um dia antes para quem está em
fuso diferente.

**Campo que não existe na lista.** Quando o campo está no nosso mapa mas não existe
naquela lista do ClickUp, o hub diz isso em vez de oferecer um preenchimento que
falharia.

### Links clicáveis

Descrição e campos de texto costumam trazer links colados como texto puro — Figma,
Drive, SharePoint, Dropbox. Agora eles são detectados e viram links de verdade.
Pontuação no fim da frase fica de fora do endereço.

### Texto extravasando

Duas causas, as duas corrigidas. A primeira: contêineres de largura flexível sem
largura mínima declarada — sem isso o texto empurra a coluna em vez de quebrar.
A segunda: URLs de SharePoint passam de 200 caracteres sem um único espaço, e
quebra de linha normal não tem onde quebrar. Os estilos de título de card e de
metadado agora quebram em qualquer ponto quando não há alternativa, e os links
quebram no meio do endereço.

**Quem tocou:** [seu nome].

**Estado:** ✅ concluído.

---

### Adendo — Descrição editável

**O quê:** a descrição do card entrou no mesmo padrão dos outros campos. Vazia,
aparece como "Adicionar descrição" em traço pontilhado; preenchida, mostra o texto
com um lápis ao lado para editar.

**Por quê:** a descrição era o único campo que ainda sumia quando estava vazio — e é
justamente onde mora o briefing da demanda. Um card sem descrição não dava nenhuma
pista de que aquele espaço existia.

**Como funciona:** clicar abre uma caixa de texto de oito linhas, redimensionável.
Ctrl+Enter salva, Esc cancela. Os links colados no texto continuam virando links
clicáveis na leitura.

**Nota técnica:** o texto é gravado no campo de descrição simples. O ClickUp mantém
um segundo campo para markdown, mas escrever nos dois faz um sobrescrever o outro —
então o hub usa só um, que é o que aparece no ClickUp de qualquer forma.

**Estado:** ✅ concluído.
