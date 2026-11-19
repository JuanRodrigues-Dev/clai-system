import { useEffect, useState } from 'react'
import { CheckCircle2, LoaderCircle, Mail, ShieldCheck, UserCheck } from 'lucide-react'
import type { PerfilUsuario } from '../../types/auth'
import { obterPerfilLogado } from './authService'

const DESCRICAO_ROLES: Record<string, { rotulo: string; descricao: string; permissoes: string[] }> = {
  ROLE_ADMIN: {
    rotulo: 'Administrador Geral',
    descricao: 'Acesso administrativo completo ao sistema da CLAI.',
    permissoes: [
      'Gerenciar cursos e disciplinas institucionais',
      'Cadastrar, editar, consultar e inativar estudantes',
      'Gerenciar estudos de caso, acompanhamentos e atendimentos',
    ],
  },
  ROLE_CLAI: {
    rotulo: 'Coordenação de Ações Inclusivas (CLAI)',
    descricao: 'Equipe responsável pela triagem, estudo de caso e acompanhamento inclusivo.',
    permissoes: [
      'Cadastrar e atualizar prontuários de estudantes',
      'Elaborar e editar Estudos de Caso',
      'Gerenciar ciclos de acompanhamento e registrar atendimentos',
    ],
  },
  ROLE_PEDAGOGICO: {
    rotulo: 'Equipe Pedagógica / Multiprofissional',
    descricao: 'Atuação psicopedagógica e pedagógica no suporte contínuo ao estudante.',
    permissoes: [
      'Registrar e atualizar Estudos de Caso',
      'Conduzir acompanhamentos e registrar sessões de atendimento',
    ],
  },
  ROLE_ASSISTENTE: {
    rotulo: 'Assistência Estudantil',
    descricao: 'Apoio biopsicossocial e acompanhamento multiprofissional.',
    permissoes: [
      'Consultar prontuários de estudantes acompanhados',
      'Registrar atendimentos e encaminhamentos',
    ],
  },
  ROLE_COORDENADOR: {
    rotulo: 'Coordenação de Curso',
    descricao: 'Articulação acadêmica entre o curso, docentes e a CLAI.',
    permissoes: [
      'Consultar estudantes acompanhados do curso',
      'Acompanhar encaminhamentos pedagógicos e curriculares',
    ],
  },
  ROLE_PROFESSOR: {
    rotulo: 'Docente',
    descricao: 'Professor responsável por disciplinas com estudantes acompanhados.',
    permissoes: [
      'Consultar orientações e necessidades de suporte do estudante',
      'Colaborar nos registros pedagógicos das disciplinas',
    ],
  },
  ROLE_DDE: {
    rotulo: 'Diretoria de Desenvolvimento do Ensino (DDE)',
    descricao: 'Acompanhamento institucional das ações inclusivas do campus.',
    permissoes: [
      'Visualizar indicadores e acompanhamentos institucionais',
    ],
  },
}

function formatarRole(role: string) {
  const chave = role.startsWith('ROLE_') ? role : `ROLE_${role}`
  return (
    DESCRICAO_ROLES[chave] ?? {
      rotulo: role.replace(/^ROLE_/, ''),
      descricao: 'Perfil de acesso atribuído ao usuário no sistema.',
      permissoes: ['Acesso autenticado às funcionalidades autorizadas para este perfil'],
    }
  )
}

export default function MeuPerfilPage() {
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    obterPerfilLogado()
      .then(setPerfil)
      .finally(() => setCarregando(false))
  }, [])

  if (carregando) {
    return (
      <div role="status" className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
        <LoaderCircle className="size-8 animate-spin text-blue-600" aria-hidden="true" />
        <p className="font-semibold text-slate-800">Carregando dados do usuário…</p>
      </div>
    )
  }

  const dados = perfil ?? {
    email: 'admin@ifpb.edu.br',
    ativo: true,
    roles: ['ROLE_ADMIN'],
  }

  return (
    <div className="space-y-6">
      {/* Card de Dados da Conta */}
      <section aria-labelledby="titulo-dados-conta" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
              <UserCheck className="size-7" aria-hidden="true" />
            </div>
            <div>
              <h2 id="titulo-dados-conta" className="text-lg font-bold text-slate-900">
                Dados do Usuário Autenticado
              </h2>
              <p className="mt-0.5 text-sm text-slate-600">
                Informações da sua conta institucional e credenciais de acesso na CLAI.
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              dados.ativo ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            {dados.ativo ? 'Conta Ativa' : 'Conta Inativa'}
          </span>
        </div>

        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-4">
            <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              <Mail className="size-4 text-blue-600" aria-hidden="true" />
              E-mail Institucional / Login
            </dt>
            <dd className="mt-1.5 text-base font-semibold text-slate-900 break-all">
              {dados.email}
            </dd>
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-4">
            <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              <ShieldCheck className="size-4 text-blue-600" aria-hidden="true" />
              Perfis Vinculados ({dados.roles.length})
            </dt>
            <dd className="mt-2 flex flex-wrap gap-2">
              {dados.roles.map((role) => (
                <span
                  key={role}
                  className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/20"
                >
                  {role}
                </span>
              ))}
            </dd>
          </div>
        </dl>
      </section>

      {/* Card de Permissões e Perfis de Acesso */}
      <section aria-labelledby="titulo-permissoes" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-100 pb-4">
          <h2 id="titulo-permissoes" className="text-lg font-bold text-slate-900">
            Perfis e Permissões no Sistema
          </h2>
          <p className="mt-0.5 text-sm text-slate-600">
            Detalhamento das permissões concedidas aos perfis atribuídos ao seu usuário.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {dados.roles.map((role) => {
            const info = formatarRole(role)
            return (
              <div key={role} className="rounded-xl border border-slate-200 p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-slate-900">{info.rotulo}</h3>
                  <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700">
                    {role}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-slate-600">{info.descricao}</p>

                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Ações permitidas:
                </p>
                <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                  {info.permissoes.map((permissao) => (
                    <li key={permissao} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
                      <span>{permissao}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
