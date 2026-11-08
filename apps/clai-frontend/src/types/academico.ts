export type NivelCurso = 'SUPERIOR' | 'TECNICO_INTEGRADO' | 'TECNICO_SUBSEQUENTE' | string

export interface Curso {
  id: number | string
  nome: string
  nivel: NivelCurso
  ativo: boolean
  criadoEm?: string
}

export interface CursoPayload {
  nome: string
  nivel: NivelCurso
}

export interface Disciplina {
  id: number | string
  nome: string
  codigo?: string
  periodo?: number
  cargaHoraria?: number
  cursoId: number | string
  cursoNome?: string
  ativo: boolean
  criadoEm?: string
}

export interface DisciplinaPayload {
  nome: string
  codigo?: string
  periodo?: number
  cargaHoraria?: number
  cursoId: number | string
}
