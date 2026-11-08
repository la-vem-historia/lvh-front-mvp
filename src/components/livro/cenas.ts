import type { CSSProperties } from 'react'

import type { StaticImageData } from 'next/image'

import carvalho from '@/assets/leitura/carvalho.jpg'
import linho from '@/assets/leitura/linho.jpg'
import madeira from '@/assets/leitura/madeira.jpg'
import nogueira from '@/assets/leitura/nogueira.jpg'

// Superfícies do modo de leitura: o livro fica aberto sobre uma delas, como numa mesa.
// Todas são fotos de verdade: três madeiras e um linho
export type CenaId = 'madeira' | 'carvalho' | 'nogueira' | 'linho'

type Cena = {
  id: CenaId
  label: string
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

const WOOD_SHADOW = 'drop-shadow(0 32px 38px rgb(30 16 6 / 0.55))'
const LIGHT_WOOD_SHADOW = 'drop-shadow(0 30px 36px rgb(60 35 12 / 0.42))'
const FABRIC_SHADOW = 'drop-shadow(0 26px 30px rgb(60 45 30 / 0.3))'

export const CENAS: Cena[] = [
  {
    id: 'madeira',
    label: 'Madeira rústica',
    style: photo(madeira, '#6b4527'),
    swatch: photo(madeira, '#6b4527'),
    shadow: WOOD_SHADOW
  },
  {
    id: 'carvalho',
    label: 'Carvalho',
    style: photo(carvalho, '#c08a55'),
    swatch: photo(carvalho, '#c08a55'),
    shadow: LIGHT_WOOD_SHADOW
  },
  {
    id: 'nogueira',
    label: 'Nogueira',
    style: photo(nogueira, '#6e4630'),
    swatch: photo(nogueira, '#6e4630'),
    shadow: WOOD_SHADOW
  },
  {
    id: 'linho',
    label: 'Linho',
    style: photo(linho, '#b39a77'),
    swatch: photo(linho, '#b39a77'),
    shadow: FABRIC_SHADOW
  }
]

export const CENA_PADRAO: CenaId = 'madeira'
