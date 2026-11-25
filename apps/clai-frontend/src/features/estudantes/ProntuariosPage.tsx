import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  ClipboardList,
  FileText,
  GraduationCap,
  Hash,
  LoaderCircle,
  RotateCcw,
  Search,
  User,
} from 'lucide-react'
import type { Estudante, Pagina } from '../../types/estudante'
import {
  listarCursosAtivos,
  listarEstudantes,
  type Curso,
} from './estudanteService'

const TAMANHO_PAGINA = 9

export default function ProntuariosPage() {
  const [paginaDados, setPaginaDados] = useState<Pagina<Estudante> | null>(null)
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [cursos, setCursos] = useState<Curso[]>([])
  const [termoBuscaInput, setTermoBuscaInput] = useState('')
  const [cursoSelecionado, setCursoSelecionado] = useState('')
  const [filtroAplicado, setFiltroAplicado] = useState<{ busca: string; curso: string }>({
    busca: '',
    curso: '',
  })

  useEffect(() => {
    listarCursosAtivos()
      .then(setCursos)
      .catch(() => setCursos([]))
  }, [])

  const carregarProntuarios = useCallback(async () => {
    setCarregando(true)
    setErro('')
    try {
      const resultado = await listarEstudantes(paginaAtual, TAMANHO_PAGINA, {
        busca: filtroAplicado.busca || undefined,
        curso: filtroAplicado.curso || undefined,
      })
      setPaginaDados(resultado)
    } catch {
      setErro('Não foi possível carregar a central de prontuários dos estudantes.')
    } finally {
      setCarregando(false)
    }
  }, [paginaAtual, filtroAplicado])

  useEffect(() => {
    void carregarProntuarios()
  }, [carregarProntuarios])

  function handleFiltrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPaginaAtual(1)
    setFiltroAplicado({
      busca: termoBuscaInput.trim(),
      curso: cursoSelecionado,
    })
  }

  function handleLimparFiltros() {
    setTermoBuscaInput('')
    setCursoSelecionado('')
    setPaginaAtual(1)
    setFiltroAplicado({ busca: '', curso: '' })
  }

  const estudantes = paginaDados?.itens ?? []
  const estudantesFiltrados = estudantes.filter((est) => {
    const termo = filtroAplicado.busca.toLowerCase()
    const bateBusca =
      !termo ||
      est.nome.toLowerCase().includes(termo) ||
      est.matricula.toLowerCase().includes(termo)
    const bateCurso = !filtroAplicado.curso || est.curso === filtroAplicado.curso
    return bateBusca && bateCurso
  })

  return (
    <div className="space-y-6">
      {/* Cabeçalho Institucional da Central de Prontuários */}
      <section
        aria-labelledby="titulo-central-prontuarios"
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
              <ClipboardList className="size-6" aria-hidden="true" />
            </div>
            <div>
              <h2 id="titulo-central-prontuarios" className="text-lg font-bold text-slate-900">
                Central de Prontuários Pedagógicos — CLAI
              </h2>
              <p className="mt-1 max-w-3xl text-sm text-slate-600">
                Acesse diretamente o prontuário individual de cada estudante acompanhado pela CLAI
                e navegue com um clique para o <strong>Estudo de Caso (Fase 01/02)</strong>,{' '}
                <strong>Acompanhamento e Atendimentos</strong> ou{' '}
                <strong>Documentos Pedagógicos (Plano de Ação, PEI/PEA e RAI)</strong>.
              </p>
            </div>
          </div>

          {paginaDados && (
            <div className="rounded-lg border border-blue-100 bg-blue-50/70 px-4 py-2.5 text-right">
              <span className="block text-xs font-semibold uppercase tracking-wide text-blue-700">
                Prontuários Ativos
              </span>
              <span className="text-xl font-bold text-blue-950">{paginaDados.total}</span>
            </div>
          )}
        </div>

        {/* Formulário de Busca Rápida e Filtro por Curso */}
        <form
          onSubmit={handleFiltrar}
          aria-label="Buscar prontuário de estudante"
          className="mt-5 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-[1fr_16rem_auto]"
        >
          <div>
            <label htmlFor="busca-prontuario" className="sr-only">
              Buscar por nome ou matrícula
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="busca-prontuario"
                type="search"
                placeholder="Buscar prontuário por nome ou matrícula do estudante…"
                value={termoBuscaInput}
                onChange={(e) => setTermoBuscaInput(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-3.5 pl-10 text-sm text-slate-900 shadow-2xs focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="filtro-curso-prontuario" className="sr-only">
              Filtrar por curso
            </label>
            <select
              id="filtro-curso-prontuario"
              value={cursoSelecionado}
              onChange={(e) => setCursoSelecionado(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
            >
              <option value="">Todos os cursos</option>
              {cursos.map((curso) => (
                <option key={curso.id ?? curso.nome} value={curso.nome}>
                  {curso.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:outline-none"
            >
              <Search className="size-4" aria-hidden="true" />
              Buscar
            </button>

            {(filtroAplicado.busca || filtroAplicado.curso) && (
              <button
                type="button"
                onClick={handleLimparFiltros}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                Limpar
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Estado de Carregamento */}
      {carregando && (
        <div
          role="status"
          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm"
        >
          <LoaderCircle className="size-8 animate-spin text-blue-600" aria-hidden="true" />
          <p className="font-semibold text-slate-800">Carregando prontuários dos estudantes…</p>
        </div>
      )}

      {/* Estado de Erro */}
      {!carregando && erro && (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="size-5 shrink-0 text-red-600" aria-hidden="true" />
            <span>{erro}</span>
          </div>
          <button
            type="button"
            onClick={() => void carregarProntuarios()}
            className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Grid de Cards de Prontuários com Atalhos Diretos por Aba */}
      {!carregando && !erro && estudantesFiltrados.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {estudantesFiltrados.map((est) => {
            const rotaBase = `/estudantes/${encodeURIComponent(est.matricula)}`
            return (
              <article
                key={est.id ?? est.matricula}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <User className="size-5" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-bold text-slate-900">
                          <Link
                            to={rotaBase}
                            className="hover:text-blue-600 focus:underline focus:outline-none"
                          >
                            {est.nome}
                          </Link>
                        </h3>
                        <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-slate-500">
                          <Hash className="size-3.5 text-blue-600" aria-hidden="true" />
                          Matrícula: <span className="font-semibold text-slate-700">{est.matricula}</span>
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                      Ativo
                    </span>
                  </div>

                  <dl className="mt-3.5 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="size-4 shrink-0 text-blue-600" aria-hidden="true" />
                      <dt className="sr-only">Curso</dt>
                      <dd className="truncate font-semibold text-slate-800">{est.curso}</dd>
                    </div>
                    <div className="flex items-center gap-2">
                      <ClipboardList className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
                      <dt className="text-slate-500">Origem:</dt>
                      <dd className="truncate font-medium text-slate-700">
                        {est.origemIdentificacao}
                      </dd>
                    </div>
                  </dl>

                  {/* Atalhos diretos para cada aba do Prontuário */}
                  <div className="mt-4 border-t border-slate-100 pt-3.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Abrir direto na aba:
                    </p>
                    <div className="mt-2 grid gap-1.5">
                      <Link
                        to={`${rotaBase}?aba=estudo-caso`}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-700"
                      >
                        <span className="flex items-center gap-2">
                          <ClipboardList className="size-3.5 text-blue-600" aria-hidden="true" />
                          1. Estudo de Caso (Fase 01/02)
                        </span>
                        <ArrowRight className="size-3.5" aria-hidden="true" />
                      </Link>

                      <Link
                        to={`${rotaBase}?aba=acompanhamento`}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-700"
                      >
                        <span className="flex items-center gap-2">
                          <CalendarClock className="size-3.5 text-emerald-600" aria-hidden="true" />
                          2. Acompanhamento e Atendimentos
                        </span>
                        <ArrowRight className="size-3.5" aria-hidden="true" />
                      </Link>

                      <Link
                        to={`${rotaBase}?aba=documentos`}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50/60 hover:text-indigo-700"
                      >
                        <span className="flex items-center gap-2">
                          <FileText className="size-3.5 text-indigo-600" aria-hidden="true" />
                          3. Documentos (Plano de Ação e PEI)
                        </span>
                        <ArrowRight className="size-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2">
                  <Link
                    to={rotaBase}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:outline-none"
                  >
                    <ClipboardList className="size-4" aria-hidden="true" />
                    Abrir Prontuário Completo
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* Estado Vazio */}
      {!carregando && !erro && estudantesFiltrados.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <ClipboardList className="size-10 text-slate-400" aria-hidden="true" />
          <h3 className="mt-3 text-base font-bold text-slate-900">
            Nenhum prontuário encontrado para os filtros informados
          </h3>
          <p className="mt-1 max-w-md text-sm text-slate-600">
            Verifique o nome ou matrícula digitados ou cadastre um novo estudante na seção de
            Estudantes.
          </p>
        </div>
      )}

      {/* Paginação */}
      {!carregando && !erro && paginaDados && paginaDados.totalPaginas > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-5 py-3.5 shadow-sm">
          <p className="text-xs font-medium text-slate-600">
            Página <span className="font-bold text-slate-900">{paginaDados.pagina}</span> de{' '}
            <span className="font-bold text-slate-900">{paginaDados.totalPaginas}</span> (
            {paginaDados.total} prontuários ativos)
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={paginaAtual <= 1}
              onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={paginaAtual >= paginaDados.totalPaginas}
              onClick={() =>
                setPaginaAtual((p) => Math.min(paginaDados.totalPaginas, p + 1))
              }
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
