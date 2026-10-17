import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  Accessibility,
  ChartNoAxesCombined,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  LogIn,
  Shield,
  User,
  Users,
} from 'lucide-react'
import { login } from './authService'
import claiLogo from '../../assets/clai-logo.svg'
import ilustracao from '../../assets/ilustracao.png'
 
const destaques = [
  { icon: Accessibility, label: 'Acessibilidade' },
  { icon: Users, label: 'Inclusão' },
  { icon: GraduationCap, label: 'Permanência' },
  { icon: ChartNoAxesCombined, label: 'Sucesso acadêmico' },
]
 
export default function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
 
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
 
    if (!username.trim() || !password) {
      setError('Informe usuário e senha.')
      return
    }
 
    setError('')
    setLoading(true)
    try {
      const token = await login({ username: username.trim(), password })
      localStorage.setItem('token', token)
      navigate('/estudantes', { replace: true })
    } catch (err) {
      if (axios.isAxiosError(err) && !err.response) {
        setError('Não foi possível conectar ao servidor.')
      } else {
        setError('Usuário ou senha inválidos.')
      }
    } finally {
      setLoading(false)
    }
  }
 
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Painel institucional (somente telas grandes) */}
      <section className="hidden flex-col overflow-hidden bg-linear-to-b from-[#04397f] to-[#092f62] text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:px-[clamp(2rem,5vw,4rem)] lg:pb-[5vh] lg:pt-[5vh]">
        {/* Topo: logo da CLAI */}
        <img
          src={claiLogo}
          alt="CLAI – Coordenação Local de Acessibilidade e Inclusão"
          className="h-[clamp(5rem,16vh,11rem)] w-auto max-w-full shrink-0 self-start brightness-0 invert"
        />
 
        {/* Meio: título, texto e destaques */}
        <div className="mt-[3vh] shrink-0">
          <h2 className="text-[length:clamp(2rem,min(3.4vw,6vh),3.5rem)] font-extrabold leading-[1.1] tracking-tight">
            Mais inclusão,
            <br />
            <span className="text-clai-300">mais possibilidades.</span>
          </h2>
          <p className="mt-[2.5vh] max-w-[28rem] text-[length:clamp(1rem,min(1.45vw,2.6vh),1.375rem)] leading-relaxed text-blue-100">
            A CLAI trabalha para garantir o acesso, a permanência e o sucesso
            acadêmico de todos os estudantes.
          </p>
 
          <ul className="mt-[3.5vh] grid max-w-xl grid-cols-4 gap-4">
            {destaques.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex flex-col items-center gap-2 text-center text-[length:clamp(0.8rem,1.1vw,1rem)] font-medium"
              >
                <span className="flex size-[clamp(3.5rem,8.5vh,6rem)] items-center justify-center rounded-full border-2 border-clai-600">
                  <Icon className="size-[42%]" aria-hidden="true" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>
 
        {/* Base: zona própria da ilustração, até a borda do painel (nunca sobrepõe os destaques) */}
        <div className="relative -mx-[clamp(2rem,5vw,4rem)] -mb-[5vh] mt-4 min-h-24 flex-1">
          <div className="pointer-events-none absolute -left-[20%] top-[18%] aspect-square w-[115%] rounded-full bg-clai-800/30" />
          <img
            src={ilustracao}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute bottom-[3vh] right-[5%] h-[92%] w-auto max-w-none select-none"
          />
        </div>
      </section>
 
      {/* Formulário */}
      <section className="flex flex-col bg-white px-6 py-8 sm:px-12">
        <p className="flex items-center justify-end gap-4 text-sm font-semibold text-clai-700">
          IFPB – Campus Cajazeiras
          <span className="h-px w-14 bg-clai-700" aria-hidden="true" />
        </p>
 
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center">
          <p className="text-3xl font-extrabold text-clai-700 lg:hidden">CLAI</p>
          <p className="mt-2 font-semibold text-clai-700 lg:mt-0">Bem-vindo(a)!</p>
          <h1 className="text-4xl font-extrabold text-clai-900 xl:text-5xl">
            Acesse o sistema
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            Faça login para continuar com suas atividades na CLAI.
          </p>
 
          <form onSubmit={handleSubmit} className="mt-10 space-y-6" noValidate>
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-blue-100 text-clai-700 shadow-md shadow-blue-100/70">
                <User className="h-6 w-6" aria-hidden="true" />
              </span>
              <div className="w-full">
                <label
                  htmlFor="username"
                  className="mb-2 block text-sm font-semibold text-clai-900"
                >
                  Usuário ou e-mail
                </label>
                <input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite seu usuário ou e-mail"
                  autoComplete="username"
                  className="h-12 w-full rounded-lg border border-blue-200 px-4 text-slate-900 placeholder:text-slate-500 focus:border-clai-700 focus:outline-none focus:ring-2 focus:ring-clai-700/30"
                />
              </div>
            </div>
 
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-blue-100 text-clai-700 shadow-md shadow-blue-100/70">
                <Lock className="h-6 w-6" aria-hidden="true" />
              </span>
              <div className="w-full">
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-clai-900"
                >
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    autoComplete="current-password"
                    className="h-12 w-full rounded-lg border border-blue-200 px-4 pr-12 text-slate-900 placeholder:text-slate-500 focus:border-clai-700 focus:outline-none focus:ring-2 focus:ring-clai-700/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-lg text-clai-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-clai-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            </div>
 
            {error && (
              <p role="alert" className="text-sm font-medium text-red-700">
                {error}
              </p>
            )}
 
            <button
              type="submit"
              disabled={loading}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-lg bg-clai-700 text-lg font-bold text-white transition hover:bg-clai-600 focus:outline-none focus:ring-2 focus:ring-clai-700 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
            >
              <LogIn className="h-5 w-5" aria-hidden="true" />
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
 
          <div className="mt-10 flex items-start gap-4 rounded-xl bg-clai-100 p-5">
            <Shield className="mt-1 h-8 w-8 shrink-0 text-clai-700" aria-hidden="true" />
            <div>
              <p className="font-bold text-clai-900">Acesso restrito</p>
              <p className="text-sm text-slate-600">
                Utilize suas credenciais para acessar o sistema de forma segura.
              </p>
            </div>
          </div>
        </div>
 
        <p className="flex items-center justify-center gap-2 text-xs font-semibold text-clai-700">
          <Lock className="h-4 w-4" aria-hidden="true" />
          Sistema CLAI · IFPB Campus Cajazeiras
        </p>
      </section>
    </main>
  )
}
 