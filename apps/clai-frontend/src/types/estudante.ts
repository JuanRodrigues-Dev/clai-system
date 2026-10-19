export interface Estudante {
  id: string // UUID
  matricula: string
  nome: string
  curso: string
  origemIdentificacao: string
  dtCriacao: string // data e hora ISO (Instant)
  ativo: boolean
}
 
// O que o front envia ao cadastrar (AlunoRequest). O id e os demais campos o backend gera.
export type NovoEstudante = Pick<Estudante, 'matricula' | 'nome' | 'curso' | 'origemIdentificacao'>
 
// Página de resultados já no formato do front: "pagina" começa em 1 (a API começa em 0)
export interface Pagina<T> {
  itens: T[]
  total: number
  totalPaginas: number
  pagina: number
  tamanho: number
}