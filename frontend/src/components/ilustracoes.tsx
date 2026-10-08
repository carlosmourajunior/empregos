// Ilustrações em SVG feitas para o MeuEmprego. Leves (sem arquivos de imagem) e com as cores do tema.

const PELES = { clara: '#F2C9A5', media: '#C98E62', escura: '#8A5A3B' }
const CABELO = { preto: '#2B2321', castanho: '#5B3A29', grisalho: '#9A9AA5' }

type PessoaProps = {
  x: number
  escala?: number
  pele: keyof typeof PELES
  cabelo: keyof typeof CABELO
  cabeloLongo?: boolean
  roupa: string
  calca: string
  acessorio?: 'capacete' | 'chef' | 'maleta' | 'avental'
}

/** Uma pessoa em pé, desenhada em volta de (x, chão em y=230). */
function Pessoa({ x, escala = 1, pele, cabelo, cabeloLongo, roupa, calca, acessorio }: PessoaProps) {
  const p = PELES[pele]
  const c = CABELO[cabelo]
  return (
    <g transform={`translate(${x} 230) scale(${escala}) translate(0 -230)`}>
      <ellipse cx={0} cy={231} rx={30} ry={5} fill="#000" opacity={0.12} />
      {cabeloLongo && <rect x={-21} y={70} width={42} height={52} rx={18} fill={c} />}
      {/* pernas e sapatos */}
      <rect x={-15} y={168} width={13} height={58} rx={6} fill={calca} />
      <rect x={2} y={168} width={13} height={58} rx={6} fill={calca} />
      <ellipse cx={-9} cy={227} rx={10} ry={5} fill="#2B2321" />
      <ellipse cx={9} cy={227} rx={10} ry={5} fill="#2B2321" />
      {/* braços */}
      <rect x={-35} y={114} width={13} height={54} rx={6.5} fill={roupa} />
      <rect x={22} y={114} width={13} height={54} rx={6.5} fill={roupa} />
      <circle cx={-28.5} cy={170} r={7} fill={p} />
      <circle cx={28.5} cy={170} r={7} fill={p} />
      {/* tronco */}
      <rect x={-25} y={106} width={50} height={72} rx={20} fill={roupa} />
      {acessorio === 'avental' && <path d="M-15 124h30v52a8 8 0 0 1-8 8h-14a8 8 0 0 1-8-8z" fill="#fff" opacity={0.9} />}
      {/* pescoço e cabeça */}
      <rect x={-6} y={94} width={12} height={16} rx={4} fill={p} />
      <circle cx={0} cy={80} r={21} fill={p} />
      <path d="M-21 80a21 21 0 0 1 42 0q-5-11-21-11t-21 11z" fill={c} />
      <circle cx={-7} cy={82} r={2.2} fill="#2B2321" />
      <circle cx={7} cy={82} r={2.2} fill="#2B2321" />
      <path d="M-6 90q6 5 12 0" stroke="#2B2321" strokeWidth={2} fill="none" strokeLinecap="round" />
      {acessorio === 'capacete' && (
        <g>
          <path d="M-23 72a23 23 0 0 1 46 0z" fill="#F5B82E" />
          <rect x={-27} y={70} width={54} height={6} rx={3} fill="#E09A12" />
          <rect x={-3} y={50} width={6} height={20} rx={3} fill="#E09A12" />
        </g>
      )}
      {acessorio === 'chef' && (
        <g fill="#fff">
          <rect x={-17} y={52} width={34} height={14} rx={3} />
          <circle cx={-11} cy={48} r={10} />
          <circle cx={0} cy={42} r={12} />
          <circle cx={11} cy={48} r={10} />
        </g>
      )}
      {acessorio === 'maleta' && (
        <g>
          <rect x={30} y={162} width={30} height={24} rx={4} fill="#6B3F1F" />
          <rect x={39} y={156} width={12} height={8} rx={3} fill="none" stroke="#6B3F1F" strokeWidth={3} />
        </g>
      )}
    </g>
  )
}

