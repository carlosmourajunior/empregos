import { Ban, Eye, FileText, Handshake, ShieldCheck, Trash2, type LucideIcon } from 'lucide-react'

import { Tela } from '@/components/Tela'

// Texto em linguagem simples. Antes de abrir ao público, o jurídico da prefeitura deve revisar.
const SECOES: { icone: LucideIcon; titulo: string; texto: string[]; cor: string }[] = [
  {
    icone: Handshake,
    titulo: 'O que é o MeuEmprego',
    texto: [
      'Um serviço gratuito para ligar quem procura trabalho às vagas das empresas da nossa cidade, feito em parceria com a prefeitura.',
    ],
    cor: 'bg-primary-soft text-primary',
  },
  {
    icone: FileText,
    titulo: 'Que dados guardamos',
    texto: [
      'Nome, CPF ou CNPJ e WhatsApp.',
      'No currículo: data de nascimento, bairro, escolaridade, áreas de interesse, experiências e carteira de motorista.',
      'Usamos esses dados só para mostrar vagas, mandar o código pelo WhatsApp e permitir que a empresa fale com você.',
    ],
    cor: 'bg-accent-soft text-[oklch(0.5_0.13_65)]',
  },
  {
    icone: Eye,
    titulo: 'Quem vê seus dados',
    texto: [
      'A empresa só vê seu currículo e seu WhatsApp se você tocar em “Tenho interesse” numa vaga dela. O CPF aparece escondido.',
      'A equipe da prefeitura vê os dados para cuidar do sistema e fazer relatórios.',
      'Não vendemos nem passamos seus dados para mais ninguém.',
    ],
    cor: 'bg-leaf-soft text-[oklch(0.45_0.12_155)]',
  },
  {
    icone: Trash2,
    titulo: 'Seus direitos',
    texto: [
      'Você pode mudar o currículo quando quiser.',
      'Você pode apagar a sua conta a qualquer momento. Os seus dados são apagados de verdade.',
    ],
    cor: 'bg-coral-soft text-coral',
  },
  {
    icone: Ban,
    titulo: 'Regras para empresas',
    texto: [
      'Só anuncie vagas de verdade. É proibido cobrar qualquer valor de quem se candidata.',
      'A prefeitura confere cada vaga antes de publicar e pode recusar vagas ou bloquear empresas.',
    ],
    cor: 'bg-primary-soft text-primary',
  },
]

export default function Termos() {
  return (
    <Tela titulo="Termos e privacidade" subtitulo="Explicado de um jeito simples" icone={ShieldCheck} voltarPara="/">
      <div className="flex flex-col gap-5">
        {SECOES.map(({ icone: Icone, titulo, texto, cor }) => (
          <section key={titulo} className="flex gap-4">
            <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${cor}`}>
              <Icone className="size-6" />
            </span>
            <div className="flex flex-col gap-1.5">
              <h2 className="text-xl font-bold">{titulo}</h2>
              {texto.map((t) => (
                <p key={t} className="text-lg">
                  {t}
                </p>
              ))}
            </div>
          </section>
        ))}
        <p className="bg-muted rounded-2xl p-4 text-base">
          Ficou com dúvida? Procure o balcão de atendimento da prefeitura. Lá também ajudam a fazer o cadastro.
        </p>
      </div>
    </Tela>
  )
}
