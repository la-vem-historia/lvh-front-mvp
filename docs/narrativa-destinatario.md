# Narrativa do destinatário: o livro é escrito para alguém

> Status: **prioridade A aplicada em 2026-11-07** (só a copy que não depende de dado novo, usando os fallbacks sem nome). As linhas aplicadas estão marcadas com **A ✓**. B, C e as mudanças de produto (P1–P9) seguem como proposta.
>
> Hero aplicado com uma versão revisada depois (opção 5): "Tem coisas que só você sabe. / Conte antes que se percam." As duas linhas cabem na largura fixa do desktop.
> Levantamento feito em 2026-11-07 na branch `feat/app-mobile`.

## O problema

Hoje o site e o app falam como um diário: "conte a sua história", "a minha história", "Minha história", "suas memórias". A pessoa escreve sobre si e para si. Isso soa egocêntrico e reduz o apelo: falar de si mesmo dá vergonha e perde fôlego no meio do caminho.

Quando a narrativa diz que a pessoa está contando a história **para** a neta ou o filho, o esforço ganha um alvo fora dela. Deixa de ser "falar de mim" e vira "deixar algo para a Ana". Esse é o motivo para voltar toda semana.

O exemplo da landing já aponta para esse caminho e serve de âncora: o recado "Vó, conta de novo a história do baile de carnaval?", assinado por Lia (`hero-livro.tsx:203-205`). A proposta é fazer o resto do produto contar a mesma história: **Maria escreve para a Lia.**

---

## Princípios de voz

1. **Sempre nomear o destinatário quando houver um nome cadastrado.** "O livro para a Ana", "A Ana vai ler isto", "Conte para a Ana". O nome do destinatário é mais forte do que qualquer adjetivo.
2. **Verbos de entrega, não de registro.** Use "contar para", "deixar para", "passar adiante", "entregar", "a Ana vai ouvir". Evite "registrar", "guardar suas memórias", "documentar" e "diário".
3. **"Sua história" nunca aparece sozinha.** Sempre vem com o destinatário ("a sua história, contada para a Ana") ou é trocada por "o livro para a Ana" ou "as histórias que a Ana vai ler".
4. **O livro tem dono e tem destino.** Autor: "Livro de Maria". Destino: "para a Lia". A capa, o título da página e o compartilhamento mostram os dois.
5. **Fallback sem nome: falar da família, não do eu.** Se a pessoa ainda não cadastrou um destinatário, use a relação ("para os seus netos", "para o seu filho") ou, sem relação, "para quem vem depois de você". Nunca volte para "a minha história".
6. **Plural natural.** Muitas avós escrevem para vários netos. A copy precisa aceitar "para o Pedro e a Luísa" e "para os meus netos" (o exemplo de dedicatória atual já é assim: `personalizar.tsx:18`).
7. **O destinatário é leitor, não plateia.** Ele é quem pergunta, quem lê e quem ouve. Ele não avalia nem "segue" ninguém. Nada de "compartilhe com seus seguidores", "publique" ou "perfil".
8. **Tom continua o mesmo:** caloroso, simples, sem pressa ("no seu tempo", "do seu jeito", "não precisa ser perfeito"). Essas frases ficam.

### Tokens usados nas propostas

| Token | Exemplo com nome | Fallback sem nome |
| --- | --- | --- |
| `{nome}` | Ana | (frase trocada pelo fallback) |
| `{para_nome}` | para a Ana · para o Pedro · para o Pedro e a Luísa | para os seus netos · para quem vem depois de você |
| `{relação}` | sua neta · seu filho | sua família |
| `{autor}` | Maria Oliveira | — |

O artigo (a/o/os) sai da relação cadastrada (filha/neta → "a"; filho/neto → "o"; mais de um → "os"/"as"). Por isso o onboarding precisa pedir a relação, não só o nome (veja **Mudanças de produto**, item P1).

---

## Levantamento e propostas de copy

Legenda de prioridade: **A** = carrega a narrativa (mudar primeiro) · **B** = reforça · **C** = ajuste fino.

### 1. Metadados e SEO

| Pri. | Arquivo:linha | Texto atual | Texto proposto | Motivo |
| --- | --- | --- | --- | --- |
| A ✓ | `src/app/layout.tsx:22` | Conte a sua história e transforme suas memórias em livro. | Responda perguntas sobre a sua vida e deixe um livro para seus filhos e netos, com fotos e a sua voz. | É a frase que aparece no Google e nos cards de compartilhamento. Precisa dizer **para quem** o livro é. |
| B | `src/app/app/page.tsx:6` | Minha história \| Lá Vem História | O livro para {nome} \| Lá Vem História (fallback: Início \| Lá Vem História) | O título da aba é lido toda vez que a pessoa abre o app. |
| C | `src/app/ler/[token]/page.tsx:6` | Livro \| Lá Vem História | Um livro de {autor} \| Lá Vem História (se o metadata puder ser dinâmico) | Quem recebe o link vê de quem é o presente. |
| C | `src/app/entrar/page.tsx:35` (alt) | …com a capa "Maria Oliveira, a minha história"… | …com a capa "Maria Oliveira, para a Lia"… | Acompanha a nova capa (P3). |

