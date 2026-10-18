//Mudar Quando decidir o que estudante 
export interface Estudante {
  id: number
  nome: string
  matricula: string
  cpf: string
  dataNascimento: string //
}

// tudo de Estudante, menos o id (que o backend gera)
export type NovoEstudante = Omit<Estudante, 'id'>