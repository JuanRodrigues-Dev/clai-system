import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarClock,
  ClipboardList,
  GraduationCap,
  Hash,
  LoaderCircle,
  Pencil,
  User,
} from 'lucide-react'
import type { Estudante } from '../../types/estudante'
import { buscarEstudantePorMatricula } from './estudanteService'
import { EstudoCasoTab } from '../estudo-caso/EstudoCasoTab'
import { AcompanhamentoAtendimentosTab } from '../acompanhamento/AcompanhamentoAtendimentosTab'

type AbaProntuario = 'estudo-caso' | 'acompanhamento'

export default function EstudanteDetalhePage() {
  const { matricula } = useParams<{ matricula: string }>()
  const [estudante, setEstudante] = useState<Estudante | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [abaAtiva, setAbaAtiva] = useState<AbaProntuario>('estudo-caso')

  const carregarEstudante = useCallback(async () => {
    if (!matricula) return
    setCarregando(true)
    setErro('')
    try {
      const dados = await buscarEstudantePorMatricula(matricula)
      setEstudante(dados)
    } catch {
      setErro('Não foi possível carregar os dados do estudante.')
    } finally {
      setCarregando(false)
    }
  }, [matricula])

  useEffect(() => {
    carregarEstudante()
  }, [carregarEstudante])

  if (carregando) {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm"
      >
        <LoaderCircle className="size-8 animate-spin text-blue-600" aria-hidden="true" />
        <p className="font-semibold text-slate-800">Carregando prontuário do estudante…</p>
      </div>
    )
  }

  if (erro || !estudante) {
    return (
      <div className="space-y-4">
        <Link
          to="/estudantes"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar para a lista de estudantes
        </Link>

        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm"
        >
          <p className="font-semibold text-red-700">
            {erro || 'Estudante não encontrado.'}
          </p>
          <button
            type="button"
            onClick={carregarEstudante}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/estudantes"
          className="inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar para a lista de estudantes
        </Link>

        <Link
          to={`/estudantes/${encodeURIComponent(estudante.matricula)}/editar`}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <Pencil className="size-3.5" aria-hidden="true" />
          Editar dados cadastrais
        </Link>
      </div>

      {/* Cabeçalho Institucional do Prontuário */}
      <section
        aria-labelledby="titulo-prontuario-estudante"
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
              <User className="size-7" aria-hidden="true" />
            </div>
            <div>
              <h2 id="titulo-prontuario-estudante" className="text-xl font-bold text-slate-900">
                {estudante.nome}
              </h2>
              <p className="mt-0.5 text-sm text-slate-600">
                Prontuário de Acompanhamento Pedagógico e Inclusivo — CLAI
              </p>
            </div>
          </div>

          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              estudante.ativo !== false
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {estudante.ativo !== false ? 'Estudante Ativo' : 'Estudante Inativo'}
          </span>
        </div>

        <dl className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3.5">
            <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
              <Hash className="size-3.5 text-blue-600" aria-hidden="true" />
              Matrícula
            </dt>
            <dd className="mt-1 font-semibold text-slate-900">{estudante.matricula}</dd>
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3.5">
            <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
              <GraduationCap className="size-3.5 text-blue-600" aria-hidden="true" />
              Curso
            </dt>
            <dd className="mt-1 font-semibold text-slate-900">{estudante.curso}</dd>
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3.5">
            <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
              <ClipboardList className="size-3.5 text-blue-600" aria-hidden="true" />
              Origem da Identificação
            </dt>
            <dd className="mt-1 font-semibold text-slate-900">{estudante.origemIdentificacao}</dd>
          </div>
        </dl>
      </section>

      {/* Navegação por Abas do Prontuário */}
      <div className="border-b border-slate-200">
        <nav aria-label="Abas do prontuário do estudante" className="-mb-px flex flex-wrap gap-2">
          <button
            type="button"
            role="tab"
            aria-selected={abaAtiva === 'estudo-caso'}
            onClick={() => setAbaAtiva('estudo-caso')}
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition focus:outline-none ${
              abaAtiva === 'estudo-caso'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900'
            }`}
          >
            <ClipboardList className="size-4" aria-hidden="true" />
            Estudo de Caso (Fase 01/02)
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={abaAtiva === 'acompanhamento'}
            onClick={() => setAbaAtiva('acompanhamento')}
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition focus:outline-none ${
              abaAtiva === 'acompanhamento'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900'
            }`}
          >
            <CalendarClock className="size-4" aria-hidden="true" />
            Acompanhamento e Atendimentos
          </button>
        </nav>
      </div>

      {/* Conteúdo da Aba Selecionada */}
      <div role="tabpanel">
        {abaAtiva === 'estudo-caso' && (
          <EstudoCasoTab
            matricula={estudante.matricula}
            nomeEstudante={estudante.nome}
            cursoEstudante={estudante.curso}
          />
        )}

        {abaAtiva === 'acompanhamento' && (
          <AcompanhamentoAtendimentosTab
            matricula={estudante.matricula}
            nomeEstudante={estudante.nome}
          />
        )}
      </div>
    </div>
  )
}
