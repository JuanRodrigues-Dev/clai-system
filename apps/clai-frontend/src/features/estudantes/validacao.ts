import type { NovoEstudante } from '../../types/estudante'
 
export type Erros = Partial<Record<keyof NovoEstudante, string>>
 
// data de hoje no formato AAAA-MM-DD, no fuso local
export function hojeISO(): string {
  return new Date().toLocaleDateString('en-CA')
}
 
// "12345678900" -> "123.456.789-00" (formata enquanto a pessoa digita)
export function formatarCpfDigitado(valor: string): string {
  const d = valor.replace(/\D/g, '').slice(0, 11)
  let resultado = d.slice(0, 3)
  if (d.length > 3) resultado += `.${d.slice(3, 6)}`
  if (d.length > 6) resultado += `.${d.slice(6, 9)}`
  if (d.length > 9) resultado += `-${d.slice(9, 11)}`
  return resultado
}
 
// Regras PROVISÓRIAS, alinhadas aos campos provisórios de types/estudante.ts.
// O backend continua sendo quem valida de verdade.
export function validar(dados: NovoEstudante): Erros {
  const erros: Erros = {}
 
  const nome = dados.nome.trim()
  if (!nome) erros.nome = 'Informe o nome completo.'
  else if (nome.split(/\s+/).length < 2) erros.nome = 'Informe nome e sobrenome.'
 
  if (!dados.dataNascimento) erros.dataNascimento = 'Informe a data de nascimento.'
  else if (dados.dataNascimento > hojeISO()) {
    erros.dataNascimento = 'A data de nascimento não pode ser futura.'
  } else if (dados.dataNascimento < '1900-01-01') {
    erros.dataNascimento = 'Data de nascimento inválida.'
  }
 
  if (dados.cpf.replace(/\D/g, '').length !== 11) erros.cpf = 'Informe os 11 dígitos do CPF.'
 
  if (!dados.matricula.trim()) erros.matricula = 'Informe a matrícula.'
 
  return erros
}