### 2. Landing: hero

| Pri. | Arquivo:linha | Texto atual | Texto proposto | Motivo |
| --- | --- | --- | --- | --- |
| B | `src/components/landing/hero.tsx:24` | Livro de memórias de família | Um livro para os seus filhos e netos | "Livro de memórias" é a definição de gênero do diário. O eyebrow já pode dizer o destino. |
| A ✓ | `src/components/landing/hero.tsx:28` | Histórias de família se perdem. / Até que você decide guardá-las. | Tem coisas que só você sabe. / Conte antes que se percam. | Fala de emoção, não de produto: o que se perde se a pessoa não contar. Não cita netos nem filhos no título, então serve para mães, pais, avós e avôs. |
| A ✓ | `src/components/landing/hero.tsx:39-40` | Responda perguntas guiadas sobre a sua vida e transforme suas respostas em um livro para as próximas gerações. | A infância, o primeiro amor, as escolhas difíceis. Deixe para seus filhos e netos as histórias que só você pode contar, na sua voz. | Os exemplos concretos fazem a pessoa lembrar das próprias histórias. "Filhos e netos" repete a descrição do Google, e a ênfase fica nas histórias, não no livro. |
| C | `src/components/landing/hero-livro.tsx:165` (aria) | Abrir o livro de exemplo de Maria Oliveira | Abrir o livro que Maria Oliveira escreveu para a neta Lia | Leitores de tela também ouvem a narrativa. |
| C | `src/components/landing/hero-livro.tsx:223` | Como você conheceu o vovô? | Mantém. | Já é uma pergunta que a neta faria. Funciona. |
| B | `src/components/landing/hero-livro.tsx:247` (capa via `BookCover`) | Maria Oliveira / a minha história | Maria Oliveira / para a Lia | Mostra o destinatário na primeira dobra do site (depende de P3). |

### 3. Landing: Como funciona

| Pri. | Arquivo:linha | Texto atual | Texto proposto | Motivo |
| --- | --- | --- | --- | --- |
| B | `como-funciona.tsx:116` | Da primeira pergunta ao livro nas mãos. | Da primeira pergunta ao livro nas mãos de quem você ama. | Fecha a frase em uma pessoa, não em um objeto. |
| A ✓ | `como-funciona.tsx:120` | Três passos simples. Você só precisa de alguns minutos por semana e de vontade de lembrar. | Três passos simples. Alguns minutos por semana, pensando em quem vai ler. | "Vontade de lembrar" é introspectivo. A motivação vira o leitor. |
| A ✓ | `como-funciona.tsx:33` | Responda perguntas guiadas | Escolha para quem você escreve | Hoje o passo 1 é a mecânica. Propor que o passo 1 seja o destinatário (casa com P1). Se preferir manter 3 passos, fica "Responda pensando em quem vai ler". **Aplicado: "Responda pensando em quem vai ler"** (o passo do destinatário entra com P1). |
| A ✓ | `como-funciona.tsx:34` | Toda semana chega uma pergunta sobre a sua vida: a infância, os amores, o trabalho, as viradas. Você responde no seu tempo, sem precisar saber escrever bem. | Toda semana chega uma pergunta que a sua neta talvez nunca tenha feito: como era a sua infância, como você conheceu o amor da sua vida, o que aprendeu no trabalho. Você responde no seu tempo, como se estivesse contando para ela. | Reposiciona a pergunta como curiosidade de quem vai ler. "Como se estivesse contando para ela" é a instrução de escrita que tira o medo. |
| B | `como-funciona.tsx:41` | Junte fotos antigas às respostas e, se preferir falar a escrever, grave a sua voz. Cada lembrança fica guardada do jeito que ela merece. | Junte fotos antigas às respostas e, se preferir falar a escrever, grave a sua voz. Daqui a muitos anos, seu neto vai poder ouvir você contando. | Troca "fica guardada" (arquivo) por um momento concreto de quem recebe. |
| A ✓ | `como-funciona.tsx:47` | Compartilhe com quem você ama | Entregue o livro para quem você escreveu | "Compartilhar" é verbo de rede social. "Entregar" é verbo de presente. |
| B | `como-funciona.tsx:48` | Suas histórias viram um livro digital. Só lê quem você convidar, e você pode tirar o acesso de qualquer pessoa quando quiser. | As respostas viram um livro, com capa, dedicatória e capítulos. Você entrega para a sua filha, para os netos, para quem quiser, e só lê quem você convidar. | Põe a dedicatória (que já existe) na vitrine e mantém a garantia de privacidade. |
| C | `como-funciona.tsx:50-51` (alt e URL) | O livro "A vida de Maria"… · `lavemhistoria.com.br/ler/a-vida-de-maria` | O livro de Maria para a Lia… · `lavemhistoria.com.br/ler/para-a-lia` | "A vida de Maria" é título de biografia. A URL de exemplo também conta a história. Exige trocar o print `compartilhar.png` se o título aparecer na imagem. |

