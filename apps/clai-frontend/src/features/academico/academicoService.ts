import axios from 'axios'
import { http } from '../../api/http'
import type { Curso, CursoPayload } from '../../types/academico'

export class CursoDuplicadoError extends Error {}

export async function listarCursos(apenasAtivos = false): Promise<Curso[]> {
  const response = await http.get<Curso[] | { content: Curso[] }>('/cursos', {
    params: apenasAtivos ? { ativo: true } : undefined,
  })
  const lista = Array.isArray(response.data) ? response.data : (response.data?.content ?? [])
  return apenasAtivos ? lista.filter((c) => c.ativo !== false) : lista
}

export async function criarCurso(payload: CursoPayload): Promise<Curso> {
  try {
    const response = await http.post<Curso>('/cursos', payload)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      throw new CursoDuplicadoError()
    }
    throw error
  }
}

export async function atualizarCurso(id: number | string, payload: CursoPayload): Promise<Curso> {
  try {
    const response = await http.put<Curso>(`/cursos/${encodeURIComponent(String(id))}`, payload)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      throw new CursoDuplicadoError()
    }
    throw error
  }
}

export async function alterarStatusCurso(id: number | string, ativo: boolean): Promise<void> {
  await http.patch(`/cursos/${encodeURIComponent(String(id))}`, { ativo })
}
