## 2026-09-19 — Links clicáveis nos comentários e cor no topo das colunas

**O quê:** corrigimos o motivo real de os links não virarem clicáveis e demos uma
faixa de cor discreta ao topo de cada coluna das boards.

---

### O bug dos links: uma armadilha clássica de expressão regular

**O que acontecia:** links colados em comentários e descrições continuavam texto
puro, mesmo com o código de conversão presente e aplicado nos lugares certos.

**Por quê:** a expressão regular que encontra endereços estava guardada numa
constante, com o flag `/g`. No JavaScript, uma expressão com `/g` **memoriza onde
parou a última busca**. Como a mesma constante era reutilizada a cada verificação,
o `.test()` alternava entre verdadeiro e falso a cada chamada: o primeiro link
virava link, o segundo não, o terceiro sim. Na prática, metade passava reto — e
num comentário com um link só, era jogar cara ou coroa.

**Correção:** a varredura passou a usar `matchAll`, que percorre o texto de uma vez
sem depender desse estado interno, e a expressão é criada nova a cada uso. O caso foi
testado com dois links na mesma frase, incluindo uma URL de SharePoint com
caracteres codificados — os dois são detectados.

Os links agora funcionam em comentários, respostas de comentário, descrição, campos
de texto e na linha de contexto do boletim de triagem.

### Cor no topo das colunas

Cada coluna ganhou uma faixa de 3 pixels no topo. A cor não é decorativa: ela
acompanha o avanço do fluxo. Começa neutra no Inbox, esquenta ao longo da esteira e
fecha em verde na conclusão. O tom semântico manda por cima disso — coluna de
impedimento é vermelha e coluna concluída é verde, esteja onde estiver na ordem.

A distribuição é proporcional ao tamanho da board, então a Produção com quinze
colunas e a Edição com seis usam a mesma progressão, só que em passos diferentes.
Colunas recolhidas mantêm a faixa, para continuarem reconhecíveis de lado.

O ponto colorido que existia antes ao lado do nome saiu: a faixa já cumpre esse
papel com menos ruído.

**Quem tocou:** [seu nome].

**Estado:** ✅ concluído.