### 4. Landing: O livro

| Pri. | Arquivo:linha | Texto atual | Texto proposto | Motivo |
| --- | --- | --- | --- | --- |
| B | `o-livro.tsx:50-51` | Nada de arquivo esquecido no computador. O que você conta vira um livro digital, com capa, sumário e capítulos, que cresce a cada resposta. | Nada de arquivo esquecido no computador. O que você conta vira um livro com capa, dedicatória e capítulos, que cresce a cada resposta e já pode ser lido por quem você escolheu. | Leva a dedicatória para a vitrine e lembra que existe um leitor esperando. |
| C | `o-livro.tsx:14` | Você escolhe quem pode ler, pessoa por pessoa… | Mantém. | Já fala de leitores. |
| B | `o-livro.tsx:18` | As lembranças que você gravou tocam ali mesmo, para a família ouvir a história contada por você. | As lembranças que você gravou tocam ali mesmo: seus netos ouvem a história na sua voz. | "A família" fica genérico. Nomear neto deixa a imagem concreta. |
| C | `o-livro.tsx:36` (capa) | `author='Maria Oliveira'` → "a minha história" | Capa com "para a Lia" (P3). | Coerência com o hero. |

### 5. Landing: Planos

| Pri. | Arquivo:linha | Texto atual | Texto proposto | Motivo |
| --- | --- | --- | --- | --- |
| C | `planos.tsx:33` | Para quem quer contar a história só escrevendo. | Para quem quer escrever o livro só com palavras. | Tira "contar a história" do vazio. |
| C | `planos.tsx:49` | Tudo para contar do seu jeito, com imagem e voz. | Para quem quer que a família veja as fotos e ouça a sua voz. | Benefício descrito do lado de quem recebe. |
| B | `planos.tsx:79` | Um preço simples para guardar o que importa. | Um preço simples para deixar o que importa para quem você ama. | Mesmo motivo do hero ("guardar" → "deixar para"). |
| C | `planos.tsx:41` | Leitura só para quem você convidar | Mantém. | |

### 6. Landing: Dúvidas frequentes e modal de contato

| Pri. | Arquivo:linha | Texto atual | Texto proposto | Motivo |
| --- | --- | --- | --- | --- |
| A ✓ | `duvidas.tsx:194` | Reunimos o que mais perguntam antes de começar a contar a própria história. | Reunimos o que mais perguntam antes de começar o livro para os filhos ou netos. | "A própria história" é a expressão mais diário do site. |
| B | `duvidas.tsx:29` | …você responde do seu jeito, como se estivesse contando para alguém. | …você responde do seu jeito, como se estivesse contando para a sua neta ou o seu filho na mesa da cozinha. | Já está quase lá; "alguém" vira uma pessoa concreta. |
| — | **nova pergunta** (sugerida para o topo da lista) | — | **Para quem é o livro?** Para quem você quiser deixar as suas histórias: um filho, uma filha, os netos. Você escolhe para quem escreve, e as perguntas e a dedicatória levam o nome dessa pessoa. Depois, é só convidar quem vai ler. | Explica o conceito central em uma linha e prepara a feature P1. |
| B | `duvidas.tsx:39` | …para a família ouvir a história contada por você. | …para os seus netos ouvirem a história contada por você. | Mesmo motivo de `o-livro.tsx:18`. |
| C | `duvidas.tsx:42` | Quem consegue ler o meu livro? | Quem consegue ler o livro? | Tira o "meu". O resto da resposta já é bom. |
| C | `duvidas.tsx:49` | Convide um irmão, um filho ou um amigo para responder… | Mantém. | Colaboração é outra coisa (quem ajuda a contar ≠ para quem é o livro). Ver nota em **Pontos de atenção**. |
| C | `duvidas.tsx:54` | …aponta o celular e ouve a sua voz. | Mantém. | |
| B | `duvidas.tsx:71-73` | O que acontece com as minhas histórias? / Elas são suas. | O que acontece com o que eu escrevi? / Continua sendo seu. Você baixa tudo quando quiser… | "Minhas histórias" reforça o eu. A garantia de posse continua. |
| C | `duvidas.tsx:117-119, 238-240` (modal) | Recebemos a sua dúvida… · Ainda com dúvida? | Mantém. | Texto operacional, neutro. |

