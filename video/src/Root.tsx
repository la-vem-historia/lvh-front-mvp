import { Composition } from 'remotion'

import { Hero, HERO_FRAMES } from './Hero'
import { TelaDoSite } from './TelaDoSite'

export const Root = () => (
  <>
    {/* Vídeo final da hero: as quatro gerações, a câmera até a tela e o site */}
    <Composition id='Hero' component={Hero} durationInFrames={HERO_FRAMES} fps={30} width={1920} height={1080} />
    {/* Só a tela do notebook, para usar em outro editor por cima do verde */}
    <Composition id='TelaDoSite' component={TelaDoSite} durationInFrames={210} fps={30} width={1920} height={1080} />
  </>
)
