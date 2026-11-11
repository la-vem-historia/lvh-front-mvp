# Vídeo da hero

`Hero` (15s) monta tudo: mãe → pai → avô → avó digitando (clipes do Flow em `public/flow`, fora do git), a câmera indo por trás da avó até o notebook com o verde recortado, e o site rodando na tela até ocupar o quadro. Os takes e cortes ficam no topo de `src/Hero.tsx`; `src/green-bbox.json` é a caixa da tela verde medida quadro a quadro no clipe 2.

```bash
npx remotion render src/index.ts Hero out/hero.mp4 --crf=20 --muted
```

## Só a tela do site

Animação em Remotion que entra por cima da tela verde no fim do clipe 2 (a câmera indo por trás da avó até o notebook).

Sequência (7s, 1920×1080, 30 fps):

1. 0–2,2s: a pergunta da semana sendo respondida
2. 2,1–3s: uma foto com legenda entra na resposta
3. 3–4,3s: o áudio "Sua voz" tocando
4. 4,3–5,3s: a página vira miolo e a capa do livro fecha
5. 5,3–7s: "Quem pode ler", com três convites enviados

```bash
npm install
npm run studio   # pré-visualizar e ajustar
npm run render   # gera out/tela-do-site.mp4
```

Textos, tempos e cores ficam no topo de `src/TelaDoSite.tsx`. As cores seguem `src/app/globals.css` do site.
