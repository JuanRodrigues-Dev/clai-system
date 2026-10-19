import type { NovoEstudante } from '../../types/estudante'
 
export type Erros = Partial<Record<keyof NovoEstudante, string>>
 
// Limites iguais aos do backend (AlunoRequest). O backend continua sendo quem valida de verdade.
function validarTexto(valor: string, mensagemVazio: string, rotulo: string, maximo: number) {
  const texto = valor.trim()
  if (!texto) return mensagemVazio
  if (texto.length > maximo) return `${rotulo} deve ter no máximo ${maximo} caracteres.`
  return undefined
}
 
export function validar(dados: NovoEstudante): Erros {
  const erros: Erros = {}
 
  const matricula = validarTexto(dados.matricula, 'Informe a matrícula.', 'A matrícula', 50)
  if (matricula) erros.matricula = matricula
 
  const nome = validarTexto(dados.nome, 'Informe o nome completo.', 'O nome', 255)
  if (nome) erros.nome = nome
 
  const curso = validarTexto(dados.curso, 'Informe o curso.', 'O curso', 150)
  if (curso) erros.curso = curso
 
  const origem = validarTexto(
    dados.origemIdentificacao,
    'Informe a origem da identificação.',
    'A origem da identificação',
    100,
  )
  if (origem) erros.origemIdentificacao = origem
 
  return erros
}