### 7. Cadastro e entrada

| Pri. | Arquivo:linha | Texto atual | Texto proposto | Motivo |
| --- | --- | --- | --- | --- |
| A ✓ | `src/components/app/entrar-form.tsx:345` | Crie a sua conta e comece a contar. · Entre para continuar a sua história. | Crie a sua conta e comece o livro. · Entre para continuar o livro. *(com destinatário salvo: "Entre para continuar o livro para a Ana" não é viável aqui, a pessoa ainda não entrou)* | Tira "a sua história" isolado. |
| A ✓ | `mobile/src/app/entrar.tsx:115` | Entre para continuar a sua história. | Entre para continuar o livro. | Mesmo texto no app. |
| B | `entrar-form.tsx:316` · `mobile/src/app/entrar.tsx:221` | É o nome que aparece no seu livro e para quem você convidar. Dá para mudar depois. | É o nome que vai na capa, como autor, e que os seus leitores vão ver. Dá para mudar depois. | Separa autor (você) de leitor (eles). Prepara a próxima tela, que pede o destinatário. |
| C | `entrar-form.tsx:201-209` (pré-abertura) | Estamos dando os últimos retoques… | Mantém. | Operacional. |

### 8. Onboarding (boas-vindas)

| Pri. | Arquivo:linha | Texto atual | Texto proposto | Motivo |
| --- | --- | --- | --- | --- |
| A ✓ | `src/components/app/boas-vindas.tsx:60` · `mobile/src/app/boas-vindas.tsx:48` | Você vai contar a sua história como… | Você vai escrever este livro como… | Mantém a escolha de papel e tira "a sua história". |
| B | `boas-vindas.tsx:62` | As perguntas se adaptam a quem está contando. | As perguntas se adaptam a quem conta e a quem vai ler. | Antecipa a segunda pergunta do onboarding (P1). |
| B | `boas-vindas.tsx:20, 27` (+ mobile) | As perguntas falam com você como pai. / …como mãe. | Mantém. Para Avó/Avô (outra sessão): "As perguntas falam com você como avó." | |
| — | **nova etapa** (P1) | — | Título: **Para quem é este livro?** · Texto: "Pense em quem vai ler. Você pode escrever para uma pessoa ou para várias, e mudar quando quiser." · Campos: Nome · Relação (Filha, Filho, Neta, Neto, Outra pessoa) · "+ Adicionar outra pessoa" · Link: "Ainda não sei, decido depois". | É o centro da proposta. |
| A ✓ | `boas-vindas.tsx:110` · `mobile/src/app/boas-vindas.tsx:101` | Começar a minha história | Começar o livro para {nome} (fallback: Começar o livro) | O botão de saída já carrega o destinatário. |

### 9. Painel / início

| Pri. | Arquivo:linha | Texto atual | Texto proposto | Motivo |
| --- | --- | --- | --- | --- |
| A ✓ | `src/components/app/painel.tsx:105` (eyebrow) · `mobile/src/app/(tabs)/(inicio)/_layout.tsx:8` (título) | Minha história | Livro para {nome} (fallback: O seu livro) | É o "Livro para a Ana" no topo pedido no briefing. O lugar mais visto do app. |
| B | `painel.tsx:106` · `mobile/.../(inicio)/index.tsx:133` | Responda no seu tempo, na ordem que quiser. Cada resposta vira um trecho do seu livro. | Responda no seu tempo, na ordem que quiser. Cada resposta vira uma página que {nome} vai ler. | Lembra a cada visita quem está esperando. |
| C | `painel.tsx:122` · `mobile/.../(inicio)/index.tsx:146` (aria) | Progresso da sua história | Progresso do livro | |
| C | `painel.tsx:136` · mobile `:156` | Continuar de onde parei / Responder a primeira pergunta | Mantém. | |
| B | `src/components/app/primeiros-passos.tsx:115` | Comece a sua história | Comece o livro para {nome} | |
| B | `primeiros-passos.tsx:68` | Conte uma lembrança falando. A família vai ouvir você no livro. | Conte uma lembrança falando. {nome} vai ouvir a sua voz no livro. | |
| C | `primeiros-passos.tsx:76` | Peça a um familiar ou amigo a versão dele de uma lembrança. | Mantém. | Colaboração. |
| — | **novo passo** em Primeiros passos (web e mobile) | — | **Convide {nome} para ler** · "O livro fica fechado até você convidar. Dá para convidar agora e ir escrevendo." · ação: Convidar | Fecha o ciclo: a pessoa sabe que o destinatário já pode acompanhar, o que motiva continuar. |

