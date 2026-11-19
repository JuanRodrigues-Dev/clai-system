import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, LoaderCircle } from 'lucide-react'
import type { NovoEstudante } from '../../types/estudante'
import { Mensagem } from '../../shared/feedback/Mensagem'
import { useToast } from '../../shared/feedback/useToast'
import { atualizarEstudante, buscarEstudantePorMatricula, cadastrarEstudante, EstudanteDuplicadoError, listarCursosAtivos } from './estudanteService'
import type { Curso } from './estudanteService'
import { validar } from './validacao'
import type { Erros } from './validacao'
 
interface Campo {
  name: keyof NovoEstudante
  label: string
  placeholder?: string
  type?: 'text' | 'date' | 'select'
  inputMode?: 'numeric'
  autoComplete?: string
  maxLength?: number
}
 
const campos: Campo[] = [
  { name: 'matricula', label: 'Matrícula', placeholder: 'Digite a matrícula', maxLength: 50 },
  { name: 'nome', label: 'Nome completo', placeholder: 'Digite o nome completo', autoComplete: 'off', maxLength: 255 },
  { name: 'curso', label: 'Curso', type: 'select', maxLength: 150 },
  { name: 'origemIdentificacao', label: 'Origem da identificação', placeholder: 'Como o estudante foi identificado', maxLength: 100 },
]

const VALORES_INICIAIS: NovoEstudante = { matricula: '', nome: '', curso: '', origemIdentificacao: '' }
 
export default function EstudanteFormPage() {
  const navigate = useNavigate()
  const { matricula: matriculaParam } = useParams<{ matricula: string }>()
  const modoEdicao = Boolean(matriculaParam)
  const { mostrarSucesso } = useToast()
  const [valores, setValores] = useState<NovoEstudante>(VALORES_INICIAIS)
  const [cursos, setCursos] = useState<Curso[]>([])
  const [erros, setErros] = useState<Erros>({})
  const [erroServidor, setErroServidor] = useState('')
  const [enviando, setEnviando] = useState(false)
 
  useEffect(() => {
    listarCursosAtivos().then(setCursos).catch(() => setCursos([]))
  }, [])

  useEffect(() => {
    if (!matriculaParam) return
    buscarEstudantePorMatricula(matriculaParam)
      .then((e) => setValores({ matricula: e.matricula, nome: e.nome, curso: e.curso, origemIdentificacao: e.origemIdentificacao }))
      .catch(() => setErroServidor('Não foi possível carregar os dados do estudante.'))
  }, [matriculaParam])

  function alterar(name: keyof NovoEstudante, valor: string) {
    setValores((atuais) => ({
      ...atuais,
      [name]: valor,
    }))
    setErros((atuais) => ({ ...atuais, [name]: undefined }))
    setErroServidor('')
  }
 
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (enviando) return
 
    const novosErros = validar(valores)
    setErros(novosErros)
    setErroServidor('')
 
    // leva o foco para o primeiro campo com erro
    const primeiroComErro = campos.find((campo) => novosErros[campo.name])
    if (primeiroComErro) {
      document.getElementById(primeiroComErro.name)?.focus()
      return
    }
 
    setEnviando(true)
    try {
      const payload = {
        nome: valores.nome.trim(),
        curso: valores.curso.trim(),
        origemIdentificacao: valores.origemIdentificacao.trim(),
      }
      if (modoEdicao && matriculaParam) {
        await atualizarEstudante(matriculaParam, payload)
        mostrarSucesso('Estudante atualizado com sucesso.')
      } else {
        await cadastrarEstudante({ matricula: valores.matricula.trim(), ...payload })
        mostrarSucesso('Estudante cadastrado com sucesso.')
      }
      navigate('/estudantes')
    } catch (error) {
      if (error instanceof EstudanteDuplicadoError) {
        setErroServidor('A matrícula informada já está cadastrada no sistema.')
        document.getElementById('matricula')?.focus()
      } else {
        setErroServidor('Não foi possível salvar o estudante. Tente novamente.')
      }
    } finally {
      setEnviando(false)
    }
  }
 
  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/estudantes"
        className="inline-flex items-center gap-2 rounded text-sm font-medium text-blue-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Voltar para a lista
      </Link>
 
      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-slate-900">Dados pessoais</h2>
        <p className="mt-1 text-sm text-slate-600">Os campos marcados com * são obrigatórios.</p>
 
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {campos.map((campo) => {
            const erro = erros[campo.name]
            const classeInput = `h-11 w-full rounded-lg border bg-white px-3 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 ${
              erro
                ? 'border-red-500 focus:border-red-600 focus:ring-red-600/30'
                : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600/30'
            }`
            return (
              <div key={campo.name}>
                <label htmlFor={campo.name} className="mb-1.5 block text-sm font-medium text-slate-800">
                  {campo.label} <span aria-hidden="true" className="text-red-600">*</span>
                </label>
                {campo.type === 'select' ? (
                  <select
                    id={campo.name}
                    name={campo.name}
                    value={valores[campo.name]}
                    onChange={(e) => alterar(campo.name, e.target.value)}
                    required
                    aria-invalid={erro ? true : undefined}
                    aria-describedby={erro ? `${campo.name}-erro` : undefined}
                    className={classeInput}
                  >
                    <option value="">Selecione um curso</option>
                    {cursos.map((curso) => (
                      <option key={curso.id ?? curso.nome} value={curso.nome}>
                        {curso.nome}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={campo.name}
                    name={campo.name}
                    type={campo.type ?? 'text'}
                    inputMode={campo.inputMode}
                    autoComplete={campo.autoComplete}
                    maxLength={campo.maxLength}
                    placeholder={campo.placeholder}
                    value={valores[campo.name]}
                    onChange={(e) => alterar(campo.name, e.target.value)}
                    disabled={modoEdicao && campo.name === 'matricula'}
                    required
                    aria-invalid={erro ? true : undefined}
                    aria-describedby={erro ? `${campo.name}-erro` : undefined}
                    className={classeInput}
                  />
                )}
                {erro && (
                  <p id={`${campo.name}-erro`} className="mt-1.5 text-sm text-red-700">
                    {erro}
                  </p>
                )}
              </div>
            )
          })}
        </div>
 
        {erroServidor && (
          <div className="mt-6">
            <Mensagem tipo="erro" onFechar={() => setErroServidor('')}>
              {erroServidor}
            </Mensagem>
          </div>
        )}
 
        <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-6">
          <Link
            to="/estudantes"
            className="inline-flex h-11 items-center rounded-lg border border-slate-300 px-5 font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={enviando}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-5 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
          >
            {enviando && <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />}
            {enviando ? 'Salvando…' : 'Salvar estudante'}
          </button>
        </div>
      </form>
    </div>
  )
}