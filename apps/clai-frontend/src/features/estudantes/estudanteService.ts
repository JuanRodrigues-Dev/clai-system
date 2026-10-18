import axios from 'axios'
import { http } from '../../api/http'
import type { Estudante, NovoEstudante } from '../../types/estudante'

// DADOS FICTÍCIOS, usados só com VITE_USE_MOCK=true enquanto o backend não existe.
const NOMES = ['Ana', 'Carlos', 'Juliana', 'Lucas', 'Mariana', 'Pedro', 'Beatriz', 'Rafael']
const SOBRENOMES = [
  ['Silva', 'Costa'],
  ['Souza', 'Lima'],
  ['Alves', 'Pereira'],
  ['Santos', 'Oliveira'],
  ['Ferreira', 'Mendes'],
  ['Rodrigues', 'Barbosa'],
]

// 8 nomes x 6 sobrenomes: as 24 combinações são todas diferentes
const ESTUDANTES_FICTICIOS: Estudante[] = Array.from({ length: 24 }, (_, i) => {
  const [sobrenome1, sobrenome2] = SOBRENOMES[i % SOBRENOMES.length]
  const mes = String((i % 12) + 1).padStart(2, '0')
  const dia = String((i % 27) + 1).padStart(2, '0')
  return {
    id: i + 1,
    nome: `${NOMES[i % NOMES.length]} ${sobrenome1} ${sobrenome2}`,
    matricula: `2026${1001 + i}`,
    cpf: `123.456.${700 + i}-00`,
    dataNascimento: `${2005 + (i % 4)}-${mes}-${dia}`,
  }
})

export async function listarEstudantes(): Promise<Estudante[]> {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    await new Promise((resolve) => setTimeout(resolve, 400))
    return [...ESTUDANTES_FICTICIOS]
  }

  const response = await http.get<Estudante[]>('/estudantes')
  return response.data
}

// Erro de negócio: já existe estudante com o mesmo CPF (o backend responde 409)
export class EstudanteDuplicadoError extends Error {}

export async function cadastrarEstudante(dados: NovoEstudante): Promise<Estudante> {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    await new Promise((resolve) => setTimeout(resolve, 600))
    const cpfNovo = dados.cpf.replace(/\D/g, '')
    if (ESTUDANTES_FICTICIOS.some((e) => e.cpf.replace(/\D/g, '') === cpfNovo)) {
      throw new EstudanteDuplicadoError()
    }
    const criado: Estudante = {
      ...dados,
      id: Math.max(0, ...ESTUDANTES_FICTICIOS.map((e) => e.id)) + 1,
    }
    ESTUDANTES_FICTICIOS.push(criado)
    return criado
  }

  try {
    const response = await http.post<Estudante>('/estudantes', dados)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      throw new EstudanteDuplicadoError()
    }
    throw error
  }
}