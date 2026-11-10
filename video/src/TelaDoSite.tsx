import { loadFont as loadFraunces } from '@remotion/google-fonts/Fraunces'
import { loadFont as loadInter } from '@remotion/google-fonts/Inter'
import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'

const { fontFamily: fraunces } = loadFraunces()
const { fontFamily: inter } = loadInter()

// Tokens do site (src/app/globals.css)
const c = {
  cream: '#fffef2',
  paper: '#fcf9ee',
  sand: '#f2efe3',
  stone: '#dad9cd',
  ink: '#222222',
  text: '#333333',
  muted: '#666666',
  honey: '#f5be4e',
  moss: '#455843',
  border: 'rgb(51 51 51 / 0.2)',
  cloth: '#1d4a2a',
  foil: '#e9d9aa'
}

const QUESTION = 'Qual a lembrança mais forte que você tem da sua mãe?'
const ANSWER =
  'Ela cantava enquanto passava o café, todo domingo de manhã. O cheiro tomava a casa inteira, e eu acordava já sabendo que o dia ia ser bom.'
const CAPTION = 'Mamãe na cozinha, 1971'
const INVITES = [
  { name: 'Ana', email: 'ana@email.com' },
  { name: 'Pedro', email: 'pedro@email.com' },
  { name: 'Lucas', email: 'lucas@email.com' }
]

// Linha do tempo, em frames a 30 fps
const T = {
  typeStart: 6,
  typeEnd: 66,
  photo: 64,
  audio: 92,
  closeBook: 128,
  share: 158,
  sent: 192
}

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const
const ease = Easing.bezier(0.22, 1, 0.36, 1)

const useIn = (start: number, duration = 14) => {
  const frame = useCurrentFrame()

  return interpolate(frame, [start, start + duration], [0, 1], { ...clamp, easing: ease })
}

const Pop = ({ start, children, style }: { start: number; children: ReactNode; style?: CSSProperties }) => {
  const p = useIn(start)

  return <div style={{ opacity: p, transform: `translateY(${(1 - p) * 18}px) scale(${0.97 + p * 0.03})`, ...style }}>{children}</div>
}

const Caret = () => {
  const frame = useCurrentFrame()

  return (
    <span
      style={{
        display: 'inline-block',
        width: 3,
        height: '1.1em',
        marginLeft: 2,
        verticalAlign: '-0.15em',
        background: c.ink,
        opacity: Math.floor(frame / 8) % 2 === 0 ? 1 : 0
      }}
    />
  )
}

// Ícones no traço do lucide, desenhados à mão para não depender do pacote
const Icon = ({ d, size = 26, fill = 'none' }: { d: string; size?: number; fill?: string }) => (
  <svg width={size} height={size} viewBox='0 0 24 24' fill={fill} stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round'>
    <path d={d} />
  </svg>
)

const icons = {
  arrowLeft: 'M19 12H5M12 19l-7-7 7-7',
  bookmark: 'm19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z',
  mic: 'M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3ZM19 10v2a7 7 0 0 1-14 0v-2M12 19v3',
  image: 'M21 15l-5-5L5 21M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 9.5a1.5 1.5 0 1 0 0-.01',
  play: 'M6 3l14 9-14 9V3z',
  check: 'M20 6 9 17l-5-5'
}

const RoundButton = ({ children, active }: { children: ReactNode; active?: boolean }) => (
  <div
    style={{
      width: 60,
      height: 60,
      borderRadius: 999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: active ? c.ink : 'transparent',
      color: active ? c.cream : c.text,
      transition: 'none'
    }}
  >
    {children}
  </div>
)

