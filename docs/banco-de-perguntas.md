# Banco de perguntas por papel

> Status: **os 4 papéis no site** (2026-11-07): Mãe 307, Pai 312, Avó 314 e Avô 318.
> Fonte única: `src/lib/lvh/perguntas.ts`. Os docs [perguntas-mae.md](perguntas-mae.md), [perguntas-pai.md](perguntas-pai.md), [perguntas-avó.md](perguntas-avó.md) e [perguntas-avô.md](perguntas-avô.md) são a versão legível.
> Referência: **Mãe**. Ela deve ser a principal usuária, então cada capítulo é desenhado primeiro para ela e depois adaptado para Pai, Avó e Avô.
> Confluence: a página [Banco de Perguntas](https://lavemhistoria.atlassian.net/wiki/spaces/LVH/pages/2031617/Banco+de+Perguntas) e as 4 páginas filhas (uma por papel) espelham este banco. O código é a fonte da verdade: quando `perguntas.ts` mudar, atualize lá também.

## Sincronização com o Confluence (2026-11-10)

O Confluence ainda descrevia o plano de abril/2026 e foi reescrito a partir do código. O que estava diferente:

| Onde | O que dizia | O que vale (código) |
| --- | --- | --- |
| Banco de Perguntas | 110 perguntas: 70 comuns + 10 por perfil; cada perfil vê 100 | 362 no banco; Mãe 307, Pai 312, Avó 314, Avô 318 (234 comuns + 73 a 84 do papel) |
| Banco de Perguntas | Blocos temáticos (infância, família de origem, vida adulta, valores, memórias, mensagens) | 12 capítulos na ordem da vida |
| Banco de Perguntas | Perguntas exclusivas intercaladas ao longo dos blocos | Perguntas do papel juntas nos capítulos 6 a 8 |
| Banco de Perguntas | Perguntas que evocam trauma ficam fora | 7 perguntas sobre perdas e momentos difíceis, marcadas como opcionais |
| Banco de Perguntas | Nada sobre a voz | Voz de quem recebe o livro |
| Escopo do MVP (seção 3 e checklist) | Os mesmos 110 / 100 e "mínimo 100 perguntas organizadas por bloco" | Seção aponta para a página Banco de Perguntas |
| Cópias no espaço pessoal (Banco de Perguntas, Escopo do MVP) | O mesmo conteúdo antigo | Banco de Perguntas virou um aviso apontando para o espaço LVH; Escopo corrigido igual ao do LVH |

Não foi revisado: o fluxo de como as perguntas chegam à pessoa (primeira pergunta pelo perfil, uma por vez, navegação livre no plano pago, perguntas mensais e sazonais), que também estava na página antiga.

## Decisões

1. **Quem pergunta é quem vai receber o livro.** O filho, a filha, o neto ou a neta faz as perguntas: "Como você escolheu o meu nome?". "Você" é quem escreve o livro, e "eu", "me" e "mim" são quem recebe. Os títulos dos capítulos também seguem essa voz.
2. **Ordem da vida.** Os capítulos seguem a vida de quem escreve, para o livro impresso ler como uma história contada do começo ao fim. A v7 do Claude Chat organizava por tema de identidade, e essa organização foi deixada de lado.
3. **Não há teto de perguntas.** A meta inicial era 200 por papel, mas pergunta boa entra.

   | Papel | Perguntas |
   | --- | --- |
   | Mãe | 307 |
   | Pai | 312 |
   | Avó | 314 |
   | Avô | 318 |
4. **Base comum + perguntas do papel.** A base comum é a vida da pessoa e vale para os 4 papéis, com variação de gênero no texto. As perguntas do papel são o que só uma mãe, um pai, uma avó ou um avô pode contar.

## Capítulos (com a Mãe como referência)

| # | Capítulo | Qtd | Tipo | Do que trata |
| --- | --- | --- | --- | --- |
| 1 | De onde você vem | 28 | comum | Nome, pais, avós, irmãos, o clima da casa, origens da família |
| 2 | Sua infância | 37 | comum | Lugar, brincadeiras, escola, cheiros, medos, amigos, a tecnologia e os acontecimentos da época |
| 3 | Sua adolescência | 32 | comum | Turma, festas, música, moda, gírias, primeira paixão, a tecnologia e as notícias da época |
| 4 | Quando você saiu de casa | 22 | comum | Estudos, primeiro emprego, independência, a tecnologia de hoje comparada com a de antes |
| 5 | Seus amores | 21 | comum | Primeiro amor, como conheceu o meu pai, casamento, o que faz um amor durar |
| 6 | **Quando você virou mãe** | 21 | papel | Desejo de ter filhos, gravidez ou adoção, a chegada, os primeiros meses |
| 7 | **Os anos de me criar** | 22 | papel | Rotina, rede de apoio, cansaço, culpa, a mãe que quis ser |
| 8 | **E sobre mim?** | 30 | papel · sobre quem recebe | Meu nome, primeira palavra, manias, travessuras, como eu era na adolescência |
| 9 | Seu trabalho e o que você ama | 31 | comum | Carreira, dinheiro, hobbies, música, filmes, livros, lugares, sonhos |
| 10 | Casa, mesa e tradições | 17 | comum | Comida, receitas, festas, rituais de família, objetos que têm história |
| 11 | No que você acredita | 26 | comum | Fé, valores, perdas, coragem, o que mudou de ideia com o tempo |
| 12 | O que você quer me dizer | 20 | comum | Conselhos, o que quer viver comigo, recados para o futuro |
| | **Total** | **307** | 234 comuns + 73 do papel | |

Os capítulos 6, 7 e 8 são os que dão valor ao livro, porque ninguém mais pode respondê-los. O capítulo 8 usa `aboutRecipient: true`: quando a pessoa cria um livro para outro filho e aproveita as respostas, essas ficam em branco.

O capítulo 9 ficou grande (31) porque recebeu os gostos e paixões da v7. Se pesar no uso, ele pode ser dividido em "Seu trabalho" e "O que você ama", sem mudar a ordem dos outros.

## Como os capítulos do papel mudam nos outros papéis

| Capítulo | Mãe | Pai | Avó | Avô |
| --- | --- | --- | --- | --- |
| 6 | Quando você virou mãe | Quando você virou pai | Quando você virou avó (a notícia do primeiro neto, ser avó comparado a ser mãe) | Quando você virou avô |
| 7 | Os anos de me criar | Os anos de me criar (visto pelo pai) | Quando o meu pai era pequeno, ou a minha mãe era pequena (o filho ou a filha que hoje é pai ou mãe do neto) | Igual à Avó, com a voz do avô |
| 8 | E sobre mim? (o filho) | E sobre mim? (o filho) | E sobre mim? (o neto) | E sobre mim? (o neto) |

Para Avó e Avô, o capítulo 7 é o mais forte do livro: o neto descobre como os pais dele eram quando crianças.

## Como o site monta as perguntas

Cada pergunta existe uma vez só no banco, com um id. O site resolve o texto para o livro aberto:

- **Gênero de quem escreve:** `[a:feminino|masculino]`. Mãe e Avó usam o primeiro, Pai e Avô o segundo ("você mesma" ou "você mesmo").
- **Gênero de quem recebe:** `[r:menino|menina]` ("quando eu era pequeno" ou "pequena").
- **Livros de avós:** `[c:filho|filha]` muda com o lado da família: o neto do filho pergunta sobre "o meu pai", o neto da filha sobre "a minha mãe". O título do capítulo também muda (`titleFor`).
- **Texto próprio de um papel (`textFor`):** quando trocar o gênero não basta ("Ser pai mudou o seu jeito de trabalhar?").
- **Papéis (`roles`):** perguntas que só existem para alguns papéis. Os capítulos 6, 7 e 8 são de Mãe e Pai.

Como a pergunta comum tem o mesmo id em todos os papéis, ao começar um livro novo dá para aproveitar as respostas da base comum, mesmo trocando de Mãe para Avó.

## Marcações nas perguntas

- **(a):** palavra sobre quem recebe que muda com o gênero cadastrado ("pequeno(a)").
- **[P]:** cita "meu pai". Se a mãe não divide a vida com o pai do filho, o app troca por "a pessoa com quem você dividiu a vida" ou esconde a pergunta. O onboarding precisa perguntar isso.
- **[G]:** só faz sentido para quem engravidou. Para quem adotou, o app esconde a pergunta.
- *(opcional)*: tema difícil, e o app deixa claro que dá para pular.

## Regras para escrever as perguntas

1. **Uma coisa por pergunta.** Evitar "Como foi e o que você sentiu?".
2. **Concreta antes de abstrata.** "O que você fazia numa tarde de sábado?" funciona melhor que "Como era sua infância?". Cada capítulo abre com perguntas fáceis e deixa as mais fundas para o fim.
3. **Na voz de quem recebe o livro.** "Que música você cantava para eu dormir?", e não "Que música você cantava para seus filhos?".
4. **Não presumir a vida da pessoa.** Nem toda mãe engravidou (adoção, filhos do parceiro), nem toda mãe divide a vida com o pai do filho, e algumas passaram por perda gestacional. Quando não der para escrever uma pergunta que sirva para todas, ela leva a marcação [P] ou [G].
5. **Não citar tecnologias nem acontecimentos específicos.** "Como era a tecnologia quando você era criança?", e não "Você tinha videocassete?". Quem responde traz a própria época.
6. **Temas difíceis são opcionais** e ficam perto do fim do capítulo.
7. **Perguntas-ponte.** Algumas perguntas tiram a mãe da lembrança e a colocam conversando com o filho ("Se eu pudesse ter te conhecido aos oito anos, o que eu teria visto?"). Elas ficam espalhadas pelos capítulos.
8. **Inventário de propósito.** Nome completo, nomes e datas dos avós ficam, pelo valor genealógico para as próximas gerações.

## Ideias de produto ligadas às perguntas

- **Ocultar pergunta + questionário rápido.** A pessoa pode marcar uma pergunta como oculta. Na hora, abre um questionário curto perguntando por quê (por exemplo: "não se aplica a mim", "é difícil de responder", "não gostei da pergunta", "já respondi em outra"). Assim aprendemos quais perguntas não funcionam e para quem. Ainda não foi desenhado.
- **Dica por época.** Com o ano de nascimento cadastrado, o app pode mostrar uma dica opcional embaixo das perguntas de tecnologia e de acontecimentos, com exemplos da época. A pergunta continua aberta.
- **Dicas editoriais por pergunta (v7).** Um aviso curto sugerindo, por exemplo, gravar a canção de ninar no microfone.
- **Foto ou áudio por pergunta (v7).** Marcar quais perguntas pedem foto ou áudio. Não foi decidido se é sugestão ou obrigação.

## Em aberto

- O total é o que a pessoa responde no livro, ou um banco de onde saem as perguntas da semana? Com uma pergunta por semana, 307 perguntas levam quase 6 anos.
- O app hoje faz as perguntas na voz do app ("Onde você nasceu?"). Com a voz do filho, a tela da pergunta pode mostrar quem está perguntando ("A Lia pergunta:").
- Próximo passo: revisar os 4 bancos com uso real, e criar o jeito de esconder ou trocar as perguntas [P] e [G].
- Num livro de avó, as respostas do capítulo 7 falam do filho ou da filha. Se ela começar um livro para um neto do outro lado da família e aproveitar as respostas, essas vão junto e precisam ser revisadas.
