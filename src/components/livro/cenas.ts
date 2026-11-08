import type { CSSProperties } from 'react'

import type { StaticImageData } from 'next/image'

import carvalho from '@/assets/leitura/carvalho.jpg'
import linho from '@/assets/leitura/linho.jpg'
import madeira from '@/assets/leitura/madeira.jpg'
import nogueira from '@/assets/leitura/nogueira.jpg'

// Superfícies do modo de leitura: o livro fica aberto sobre uma delas, como numa mesa.
// Texturas são fotos de verdade (três madeiras e um linho); cores são fundos lisos, para quem prefere sem distração
export type CenaId = 'madeira' | 'carvalho' | 'nogueira' | 'linho' | 'creme' | 'areia' | 'musgo' | 'grafite'

type Cena = {
  id: CenaId
  label: string
  kind: 'textura' | 'cor'
  // Fundo claro pede texto escuro por cima (a legenda acima do livro)
  light?: boolean
  style: CSSProperties
  // Bolinha do seletor: um pedaço da própria textura
  swatch: CSSProperties
  // Sombra do livro sobre a superfície: mais funda na madeira escura, mais leve no tecido
  shadow: string
}

// Foto como fundo: cobre a tela toda, com a cor média da foto por baixo enquanto ela carrega
const photo = (image: StaticImageData, color: string, overlay?: string): CSSProperties => ({
  backgroundColor: color,
  backgroundImage: overlay ? `${overlay}, url(${image.src})` : `url(${image.src})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center'
})

// Cor lisa: o mesmo tom no fundo e na bolinha do seletor
const solid = (id: CenaId, label: string, color: string, shadow: string, light = false): Cena => ({
  id,
  label,
  kind: 'cor',
  light,
  style: { backgroundColor: color },
  swatch: { backgroundColor: color },
  shadow
})

const WOOD_SHADOW = 'drop-shadow(0 32px 38px rgb(30 16 6 / 0.55))'
const LIGHT_WOOD_SHADOW = 'drop-shadow(0 30px 36px rgb(60 35 12 / 0.42))'
const FABRIC_SHADOW = 'drop-shadow(0 26px 30px rgb(60 45 30 / 0.3))'

export const CENAS: Cena[] = [
  {
    id: 'madeira',
    label: 'Madeira rústica',
    kind: 'textura',
    style: photo(madeira, '#6b4527'),
    swatch: photo(madeira, '#6b4527'),
    shadow: WOOD_SHADOW
  },
  {
    id: 'carvalho',
    label: 'Carvalho',
    kind: 'textura',
    light: true,
    style: photo(carvalho, '#c08a55'),
    swatch: photo(carvalho, '#c08a55'),
    shadow: LIGHT_WOOD_SHADOW
  },
  {
    id: 'nogueira',
    label: 'Nogueira',
    kind: 'textura',
    style: photo(nogueira, '#6e4630'),
    swatch: photo(nogueira, '#6e4630'),
    shadow: WOOD_SHADOW
  },
  {
    id: 'linho',
    label: 'Linho',
    kind: 'textura',
    light: true,
    style: photo(linho, '#b39a77'),
    swatch: photo(linho, '#b39a77'),
    shadow: FABRIC_SHADOW
  },
  solid('creme', 'Creme', '#efe6d2', 'drop-shadow(0 26px 30px rgb(70 50 25 / 0.28))', true),
  solid('areia', 'Areia', '#cdbb9c', 'drop-shadow(0 28px 32px rgb(70 50 25 / 0.36))', true),
  solid('musgo', 'Musgo', '#3f5240', 'drop-shadow(0 30px 38px rgb(10 18 10 / 0.55))'),
  solid('grafite', 'Grafite', '#2a2826', 'drop-shadow(0 30px 40px rgb(0 0 0 / 0.6))')
]

export const CENA_PADRAO: CenaId = 'madeira'