### 10. Tela de escrita (pergunta)

| Pri. | Arquivo:linha | Texto atual | Texto proposto | Motivo |
| --- | --- | --- | --- | --- |
| A ✓ | `src/components/app/pergunta.tsx:464` | Deixe fluir. Conte a sua história… | Conte como se {nome} estivesse aqui, perguntando… (fallback: Conte como se estivesse falando com a sua família…) | É a instrução de escrita, vista em toda resposta. Muda o tom do texto produzido. |
| A ✓ | `mobile/src/components/question-editor.tsx:404` | Escreva aqui, do seu jeito. Não precisa ser perfeito. | Conte para {nome}, do seu jeito. Não precisa ser perfeito. | Mesmo motivo; mantém o "não precisa ser perfeito". |
| — | **novo:** linha sob a pergunta (web e mobile) | — | "{nome} vai ler isto no capítulo {capítulo}." em texto discreto | Lembrete leve do leitor. Opcional; testar se não pesa. |
| C | `pergunta.tsx:132` | Pausar a sua voz / Ouvir a sua voz | Mantém. | |
| C | `pergunta.tsx:549` | Gravar sua voz | Mantém (ou "Gravar para {nome} ouvir" num teste A/B). | |
| C | `mobile/src/app/(tabs)/escrever/index.tsx:23` | A sua história está completa. Releia e ajuste o que quiser pelo Início. | O livro para {nome} está completo. Releia, ajuste o que quiser e entregue. | Conclusão com destino, não com "completei meu diário". |

### 11. O livro (página do autor), capa e dedicatória

| Pri. | Arquivo:linha | Texto atual | Texto proposto | Motivo |
| --- | --- | --- | --- | --- |
| A ✓ | `src/components/livro/book-cover.tsx:94` | a minha história | para {nome} (ou o texto da dedicatória curta; fallback: "para a minha família") | A capa é o símbolo do produto. Hoje ela diz "diário". Depende de P3. |
| A ✓ | `book-reader.tsx:291` (folha de rosto) | a minha história | para {nome} | Mesmo motivo, dentro do livro. |
| A ✓ | `dedication-preview.tsx:59` | a minha história | para {nome} | Prévia da capa em Personalizar. |
| A ✓ | `src/components/livro/livro.tsx:36` | A sua história, até aqui. | O livro para {nome}, até aqui. | Título da página do livro. |
| B | `livro.tsx:83` | O seu livro ainda está em branco. Responda a primeira pergunta e veja a sua história começar a tomar forma… | O livro para {nome} ainda está em branco. Responda a primeira pergunta e veja as primeiras páginas aparecerem. | |
| B | `livro.tsx:64` | Confirme o nome que vai na capa e, se quiser, escreva uma dedicatória para quem vai ler. | Confirme o nome na capa e escreva uma dedicatória para {nome}. É a primeira página que {nome} vai ler. | Hoje a dedicatória é opcional e escondida. Ela é o lugar natural do destinatário. |
| B | `personalizar.tsx:177` | A primeira página depois da capa. Se preferir, deixe em branco. | A primeira página que {nome} vai ler. Algumas palavras bastam. | Valoriza a dedicatória sem obrigar. |
| B | `personalizar.tsx:18` | Para os meus netos, Pedro e Luísa. | Pré-preencher com "Para {nome}," a partir do destinatário cadastrado (mantém o exemplo como placeholder quando não houver). | Reduz a página em branco. |
| B | `book-reader.tsx:354` (colofão) | Este livro foi escrito por {autor} em {ano}, a partir das perguntas do Lá Vem História. | Este livro foi escrito por {autor} para {nome}, em {ano}, a partir das perguntas do Lá Vem História. | O colofão é o registro formal; deve dizer o destino. |
| C | `livro-impressao.tsx:277` (document.title do PDF) | {autor}, a minha história | {autor}, para {nome} | Nome do arquivo baixado. |
| C | `livro-impressao.tsx:348` | Um PDF para guardar, imprimir e passar adiante. | Um PDF para imprimir e entregar a {nome}. | |
| C | `mobile/src/app/(tabs)/livro/index.tsx:30` | A história de {autor}. | O livro para {nome}. | |
| C | `mobile/src/app/(tabs)/livro/_layout.tsx:8` | O livro | Mantém. | Rótulo de aba, curto. |

