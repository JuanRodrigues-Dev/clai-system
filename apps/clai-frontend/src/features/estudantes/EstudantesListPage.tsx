import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, LoaderCircle, Plus } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Estudante } from '../../types/estudante'
import { inativarEstudante, listarCursosAtivos, listarEstudantes } from './estudanteService'
import type { Curso } from './estudanteService'
 
const OPCOES_TAMANHO_PAGINA = [5, 10, 20]
 
// Colunas da tabela em um único lugar: quando os campos reais forem definidos,
// a troca é aqui e em types/estudante.ts.
const colunas: { titulo: string; render: (e: Estudante) => ReactNode; className?: string }[] = [
  {
    titulo: 'Nome',
    render: (e) => (
      <Link
        to={`/estudantes/${encodeURIComponent(e.matricula)}`}
        className="font-semibold text-slate-900 hover:text-blue-600 hover:underline"
      >
        {e.nome}
      </Link>
    ),
  },
  { titulo: 'Matrícula', render: (e) => e.matricula },
  { titulo: 'Curso', render: (e) => e.curso },
  { titulo: 'Origem da identificação', render: (e) => e.origemIdentificacao },
]
 
// até 5 números de página ao redor da página atual
function janelaDePaginas(atual: number, total: number, tamanho = 5): number[] {
  const inicio = Math.max(1, Math.min(atual - 2, total - tamanho + 1))
  const fim = Math.min(total, inicio + tamanho - 1)
  return Array.from({ length: fim - inicio + 1 }, (_, i) => inicio + i)
}
 
type Status = 'carregando' | 'ok' | 'erro'
 
