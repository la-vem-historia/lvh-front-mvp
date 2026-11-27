import { redirect } from 'next/navigation'

// A página de estados mudou para /equipe/assinatura, que abre sem conta no app
export default function EstadosAntigos() {
  redirect('/equipe/assinatura')
}