### 12. Compartilhamento e leitura (quem recebe)

| Pri. | Arquivo:linha | Texto atual | Texto proposto | Motivo |
| --- | --- | --- | --- | --- |
| A ✓ | `src/components/livro/livro-compartilhado.tsx:46-47` | Um livro de {autor} / {autor}, a minha história. | Um livro de {autor} / Escrito para {leitor}. *(quando o leitor convidado é o destinatário)* · senão: Escrito para {nome}. | Quem abre o link precisa sentir que o livro é para ela. Este é o momento de maior emoção do produto. |
| B | `compartilhar.tsx:75-77` | Quem pode ler / O livro é fechado: só lê quem você convidar… | Quem pode ler / O livro é fechado: só lê quem você convidar. Comece por {nome}. | Sugere o primeiro convite óbvio. |
| — | **novo** em `compartilhar.tsx` | — | Pré-preencher o nome do destinatário no campo de convite, com o botão "Convidar {nome}". | Remove atrito do convite que mais importa. |
| A ✓ | `mobile/src/app/(tabs)/perfil/convidar-leitor.tsx:33` | {leitor}, este é o seu link para ler o meu livro: {link} | {leitor}, escrevi um livro para você. Este é o seu link para ler: {link} *(se {leitor} for o destinatário)* · senão: {leitor}, estou escrevendo um livro para {nome} e queria que você lesse também: {link} | É a mensagem que o destinatário recebe no WhatsApp. "O meu livro" vira "um livro para você". |
| B | `src/components/livro/ouvir-voz.tsx:59` | Do livro de {autor} | Do livro de {autor} para {nome} | Página aberta pelo QR code no impresso. |
| C | `livro-compartilhado.tsx:38` · `ouvir-voz.tsx:51` | …quem escreveu o livro removeu o seu acesso. | Mantém. | |

### 13. Colaboração (convite para ajudar a contar)

| Pri. | Arquivo:linha | Texto atual | Texto proposto | Motivo |
| --- | --- | --- | --- | --- |
| A ✓ | `src/components/app/colaboradores-pergunta.tsx:32` | Oi, {convidado}! Estou escrevendo a minha história no Lá Vem História e queria muito a sua versão de uma lembrança: "{pergunta}" | Oi, {convidado}! Estou escrevendo um livro de histórias da família para {nome} e queria muito a sua versão de uma lembrança: "{pergunta}" | O colaborador entra na mesma missão (um livro para a neta), não no "projeto pessoal" de alguém. Isso aumenta a resposta. |
| A ✓ | `src/components/colaborar/colaborar.tsx:105` | {dono} está escrevendo a própria história e quer a sua versão destas lembranças. | {dono} está escrevendo um livro para {nome} e quer a sua versão destas lembranças. | Mesmo motivo. Precisa expor o nome do destinatário na view do colaborador (API). |
| B | `mobile/src/app/(tabs)/perfil/colaborador/[id].tsx:36` | {colaborador}, responda algumas perguntas do meu livro: {link} | {colaborador}, estou escrevendo um livro para {nome}. Me ajuda com algumas lembranças? {link} | |
| C | `colaborar.tsx:103` | Conte o que você lembra, do seu jeito. | Mantém. | |

### 14. E-mail da pergunta da semana (prévia no app)

O e-mail real ainda não é enviado (é protótipo). A prévia mostra o que vai chegar, então a copy decidida aqui vira a do e-mail.

| Pri. | Arquivo:linha | Texto atual | Texto proposto | Motivo |
| --- | --- | --- | --- | --- |
| A (pendente: depende do nome, P1) | `pergunta-da-semana.tsx:65` (assunto) | A pergunta da semana chegou | {nome} quer saber: {pergunta resumida} *(ou: "Uma pergunta para o livro da {nome}")* | O assunto é o que decide se o e-mail é aberto. Uma pergunta "vinda" do neto abre mais do que um lembrete de sistema. |
| B | `pergunta-da-semana.tsx:71` · `mobile/.../exemplo-email.tsx:46` | Oi, {primeiro nome}. A pergunta desta semana é: | Oi, {primeiro nome}. Esta semana, a pergunta para o livro da {nome} é: | |
| B | `pergunta-da-semana.tsx:93` · `mobile/.../exemplo-email.tsx:56` | Você respondeu todas as perguntas. Que tal reler o seu livro? | Você respondeu todas as perguntas. O livro para {nome} está pronto para ser entregue. | |
| C | `src/components/app/configuracoes.tsx:238` · `mobile/.../configuracoes.tsx:52` | Um e-mail com a próxima pergunta do seu livro… | Um e-mail com a próxima pergunta do livro para {nome}… | |

