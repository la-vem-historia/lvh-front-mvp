// Antes da abertura ao público: quem cria conta deixa o e-mail numa lista de interessados.
// A equipe ganha este cookie ao passar pela senha do site e usa o app normalmente
export const TEAM_COOKIE = 'lvh-equipe'

export const isTeam = () => typeof document !== 'undefined' && document.cookie.split('; ').includes(`${TEAM_COOKIE}=1`)

// O que /api/leads devolve: se o e-mail já estava na lista
export type LeadResult = { already: boolean }
