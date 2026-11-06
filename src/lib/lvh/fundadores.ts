// Membros fundadores: as primeiras pessoas da lista ganham desconto no primeiro ano
export const FOUNDER_SPOTS = 100
export const FOUNDER_DISCOUNT = 0.5

export const PLAN_PRICES = { essencial: 9.9, completo: 29.9 }

export const formatPrice = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })

export const founderPrice = (value: number) => Math.round(value * (1 - FOUNDER_DISCOUNT) * 100) / 100

// O que /api/leads devolve
export type LeadsCount = { taken: number }
export type LeadResult = { position: number; founder: boolean; already: boolean }