### 15. Conta, configurações e exclusão

| Pri. | Arquivo:linha | Texto atual | Texto proposto | Motivo |
| --- | --- | --- | --- | --- |
| C | `src/app/app/conta/page.tsx:6` | Minha conta | Mantém. | É conta, não história. |
| C | `configuracoes.tsx:254` · `mobile/.../configuracoes.tsx:123` | O guia da home com os primeiros marcos da sua história. | O guia do início com os primeiros passos do livro. | |
| C | `configuracoes.tsx:179` | Ninguém tem acesso ao seu livro ainda. | Ninguém tem acesso ao livro ainda. Que tal convidar {nome}? | |
| — | **nova seção** em Configurações (web e mobile) | — | **Para quem é o livro** · nome(s) e relação, editáveis. | Onde o destinatário vive depois do onboarding. |
| C | `mobile/.../excluir-conta.tsx:120` | …as suas histórias serão apagadas agora… | Mantém. | Em exclusão, clareza vale mais que narrativa. |

### 16. Outros

| Pri. | Arquivo:linha | Texto atual | Texto proposto | Motivo |
| --- | --- | --- | --- | --- |
| B | `src/components/app/avise-papeis.tsx:61` | Em breve, mais papéis: avô, avó, tio, tia, amigo e amiga. | Em breve, mais papéis: avó e avô. *(tio, tia e amigos só se fizer sentido para o destinatário; ver Pontos de atenção)* | "Amigo/amiga" não tem um descendente natural e enfraquece a narrativa. |

---

## Mudanças de produto que reforçam a narrativa

| # | Mudança | Onde | Esforço | Por quê |
| --- | --- | --- | --- | --- |
| **P1** | **Destinatário no onboarding.** Segunda etapa depois do papel: "Para quem é este livro?" com nome + relação (Filha, Filho, Neta, Neto, Outra pessoa), aceitando mais de uma pessoa e "decido depois". Salvar em `User` (ex.: `recipients: { name: string; relation: 'filha' \| 'filho' \| 'neta' \| 'neto' \| 'outra' }[]`) em `src/lib/lvh/types.ts` e no mobile. | `boas-vindas.tsx` (web e mobile), `types.ts`, `api.ts` | Médio | Tudo o mais depende deste dado. A relação dá o artigo (a/o) e permite adaptar perguntas. |
| **P2** | **"Livro para a Ana" no topo.** Eyebrow do painel e título da aba Início usam o destinatário. Quando houver vários: "Livro para o Pedro e a Luísa"; mais de dois: "Livro para os netos". | `painel.tsx`, `(inicio)/_layout.tsx`, `app/page.tsx` | Baixo | Lembrete constante do motivo, sem pedir nada. |
| **P3** | **Capa e folha de rosto com destinatário.** Trocar o subtítulo fixo "a minha história" por "para {nome}". Opcional em Personalizar: "Texto sob o nome" com sugestão "para {nome}". | `book-cover.tsx`, `book-reader.tsx`, `dedication-preview.tsx`, `personalizar.tsx`, `livro-impressao.tsx` | Baixo | A capa é a imagem do produto no site, no app e no impresso. |
| **P4** | **Dedicatória pré-preenchida e promovida.** Começar com "Para {nome}," e mostrar a dedicatória como passo dos Primeiros passos ("Escreva a dedicatória para {nome}"). | `personalizar.tsx`, `primeiros-passos.tsx` | Baixo | A primeira página do livro vira o primeiro gesto de escrita, e é para o outro. |
| **P5** | **Convite do destinatário como passo natural.** Novo passo "Convide {nome} para ler" e campo pré-preenchido em Compartilhar. Ler em andamento ("o livro cresce, e {nome} vê as páginas novas") é um motivo forte de constância. | `primeiros-passos.tsx` (web e mobile), `compartilhar.tsx`, `convidar-leitor.tsx` | Baixo/Médio | O leitor ativo vira o motor de retorno. |
| **P6** | **Página de leitura personalizada.** Quando o leitor convidado é o destinatário, a abertura diz "Escrito para você, {leitor}" e mostra a dedicatória primeiro. | `livro-compartilhado.tsx`, API de share (saber se o share é o destinatário) | Médio | É o momento do presente; deve parecer feito para quem abre. |
| **P7** | **"Perguntas que {nome} faria".** O destinatário (já convidado como leitor) pode sugerir uma pergunta ("Vó, conta de novo…"), que aparece no painel com o nome dele. É o recado da Lia da landing virando função. | painel, leitura, API | Alto | Transforma o destinatário de leitor passivo em quem puxa a história. Fica para depois. |
| **P8** | **Assunto do e-mail semanal com o nome do destinatário** (ver seção 14). | serviço de e-mail, quando existir | Baixo | |
| **P9** | **Landing com a história de Maria e Lia de ponta a ponta.** O hero já tem o recado da Lia; capa "para a Lia", URL de exemplo `/ler/para-a-lia`, prints de Como funciona com "Livro para a Lia" no topo. | landing + novos prints em `src/assets/landing/produto/` | Médio | A demonstração conta a narrativa sem precisar explicar. |

