import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { GraduationCap, LoaderCircle, Plus } from 'lucide-react'
import { extrairMensagemErro } from '../../api/http'
import { Mensagem } from '../../shared/feedback/Mensagem'
import { useToast } from '../../shared/feedback/useToast'
import type { Curso, NivelCurso } from '../../types/academico'
import {
  alterarStatusCurso,
  atualizarCurso,
  criarCurso,
  CursoDuplicadoError,
  listarCursos,
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

  const [cursos, setCursos] = useState<Curso[]>([])
  const [carregandoCursos, setCarregandoCursos] = useState(true)
  const [erroListaCursos, setErroListaCursos] = useState('')

  // Estado do formulário de Curso (criação e edição)
  const [cursoEditando, setCursoEditando] = useState<Curso | null>(null)
  const [nomeCurso, setNomeCurso] = useState('')
  const [nivelCurso, setNivelCurso] = useState<NivelCurso>('SUPERIOR')
  const [erroFormCurso, setErroFormCurso] = useState('')
  const [salvandoCurso, setSalvandoCurso] = useState(false)

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

  useEffect(() => {
    carregarCursos()
  }, [carregarCursos])

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
    </div>
  )
}
