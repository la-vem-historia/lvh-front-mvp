import type { CSSProperties } from 'react'

// Superfícies do modo de leitura: o livro fica aberto sobre uma delas, como numa mesa.
// As texturas são desenhadas aqui mesmo (SVG e gradientes), sem fotos para baixar nem licenças
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

// Mesa de tábuas: cada tábua com um tom, veios finos e compridos por cima e frestas escuras entre elas
const WOOD = svg(`<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='1000'>
  <filter id='veio'>
    <feTurbulence type='fractalNoise' baseFrequency='0.0018 0.22' numOctaves='4' seed='11'/>
    <feColorMatrix values='0 0 0 0 0.24  0 0 0 0 0.13  0 0 0 0 0.05  1.3 0 0 0 -0.52'/>
  </filter>
  <filter id='mancha'>
    <feTurbulence type='fractalNoise' baseFrequency='0.004 0.02' numOctaves='3' seed='5'/>
    <feColorMatrix values='0 0 0 0 0.36  0 0 0 0 0.2  0 0 0 0 0.09  0.9 0 0 0 -0.3'/>
  </filter>
  <rect width='100%' height='100%' fill='#a5703f'/>
  <rect y='0' width='100%' height='200' fill='#b07a48'/>
  <rect y='200' width='100%' height='210' fill='#9a663a'/>
  <rect y='410' width='100%' height='195' fill='#a9743f'/>
  <rect y='605' width='100%' height='205' fill='#965f35'/>
  <rect y='810' width='100%' height='190' fill='#ab7644'/>
  <rect width='100%' height='100%' filter='url(#mancha)'/>
  <rect width='100%' height='100%' filter='url(#veio)'/>
  <g fill='#2e1b0c' opacity='0.6'>
    <rect y='199' width='100%' height='2.5'/>
    <rect y='409' width='100%' height='2.5'/>
    <rect y='604' width='100%' height='2.5'/>
    <rect y='809' width='100%' height='2.5'/>
  </g>
  <g fill='#f3d2a6' opacity='0.12'>
    <rect y='202' width='100%' height='1'/>
    <rect y='412' width='100%' height='1'/>
    <rect y='607' width='100%' height='1'/>
    <rect y='812' width='100%' height='1'/>
  </g>
</svg>`)

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
    style: { backgroundColor: '#a06d43', backgroundImage: WOOD, backgroundSize: 'cover', backgroundPosition: 'center' },
    swatch: { backgroundColor: '#a06d43', backgroundImage: WOOD, backgroundSize: '400%' },
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
    style: { backgroundColor: '#e8dfcc', backgroundImage: WEAVE, backgroundSize: '300px 300px' },
    swatch: { backgroundColor: '#e8dfcc', backgroundImage: WEAVE, backgroundSize: '150px 150px' },
    shadow: 'drop-shadow(0 26px 30px rgb(60 45 30 / 0.3))'
  },
  {
    id: 'noite',
    label: 'Noite',
    style: {
      backgroundColor: '#14120f',
      backgroundImage: 'radial-gradient(ellipse 60% 55% at 50% 48%, #3d3329 0%, #221d18 55%, #100e0c 100%)'
    },
    swatch: { backgroundImage: 'radial-gradient(circle at 50% 40%, #4a3e32, #14120f 75%)' },
    shadow: 'drop-shadow(0 30px 40px rgb(0 0 0 / 0.7))'
  }
]

export const CENA_PADRAO: CenaId = 'madeira'
