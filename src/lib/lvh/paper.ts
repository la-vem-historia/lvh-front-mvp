// Papel das páginas: Pólen Soft, o creme levemente amarelado dos livros de qualidade.
// A textura imita o papel de verdade: relevo irregular sob luz rasante, manchas de densidade,
// fibras curtas em qualquer direção e alguns pontinhos, sem nenhum padrão regular
export const PAPER = '#efe7d4'

const svg = (content: string) => `url("data:image/svg+xml;utf8,${encodeURIComponent(content)}")`

// Relevo: ruído iluminado de lado, centrado no cinza médio para clarear e escurecer o creme (soft-light)
const RELIEF = svg(
  "<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='r' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='0.05' numOctaves='5' seed='3' stitchTiles='stitch' result='n'/><feDiffuseLighting in='n' surfaceScale='2' lighting-color='#fff'><feDistantLight azimuth='225' elevation='55'/></feDiffuseLighting><feComponentTransfer><feFuncR type='linear' slope='1.25' intercept='-0.525'/><feFuncG type='linear' slope='1.25' intercept='-0.525'/><feFuncB type='linear' slope='1.25' intercept='-0.525'/></feComponentTransfer></filter><rect width='100%' height='100%' filter='url(#r)'/></svg>"
)

// Fibras: as cristas de um ruído turbulento viram fios curtos e tortos, em todas as direções
const FIBERS = svg(
  "<svg xmlns='http://www.w3.org/2000/svg' width='360' height='360'><filter id='f' x='0' y='0' width='100%' height='100%'><feTurbulence type='turbulence' baseFrequency='0.07' numOctaves='1' seed='7' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.5  0 0 0 0 0.42  0 0 0 0 0.28  -20 0 0 0 0.08'/></filter><rect width='100%' height='100%' filter='url(#f)'/></svg>"
)

// Pontinhos esparsos, como as impurezas que aparecem no papel
const SPECKS = svg(
  "<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='s' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='1' seed='11' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.38  0 0 0 0 0.32  0 0 0 0 0.24  6 0 0 0 -4.75'/></filter><rect width='100%' height='100%' filter='url(#s)'/></svg>"
)

// Manchas suaves: o papel não tem a mesma densidade em toda a folha
const MOTTLE = svg(
  "<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><filter id='m' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='0.01' numOctaves='3' seed='5' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.55  0 0 0 0 0.45  0 0 0 0 0.3  0 0 0 0.08 0'/></filter><rect width='100%' height='100%' filter='url(#m)'/></svg>"
)

export const PAPER_STYLE = {
  backgroundColor: PAPER,
  backgroundImage: `${SPECKS}, ${FIBERS}, ${RELIEF}, ${MOTTLE}`,
  backgroundBlendMode: 'normal, normal, soft-light, normal'
}
