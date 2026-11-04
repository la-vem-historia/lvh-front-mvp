// Ícones que o Lucide não tem, desenhados no mesmo traço (grade 24, linha 2, pontas redondas)
import Svg, { Path } from 'react-native-svg'

type IconProps = { size?: number; color?: string; strokeWidth?: number }

// Adicionar áudio: barras de som com o + no canto, no mesmo desenho do ImagePlus. O microfone sozinho fica para
// ditar (voz vira texto), para as duas ações não se confundirem
export function AudioPlus({ size = 24, color = 'currentColor', strokeWidth = 2 }: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <Path d='M2 11v3' />
      <Path d='M6 7v11' />
      <Path d='M10 4v17' />
      <Path d='M14 9v8' />
      <Path d='M18 12v5' />
      <Path d='M16 5h6' />
      <Path d='M19 2v6' />
    </Svg>
  )
}
