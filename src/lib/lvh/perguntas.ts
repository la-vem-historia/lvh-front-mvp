// Banco de perguntas de todos os papéis. Versões legíveis: docs/perguntas-mae.md e docs/perguntas-pai.md.
// Quem pergunta é quem recebe o livro: "você" é quem escreve, "eu" e "mim" são quem recebe.
//
// Marcações no texto, resolvidas por chaptersFor:
// - [a:feminino|masculino] muda com quem escreve: Mãe e Avó | Pai e Avô
// - [r:menino|menina] muda com quem recebe o livro

import type { Chapter, RecipientGender, Role } from './types'

export type BankQuestion = {
  id: number
  text: string
  // Texto próprio de um papel, quando trocar o gênero não basta
  textFor?: Partial<Record<Role, string>>
  // Só existe para estes papéis. Sem a lista, vale para todos
  roles?: Role[]
  // Cita o pai ou a mãe de quem recebe (parceiro) ou só serve para quem engravidou (gravidez).
  // Por enquanto aparecem para todos; quando o cadastro souber disso, o app troca o texto ou esconde
  needs?: 'parceiro' | 'gravidez'
  // Tema difícil: o app deve deixar claro que dá para pular
  optional?: boolean
  // Pergunta sobre quem recebe o livro. Ao aproveitar respostas de outro livro, fica em branco
  aboutRecipient?: boolean
}

export type BankChapter = {
  id: string
  title: string
  questions: BankQuestion[]
}

