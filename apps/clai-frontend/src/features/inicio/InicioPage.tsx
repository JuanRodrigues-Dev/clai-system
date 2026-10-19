import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Plus, Users } from 'lucide-react'
import { listarEstudantes } from '../estudantes/estudanteService'

const acoes = [
  {
    to: '/estudantes/novo',
    titulo: 'Cadastrar estudante',
    descricao: 'Adicione um novo estudante ao sistema',
    icon: Plus,
  },
  {
    to: '/estudantes',
    titulo: 'Ver estudantes',
    descricao: 'Consulte a lista de estudantes cadastrados',
    icon: Users,
  },
]

export default function InicioPage() {
    const [total, setTotal] = useState<number | null>(null)
    const [erro, setErro] = useState(false)

    // O total vem do servidor: pede 1 estudante e lê o total.
    useEffect(() => {
      let ativo = true
      listarEstudantes(1, 1)
        .then((pagina) => {
          if (ativo) setTotal(pagina.total)
        })
        .catch(() => {
          if (ativo) setErro(true)
        })
      return () => {
        ativo = false
      }
    }, [])
  return (
    <>
      <h2 className="text-2xl font-bold text-slate-900">Bem-vindo(a), Administrador!</h2>
      <p className="mt-1 text-slate-600">
        Aqui você pode gerenciar os estudantes e acompanhar as informações do sistema.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="flex size-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Users className="size-5" aria-hidden="true" />
          </span>
          <p className="mt-4 text-sm text-slate-600">Total de estudantes</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">
            {erro ? '—' : (total ?? '…')}
          </p>
          {erro && (
            <p role="alert" className="mt-1 text-xs text-red-700">
              Não foi possível carregar.
            </p>
          )}
        </div>
      </div>

      <h3 className="mt-10 text-lg font-semibold text-slate-900">Ações rápidas</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {acoes.map(({ to, titulo, descricao, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Icon className="size-6" aria-hidden="true" />
            </span>
            <span className="flex-1">
              <span className="block font-semibold text-slate-900">{titulo}</span>
              <span className="block text-sm text-slate-600">{descricao}</span>
            </span>
            <ArrowRight className="size-5 text-slate-400" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </>
  )
}