/** Cena da tela inicial: três trabalhadores na frente da cidade. */
export function IlustracaoCidade({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 360 250" className={className} role="img" aria-label="Pessoas trabalhando na cidade">
      {/* sol e prédios ao fundo */}
      <circle cx={326} cy={36} r={24} fill="#FFD66B" />
      <g fill="#fff" opacity={0.18}>
        <rect x={18} y={92} width={46} height={140} rx={6} />
        <rect x={70} y={60} width={40} height={172} rx={6} />
        <rect x={250} y={100} width={44} height={132} rx={6} />
        <rect x={300} y={128} width={44} height={104} rx={6} />
      </g>
      <g fill="#fff" opacity={0.3}>
        <rect x={80} y={74} width={8} height={10} rx={2} />
        <rect x={93} y={74} width={8} height={10} rx={2} />
        <rect x={80} y={94} width={8} height={10} rx={2} />
        <rect x={93} y={94} width={8} height={10} rx={2} />
        <rect x={28} y={106} width={8} height={10} rx={2} />
        <rect x={44} y={106} width={8} height={10} rx={2} />
        <rect x={260} y={114} width={8} height={10} rx={2} />
        <rect x={276} y={114} width={8} height={10} rx={2} />
      </g>
      {/* chão */}
      <rect x={0} y={228} width={360} height={22} rx={11} fill="#fff" opacity={0.22} />
      <Pessoa x={98} escala={0.92} pele="media" cabelo="preto" roupa="#F08A5D" calca="#2F3E66" acessorio="capacete" />
      <Pessoa x={262} escala={0.9} pele="clara" cabelo="castanho" roupa="#3FB67A" calca="#2F3E66" acessorio="chef" />
      <Pessoa
        x={180}
        escala={1.02}
        pele="escura"
        cabelo="preto"
        cabeloLongo
        roupa="#FFC94A"
        calca="#24304F"
        acessorio="maleta"
      />
      {/* balão de "vaga encontrada" */}
      <g transform="translate(196 18)">
        <rect width={92} height={36} rx={18} fill="#fff" />
        <path d="M18 34l-6 12 16-12z" fill="#fff" />
        <circle cx={20} cy={18} r={10} fill="#3FB67A" />
        <path d="M15 18l4 4 7-8" stroke="#fff" strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x={36} y={12} width={44} height={5} rx={2.5} fill="#C9D3EA" />
        <rect x={36} y={21} width={30} height={5} rx={2.5} fill="#E4E9F5" />
      </g>
    </svg>
  )
}

/** Celular recebendo o código pelo WhatsApp. */
export function IlustracaoCelular({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 200" className={className} role="img" aria-label="Celular recebendo uma mensagem com o código">
      <circle cx={110} cy={104} r={86} fill="var(--leaf-soft)" />
      <rect x={66} y={22} width={88} height={168} rx={16} fill="#24304F" />
      <rect x={73} y={34} width={74} height={144} rx={9} fill="#fff" />
      <rect x={73} y={34} width={74} height={22} rx={9} fill="#25A35A" />
      <rect x={73} y={47} width={74} height={9} fill="#25A35A" />
      <circle cx={85} cy={45} r={5} fill="#fff" opacity={0.85} />
      <rect x={94} y={42} width={34} height={5} rx={2.5} fill="#fff" opacity={0.85} />
      <rect x={80} y={66} width={52} height={22} rx={8} fill="#E7F6EC" />
      <rect x={86} y={73} width={36} height={4} rx={2} fill="#9BD3AF" />
      <rect x={86} y={80} width={24} height={4} rx={2} fill="#9BD3AF" />
      {/* balão com o código saindo do celular */}
      <g transform="translate(112 92)">
        <rect width={96} height={44} rx={14} fill="#fff" stroke="#25A35A" strokeWidth={2.5} />
        <text x={48} y={29} textAnchor="middle" fontSize={18} fontWeight={700} fill="#24304F" letterSpacing={2}>
          123 456
        </text>
      </g>
      <circle cx={170} cy={58} r={16} fill="var(--accent)" />
      <text x={170} y={64} textAnchor="middle" fontSize={16} fontWeight={800} fill="#4A2E00">
        1
      </text>
    </svg>
  )
}

/** Forma decorativa (bolhas) para fundos coloridos. */
export function Bolhas({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <circle cx={360} cy={30} r={90} fill="#fff" opacity={0.08} />
      <circle cx={30} cy={250} r={120} fill="#fff" opacity={0.06} />
      <circle cx={330} cy={260} r={40} fill="#fff" opacity={0.07} />
    </svg>
  )
}

/** Prancheta com tudo conferido: fila de aprovação vazia. */
export function IlustracaoTudoEmDia({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 180" className={className} role="img" aria-label="Prancheta com tudo conferido">
      <circle cx={110} cy={96} r={78} fill="var(--leaf-soft)" />
      <rect x={62} y={30} width={96} height={128} rx={14} fill="#C98E62" />
      <rect x={70} y={40} width={80} height={110} rx={8} fill="#fff" />
      <rect x={90} y={22} width={40} height={18} rx={6} fill="#5B6B8F" />
      {[64, 92, 120].map((y) => (
        <g key={y}>
          <circle cx={86} cy={y} r={8} fill="#3FB67A" />
          <path d={`M82 ${y}l3 3 5-6`} stroke="#fff" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <rect x={100} y={y - 5} width={40} height={5} rx={2.5} fill="#C9D3EA" />
          <rect x={100} y={y + 3} width={26} height={4} rx={2} fill="#E4E9F5" />
        </g>
      ))}
      <g transform="translate(150 118)">
        <circle r={22} fill="var(--accent)" />
        <path d="M-9 0l6 6 12-13" stroke="#4A2E00" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <circle cx={42} cy={50} r={5} fill="var(--accent)" />
      <circle cx={186} cy={60} r={4} fill="#F08A5D" />
      <circle cx={34} cy={130} r={3.5} fill="var(--primary)" />
    </svg>
  )
}
