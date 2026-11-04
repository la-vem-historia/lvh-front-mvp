// O que a camada de dados do site (src/lib/lvh/api.ts) espera do navegador e o React Native
// não tem: localStorage síncrono (gravado em SQLite) e crypto.randomUUID
import 'expo-sqlite/localStorage/install'
import * as Crypto from 'expo-crypto'

const globalCrypto = globalThis as { crypto?: { randomUUID?: () => string } }

if (!globalCrypto.crypto?.randomUUID) {
  globalCrypto.crypto = { ...globalCrypto.crypto, randomUUID: Crypto.randomUUID }
}
