import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, LoaderCircle, Plus, Search } from 'lucide-react'
import type { Estudante } from '../../types/estudante'
import { listarEstudantes } from './estudanteService'
import { formatarData, mascararCpf, normalizar } from './formatadores'
 
const TAMANHO_PAGINA = 5
 
// Colunas da tabela em um único lugar: quando os campos reais forem definidos,
// a troca é aqui e em types/estudante.ts.
const colunas: { titulo: string; render: (e: Estudante) => ReactNode; className?: string }[] = [
  { titulo: 'Nome', render: (e) => e.nome, className: 'font-semibold text-slate-900' },
  { titulo: 'Matrícula', render: (e) => e.matricula },
  { titulo: 'CPF', render: (e) => mascararCpf(e.cpf) },
  { titulo: 'Data de nascimento', render: (e) => formatarData(e.dataNascimento) },
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
  const [status, setStatus] = useState<Status>('carregando')
  const [busca, setBusca] = useState('')
  const [pagina, setPagina] = useState(1)
 
  const carregar = useCallback(async () => {
    setStatus('carregando')
    try {
      setEstudantes(await listarEstudantes())
      setStatus('ok')
    } catch {
      setStatus('erro')
    }
  }, [])
 
  useEffect(() => {
    carregar()
  }, [carregar])
 
  const filtrados = useMemo(() => {
    const termo = normalizar(busca.trim())
    if (!termo) return estudantes
    return estudantes.filter((e) =>
      normalizar(`${e.nome} ${e.matricula} ${e.cpf} ${e.cpf.replace(/\D/g, '')}`).includes(termo),
    )
  }, [estudantes, busca])
 
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / TAMANHO_PAGINA))
  const paginaAtual = Math.min(pagina, totalPaginas)
  const visiveis = filtrados.slice((paginaAtual - 1) * TAMANHO_PAGINA, paginaAtual * TAMANHO_PAGINA)
 
  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <div className="relative w-full sm:max-w-md">
          <label htmlFor="busca" className="sr-only">
            Buscar estudantes
          </label>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
          <input
            id="busca"
            type="search"
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value)
              setPagina(1)
            }}
            placeholder="Buscar por nome, matrícula ou CPF…"
            className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-slate-900 placeholder:text-slate-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
          />
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
 
        {status === 'ok' && filtrados.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            {estudantes.length === 0 ? (
              <>
                <p className="font-semibold text-slate-800">Nenhum estudante cadastrado ainda.</p>
                <Link to="/estudantes/novo" className="text-sm font-semibold text-blue-600 hover:underline">
                  Cadastrar o primeiro estudante
                </Link>
              </>
            ) : (
              <p className="font-semibold text-slate-800">
                Nenhum estudante encontrado para “{busca.trim()}”.
              </p>
            )}
          </div>
        )}
 
        {status === 'ok' && filtrados.length > 0 && (
          <>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {visiveis.map((estudante) => (
                    <tr key={estudante.id}>
                      {colunas.map((coluna) => (
                        <td
                          key={coluna.titulo}
                          className={`px-5 py-4 text-slate-700 ${coluna.className ?? ''}`}
                        >
                          {coluna.render(estudante)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
 
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4">
              <p className="text-sm text-slate-600">
                Mostrando {visiveis.length} de {filtrados.length}{' '}
                {filtrados.length === 1 ? 'estudante' : 'estudantes'}
              </p>
 
              {totalPaginas > 1 && (
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
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}