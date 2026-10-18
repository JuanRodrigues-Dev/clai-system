import type { ReactNode } from 'react'
import { CircleAlert, CircleCheck, X } from 'lucide-react'
import type { TipoMensagem } from './toastContext.ts'
 
interface MensagemProps {
  tipo: TipoMensagem
  titulo?: string
  children: ReactNode
  onFechar?: () => void
}
 
const estilos = {
  sucesso: {
    caixa: 'border-emerald-400 bg-emerald-50',
    titulo: 'text-emerald-800',
    icone: 'text-emerald-600',
    tituloPadrao: 'Sucesso!',
    Icone: CircleCheck,
  },
  erro: {
    caixa: 'border-red-400 bg-red-50',
    titulo: 'text-red-800',
    icone: 'text-red-600',
    tituloPadrao: 'Erro!',
    Icone: CircleAlert,
  },
}
 
export function Mensagem({ tipo, titulo, children, onFechar }: MensagemProps) {
  const estilo = estilos[tipo]
  const Icone = estilo.Icone
 
  return (
    <div
      role={tipo === 'erro' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-xl border p-4 shadow-sm ${estilo.caixa}`}
    >
      <Icone className={`mt-0.5 size-6 shrink-0 ${estilo.icone}`} aria-hidden="true" />
      <div className="flex-1">
        <p className={`font-semibold ${estilo.titulo}`}>{titulo ?? estilo.tituloPadrao}</p>
        <div className="text-sm text-slate-700">{children}</div>
      </div>
      {onFechar && (
        <button
          type="button"
          onClick={onFechar}
          aria-label="Fechar mensagem"
          className="rounded p-1 text-slate-500 hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
 