// Tela 1: a pergunta da semana sendo respondida, com foto e voz
const Pergunta = () => {
  const frame = useCurrentFrame()
  const typed = Math.round(interpolate(frame, [T.typeStart, T.typeEnd], [0, ANSWER.length], clamp))
  const captionTyped = Math.round(interpolate(frame, [T.photo + 8, T.photo + 26], [0, CAPTION.length], clamp))
  const audioProgress = interpolate(frame, [T.audio + 10, T.closeBook], [0, 0.62], clamp)
  const seconds = Math.floor(interpolate(frame, [T.audio + 10, T.closeBook], [0, 23], clamp))
  const photoActive = frame >= T.photo - 6 && frame < T.photo + 6
  const micActive = frame >= T.audio - 6 && frame < T.audio + 6

  return (
    <AbsoluteFill style={{ background: c.cream, fontFamily: inter, color: c.text }}>
      <div style={{ width: 1180, margin: '0 auto', paddingTop: 70, display: 'flex', flexDirection: 'column', gap: 34, height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 22, color: c.muted }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon d={icons.arrowLeft} size={24} /> Início
          </span>
          <span style={{ fontSize: 19 }}>{typed > 0 ? 'Salvo agora' : ''}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <span style={{ fontSize: 21, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', color: c.text }}>
            De onde você vem <span style={{ color: c.muted, fontWeight: 400 }}>· Pergunta 8</span>
          </span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
            <h1 style={{ fontFamily: fraunces, fontWeight: 400, fontSize: 64, lineHeight: 1.15, margin: 0, color: c.ink, letterSpacing: '-0.01em' }}>
              {QUESTION}
            </h1>
            <div style={{ color: c.muted, paddingTop: 14 }}>
              <Icon d={icons.bookmark} size={32} />
            </div>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            marginBottom: 70,
            background: c.paper,
            border: `1.5px solid rgb(51 51 51 / 0.14)`,
            borderRadius: 44,
            boxShadow: '0 40px 70px -46px rgb(60 45 30 / 0.45)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <p style={{ margin: 0, padding: '44px 52px 0', fontSize: 34, lineHeight: 1.6, color: c.ink, flex: 1 }}>
            {ANSWER.slice(0, typed)}
            {frame < T.photo + 30 && <Caret />}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 28px' }}>
            {frame >= T.photo && (
              <Pop start={T.photo}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18, background: c.cream, borderRadius: 999, padding: 9, paddingRight: 24, height: 84 }}>
                  <Img src={staticFile('foto-familia.jpg')} style={{ width: 66, height: 66, borderRadius: 999, objectFit: 'cover', filter: 'sepia(0.35)' }} />
                  <span style={{ fontSize: 24, color: captionTyped ? c.text : 'rgb(102 102 102 / 0.7)', fontStyle: captionTyped ? 'normal' : 'italic' }}>
                    {captionTyped ? CAPTION.slice(0, captionTyped) : 'Legenda da foto (opcional)'}
                  </span>
                </div>
              </Pop>
            )}
            {frame >= T.audio && (
              <Pop start={T.audio}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18, background: c.cream, borderRadius: 999, padding: 9, paddingRight: 28, height: 84 }}>
                  <div style={{ width: 66, height: 66, borderRadius: 999, background: c.honey, color: c.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon d={icons.play} size={24} fill='currentColor' />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <span style={{ fontSize: 22, fontWeight: 500 }}>Sua voz</span>
                    <div style={{ height: 6, background: c.sand, borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${audioProgress * 100}%`, background: c.ink, borderRadius: 999 }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 20, color: c.muted, fontVariantNumeric: 'tabular-nums' }}>0:{String(seconds).padStart(2, '0')} / 0:37</span>
                </div>
              </Pop>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 28 }}>
            <div style={{ width: 60, height: 60, borderRadius: 999, background: c.sand, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon d={icons.mic} size={26} />
            </div>
            <div style={{ display: 'flex', gap: 6, background: c.sand, borderRadius: 999, padding: 6 }}>
              <RoundButton active={micActive}>
                <Icon d={icons.mic} size={26} />
              </RoundButton>
              <RoundButton active={photoActive}>
                <Icon d={icons.image} size={26} />
              </RoundButton>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}

// Capa do livro, no tecido verde com douração (src/components/livro/book-cover.tsx)
const Capa = () => {
  const stamped: CSSProperties = { color: c.foil, textShadow: '0 -1px 0 rgb(0 0 0 / 0.35)' }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: c.cloth,
        backgroundImage:
          'repeating-linear-gradient(0deg, rgb(255 255 255 / 0.035) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgb(0 0 0 / 0.06) 0 1px, transparent 1px 3px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 40px 40px 66px',
        textAlign: 'center',
        backfaceVisibility: 'hidden'
      }}
    >
      <span style={{ position: 'absolute', inset: '0 auto 0 0', width: 22, background: 'linear-gradient(to right, rgb(0 0 0 / 0.38), rgb(255 255 255 / 0.07) 55%, rgb(0 0 0 / 0.18))' }} />
      <span style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 80% at 70% 0%, rgb(255 255 255 / 0.10), transparent 60%)' }} />
      <span style={{ ...stamped, fontFamily: inter, fontSize: 11, fontWeight: 500, letterSpacing: '0.32em', textTransform: 'uppercase', position: 'relative' }}>
        Lá Vem História
      </span>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, position: 'relative' }}>
        <span style={{ ...stamped, fontFamily: fraunces, fontSize: 46, lineHeight: 1.05 }}>Helena</span>
        <span style={{ width: 44, height: 1, background: c.foil, opacity: 0.6 }} />
        <span style={{ ...stamped, fontFamily: fraunces, fontStyle: 'italic', fontSize: 19 }}>para a minha família</span>
      </div>
      <span style={{ ...stamped, fontFamily: inter, fontSize: 12, letterSpacing: '0.25em', position: 'relative' }}>2026</span>
    </div>
  )
}

// Tela 2: a página encolhe, vira miolo e a capa fecha por cima
const Livro = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const appear = spring({ frame: frame - T.closeBook, fps, config: { damping: 200 } })
  const close = spring({ frame: frame - (T.closeBook + 8), fps, config: { damping: 18, stiffness: 70, mass: 0.9 } })
  const angle = interpolate(close, [0, 1], [-168, 0])

  return (
    <AbsoluteFill style={{ background: c.sand, alignItems: 'center', justifyContent: 'center', perspective: 2400 }}>
      <div style={{ width: 440, height: 622, position: 'relative', transform: `scale(${1.1 + appear * 0.2})`, opacity: appear, transformStyle: 'preserve-3d' }}>
        {/* Miolo: páginas creme com a resposta */}
        <div
          style={{
            position: 'absolute',
            inset: '6px 0 6px 10px',
            background: c.paper,
            boxShadow: '0 30px 60px -20px rgb(60 45 30 / 0.45), inset 8px 0 14px -10px rgb(0 0 0 / 0.25)',
            padding: '56px 44px',
            fontFamily: fraunces,
            color: c.ink
          }}
        >
          <p style={{ fontFamily: inter, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: c.muted, margin: 0 }}>De onde você vem</p>
          <p style={{ fontSize: 24, lineHeight: 1.25, margin: '14px 0 18px' }}>{QUESTION}</p>
          <p style={{ fontSize: 15, lineHeight: 1.7, margin: 0, color: c.text }}>{ANSWER}</p>
        </div>
        {/* Capa, girando sobre a lombada */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transformOrigin: 'left center',
            transform: `rotateY(${angle}deg)`,
            transformStyle: 'preserve-3d',
            boxShadow: '0 40px 80px -24px rgb(30 25 20 / 0.55)'
          }}
        >
          <Capa />
        </div>
      </div>
    </AbsoluteFill>
  )
}

// Tela 3: "Quem pode ler", convidando três pessoas e enviando
const Compartilhar = () => {
  const frame = useCurrentFrame()
  const panel = useIn(T.share, 16)
  const sent = useIn(T.sent, 12)
  const count = INVITES.filter((_, index) => frame >= T.share + 8 + index * 8).length

  return (
    <AbsoluteFill style={{ fontFamily: inter, color: c.text }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: 760,
          background: c.cream,
          boxShadow: '-30px 0 80px -30px rgb(30 25 20 / 0.35)',
          transform: `translateX(${(1 - panel) * 100}%)`,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ padding: '96px 64px 40px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h2 style={{ fontFamily: fraunces, fontWeight: 400, fontSize: 56, margin: 0, color: c.ink }}>Quem pode ler</h2>
          <p style={{ fontSize: 26, lineHeight: 1.5, margin: 0, color: c.muted }}>
            O livro é fechado: só lê quem você convidar, pelo link pessoal.
          </p>
        </div>
        <div style={{ borderTop: `1px solid ${c.border}`, padding: '36px 64px', display: 'flex', flexDirection: 'column' }}>
          <p style={{ fontSize: 24, fontWeight: 500, margin: '0 0 18px' }}>
            {count ? `${count} ${count === 1 ? 'pessoa tem' : 'pessoas têm'} acesso` : 'Ninguém tem acesso ainda'}
          </p>
          {INVITES.map((invite, index) =>
            frame >= T.share + 8 + index * 8 ? (
              <Pop key={invite.email} start={T.share + 8 + index * 8}>
                <div style={{ borderTop: `1px solid ${c.border}`, padding: '22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 26, fontWeight: 500 }}>{invite.name}</span>
                    <span style={{ fontSize: 21, color: c.muted }}>{invite.email}</span>
                  </div>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 21,
                      color: c.moss,
                      opacity: sent
                    }}
                  >
                    <Icon d={icons.check} size={22} /> Convite enviado
                  </span>
                </div>
              </Pop>
            ) : null
          )}
        </div>
      </div>
    </AbsoluteFill>
  )
}

export const TelaDoSite = () => {
  const frame = useCurrentFrame()
  const pageOut = interpolate(frame, [T.closeBook - 4, T.closeBook + 8], [1, 0], { ...clamp, easing: ease })
  const bookShift = interpolate(frame, [T.share - 2, T.share + 16], [0, -330], { ...clamp, easing: ease })
  // Push-in lento, para a tela continuar viva depois do movimento de câmera do clipe 2
  const drift = interpolate(frame, [0, 210], [1, 1.035])

  return (
    <AbsoluteFill style={{ background: c.cream, overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `scale(${drift})` }}>
        {frame >= T.closeBook - 4 && (
          <AbsoluteFill style={{ transform: `translateX(${bookShift}px)` }}>
            <Livro />
          </AbsoluteFill>
        )}
        {pageOut > 0 && (
          <AbsoluteFill style={{ opacity: pageOut, transform: `scale(${0.9 + pageOut * 0.1})` }}>
            <Pergunta />
          </AbsoluteFill>
        )}
        {frame >= T.share && <Compartilhar />}
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
