import { useEffect } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Home, LogOut, User, Users } from 'lucide-react'
import { useAuth } from '../features/auth/useAuth'
import claiLogo from '../assets/clai-logo.svg'

const links = [
  { to: '/inicio', label: 'Início', icon: Home },
  { to: '/estudantes', label: 'Estudantes', icon: Users },
]
const titulos: Record<string, string> = {
  '/inicio': 'Início',
  '/estudantes': 'Estudantes',
  '/estudantes/novo': 'Cadastrar estudante',
}

// fixo na Sprint 1 (único usuário: administrador global)
const NOME_USUARIO = 'Administrador'

function linkClass({ isActive }: { isActive: boolean }) {
  return `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
    isActive ? 'bg-blue-600 text-white' : 'text-blue-100 hover:bg-white/10'
  }`
}
function Avatar() {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
      <User className="size-5" aria-hidden="true" />
    </span>
  )
}

export default function Layout() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const titulo = titulos[pathname] ?? 'CLAI'

  useEffect(() => {
    document.title = `${titulo} · CLAI`
  }, [titulo])

  function handleSignOut() {
    signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[16rem_1fr]">
      {/* Sidebar (telas grandes) */}
      <aside className="sticky top-0 hidden h-screen flex-col bg-clai-950 px-4 py-6 text-white lg:flex">
        <img
          src={claiLogo}
          alt="CLAI"
          className="mb-8 h-10 w-auto self-start brightness-0 invert"
        />

        <nav aria-label="Principal" className="flex flex-1 flex-col gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkClass}>
              <Icon className="size-5" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 pt-4">
          <div className="mb-2 flex items-center gap-3 px-3">
            <Avatar />
            <span className="text-sm font-semibold">{NOME_USUARIO}</span>
          </div>
          <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-blue-100 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <LogOut className="size-5" aria-hidden="true" />
              Sair
          </button>
       </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Cabeçalho (telas grandes): usuário */}
        <header className="hidden h-16 items-center justify-end gap-3 border-b border-slate-200 bg-white px-8 lg:flex">
          <span className="flex size-9 items-center justify-center rounded-full bg-blue-600 text-white">
            <User className="size-5" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold text-slate-800">{NOME_USUARIO}</span>
        </header>

        {/* Barra superior (telas pequenas): navegação + sair */}
        <header className="flex items-center justify-between bg-clai-950 px-4 py-3 text-white lg:hidden">
          <nav aria-label="Principal" className="flex gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={linkClass}>
                <Icon className="size-5" aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Sair"
            className="rounded-lg p-2 text-blue-100 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <LogOut className="size-5" aria-hidden="true" />
          </button>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}