// Exportado só para gerar os docs; o app usa chaptersFor
export const bank: BankChapter[] = [
  {
    id: 'de-onde-voce-vem',
    title: 'De onde você vem',
    questions: [
      { id: 1001, text: 'Qual é o seu nome completo?' },
      { id: 1002, text: 'Você sabe por que seus pais escolheram esse nome?' },
      { id: 1003, text: 'Você tinha algum apelido? De onde ele veio?' },
      { id: 1004, text: 'Como seus pais se chamavam, e de onde eles vieram?' },
      { id: 1005, text: 'Como seus pais se conheceram?' },
      { id: 1006, text: 'Como você descreveria a relação entre eles?' },
      { id: 1007, text: 'Como era a sua mãe no dia a dia?' },
      { id: 1008, text: 'Qual a lembrança mais forte que você tem da sua mãe?' },
      { id: 1009, text: 'E do seu pai?' },
      { id: 1010, text: 'Fisicamente, você se parece mais com qual dos dois?' },
      { id: 1011, text: 'E no jeito de ser, de quem você puxou mais?' },
      { id: 1012, text: 'Tem algo que você gostaria de ter dito a um deles e nunca disse?' },
      { id: 1013, text: 'O que seus pais faziam para ganhar a vida?' },
      { id: 1014, text: 'Como era o dinheiro em casa: sobrava, faltava ou dava certinho?' },
      { id: 1015, text: 'Quantos irmãos você tem, e como era a relação entre vocês?' },
      { id: 1016, text: 'Quem cuidava de você quando seus pais não estavam?' },
      { id: 1017, text: 'Como era o clima da sua casa quando você era criança?' },
      { id: 1018, text: 'Na sua família se falava abertamente sobre sentimentos, ou as coisas ficavam no silêncio?' },
      { id: 1019, text: 'Como se chamavam os seus quatro avós?' },
      { id: 1020, text: 'Quando e onde eles nasceram?' },
      { id: 1021, text: 'Você conheceu seus avós? Como eles eram?' },
      { id: 1022, text: 'O que você sabe da vida que seus avós tiveram antes de você nascer?' },
      { id: 1023, text: 'Tem algum traço seu que veio direto deles?' },
      { id: 1024, text: 'Que história da família você ouvia desde [a:pequena|pequeno]?' },
      { id: 1025, text: 'Sua família veio de outro lugar? Como chegaram até onde você cresceu?' },
      { id: 1026, text: 'Que história engraçada a família conta até hoje?' },
      { id: 1027, text: 'Qual foi a maior lição que você aprendeu com seus pais?' },
      { id: 1028, text: 'Que parente seu você gostaria que eu tivesse conhecido?' },
    ]
  },
  {
    id: 'infancia',
    title: 'Sua infância',
    questions: [
      { id: 1029, text: 'Onde você nasceu? Sabe como foi o dia do seu nascimento?' },
      { id: 1030, text: 'Você ainda tem alguma ligação com o lugar onde nasceu?' },
      { id: 1031, text: 'Como você era quando criança?' },
      { id: 1032, text: 'Como era a casa onde você passou a infância?' },
      { id: 1033, text: 'Como era a sua rua ou o seu bairro?' },
      { id: 1034, text: 'Quais eram suas brincadeiras favoritas?' },
      { id: 1035, text: 'Se a gente tivesse crescido junto, que brincadeira você teria me ensinado?' },
      { id: 1036, text: 'Teve algum brinquedo que você amava?' },
      { id: 1037, text: 'Qual foi o melhor presente que você ganhou?' },
      { id: 1038, text: 'Quem eram suas melhores amigas e amigos?' },
      { id: 1039, text: 'Você tinha um bicho de estimação? Como ele era?' },
      { id: 1040, text: 'Qual cheiro te leva direto para a infância?' },
      { id: 1041, text: 'Que comida da sua infância você ainda sente o gosto?' },
      { id: 1042, text: 'Tinha algum doce ou comida que você amava e que não existe mais?' },
      { id: 1043, text: 'Como era um domingo na sua casa?' },
      { id: 1044, text: 'O que vocês faziam para se divertir dentro de casa?' },
      { id: 1045, text: 'Em que escola você estudou?' },
      { id: 1046, text: 'Como você era na escola?' },
      { id: 1047, text: 'Teve alguma professora ou professor que marcou você?' },
      { id: 1048, text: 'O que você queria ser quando crescesse?' },
      { id: 1049, text: 'Já se meteu em alguma encrenca? Me conta como foi.' },
      { id: 1050, text: 'Do que você tinha medo?' },
      { id: 1051, text: 'Que roupa ou penteado a sua mãe fazia em você?', textFor: { Pai: 'Que roupa a sua mãe fazia você usar que você odiava?', Avô: 'Que roupa a sua mãe fazia você usar que você odiava?' } },
      { id: 1052, text: 'Como eram os seus aniversários e o Natal?' },
      { id: 1053, text: 'Alguma viagem da infância ficou na memória?' },
      { id: 1054, text: 'Como era a tecnologia quando você era criança? Que aparelhos existiam na sua casa?' },
      { id: 1055, text: 'O que todo mundo assistia quando você era criança?' },
      { id: 1056, text: 'Que música tocava em todo lugar nessa época?' },
      { id: 1057, text: 'Quanto custavam as coisas que você comprava quando era criança?' },
      { id: 1058, text: 'Como a sua família se falava com quem morava longe?' },
      { id: 1059, text: 'Que acontecimento do país ou do mundo você lembra da sua infância, mesmo sem ter entendido direito na época?' },
      { id: 1060, text: 'Qual foi a sua maior alegria de criança?' },
      { id: 1061, text: 'Qual memória da infância você mais revisita?' },
      { id: 1062, text: 'O que da sua infância você ainda carrega hoje?' },
      { id: 1063, text: 'Teve algum momento difícil que você enfrentou ainda [a:pequena|pequeno]?', optional: true },
      { id: 1064, text: 'Se eu pudesse ter te conhecido aos oito anos, o que eu teria visto?' },
      { id: 1065, text: 'O que você viveu na infância e torce para que eu também tenha vivido?' },
    ]
  },
  {
    id: 'adolescencia',
    title: 'Sua adolescência',
    questions: [
      { id: 1066, text: 'Como você era aos 15 anos?' },
      { id: 1067, text: 'Quem era a sua turma?' },
      { id: 1068, text: 'O que te preocupava nessa época?' },
      { id: 1069, text: 'E o que te animava?' },
      { id: 1070, text: 'Em que momento você sentiu que estava deixando a infância para trás?' },
      { id: 1071, text: 'Se eu tivesse sido [r:seu amigo|sua amiga] na adolescência, como eu te descreveria?' },
      { id: 1072, text: 'Que músicas você ouvia sem parar?' },
      { id: 1073, text: 'Como você ouvia música nessa época?' },
      { id: 1074, text: 'Que filmes, novelas ou livros marcaram essa fase?' },
      { id: 1075, text: 'Como você assistia filmes?' },
      { id: 1076, text: 'Como eram as festas, e onde vocês se encontravam?' },
      { id: 1077, text: 'O que estava na moda e você fazia questão de usar?' },
      { id: 1078, text: 'Que gíria todo mundo usava e hoje ninguém mais fala?' },
      { id: 1079, text: 'Como era a tecnologia na sua adolescência? O que tinha de novo?' },
      { id: 1080, text: 'Como você falava com os amigos e com quem estava namorando?' },
      { id: 1081, text: 'Que notícia do mundo você lembra exatamente onde estava quando ouviu?' },
      { id: 1082, text: 'Que matéria da escola te acendia de um jeito diferente?' },
      { id: 1083, text: 'Que conselho você me daria para aproveitar melhor os anos de escola?' },
      { id: 1084, text: 'Que regra dos seus pais você mais odiava?' },
      { id: 1085, text: 'Teve uma fase rebelde? O que você aprontou?' },
      { id: 1086, text: 'Quem foi a sua primeira paixão?' },
      { id: 1087, text: 'Como você ficava quando estava [a:apaixonada|apaixonado]?' },
      { id: 1088, text: 'Você dava o primeiro passo ou esperava a pessoa vir?' },
      { id: 1089, text: 'Como foi o seu primeiro beijo?' },
      { id: 1090, text: 'Quem você admirava nessa época?' },
      { id: 1091, text: 'Teve festa de 15 anos ou algum marco parecido?', textFor: { Pai: 'Teve algum marco que fez você se sentir mais velho?', Avô: 'Teve algum marco que fez você se sentir mais velho?' } },
      { id: 1092, text: 'Do que você se orgulha dessa fase?' },
      { id: 1093, text: 'Em que momento você se sentiu mais [a:perdida|perdido]?' },
      { id: 1094, text: 'Como você imaginava que seria a sua vida aos 30?' },
      { id: 1095, text: 'Se pudesse reencontrar alguém dessa época, quem seria e o que você diria?' },
      { id: 1096, text: 'O que você viveu nessa fase e torce para que eu também viva?' },
      { id: 1097, text: 'O que você gostaria de ter ouvido de alguém naquela idade?' },
    ]
  },
  {
    id: 'saida-de-casa',
    title: 'Quando você saiu de casa',
    questions: [
      { id: 1098, text: 'Você continuou estudando depois da escola? O quê, e por quê?' },
      { id: 1099, text: 'Qual foi o seu primeiro trabalho?' },
      { id: 1100, text: 'Você lembra quanto ganhava?' },
      { id: 1101, text: 'O que você comprou com o primeiro salário?' },
      { id: 1102, text: 'Quando você saiu da casa dos seus pais? Como foi?' },
      { id: 1103, text: 'Como era a primeira casa que foi sua?' },
      { id: 1104, text: 'Qual foi a primeira grande decisão que você tomou [a:sozinha|sozinho]?' },
      { id: 1105, text: 'Alguém duvidou de você nessa época? O que você fez?' },
      { id: 1106, text: 'Que cidade ou lugar mudou o seu jeito de ver o mundo?' },
      { id: 1107, text: 'Como era ser [a:uma mulher jovem|um homem jovem] naquela época?' },
      { id: 1108, text: 'Qual era o sonho de consumo da sua geração?' },
      { id: 1109, text: 'Que acontecimento do país ou do mundo marcou essa fase da sua vida?' },
      { id: 1110, text: 'Como as pessoas se falavam e se encontravam nessa época?' },
      { id: 1111, text: 'Que tecnologia chegou na sua vida adulta e mudou tudo?' },
      { id: 1112, text: 'Como é a tecnologia hoje, comparada com a da sua infância?' },
      { id: 1113, text: 'Que tecnologia de hoje você nunca imaginou que existiria?' },
      { id: 1114, text: 'O que da sua época você queria que ainda existisse?' },
      { id: 1115, text: 'Que amizade dessa fase dura até hoje?' },
      { id: 1116, text: 'Qual foi a maior loucura que você fez nesse tempo?' },
      { id: 1117, text: 'Teve um momento em que você precisou recomeçar?' },
      { id: 1118, text: 'Que acontecimento você viveu e acha que eu vou estudar nos livros de história?' },
      { id: 1119, text: 'Que conselho você daria para você [a:mesma|mesmo] aos 20 anos?' },
    ]
  },
  {
    id: 'amores',
    title: 'Seus amores',
    questions: [
      { id: 1120, text: 'Quem foi o seu primeiro namorado ou namorada?' },
      { id: 1121, text: 'Você namorou muito antes de se acertar com alguém?' },
      { id: 1122, text: 'Teve alguma decepção amorosa que doeu muito?' },
      { id: 1123, text: 'Como você conheceu [a:o meu pai|a minha mãe]?', roles: ['Mãe', 'Pai'], needs: 'parceiro' },
      { id: 1124, text: 'O que fez você se apaixonar [a:por ele|por ela]?', roles: ['Mãe', 'Pai'], needs: 'parceiro' },
      { id: 1125, text: 'Como foi o primeiro encontro de vocês?' },
      { id: 1126, text: 'Quando você soube que era sério?' },
      { id: 1127, text: 'Como seus pais reagiram quando você [a:o|a] apresentou?', roles: ['Mãe', 'Pai'], needs: 'parceiro' },
      { id: 1128, text: 'Como foi o pedido, o casamento ou a decisão de morar juntos?' },
      { id: 1129, text: 'Como vocês dividiram as tarefas quando começaram a vida juntos?' },
      { id: 1130, text: 'Qual a lembrança mais bonita que vocês têm juntos?' },
      { id: 1131, text: 'Vocês passaram por uma fase difícil? Como atravessaram?' },
      { id: 1132, text: 'Que coisa vocês fazem que ninguém mais entende?' },
      { id: 1133, text: 'O que você mais admira [a:no meu pai|na minha mãe] até hoje?', roles: ['Mãe', 'Pai'], needs: 'parceiro' },
      { id: 1134, text: 'O que o amor te ensinou que você não sabia aos 20?' },
      { id: 1135, text: 'Já fez alguma loucura por amor?' },
      { id: 1136, text: 'Na sua opinião, o que faz um relacionamento durar?' },
      { id: 1137, text: 'Quais são as maiores armadilhas de um relacionamento?' },
      { id: 1138, text: 'Se uma história de amor terminou, o que você leva dela?', optional: true },
      { id: 1139, text: 'O que você espera que eu tenha aprendido sobre amor olhando para vocês dois?' },
      { id: 1140, text: 'O que você quer que eu saiba sobre escolher alguém para amar?' },
    ]
  },
  {
    id: 'virar-mae',
    title: 'Quando você virou [a:mãe|pai]',
    questions: [
      { id: 1141, text: 'Você sempre quis ser [a:mãe|pai]?', roles: ['Mãe', 'Pai'] },
      { id: 1142, text: 'Antes de ser [a:mãe|pai], como você imaginava que seria?', roles: ['Mãe', 'Pai'] },
      { id: 1143, text: 'Como você descobriu que ia ser [a:mãe|pai] pela primeira vez?', roles: ['Mãe', 'Pai'] },
      { id: 1144, text: 'Quem foi a primeira pessoa a saber? Como foi contar?', roles: ['Mãe', 'Pai'] },
      { id: 1145, text: 'Como foram os meses de espera?', roles: ['Mãe', 'Pai'] },
      { id: 1146, text: 'Teve algum desejo, enjoo ou mania nesse tempo?', roles: ['Mãe'], needs: 'gravidez' },
      { id: 1308, text: 'O que você fazia para ajudar durante a espera?', roles: ['Pai'] },
      { id: 1147, text: 'Como você preparou a casa e a vida para a chegada?', roles: ['Mãe', 'Pai'] },
      { id: 1148, text: 'Do que você tinha mais medo antes da chegada?', roles: ['Mãe', 'Pai'] },
      { id: 1149, text: 'Como foi o dia em que você virou [a:mãe|pai]?', roles: ['Mãe', 'Pai'] },
      { id: 1150, text: 'O que você sentiu na primeira vez que segurou seu bebê no colo?', roles: ['Mãe', 'Pai'] },
      { id: 1151, text: 'Quem estava com você nesse dia?', roles: ['Mãe', 'Pai'] },
      { id: 1152, text: 'Como foi voltar para casa com um bebê?', roles: ['Mãe', 'Pai'] },
      { id: 1153, text: 'Como foram as primeiras noites?', roles: ['Mãe', 'Pai'] },
      { id: 1154, text: 'Quem te ajudou nos primeiros meses?', roles: ['Mãe', 'Pai'] },
      { id: 1155, text: 'O que ninguém tinha te contado sobre ser [a:mãe|pai]?', roles: ['Mãe', 'Pai'] },
      { id: 1156, text: 'Que conselho você recebeu e realmente funcionou?', roles: ['Mãe', 'Pai'] },
      { id: 1157, text: 'E qual conselho você ignorou, com toda a razão?', roles: ['Mãe', 'Pai'] },
      { id: 1158, text: 'O que mudou entre você e [a:a sua mãe|o seu pai] quando você virou [a:mãe|pai]?', roles: ['Mãe', 'Pai'] },
      { id: 1159, text: 'Como a sua vida mudou depois que você virou [a:mãe|pai]?', roles: ['Mãe', 'Pai'] },
      { id: 1160, text: 'Teve alguma perda ou espera difícil no caminho até ser [a:mãe|pai]?', roles: ['Mãe', 'Pai'], optional: true },
      { id: 1161, text: 'Em que momento você se sentiu [a:mãe|pai] de verdade?', roles: ['Mãe', 'Pai'] },
    ]
  },
  {
    id: 'criacao',
    title: 'Os anos de me criar',
    questions: [
      { id: 1162, text: 'Como era um dia comum quando eu era [r:pequeno|pequena]?', roles: ['Mãe', 'Pai'] },
      { id: 1163, text: 'Qual era a parte mais difícil da rotina?', roles: ['Mãe', 'Pai'] },
      { id: 1164, text: 'E a parte que você mais gostava?', roles: ['Mãe', 'Pai'] },
      { id: 1165, text: 'O que você fazia quando estava [a:exausta|exausto]?', roles: ['Mãe', 'Pai'] },
      { id: 1166, text: 'Quem era a sua rede de apoio?', roles: ['Mãe', 'Pai'] },
      { id: 1310, text: 'Como você e a minha mãe dividiam os cuidados comigo?', roles: ['Pai'], needs: 'parceiro' },
      { id: 1167, text: 'Que regras da casa eram inegociáveis?', roles: ['Mãe', 'Pai'] },
      { id: 1168, text: 'Qual era a bronca que você mais me dava?', roles: ['Mãe', 'Pai'] },
      { id: 1169, text: 'Que música você cantava para eu dormir?', roles: ['Mãe', 'Pai'] },
      { id: 1170, text: 'Que história você me contava na hora de dormir?', roles: ['Mãe', 'Pai'] },
      { id: 1311, text: 'O que você mais gostava de fazer comigo quando eu era [r:pequeno|pequena]?', roles: ['Pai'] },
      { id: 1171, text: 'Qual foi o maior susto que você passou como [a:mãe|pai]?', roles: ['Mãe', 'Pai'] },
      { id: 1309, text: 'Qual foi o momento mais emocionante de ser pai?', roles: ['Pai'] },
      { id: 1172, text: 'Teve alguma noite no hospital que você nunca esqueceu?', roles: ['Mãe', 'Pai'], optional: true },
      { id: 1173, text: 'Que tipo de [a:mãe|pai] você queria ser? E conseguiu?', roles: ['Mãe', 'Pai'] },
      { id: 1313, text: 'Como você enxerga a responsabilidade de ser pai?', roles: ['Pai'] },
      { id: 1174, text: 'Em que você fez diferente [a:da sua mãe|do seu pai]?', roles: ['Mãe', 'Pai'] },
      { id: 1175, text: 'E o que você repetiu [a:dela|dele] sem perceber?', roles: ['Mãe', 'Pai'] },
      { id: 1176, text: 'Já se sentiu [a:culpada|culpado] como [a:mãe|pai]? Por quê?', roles: ['Mãe', 'Pai'] },
      { id: 1312, text: 'O que você sentia por mim e não conseguia demonstrar?', roles: ['Pai'] },
      { id: 1177, text: 'Do que você abriu mão para me criar?', roles: ['Mãe', 'Pai'] },
      { id: 1178, text: 'Como você conciliou trabalho e filhos?', roles: ['Mãe', 'Pai'] },
      { id: 1179, text: 'Que momento do dia a dia você queria congelar?', roles: ['Mãe', 'Pai'] },
      { id: 1180, text: 'O que você aprendeu sobre si [a:mesma|mesmo] sendo [a:mãe|pai]?', roles: ['Mãe', 'Pai'] },
      { id: 1181, text: 'O que você tem certeza de que fez certo?', roles: ['Mãe', 'Pai'] },
      { id: 1182, text: 'Se pudesse voltar, o que você faria diferente?', roles: ['Mãe', 'Pai'] },
      { id: 1183, text: 'O que você gostaria que eu soubesse sobre o que foi me criar?', roles: ['Mãe', 'Pai'] },
    ]
  },
  {
    id: 'sobre-mim',
    title: 'E sobre mim?',
    questions: [
      { id: 1184, text: 'Por que você escolheu o meu nome?', roles: ['Mãe', 'Pai'], aboutRecipient: true },
      { id: 1185, text: 'Como você descobriu que eu estava a caminho?', roles: ['Mãe', 'Pai'], aboutRecipient: true },
      { id: 1186, text: 'Como [a:o meu pai|a minha mãe] reagiu quando soube?', textFor: { Pai: 'Como você e a minha mãe comemoraram a notícia?' }, roles: ['Mãe', 'Pai'], needs: 'parceiro', aboutRecipient: true },
      { id: 1187, text: 'Você acertou se eu seria menina ou menino?', roles: ['Mãe', 'Pai'], needs: 'gravidez', aboutRecipient: true },
      { id: 1188, text: 'O que você sentia quando me percebia mexendo na barriga?', roles: ['Mãe'], needs: 'gravidez', aboutRecipient: true },
      { id: 1314, text: 'Como foi me sentir mexendo na barriga da minha mãe?', roles: ['Pai'], needs: 'gravidez', aboutRecipient: true },
      { id: 1189, text: 'Como foi o dia em que eu nasci ou cheguei?', roles: ['Mãe', 'Pai'], aboutRecipient: true },
      { id: 1190, text: 'Qual foi a primeira coisa que você pensou quando me viu?', roles: ['Mãe', 'Pai'], aboutRecipient: true },
      { id: 1191, text: 'Com quem eu parecia quando era bebê?', roles: ['Mãe', 'Pai'], aboutRecipient: true },
      { id: 1192, text: 'Qual foi a minha primeira palavra?', roles: ['Mãe', 'Pai'], aboutRecipient: true },
      { id: 1193, text: 'Como foram os meus primeiros passos?', roles: ['Mãe', 'Pai'], aboutRecipient: true },
      { id: 1194, text: 'Que apelidos eu já tive?', roles: ['Mãe', 'Pai'], aboutRecipient: true },
      { id: 1195, text: 'Qual era a minha comida favorita? E qual eu não comia de jeito nenhum?', roles: ['Mãe', 'Pai'], aboutRecipient: true },
      { id: 1196, text: 'Que brinquedo ou paninho ia comigo para todo lado?', roles: ['Mãe', 'Pai'], aboutRecipient: true },
      { id: 1197, text: 'Que mania eu tinha quando era [r:pequeno|pequena]?', roles: ['Mãe', 'Pai'], aboutRecipient: true },
      { id: 1198, text: 'Do que você mais gostava em mim quando eu era [r:pequeno|pequena]?', roles: ['Mãe', 'Pai'], aboutRecipient: true },
      { id: 1199, text: 'Que coisa engraçada eu disse que a família repete até hoje?', roles: ['Mãe', 'Pai'], aboutRecipient: true },
      { id: 1200, text: 'Como foi o meu primeiro dia na escola?', roles: ['Mãe', 'Pai'], aboutRecipient: true },
      { id: 1201, text: 'Você lembra o que eu dizia que queria ser quando crescesse?', roles: ['Mãe', 'Pai'], aboutRecipient: true },
      { id: 1202, text: 'Que travessura minha você nunca esqueceu?', roles: ['Mãe', 'Pai'], aboutRecipient: true },
      { id: 1203, text: 'Qual foi o maior susto que eu te dei?', roles: ['Mãe', 'Pai'], aboutRecipient: true },
      { id: 1204, text: 'Do que eu tinha medo? E como você me acalmava?', roles: ['Mãe', 'Pai'], aboutRecipient: true },
      { id: 1205, text: 'Teve alguma fase minha que foi especialmente difícil para você?', roles: ['Mãe', 'Pai'], aboutRecipient: true },
      { id: 1206, text: 'Como eu era na adolescência, do seu ponto de vista?', roles: ['Mãe', 'Pai'], aboutRecipient: true },
      { id: 1207, text: 'Foi difícil quando eu saí de casa?', roles: ['Mãe', 'Pai'], aboutRecipient: true },
      { id: 1208, text: 'Que momento comigo você queria viver de novo?', roles: ['Mãe', 'Pai'], aboutRecipient: true },
      { id: 1209, text: 'Em que momento eu te surpreendi de um jeito que você não esquece?', roles: ['Mãe', 'Pai'], aboutRecipient: true },
      { id: 1210, text: 'O que você já via em mim [r:pequeno|pequena] que continua igual hoje?', roles: ['Mãe', 'Pai'], aboutRecipient: true },
      { id: 1211, text: 'Qual conquista minha te deixou mais [a:orgulhosa|orgulhoso]?', roles: ['Mãe', 'Pai'], aboutRecipient: true },
      { id: 1212, text: 'Do que você mais se orgulha de ter me ensinado?', roles: ['Mãe', 'Pai'], aboutRecipient: true },
      { id: 1213, text: 'O que eu te ensinei sem saber?', roles: ['Mãe', 'Pai'], aboutRecipient: true },
    ]
  },
  {
    id: 'trabalho-e-paixoes',
    title: 'Seu trabalho e o que você ama',
    questions: [
      { id: 1214, text: 'Como você escolheu a sua profissão ou o que faz da vida?' },
      { id: 1215, text: 'Qual trabalho você mais gostou de fazer?' },
      { id: 1216, text: 'Teve algum trabalho que te fez muito infeliz?' },
      { id: 1217, text: 'Qual foi o maior desafio da sua vida profissional?' },
      { id: 1218, text: 'De que conquista você mais se orgulha?' },
      { id: 1219, text: 'Já fracassou em algo importante? Como se levantou?' },
      { id: 1220, text: 'Alguém já te tratou diferente por ser mulher? Como você lidou?', roles: ['Mãe', 'Avó'] },
      { id: 1315, text: 'Você sentiu pressão para ser quem sustentava a casa? Como lidou?', roles: ['Pai', 'Avô'] },
      { id: 1221, text: 'Fora da família, quem foi decisivo no seu caminho?' },
      { id: 1222, text: 'Depois que virou [a:mãe|pai], você voltou a trabalhar, mudou de caminho ou ficou em casa? Como decidiu?', textFor: { Pai: 'Ser pai mudou o seu jeito de trabalhar? Como?', Avô: 'Ser pai mudou o seu jeito de trabalhar? Como?' } },
      { id: 1223, text: 'O que você prioriza quando pensa em trabalho?' },
      { id: 1224, text: 'A sua relação com dinheiro mudou com o tempo?' },
      { id: 1225, text: 'O que o trabalho te ensinou sobre a vida?' },
      { id: 1226, text: 'Se começasse de novo, seguiria o mesmo caminho?' },
      { id: 1227, text: 'O que você faz só para você?' },
      { id: 1228, text: 'Que hobby ou paixão te acompanha há anos?' },
      { id: 1229, text: 'Você pratica ou já praticou algum esporte?' },
      { id: 1230, text: 'Você toca algum instrumento, ou já tentou aprender?' },
      { id: 1231, text: 'Que habilidade sua pouca gente conhece?' },
      { id: 1232, text: 'Que música faz você parar tudo quando toca?' },
      { id: 1233, text: 'Que música te leva direto para um momento da sua vida?' },
      { id: 1234, text: 'Que filme você assistiria de novo agora?' },
      { id: 1235, text: 'Que livro mudou alguma coisa em você?' },
      { id: 1236, text: '[a:Que amiga|Que amigo] te segurou nos momentos difíceis?' },
      { id: 1237, text: 'Em que lugar do mundo você se sentiu mais em paz?' },
      { id: 1238, text: 'Que lugar, quando você volta, parece que o tempo parou?' },
      { id: 1239, text: 'O que você mais gosta de observar quando chega a um lugar novo?' },
      { id: 1240, text: 'Que lugar você ainda quer conhecer?' },
      { id: 1241, text: 'O que você ainda quer aprender?' },
      { id: 1242, text: 'Que sonho você deixou na gaveta?' },
      { id: 1243, text: 'E qual você ainda quer tirar de lá?' },
      { id: 1244, text: 'O que você faria se soubesse que não ia falhar?' },
    ]
  },
  {
    id: 'casa-mesa-tradicoes',
    title: 'Casa, mesa e tradições',
    questions: [
      { id: 1245, text: 'Qual é a sua comida preferida?' },
      { id: 1246, text: 'Que receita da família não pode se perder? Como se faz?' },
      { id: 1247, text: 'Qual prato é a sua especialidade?' },
      { id: 1248, text: 'Quem te ensinou a cozinhar?' },
      { id: 1249, text: 'Como é, ou era, o almoço de domingo na nossa casa?' },
      { id: 1250, text: 'A que restaurante você voltaria agora, e com quem?' },
      { id: 1251, text: 'Como a família comemora o Natal e as festas do ano?' },
      { id: 1252, text: 'Que tradição você herdou dos seus pais?' },
      { id: 1253, text: 'E qual tradição foi você quem criou?' },
      { id: 1254, text: 'Que objeto da casa tem uma história por trás?' },
      { id: 1255, text: 'Que música não pode faltar nas festas da família?' },
      { id: 1256, text: 'Que remédio caseiro você jura que funciona?' },
      { id: 1257, text: 'Que ditado ou frase você vive repetindo?' },
      { id: 1258, text: 'Qual foi a festa de família mais inesquecível?' },
      { id: 1259, text: 'Qual foi a viagem em família mais marcante?' },
      { id: 1260, text: 'Qual cantinho da casa é o seu lugar?' },
      { id: 1261, text: 'Que tradição você quer que eu continue?' },
    ]
  },
  {
    id: 'crencas',
    title: 'No que você acredita',
    questions: [
      { id: 1262, text: 'Em que você acredita?' },
      { id: 1263, text: 'Que lugar a fé ou a espiritualidade teve na sua vida?' },
      { id: 1264, text: 'Houve algum momento em que a sua fé foi testada de verdade?' },
      { id: 1265, text: 'O que você acha que acontece depois da morte?' },
      { id: 1266, text: 'Que prática ou ritual te segura nos momentos difíceis?' },
      { id: 1267, text: 'De que valor você não abre mão?' },
      { id: 1268, text: 'O que é felicidade para você?' },
      { id: 1269, text: 'O que você considera imperdoável?' },
      { id: 1270, text: 'Já perdoou algo muito difícil? Como conseguiu?' },
      { id: 1271, text: 'O que te faz morrer de rir?' },
      { id: 1272, text: 'O que te emociona até hoje?' },
      { id: 1273, text: 'Que momento te fez chorar de alegria?' },
      { id: 1274, text: 'O que te tira o sono?' },
      { id: 1275, text: 'Qual foi a perda que mais doeu?', optional: true },
      { id: 1276, text: 'O que te ajudou a seguir em frente depois dela?', optional: true },
      { id: 1277, text: 'Qual foi o momento mais difícil da sua vida, e o que te tirou dele?', optional: true },
      { id: 1278, text: 'Quais foram as melhores decisões da sua vida?' },
      { id: 1279, text: 'Qual foi a coisa mais corajosa que você já fez?' },
      { id: 1280, text: 'A quem você é [a:grata|grato] por ter mudado a sua vida?' },
      { id: 1281, text: 'Sobre o que você mudou de ideia com o tempo?' },
      { id: 1282, text: 'O que envelhecer te ensinou que você não esperava?' },
      { id: 1283, text: 'Do que você se arrepende?' },
      { id: 1284, text: 'Você acredita mais em destino, em sorte ou em esforço?' },
      { id: 1285, text: 'O que você acha que o mundo ainda precisa aprender?' },
      { id: 1286, text: 'O que você construiu que espera que dure depois de você?' },
      { id: 1287, text: 'Como você quer ser [a:lembrada|lembrado]?' },
    ]
  },
  {
    id: 'recados',
    title: 'O que você quer me dizer',
    questions: [
      { id: 1288, text: 'O que você sente ao imaginar que eu vou ler este livro?' },
      { id: 1289, text: 'Qual é o maior conselho que você pode me dar?' },
      { id: 1290, text: 'Que valor você mais espera ter passado para mim?' },
      { id: 1291, text: 'O que você quer que eu saiba sobre o amor?' },
      { id: 1292, text: 'E sobre dinheiro e trabalho?' },
      { id: 1293, text: 'E sobre amizade?' },
      { id: 1294, text: 'O que eu devo fazer quando a vida der errado?' },
      { id: 1295, text: 'Se pudesse me poupar de uma dor, qual seria?' },
      { id: 1296, text: 'Que erro seu você não quer que eu repita?' },
      { id: 1297, text: 'Que conselho você me dá sobre ser mãe ou pai um dia?' },
      { id: 1298, text: 'Do que você mais se orgulha em mim?' },
      { id: 1299, text: 'Que livro, filme ou música você quer que eu conheça?' },
      { id: 1300, text: 'Que lugar você quer que eu conheça um dia?' },
      { id: 1301, text: 'Que lugar você quer conhecer comigo?' },
      { id: 1302, text: 'O que você ainda quer viver ao meu lado?' },
      { id: 1303, text: 'O que você mais gosta na nossa relação hoje?' },
      { id: 1304, text: 'O que você deseja para o meu futuro?' },
      { id: 1305, text: 'O que você nunca disse em voz alta e quer deixar escrito aqui?' },
      { id: 1306, text: 'Complete: "Nunca se esqueça de que..."' },
      { id: 1307, text: 'O que você quer dizer na última página deste livro?' },
    ]
  },
]

const writesAsWoman = (role?: string) => role !== 'Pai' && role !== 'Avô'

const resolve = (text: string, role?: string, recipientGender?: RecipientGender) =>
  text.replace(/\[([ar]):([^|\]]*)\|([^\]]*)\]/g, (_, who: string, first: string, second: string) => {
    if (who === 'a') return writesAsWoman(role) ? first : second

    return recipientGender === 'menina' ? second : first
  })

// Os capítulos de um livro: só as perguntas do papel de quem escreve, já com o texto final
export function chaptersFor(role?: string, recipientGender?: RecipientGender): Chapter[] {
  return bank
    .map(chapter => ({
      id: chapter.id,
      title: resolve(chapter.title, role, recipientGender),
      questions: chapter.questions
        .filter(question => !question.roles || question.roles.includes(role as Role))
        .map(question => ({
          id: question.id,
          text: resolve(question.textFor?.[role as Role] ?? question.text, role, recipientGender),
          // Pergunta que existe só para um papel: trocar de papel apaga a resposta
          ...(question.roles?.length === 1 && { profile: question.roles[0] }),
          ...(question.aboutRecipient && { aboutRecipient: true })
        }))
    }))
    .filter(chapter => chapter.questions.length > 0)
}
