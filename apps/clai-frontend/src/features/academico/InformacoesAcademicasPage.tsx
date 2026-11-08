import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { BookOpen, GraduationCap, LoaderCircle, Plus } from 'lucide-react'
import { extrairMensagemErro } from '../../api/http'
import { Mensagem } from '../../shared/feedback/Mensagem'
import { useToast } from '../../shared/feedback/useToast'
import type { Curso, Disciplina, NivelCurso } from '../../types/academico'
import {
  alterarStatusCurso,
  alterarStatusDisciplina,
  atualizarCurso,
  atualizarDisciplina,
  criarCurso,
  criarDisciplina,
  CursoDuplicadoError,
  DisciplinaDuplicadaError,
  listarCursos,
  listarDisciplinas,
} from './academicoService'

const OPCOES_NIVEL: { valor: NivelCurso; rotulo: string }[] = [
  { valor: 'SUPERIOR', rotulo: 'Superior' },
  { valor: 'TECNICO_INTEGRADO', rotulo: 'Técnico Integrado' },
  { valor: 'TECNICO_SUBSEQUENTE', rotulo: 'Técnico Subsequente' },
]

function formatarNivel(nivel: string): string {
  return OPCOES_NIVEL.find((o) => o.valor === nivel)?.rotulo ?? nivel
}

