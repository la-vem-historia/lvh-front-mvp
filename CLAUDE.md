@AGENTS.md
@SHADCN-STUDIO.md

## Fluxo de mudanças: branch, PR e deploy

- O repositório da equipe é `la-vem-historia/lvh-front-mvp` (remote `lvh`). O `origin` é o fork pessoal do Moreno: não abra PR nele.
- O `main` da equipe vai direto para produção na Vercel (lvh-lp-mvp.vercel.app). Nunca faça commit nem push direto no `main`.
- Toda mudança começa num branch novo a partir do `lvh/main` atualizado (`git fetch lvh`), com nome `feat/…`, `fix/…` ou `docs/…`.
- Commite só os arquivos da tarefa. A pasta de trabalho costuma ter mudanças em andamento de outras tarefas: nunca use `git add -A`. Se o branch atual tem outras coisas, crie um worktree em `.claude/worktrees/<nome>` a partir do `lvh/main` e leve só os arquivos da tarefa para ele.
- Antes de subir, rode `npx next build` e o ESLint nos arquivos alterados. Num worktree, rode `npm ci` antes: a Turbopack não aceita `node_modules` como link simbólico.
- Abra o PR para o `main` do `lvh` com o Pedro (`pedroNielson`) como revisor. Descrição em português: resumo, o que muda, pontos para revisar e como testou.
- Quem aprova e faz o merge é o Pedro. Não faça o merge nem ligue o auto-merge.
- PR que depende de outro ainda aberto: a base é o branch do outro PR, e a descrição diz para fazer o merge depois dele.
