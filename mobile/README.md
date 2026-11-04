# Lá Vem História — app

App iOS e Android em Expo. Usa a mesma camada de dados do site (`../src/lib/lvh`) pelo atalho `@lvh/*`; o `metro.config.js` deixa o Metro enxergar essa pasta.

## Rodar

```bash
npm install
npx expo run:ios      # primeira vez, ou depois de adicionar pacote nativo
npx expo start --dev-client
```

Se o `pod install` falhar com erro de encoding, rode com `LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8`.

As pastas `ios/` e `android/` são geradas pelo Expo e não vão para o git: configurações nativas ficam no `app.json`.
