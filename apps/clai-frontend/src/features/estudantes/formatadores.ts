// "2008-03-15" -> "15/03/2008" (sem usar Date, para não sofrer deslocamento de fuso)
export function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split('-')
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : '—'
}

// "123.456.789-00" -> "***.456.789-**" (mostra só o necessário na lista)
export function mascararCpf(cpf: string): string {
  const digitos = cpf.replace(/\D/g, '')
  if (digitos.length !== 11) return '—'
  return `***.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-**`
}

// minúsculas e sem acentos, para a busca ignorar maiúsculas e acentuação
export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}