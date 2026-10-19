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
 
// "pagina" começa em 1 na tela; a API começa em 0. O backend lista só os ativos, por nome.
export async function listarEstudantes(pagina = 1, tamanho = 10): Promise<Pagina<Estudante>> {
  const response = await http.get<PaginaApi>('/v1/aluno', {
    params: { page: pagina - 1, size: tamanho },
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
    const response = await http.post<Estudante>('/v1/aluno', dados)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      throw new EstudanteDuplicadoError()
    }
    throw error
  }
}