---

## Onde a copy das perguntas cruza com esta narrativa

> Os arquivos de perguntas (`src/lib/lvh/perguntas.ts`, gerado de `Perguntas/banco-de-perguntas-lvh.csv`) **não foram editados**. Isto é só um mapa para a sessão que está planejando o banco de perguntas para mãe, pai, avó e avô.

1. **O papel define o destinatário padrão.** Mãe/Pai → filha/filho; Avó/Avô → neta/neto. O onboarding (P1) pode pré-sugerir a relação a partir do papel. As perguntas podem usar a relação, não só o papel de quem escreve.
2. **Perguntas exclusivas de avós que citam o pai/mãe do neto** (ex.: "Como era meu pai/minha mãe quando criança?") são o melhor cruzamento: com destinatário cadastrado elas podem virar "Como era o pai da Ana quando criança?". Para isso, o banco precisa saber **qual filho é o pai/mãe do neto** (um campo a mais no P1, opcional: "Filho(a) de quem?").
3. **Pronome da pergunta continua "você"** (quem escreve). A presença do destinatário entra no **entorno** da pergunta (placeholder, linha "{nome} vai ler isto", assunto do e-mail), não no texto da pergunta, para o banco não precisar de variações por nome.
   Exceção sugerida: o capítulo **Lições para o Futuro** (`perguntas.ts:468`) e perguntas como "Qual o maior ensinamento da sua família que você quer passar adiante?" (`perguntas.ts:110`) e "Alguma tradição familiar que você gostaria que continuasse?" (`:114`) podem ganhar versão com o destinatário: "Que ensinamento você quer passar para a Ana?".
4. **Capítulo "Paternidade"** (`perguntas.ts:218`) é onde maternidade/paternidade cruza com "para o filho": perguntas como "Como foi quando você soube que ia ter um filho?" ganham força se o livro é para esse filho ("…quando soube que ia ter a Ana?"). Vale prever um token opcional `{destinatário}` só nesse capítulo.
5. **Exemplos da landing** (`hero-livro.tsx:223, 258`: "Como você conheceu o vovô?", "Qual é a sua lembrança mais antiga?") devem continuar existindo no banco com o mesmo texto, porque aparecem nos prints e no livro de exemplo.
6. **Papéis futuros** listados em `avise-papeis.tsx:61` (tio, tia, amigo, amiga) não têm destinatário descendente óbvio. Antes de criar perguntas para eles, decidir se o produto continua "para filhos e netos" ou abre para "sobrinhos/afilhados".

---

## Pontos de atenção

- **Colaborador ≠ destinatário.** Hoje "convidar" serve para duas coisas: convidar quem lê e convidar quem ajuda a responder. Com a narrativa nova, o destinatário pode ser as duas coisas (a filha que lê e também conta a versão dela). A copy deve deixar claro: **"para quem é o livro"** (destinatário), **"quem pode ler"** (leitores) e **"quem ajuda a contar"** (colaboradores).
- **Privacidade da colaboração.** Mostrar o nome do destinatário para o colaborador (seção 13) expõe um dado novo. Parece aceitável (é família), mas vale confirmar.
- **Livro sem destinatário.** Algumas pessoas querem escrever "para a família" de forma geral. O fallback "para a minha família" na capa e "para quem vem depois de você" na copy cobre esse caso, sem voltar ao "a minha história".
- **Prints da landing** (`src/assets/landing/produto/*.png`) mostram o título atual. Trocar a copy do app sem trocar os prints cria incoerência na landing.
- **Web e mobile têm textos duplicados** (painel, onboarding, configurações, e-mail de exemplo). Toda troca aprovada precisa ir nos dois.

## Próximos passos sugeridos

1. Aprovar (ou ajustar) os **princípios de voz** e a forma do token `{nome}`/`{para_nome}`.
2. Aprovar as linhas de prioridade **A** e aplicar a copy que não depende de dado novo (landing, SEO, FAQ, cadastro, placeholder com fallback).
3. Implementar **P1** (destinatário no onboarding) e, em seguida, P2–P5, que reaproveitam o mesmo dado.
4. Alinhar com a sessão do banco de perguntas os itens 2–4 da seção de cruzamento.
