import { Building2, Download, FileText, type LucideIcon, Megaphone } from 'lucide-react'

import { cn } from '@/lib/utils'

import { Cabecalho } from './Layout'

const PLANILHAS: { tipo: string; nome: string; texto: string; icone: LucideIcon; cor: string }[] = [
  {
    tipo: 'vagas',
    nome: 'Vagas',
    texto: 'Todas as vagas, com empresa, salário, situação e quantos interessados.',
    icone: Megaphone,
    cor: 'bg-primary-soft text-primary',
  },
  {
    tipo: 'curriculos',
    nome: 'Currículos',
    texto: 'Nome, WhatsApp, bairro, escolaridade e áreas. Sem CPF, para proteger os dados.',
    icone: FileText,
    cor: 'bg-leaf-soft text-[oklch(0.45_0.12_155)]',
  },
  {
    tipo: 'empresas',
    nome: 'Empresas',
    texto: 'Empresas cadastradas, CNPJ, contato e quantas vagas cada uma criou.',
    icone: Building2,
    cor: 'bg-accent-soft text-[oklch(0.5_0.13_65)]',
  },
]

export default function Planilhas() {
  return (
    <>
      <Cabecalho titulo="Planilhas" texto="Baixe os dados para relatórios. Abre no Excel, LibreOffice ou Google Planilhas." />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {PLANILHAS.map(({ tipo, nome, texto, icone: Icone, cor }) => (
          <article key={tipo} className="bg-card flex flex-col gap-4 rounded-3xl p-6 shadow-sm ring-1 ring-black/5">
            <span className={cn('grid size-14 place-items-center rounded-2xl', cor)}>
              <Icone className="size-7" />
            </span>
            <div className="flex-1">
              <h2 className="text-xl font-extrabold">{nome}</h2>
              <p className="text-muted-foreground mt-1">{texto}</p>
            </div>
            <a
              href={`/api/painel/exportar/${tipo}/`}
              download
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl font-bold"
            >
              <Download className="size-5" /> Baixar planilha
            </a>
          </article>
        ))}
      </div>
      <p className="text-muted-foreground mt-6 text-sm">
        As planilhas têm dados pessoais. Guarde em local seguro e não compartilhe fora da prefeitura.
      </p>
    </>
  )
}
