import axios from 'axios'
import { http } from '../../api/http'
import type { Estudante, NovoEstudante, Pagina } from '../../types/estudante'
 
// Página do Spring: os totais vêm na raiz ou dentro de "page", conforme a configuração do backend
interface PaginaApi {
  content: Estudante[]
  totalElements?: number
  totalPages?: number
  number?: number
  size?: number
  page?: { totalElements: number; totalPages: number; number: number; size: number }
}
 
// Erro de negócio: já existe estudante com a mesma matrícula (o backend responde 409)
export class EstudanteDuplicadoError extends Error {}

export interface FiltrosEstudante {
  busca?: string
  curso?: string
}
 
// "pagina" começa em 1 na tela; a API começa em 0. O backend lista só os ativos, por nome.
export async function listarEstudantes(
  pagina = 1,
  tamanho = 10,
  filtros?: FiltrosEstudante,
): Promise<Pagina<Estudante>> {
  const response = await http.get<PaginaApi>('/alunos', {
    params: {
      page: pagina - 1,
      size: tamanho,
      ...(filtros?.busca ? { busca: filtros.busca } : {}),
      ...(filtros?.curso ? { curso: filtros.curso } : {}),
    },
  })
 
  const dados = response.data
  const meta = dados.page ?? dados
 
  return {
    itens: dados.content,
    total: meta.totalElements ?? dados.content.length,
    totalPaginas: meta.totalPages ?? 1,
    pagina: (meta.number ?? 0) + 1,
    tamanho: meta.size ?? tamanho,
  }
}
 
export async function cadastrarEstudante(dados: NovoEstudante): Promise<Estudante> {
  try {
    const response = await http.post<Estudante>('/alunos', dados)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      throw new EstudanteDuplicadoError()
    }
    throw error
  }
}

export interface Curso {
  id?: string
  nome: string
  ativo?: boolean
}

export type AtualizarEstudantePayload = Pick<NovoEstudante, 'nome' | 'curso' | 'origemIdentificacao'>

export async function buscarEstudantePorMatricula(matricula: string): Promise<Estudante> {
  const response = await http.get<Estudante>(`/alunos/${encodeURIComponent(matricula)}`)
  return response.data
}

export async function atualizarEstudante(matricula: string, payload: AtualizarEstudantePayload): Promise<Estudante> {
  const response = await http.put<Estudante>(`/alunos/${encodeURIComponent(matricula)}`, payload)
  return response.data
}

export async function inativarEstudante(matricula: string): Promise<void> {
  await http.patch(`/alunos/${encodeURIComponent(matricula)}`, { ativo: false })
}

export async function listarCursosAtivos(): Promise<Curso[]> {
  const response = await http.get<Curso[] | { content: Curso[] }>('/cursos')
  const lista = Array.isArray(response.data) ? response.data : (response.data?.content ?? [])
  return lista.filter((curso) => curso.ativo !== false)
}