export default function InformacoesAcademicasPage() {
  const { mostrarSucesso } = useToast()

  // Estado de Cursos
  const [cursos, setCursos] = useState<Curso[]>([])
  const [carregandoCursos, setCarregandoCursos] = useState(true)
  const [erroListaCursos, setErroListaCursos] = useState('')

  const [cursoEditando, setCursoEditando] = useState<Curso | null>(null)
  const [nomeCurso, setNomeCurso] = useState('')
  const [nivelCurso, setNivelCurso] = useState<NivelCurso>('SUPERIOR')
  const [erroFormCurso, setErroFormCurso] = useState('')
  const [salvandoCurso, setSalvandoCurso] = useState(false)

  // Estado de Disciplinas
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [carregandoDisciplinas, setCarregandoDisciplinas] = useState(true)
  const [erroListaDisciplinas, setErroListaDisciplinas] = useState('')
  const [filtroCursoDisciplina, setFiltroCursoDisciplina] = useState('')

  const [disciplinaEditando, setDisciplinaEditando] = useState<Disciplina | null>(null)
  const [nomeDisciplina, setNomeDisciplina] = useState('')
  const [codigoDisciplina, setCodigoDisciplina] = useState('')
  const [periodoDisciplina, setPeriodoDisciplina] = useState('')
  const [cargaHorariaDisciplina, setCargaHorariaDisciplina] = useState('')
  const [cursoIdDisciplina, setCursoIdDisciplina] = useState('')
  const [erroFormDisciplina, setErroFormDisciplina] = useState('')
  const [salvandoDisciplina, setSalvandoDisciplina] = useState(false)

  const carregarCursos = useCallback(async () => {
    setCarregandoCursos(true)
    setErroListaCursos('')
    try {
      const lista = await listarCursos(false)
      setCursos(lista)
    } catch {
      setErroListaCursos('Não foi possível carregar os cursos cadastrados.')
    } finally {
      setCarregandoCursos(false)
    }
  }, [])

  const carregarDisciplinas = useCallback(async () => {
    setCarregandoDisciplinas(true)
    setErroListaDisciplinas('')
    try {
      const lista = await listarDisciplinas()
      setDisciplinas(lista)
    } catch {
      setErroListaDisciplinas('Não foi possível carregar as disciplinas cadastradas.')
    } finally {
      setCarregandoDisciplinas(false)
    }
  }, [])

  useEffect(() => {
    carregarCursos()
    carregarDisciplinas()
  }, [carregarCursos, carregarDisciplinas])

  const cursosAtivos = useMemo(() => cursos.filter((c) => c.ativo !== false), [cursos])

  const mapaNomesCursos = useMemo(() => {
    const mapa = new Map<string, string>()
    for (const c of cursos) {
      mapa.set(String(c.id), c.nome)
    }
    return mapa
  }, [cursos])

  const disciplinasFiltradas = useMemo(() => {
    if (!filtroCursoDisciplina) return disciplinas
    return disciplinas.filter((d) => String(d.cursoId) === filtroCursoDisciplina)
  }, [disciplinas, filtroCursoDisciplina])

  // Handlers de Curso
  function iniciarEdicaoCurso(curso: Curso) {
    setCursoEditando(curso)
    setNomeCurso(curso.nome)
    setNivelCurso(curso.nivel || 'SUPERIOR')
    setErroFormCurso('')
  }

  function cancelarEdicaoCurso() {
    setCursoEditando(null)
    setNomeCurso('')
    setNivelCurso('SUPERIOR')
    setErroFormCurso('')
  }

  async function handleSubmitCurso(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nomeLimpo = nomeCurso.trim()
    if (!nomeLimpo) {
      setErroFormCurso('Informe o nome do curso.')
      return
    }

    setSalvandoCurso(true)
    setErroFormCurso('')
    try {
      if (cursoEditando) {
        await atualizarCurso(cursoEditando.id, { nome: nomeLimpo, nivel: nivelCurso })
        mostrarSucesso('Curso atualizado com sucesso.')
      } else {
        await criarCurso({ nome: nomeLimpo, nivel: nivelCurso })
        mostrarSucesso('Curso cadastrado com sucesso.')
      }
      cancelarEdicaoCurso()
      await carregarCursos()
    } catch (error) {
      if (error instanceof CursoDuplicadoError) {
        setErroFormCurso('Já existe um curso cadastrado com este nome.')
      } else {
        setErroFormCurso(extrairMensagemErro(error, 'Não foi possível salvar o curso.'))
      }
    } finally {
      setSalvandoCurso(false)
    }
  }

  async function handleAlternarStatusCurso(curso: Curso) {
    const novoStatus = !curso.ativo
    const acao = novoStatus ? 'reativar' : 'inativar'
    if (!window.confirm(`Deseja realmente ${acao} o curso "${curso.nome}"?`)) return

    try {
      await alterarStatusCurso(curso.id, novoStatus)
      mostrarSucesso(`Curso ${novoStatus ? 'reativado' : 'inativado'} com sucesso.`)
      await carregarCursos()
    } catch (error) {
      setErroListaCursos(extrairMensagemErro(error, `Não foi possível ${acao} o curso.`))
    }
  }

  // Handlers de Disciplina
  function iniciarEdicaoDisciplina(disciplina: Disciplina) {
    setDisciplinaEditando(disciplina)
    setNomeDisciplina(disciplina.nome)
    setCodigoDisciplina(disciplina.codigo ?? '')
    setPeriodoDisciplina(disciplina.periodo != null ? String(disciplina.periodo) : '')
    setCargaHorariaDisciplina(
      disciplina.cargaHoraria != null ? String(disciplina.cargaHoraria) : '',
    )
    setCursoIdDisciplina(String(disciplina.cursoId))
    setErroFormDisciplina('')
  }

  function cancelarEdicaoDisciplina() {
    setDisciplinaEditando(null)
    setNomeDisciplina('')
    setCodigoDisciplina('')
    setPeriodoDisciplina('')
    setCargaHorariaDisciplina('')
    setCursoIdDisciplina('')
    setErroFormDisciplina('')
  }

  async function handleSubmitDisciplina(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nomeLimpo = nomeDisciplina.trim()
    if (!nomeLimpo) {
      setErroFormDisciplina('Informe o nome da disciplina.')
      return
    }
    if (!cursoIdDisciplina) {
      setErroFormDisciplina('Selecione o curso ao qual a disciplina pertence.')
      return
    }

    const periodoNum = periodoDisciplina.trim() ? Number(periodoDisciplina) : undefined
    const cargaNum = cargaHorariaDisciplina.trim() ? Number(cargaHorariaDisciplina) : undefined

    if (periodoNum !== undefined && (Number.isNaN(periodoNum) || periodoNum < 1)) {
      setErroFormDisciplina('O período deve ser um número inteiro positivo.')
      return
    }
    if (cargaNum !== undefined && (Number.isNaN(cargaNum) || cargaNum < 1)) {
      setErroFormDisciplina('A carga horária deve ser um número inteiro positivo.')
      return
    }

    const payload = {
      nome: nomeLimpo,
      codigo: codigoDisciplina.trim() || undefined,
      periodo: periodoNum,
      cargaHoraria: cargaNum,
      cursoId: Number.isNaN(Number(cursoIdDisciplina))
        ? cursoIdDisciplina
        : Number(cursoIdDisciplina),
    }

    setSalvandoDisciplina(true)
    setErroFormDisciplina('')
    try {
      if (disciplinaEditando) {
        await atualizarDisciplina(disciplinaEditando.id, payload)
        mostrarSucesso('Disciplina atualizada com sucesso.')
      } else {
        await criarDisciplina(payload)
        mostrarSucesso('Disciplina cadastrada com sucesso.')
      }
      cancelarEdicaoDisciplina()
      await carregarDisciplinas()
    } catch (error) {
      if (error instanceof DisciplinaDuplicadaError) {
        setErroFormDisciplina('Já existe uma disciplina com este nome neste curso.')
      } else {
        setErroFormDisciplina(extrairMensagemErro(error, 'Não foi possível salvar a disciplina.'))
      }
    } finally {
      setSalvandoDisciplina(false)
    }
  }

  async function handleAlternarStatusDisciplina(disciplina: Disciplina) {
    const novoStatus = !disciplina.ativo
    const acao = novoStatus ? 'reativar' : 'inativar'
    if (!window.confirm(`Deseja realmente ${acao} a disciplina "${disciplina.nome}"?`)) return

    try {
      await alterarStatusDisciplina(disciplina.id, novoStatus)
      mostrarSucesso(`Disciplina ${novoStatus ? 'reativada' : 'inativada'} com sucesso.`)
      await carregarDisciplinas()
    } catch (error) {
      setErroListaDisciplinas(extrairMensagemErro(error, `Não foi possível ${acao} a disciplina.`))
    }
  }

  return (
    <div className="space-y-8">
      {/* Seção de Gerenciamento de Cursos */}
      <section aria-labelledby="titulo-secao-cursos" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <GraduationCap className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="titulo-secao-cursos" className="text-lg font-bold text-slate-900">
                Cursos do Campus
              </h2>
              <p className="text-sm text-slate-600">
                Cadastre e gerencie os cursos que abastecem o cadastro de estudantes e as disciplinas.
              </p>
            </div>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {cursos.length} {cursos.length === 1 ? 'curso' : 'cursos'}
          </span>
        </div>

        {/* Formulário compacto de Curso */}
        <form onSubmit={handleSubmitCurso} noValidate className="mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="mb-3 text-sm font-semibold text-slate-800">
            {cursoEditando ? `Editando curso: ${cursoEditando.nome}` : 'Adicionar novo curso'}
          </p>

          {erroFormCurso && (
            <div className="mb-4">
              <Mensagem tipo="erro">{erroFormCurso}</Mensagem>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-[1fr_14rem_auto]">
            <div>
              <label htmlFor="nome-curso" className="mb-1 block text-xs font-medium text-slate-700">
                Nome do curso <span aria-hidden="true" className="text-red-600">*</span>
              </label>
              <input
                id="nome-curso"
                type="text"
                maxLength={160}
                placeholder="Ex.: Análise e Desenvolvimento de Sistemas"
                value={nomeCurso}
                onChange={(e) => setNomeCurso(e.target.value)}
                required
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              />
            </div>

            <div>
              <label htmlFor="nivel-curso" className="mb-1 block text-xs font-medium text-slate-700">
                Nível <span aria-hidden="true" className="text-red-600">*</span>
              </label>
              <select
                id="nivel-curso"
                value={nivelCurso}
                onChange={(e) => setNivelCurso(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              >
                {OPCOES_NIVEL.map((op) => (
                  <option key={op.valor} value={op.valor}>
                    {op.rotulo}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2">
              {cursoEditando && (
                <button
                  type="button"
                  onClick={cancelarEdicaoCurso}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                disabled={salvandoCurso}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {salvandoCurso ? (
                  <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Plus className="size-4" aria-hidden="true" />
                )}
                {cursoEditando ? 'Salvar curso' : 'Adicionar curso'}
              </button>
            </div>
          </div>
        </form>

        {/* Lista de Cursos */}
        <div className="mt-5">
          {carregandoCursos && (
            <div role="status" className="flex items-center justify-center gap-2 py-10 text-sm text-slate-600">
              <LoaderCircle className="size-5 animate-spin text-blue-600" aria-hidden="true" />
              <span>Carregando cursos…</span>
            </div>
          )}

          {!carregandoCursos && erroListaCursos && (
            <div className="space-y-3 py-4">
              <Mensagem tipo="erro">{erroListaCursos}</Mensagem>
              <button
                type="button"
                onClick={carregarCursos}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!carregandoCursos && !erroListaCursos && cursos.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">
              Nenhum curso cadastrado até o momento. Utilize o formulário acima para adicionar.
            </p>
          )}

          {!carregandoCursos && !erroListaCursos && cursos.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <caption className="sr-only">Lista de cursos</caption>
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium">Nome do curso</th>
                    <th scope="col" className="px-4 py-3 font-medium">Nível</th>
                    <th scope="col" className="px-4 py-3 font-medium">Status</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {cursos.map((curso) => (
                    <tr key={curso.id} className={!curso.ativo ? 'bg-slate-50/60 opacity-75' : ''}>
                      <td className="px-4 py-3 font-semibold text-slate-900">{curso.nome}</td>
                      <td className="px-4 py-3 text-slate-700">{formatarNivel(curso.nivel)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            curso.ativo
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {curso.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => iniciarEdicaoCurso(curso)}
                            className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAlternarStatusCurso(curso)}
                            className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${
                              curso.ativo
                                ? 'border-red-200 text-red-700 hover:bg-red-50'
                                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            {curso.ativo ? 'Inativar' : 'Reativar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Seção de Gerenciamento de Disciplinas */}
      <section aria-labelledby="titulo-secao-disciplinas" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <BookOpen className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="titulo-secao-disciplinas" className="text-lg font-bold text-slate-900">
                Disciplinas por Curso
              </h2>
              <p className="text-sm text-slate-600">
                Cadastre e gerencie as disciplinas vinculadas aos cursos do campus.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              aria-label="Filtrar disciplinas por curso"
              value={filtroCursoDisciplina}
              onChange={(e) => setFiltroCursoDisciplina(e.target.value)}
              className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
            >
              <option value="">Todos os cursos</option>
              {cursos.map((curso) => (
                <option key={curso.id} value={String(curso.id)}>
                  {curso.nome}
                </option>
              ))}
            </select>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {disciplinasFiltradas.length}{' '}
              {disciplinasFiltradas.length === 1 ? 'disciplina' : 'disciplinas'}
            </span>
          </div>
        </div>

        {/* Formulário de Disciplina */}
        <form onSubmit={handleSubmitDisciplina} noValidate className="mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="mb-3 text-sm font-semibold text-slate-800">
            {disciplinaEditando
              ? `Editando disciplina: ${disciplinaEditando.nome}`
              : 'Adicionar nova disciplina'}
          </p>

          {erroFormDisciplina && (
            <div className="mb-4">
              <Mensagem tipo="erro">{erroFormDisciplina}</Mensagem>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_7rem_6rem_7rem_auto]">
            <div>
              <label htmlFor="nome-disciplina" className="mb-1 block text-xs font-medium text-slate-700">
                Nome da disciplina <span aria-hidden="true" className="text-red-600">*</span>
              </label>
              <input
                id="nome-disciplina"
                type="text"
                maxLength={160}
                placeholder="Ex.: Banco de Dados II"
                value={nomeDisciplina}
                onChange={(e) => setNomeDisciplina(e.target.value)}
                required
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              />
            </div>

            <div>
              <label htmlFor="curso-disciplina" className="mb-1 block text-xs font-medium text-slate-700">
                Curso <span aria-hidden="true" className="text-red-600">*</span>
              </label>
              <select
                id="curso-disciplina"
                value={cursoIdDisciplina}
                onChange={(e) => setCursoIdDisciplina(e.target.value)}
                required
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              >
                <option value="">Selecione o curso</option>
                {cursosAtivos.map((curso) => (
                  <option key={curso.id} value={String(curso.id)}>
                    {curso.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="codigo-disciplina" className="mb-1 block text-xs font-medium text-slate-700">
                Código / Sigla
              </label>
              <input
                id="codigo-disciplina"
                type="text"
                maxLength={40}
                placeholder="Ex.: BD2"
                value={codigoDisciplina}
                onChange={(e) => setCodigoDisciplina(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              />
            </div>

            <div>
              <label htmlFor="periodo-disciplina" className="mb-1 block text-xs font-medium text-slate-700">
                Período
              </label>
              <input
                id="periodo-disciplina"
                type="number"
                min={1}
                max={20}
                placeholder="Ex.: 3"
                value={periodoDisciplina}
                onChange={(e) => setPeriodoDisciplina(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              />
            </div>

            <div>
              <label htmlFor="ch-disciplina" className="mb-1 block text-xs font-medium text-slate-700">
                Carga horária
              </label>
              <input
                id="ch-disciplina"
                type="number"
                min={1}
                placeholder="Ex.: 67"
                value={cargaHorariaDisciplina}
                onChange={(e) => setCargaHorariaDisciplina(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              />
            </div>

            <div className="flex items-end gap-2">
              {disciplinaEditando && (
                <button
                  type="button"
                  onClick={cancelarEdicaoDisciplina}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                disabled={salvandoDisciplina}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {salvandoDisciplina ? (
                  <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Plus className="size-4" aria-hidden="true" />
                )}
                {disciplinaEditando ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </div>
        </form>

        {/* Lista de Disciplinas */}
        <div className="mt-5">
          {carregandoDisciplinas && (
            <div role="status" className="flex items-center justify-center gap-2 py-10 text-sm text-slate-600">
              <LoaderCircle className="size-5 animate-spin text-blue-600" aria-hidden="true" />
              <span>Carregando disciplinas…</span>
            </div>
          )}

          {!carregandoDisciplinas && erroListaDisciplinas && (
            <div className="space-y-3 py-4">
              <Mensagem tipo="erro">{erroListaDisciplinas}</Mensagem>
              <button
                type="button"
                onClick={carregarDisciplinas}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!carregandoDisciplinas && !erroListaDisciplinas && disciplinasFiltradas.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">
              Nenhuma disciplina encontrada. Utilize o formulário acima para cadastrar.
            </p>
          )}

          {!carregandoDisciplinas && !erroListaDisciplinas && disciplinasFiltradas.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[44rem] text-left text-sm">
                <caption className="sr-only">Lista de disciplinas</caption>
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium">Disciplina</th>
                    <th scope="col" className="px-4 py-3 font-medium">Curso</th>
                    <th scope="col" className="px-4 py-3 font-medium">Código</th>
                    <th scope="col" className="px-4 py-3 font-medium">Período / CH</th>
                    <th scope="col" className="px-4 py-3 font-medium">Status</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {disciplinasFiltradas.map((disciplina) => {
                    const nomeDoCurso =
                      disciplina.cursoNome ??
                      mapaNomesCursos.get(String(disciplina.cursoId)) ??
                      `Curso #${disciplina.cursoId}`
                    return (
                      <tr key={disciplina.id} className={!disciplina.ativo ? 'bg-slate-50/60 opacity-75' : ''}>
                        <td className="px-4 py-3 font-semibold text-slate-900">{disciplina.nome}</td>
                        <td className="px-4 py-3 text-slate-700">{nomeDoCurso}</td>
                        <td className="px-4 py-3 text-slate-700">{disciplina.codigo || '—'}</td>
                        <td className="px-4 py-3 text-slate-700">
                          {disciplina.periodo ? `${disciplina.periodo}º período` : '—'}
                          {disciplina.cargaHoraria ? ` · ${disciplina.cargaHoraria}h` : ''}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              disciplina.ativo
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {disciplina.ativo ? 'Ativa' : 'Inativa'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => iniciarEdicaoDisciplina(disciplina)}
                              className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAlternarStatusDisciplina(disciplina)}
                              className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${
                                disciplina.ativo
                                  ? 'border-red-200 text-red-700 hover:bg-red-50'
                                  : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                              }`}
                            >
                              {disciplina.ativo ? 'Inativar' : 'Reativar'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