export default function EstudantesListPage() {
  const [estudantes, setEstudantes] = useState<Estudante[]>([])
  const [cursos, setCursos] = useState<Curso[]>([])
  const [busca, setBusca] = useState('')
  const [cursoFiltro, setCursoFiltro] = useState('')
  const [total, setTotal] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [status, setStatus] = useState<Status>('carregando')
  const [paginaAtual, setPagina] = useState(1)
  const [tamanhoPagina, setTamanhoPagina] = useState(5)

  useEffect(() => {
    listarCursosAtivos().then(setCursos).catch(() => setCursos([]))
  }, [])

  const carregar = useCallback(async () => {
    setStatus('carregando')
    try {
      const resultado = await listarEstudantes(paginaAtual, tamanhoPagina, {
        busca: busca.trim() || undefined,
        curso: cursoFiltro || undefined,
      })
      setEstudantes(resultado.itens)
      setTotal(resultado.total)
      setTotalPaginas(Math.max(1, resultado.totalPaginas))
      setStatus('ok')
    } catch {
      setStatus('erro')
    }
  }, [paginaAtual, tamanhoPagina, busca, cursoFiltro])

  useEffect(() => {
    carregar()
  }, [carregar])

  const estudantesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return estudantes.filter((e) => {
      const correspondeBusca =
        !termo ||
        e.nome.toLowerCase().includes(termo) ||
        e.matricula.toLowerCase().includes(termo)
      const correspondeCurso = !cursoFiltro || e.curso === cursoFiltro
      return correspondeBusca && correspondeCurso
    })
  }, [estudantes, busca, cursoFiltro])

  async function handleInativar(estudante: Estudante) {
    if (!window.confirm(`Deseja realmente inativar o estudante ${estudante.nome}?`)) return
    try {
      await inativarEstudante(estudante.matricula)
      await carregar()
    } catch {
      setStatus('erro')
    }
  }
 
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3"> 
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <input
            type="search"
            aria-label="Filtrar por nome ou matrícula"
            placeholder="Buscar por nome ou matrícula..."
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value)
              setPagina(1)
            }}
            className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30 sm:max-w-xs"
          />
          <select
            aria-label="Filtrar por curso"
            value={cursoFiltro}
            onChange={(e) => {
              setCursoFiltro(e.target.value)
              setPagina(1)
            }}
            className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30 sm:w-auto"
          >
            <option value="">Todos os cursos</option>
            {cursos.map((curso) => (
              <option key={curso.id ?? curso.nome} value={curso.nome}>
                {curso.nome}
              </option>
            ))}
          </select>
        </div>
        <Link
          to="/estudantes/novo"
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-5 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          <Plus className="size-5" aria-hidden="true" />
          Cadastrar
        </Link>
      </div>
 
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {status === 'carregando' && (
          <div role="status" className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <LoaderCircle className="size-8 animate-spin text-blue-600" aria-hidden="true" />
            <p className="font-semibold text-slate-800">Carregando estudantes…</p>
            <p className="text-sm text-slate-600">Aguarde um momento.</p>
          </div>
        )}
 
        {status === 'erro' && (
          <div role="alert" className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <p className="font-semibold text-red-700">Não foi possível carregar os estudantes.</p>
            <button
              type="button"
              onClick={carregar}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Tentar novamente
            </button>
          </div>
        )}
 
        {status === 'ok' && estudantesFiltrados.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <p className="font-semibold text-slate-800">Nenhum estudante cadastrado ainda.</p>
            <Link to="/estudantes/novo" className="text-sm font-semibold text-blue-600 hover:underline">
              Cadastrar o primeiro estudante
            </Link>
          </div>
        )}
 
        {status === 'ok' && (
          <>
            {estudantesFiltrados.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <caption className="sr-only">Lista de estudantes</caption>
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    {colunas.map((coluna) => (
                      <th key={coluna.titulo} scope="col" className="px-5 py-3 font-medium">
                        {coluna.titulo}
                      </th>
                    ))}
                    <th scope="col" className="px-5 py-3 text-right font-medium">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {estudantesFiltrados.map((estudante) => (
                    <tr key={estudante.id}>
                      {colunas.map((coluna) => (
                        <td
                          key={coluna.titulo}
                          className={`px-5 py-4 text-slate-700 ${coluna.className ?? ''}`}
                        >
                          {coluna.render(estudante)}
                        </td>
                      ))}
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <Link
                            to={`/estudantes/${encodeURIComponent(estudante.matricula)}`}
                            className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                          >
                            Prontuário
                          </Link>
                          <Link
                            to={`/estudantes/${encodeURIComponent(estudante.matricula)}/editar`}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                          >
                            Editar
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleInativar(estudante)}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                          >
                            Inativar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
 
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4">
              <div className="flex flex-wrap items-center gap-4">
                <p className="text-sm text-slate-600">
                  Mostrando {estudantesFiltrados.length} de {total}{' '}
                  {total === 1 ? 'estudante' : 'estudantes'}
                </p>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <span>Itens por página:</span>
                  <select
                    value={tamanhoPagina}
                    onChange={(e) => {
                      setTamanhoPagina(Number(e.target.value))
                      setPagina(1)
                    }}
                    className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                  >
                    {OPCOES_TAMANHO_PAGINA.map((opcao) => (
                      <option key={opcao} value={opcao}>
                        {opcao}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
 
                <nav aria-label="Paginação" className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPagina(paginaAtual - 1)}
                    disabled={paginaAtual === 1}
                    aria-label="Página anterior"
                    className="flex size-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="size-5" aria-hidden="true" />
                  </button>
 
                  {janelaDePaginas(paginaAtual, totalPaginas).map((numero) => (
                    <button
                      key={numero}
                      type="button"
                      onClick={() => setPagina(numero)}
                      aria-label={`Página ${numero}`}
                      aria-current={numero === paginaAtual ? 'page' : undefined}
                      className={`size-9 rounded-lg border text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                        numero === paginaAtual
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {numero}
                    </button>
                  ))}
 
                  <button
                    type="button"
                    onClick={() => setPagina(paginaAtual + 1)}
                    disabled={paginaAtual === totalPaginas}
                    aria-label="Próxima página"
                    className="flex size-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight className="size-5" aria-hidden="true" />
                  </button>
                </nav>
            </div>
          </>
        )}
      </div>
    </>
  )
}
