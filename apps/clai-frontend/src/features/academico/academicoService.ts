import axios from 'axios'
import { http } from '../../api/http'
import type { Curso, CursoPayload, Disciplina, DisciplinaPayload } from '../../types/academico'

export class CursoDuplicadoError extends Error {}
export class DisciplinaDuplicadaError extends Error {}

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

export async function listarDisciplinas(cursoId?: number | string): Promise<Disciplina[]> {
  const response = await http.get<Disciplina[] | { content: Disciplina[] }>('/disciplinas', {
    params: cursoId ? { cursoId } : undefined,
  })
  return Array.isArray(response.data) ? response.data : (response.data?.content ?? [])
}

export async function criarDisciplina(payload: DisciplinaPayload): Promise<Disciplina> {
  try {
    const response = await http.post<Disciplina>('/disciplinas', payload)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      throw new DisciplinaDuplicadaError()
    }
    throw error
  }
}

export async function atualizarDisciplina(
  id: number | string,
  payload: DisciplinaPayload,
): Promise<Disciplina> {
  try {
    const response = await http.put<Disciplina>(`/disciplinas/${encodeURIComponent(String(id))}`, payload)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      throw new DisciplinaDuplicadaError()
    }
    throw error
  }
}

export async function alterarStatusDisciplina(id: number | string, ativo: boolean): Promise<void> {
  await http.patch(`/disciplinas/${encodeURIComponent(String(id))}`, { ativo })
}
