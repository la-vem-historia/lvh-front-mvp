import type { CSSProperties } from 'react'

import linho from '@/assets/leitura/linho.jpg'
import madeira from '@/assets/leitura/madeira.jpg'

// Superfícies do modo de leitura: o livro fica aberto sobre uma delas, como numa mesa.
// Madeira, linho e noite usam fotos de verdade; a toalha xadrez ainda é desenhada aqui (SVG e gradientes)
export type CenaId = 'madeira' | 'toalha' | 'linho' | 'noite'

type Cena = {
  id: CenaId
  label: string
  style: CSSProperties
  // Bolinha do seletor: um pedaço da própria textura
  swatch: CSSProperties
  // Sombra do livro sobre a superfície: mais funda no escuro, mais leve no tecido claro
  shadow: string
}

const svg = (markup: string) => `url("data:image/svg+xml,${encodeURIComponent(markup)}")`

// Foto de uma mesa de madeira de verdade. A noite usa a mesma mesa, no escuro, com a luz de um abajur no livro
const WOOD = `url(${madeira.src})`

// Trama fina de tecido: ruído miúdo, quase invisível, por cima da cor
const WEAVE = svg(`<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'>
  <filter id='trama'>
    <feTurbulence type='fractalNoise' baseFrequency='0.9 0.45' numOctaves='2' seed='3'/>
    <feColorMatrix values='0 0 0 0 0.3  0 0 0 0 0.24  0 0 0 0 0.16  0 0 0 0.16 0'/>
  </filter>
  <rect width='100%' height='100%' filter='url(#trama)'/>
</svg>`)

// Xadrez de toalha de mesa (vichy): duas faixas que se cruzam e escurecem onde se encontram
const GINGHAM = 'rgb(176 74 58 / 0.42)'

export const CENAS: Cena[] = [
  {
    id: 'madeira',
    label: 'Mesa de madeira',
    style: { backgroundColor: '#6b4527', backgroundImage: WOOD, backgroundSize: 'cover', backgroundPosition: 'center' },
    swatch: {
      backgroundColor: '#6b4527',
      backgroundImage: WOOD,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    },
    shadow: 'drop-shadow(0 32px 38px rgb(30 16 6 / 0.55))'
  },
  {
    id: 'toalha',
    label: 'Toalha xadrez',
    style: {
      backgroundColor: '#f4ede0',
      backgroundImage: `${WEAVE}, linear-gradient(90deg, ${GINGHAM} 50%, transparent 50%), linear-gradient(${GINGHAM} 50%, transparent 50%)`,
      backgroundSize: '300px 300px, 56px 56px, 56px 56px'
    },
    swatch: {
      backgroundColor: '#f4ede0',
      backgroundImage: `linear-gradient(90deg, ${GINGHAM} 50%, transparent 50%), linear-gradient(${GINGHAM} 50%, transparent 50%)`,
      backgroundSize: '12px 12px'
    },
    shadow: 'drop-shadow(0 26px 30px rgb(70 30 20 / 0.32))'
  },
  {
    id: 'linho',
    label: 'Linho',
    style: {
      backgroundColor: '#b39a77',
      backgroundImage: `url(${linho.src})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    },
    swatch: { backgroundColor: '#b39a77', backgroundImage: `url(${linho.src})`, backgroundSize: 'cover' },
    shadow: 'drop-shadow(0 26px 30px rgb(60 45 30 / 0.3))'
  },
  {
    id: 'noite',
    label: 'Noite',
    style: {
      backgroundColor: '#0c0805',
      backgroundImage: `radial-gradient(ellipse 58% 52% at 50% 48%, rgb(255 196 130 / 0.08), rgb(8 5 3 / 0.72) 62%, rgb(4 2 1 / 0.92) 100%), ${WOOD}`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    },
    swatch: {
      backgroundColor: '#0c0805',
      backgroundImage: `radial-gradient(circle at 50% 40%, rgb(255 196 130 / 0.1), rgb(8 5 3 / 0.8) 75%), ${WOOD}`,
      backgroundSize: 'cover'
    },
    shadow: 'drop-shadow(0 30px 40px rgb(0 0 0 / 0.7))'
  }
]

export const CENA_PADRAO: CenaId = 'madeira'
