import { http } from '../../api/http'
import type { Estudante } from '../../types/estudante'

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
    return ESTUDANTES_FICTICIOS
  }

  const response = await http.get<Estudante[]>('/estudantes')
  return response.data
}