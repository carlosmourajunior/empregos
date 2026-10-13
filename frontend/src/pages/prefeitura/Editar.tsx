import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Briefcase, Building2, Plus, Trash2, UserRound } from 'lucide-react'
import { useState } from 'react'

import { api, type Curriculo, type Experiencia } from '@/lib/api'
import { mascaraTelefone } from '@/lib/mascaras'
import { CONTRATOS, ESCOLARIDADES, HORARIOS } from '@/lib/opcoes'
import { type CandidatoPainel, type EmpresaPainel, errosDa, formatarTelefone, type VagaPainel } from '@/lib/painel'

import { CampoEscolha, CampoTexto, CampoTextoLongo, Janela } from './Formulario'

// Janelas de edição da prefeitura. Salvam com PATCH e atualizam todas as listas do painel.

function useSalvar<T>(caminho: string, onSalvo: (dados: T) => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (corpo: unknown) => api<T>(caminho, { method: 'PATCH', body: corpo }),
    onSuccess: (dados) => {
      queryClient.invalidateQueries({ queryKey: ['painel'] })
      onSalvo(dados)
    },
  })
}

export function EditarVaga({ vaga, onFechar, onSalvo }: { vaga: VagaPainel; onFechar: () => void; onSalvo: (v: VagaPainel) => void }) {
  const [dados, setDados] = useState({
    cargo: vaga.cargo,
    area: vaga.area,
    descricao: vaga.descricao,
    salario: vaga.salario ? String(Math.round(Number(vaga.salario))) : '',
    contrato: vaga.contrato,
    horario: vaga.horario,
    bairro: vaga.bairro,
    quantidade: String(vaga.quantidade),
  })
  const salvar = useSalvar<VagaPainel>(`/painel/vagas/${vaga.id}/`, onSalvo)
  const { campos, geral } = errosDa(salvar.error)
  const mudar = (campo: keyof typeof dados) => (e: { target: { value: string } }) => setDados({ ...dados, [campo]: e.target.value })

  return (
    <Janela
      titulo="Editar vaga"
      texto={`${vaga.empresa} · a situação da vaga não muda ao salvar.`}
      icone={Briefcase}
      ocupado={salvar.isPending}
      erro={geral}
      onFechar={onFechar}
      onSalvar={() =>
        salvar.mutate({ ...dados, salario: dados.salario.trim() ? dados.salario.replace(/\D/g, '') : null, quantidade: Number(dados.quantidade) })
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <CampoTexto rotulo="Cargo" value={dados.cargo} onChange={mudar('cargo')} maxLength={80} required erro={campos.cargo} />
        <CampoTexto rotulo="Área" value={dados.area} onChange={mudar('area')} maxLength={60} required erro={campos.area} />
      </div>
      <CampoTextoLongo rotulo="O que vai fazer" value={dados.descricao} onChange={mudar('descricao')} maxLength={300} required erro={campos.descricao} />
      <div className="grid grid-cols-3 gap-4">
        <CampoTexto
          rotulo="Salário (R$)"
          inputMode="numeric"
          placeholder="A combinar"
          value={dados.salario}
          onChange={mudar('salario')}
          erro={campos.salario}
        />
        <CampoEscolha rotulo="Contrato" opcoes={CONTRATOS} value={dados.contrato} onChange={mudar('contrato')} erro={campos.contrato} />
        <CampoEscolha rotulo="Horário" opcoes={HORARIOS} value={dados.horario} onChange={mudar('horario')} erro={campos.horario} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <CampoTexto rotulo="Bairro" className="col-span-2" value={dados.bairro} onChange={mudar('bairro')} maxLength={80} required erro={campos.bairro} />
        <CampoTexto rotulo="Quantas vagas" type="number" min={1} value={dados.quantidade} onChange={mudar('quantidade')} required erro={campos.quantidade} />
      </div>
    </Janela>
  )
}

/** Nome e WhatsApp da conta. Trocar o número pede um código novo no próximo login. */
function CamposConta({
  dados,
  campos,
  telefoneOriginal,
  onMudar,
}: {
  dados: { nome: string; telefone: string }
  campos: Record<string, string>
  telefoneOriginal: string
  onMudar: (dados: { nome: string; telefone: string }) => void
}) {
  const trocou = dados.telefone.replace(/\D/g, '') !== formatarTelefone(telefoneOriginal).replace(/\D/g, '')
  return (
    <div className="grid grid-cols-2 gap-4">
      <CampoTexto rotulo="Nome" value={dados.nome} onChange={(e) => onMudar({ ...dados, nome: e.target.value })} maxLength={150} required erro={campos.nome} />
      <div className="flex flex-col gap-1">
        <CampoTexto
          rotulo="WhatsApp"
          inputMode="tel"
          value={dados.telefone}
          onChange={(e) => onMudar({ ...dados, telefone: mascaraTelefone(e.target.value) })}
          required
          erro={campos.telefone}
        />
        {trocou && !campos.telefone && <p className="text-muted-foreground text-sm">No próximo login, chega um código nesse número novo.</p>}
      </div>
    </div>
  )
}

export function EditarEmpresa({ empresa, onFechar }: { empresa: EmpresaPainel; onFechar: () => void }) {
  const [dados, setDados] = useState({ nome: empresa.nome, telefone: formatarTelefone(empresa.telefone) })
  const salvar = useSalvar(`/painel/empresas/${empresa.id}/`, onFechar)
  const { campos, geral } = errosDa(salvar.error)
  return (
    <Janela
      titulo="Editar empresa"
      texto="O CNPJ não muda: ele é o login da empresa."
      icone={Building2}
      largura="max-w-xl"
      ocupado={salvar.isPending}
      erro={geral}
      onFechar={onFechar}
      onSalvar={() => salvar.mutate(dados)}
    >
      <CamposConta dados={dados} campos={campos} telefoneOriginal={empresa.telefone} onMudar={setDados} />
    </Janela>
  )
}

const CURRICULO_VAZIO: Curriculo = {
  data_nascimento: '',
  bairro: '',
  escolaridade: 'fundamental',
  areas_interesse: [],
  tem_cnh: false,
  categoria_cnh: '',
  experiencias: [],
}

export function EditarCandidato({
  candidato,
  abrirCurriculo = false,
  onFechar,
  onSalvo,
}: {
  candidato: CandidatoPainel
  abrirCurriculo?: boolean
  onFechar: () => void
  onSalvo: (c: CandidatoPainel) => void
}) {
  const [conta, setConta] = useState({ nome: candidato.nome, telefone: formatarTelefone(candidato.telefone) })
  const [curriculo, setCurriculo] = useState<Curriculo>(candidato.curriculo ?? CURRICULO_VAZIO)
  const [areas, setAreas] = useState((candidato.curriculo?.areas_interesse ?? []).join(', '))
  const temCurriculo = candidato.curriculo !== null
  const [editarCurriculo, setEditarCurriculo] = useState(temCurriculo || abrirCurriculo)
  const salvar = useSalvar<CandidatoPainel>(`/painel/candidatos/${candidato.id}/`, onSalvo)
  const { campos, geral } = errosDa(salvar.error)
  const c = (campo: string) => campos[`curriculo.${campo}`]
  const mudarExperiencia = (i: number, campo: keyof Experiencia, valor: string) =>
    setCurriculo({ ...curriculo, experiencias: curriculo.experiencias.map((e, j) => (j === i ? { ...e, [campo]: valor } : e)) })

  return (
    <Janela
      titulo="Editar candidato"
      texto="O CPF não muda: ele é o login da pessoa."
      icone={UserRound}
      largura="max-w-3xl"
      ocupado={salvar.isPending}
      erro={geral ?? (Object.keys(campos).length ? 'Confira os campos marcados.' : undefined)}
      onFechar={onFechar}
      onSalvar={() =>
        salvar.mutate({
          ...conta,
          ...(editarCurriculo && {
            curriculo: {
              ...curriculo,
              areas_interesse: areas
                .split(',')
                .map((a) => a.trim())
                .filter(Boolean),
              categoria_cnh: curriculo.tem_cnh ? curriculo.categoria_cnh : '',
            },
          }),
        })
      }
    >
      <CamposConta dados={conta} campos={campos} telefoneOriginal={candidato.telefone} onMudar={setConta} />

      {!editarCurriculo ? (
        <button
          type="button"
          onClick={() => setEditarCurriculo(true)}
          className="text-primary hover:bg-primary-soft/50 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-4 font-bold"
        >
          <Plus className="size-5" /> Preencher o currículo
        </button>
      ) : (
        <section className="flex flex-col gap-4 border-t pt-4">
          <h3 className="text-lg font-extrabold">Currículo</h3>
          <div className="grid grid-cols-3 gap-4">
            <CampoTexto
              rotulo="Nascimento"
              type="date"
              value={curriculo.data_nascimento}
              onChange={(e) => setCurriculo({ ...curriculo, data_nascimento: e.target.value })}
              required
              erro={c('data_nascimento')}
            />
            <CampoTexto
              rotulo="Bairro"
              value={curriculo.bairro}
              onChange={(e) => setCurriculo({ ...curriculo, bairro: e.target.value })}
              maxLength={80}
              required
              erro={c('bairro')}
            />
            <CampoEscolha
              rotulo="Estudo"
              opcoes={ESCOLARIDADES}
              value={curriculo.escolaridade}
              onChange={(e) => setCurriculo({ ...curriculo, escolaridade: e.target.value })}
              erro={c('escolaridade')}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <CampoTexto
              rotulo="Áreas de interesse (até 3, separadas por vírgula)"
              className="col-span-2"
              value={areas}
              onChange={(e) => setAreas(e.target.value)}
              required
              erro={c('areas_interesse')}
            />
            <div className="flex items-end gap-3">
              <label className="flex min-h-11 items-center gap-2 font-bold">
                <input
                  type="checkbox"
                  className="accent-primary size-5"
                  checked={curriculo.tem_cnh}
                  onChange={(e) => setCurriculo({ ...curriculo, tem_cnh: e.target.checked })}
                />
                Tem CNH
              </label>
              {curriculo.tem_cnh && (
                <CampoTexto
                  rotulo="Categoria"
                  className="flex-1"
                  value={curriculo.categoria_cnh}
                  onChange={(e) => setCurriculo({ ...curriculo, categoria_cnh: e.target.value.toUpperCase() })}
                  maxLength={5}
                  erro={c('categoria_cnh')}
                />
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-bold">Experiências</p>
            {curriculo.experiencias.map((exp, i) => (
              <div key={i} className="grid grid-cols-[2fr_2fr_1fr_auto] items-end gap-3">
                <CampoTexto rotulo="O que fazia" value={exp.o_que_fazia} onChange={(e) => mudarExperiencia(i, 'o_que_fazia', e.target.value)} maxLength={120} required />
                <CampoTexto rotulo="Onde" value={exp.onde} onChange={(e) => mudarExperiencia(i, 'onde', e.target.value)} maxLength={120} required />
                <CampoTexto rotulo="Quanto tempo" value={exp.quanto_tempo} onChange={(e) => mudarExperiencia(i, 'quanto_tempo', e.target.value)} maxLength={40} required />
                <button
                  type="button"
                  aria-label="Tirar experiência"
                  onClick={() => setCurriculo({ ...curriculo, experiencias: curriculo.experiencias.filter((_, j) => j !== i) })}
                  className="text-coral hover:bg-coral-soft grid size-11 place-items-center rounded-xl"
                >
                  <Trash2 className="size-5" />
                </button>
              </div>
            ))}
            {c('experiencias') && <p className="text-destructive text-sm font-semibold">{c('experiencias')}</p>}
            {curriculo.experiencias.length < 3 && (
              <button
                type="button"
                onClick={() => setCurriculo({ ...curriculo, experiencias: [...curriculo.experiencias, { o_que_fazia: '', onde: '', quanto_tempo: '' }] })}
                className="text-primary flex items-center gap-1.5 self-start font-bold hover:underline"
              >
                <Plus className="size-4" /> Adicionar experiência
              </button>
            )}
          </div>
        </section>
      )}
    </Janela>
  )
}
