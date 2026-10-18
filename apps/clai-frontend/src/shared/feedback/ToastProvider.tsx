import { useCallback, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Mensagem } from './Mensagem'
import { ToastContext } from './toastContext'
import type { TipoMensagem } from './toastContext'
 
interface Toast {
  id: number
  tipo: TipoMensagem
  texto: string
}
 
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const proximoId = useRef(0)
 
  const fechar = useCallback((id: number) => {
    setToasts((atuais) => atuais.filter((toast) => toast.id !== id))
  }, [])
 
  const mostrar = useCallback(
    (tipo: TipoMensagem, texto: string) => {
      const id = proximoId.current++
      setToasts((atuais) => [...atuais, { id, tipo, texto }])
      // some sozinha (erros ficam um pouco mais na tela)
      window.setTimeout(() => fechar(id), tipo === 'erro' ? 8000 : 5000)
    },
    [fechar],
  )
 
  const value = useMemo(
    () => ({
      mostrarSucesso: (texto: string) => mostrar('sucesso', texto),
      mostrarErro: (texto: string) => mostrar('erro', texto),
    }),
    [mostrar],
  )
 
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 top-4 z-50 flex flex-col items-end gap-3 sm:inset-x-auto sm:right-6 sm:top-6 sm:w-96">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto w-full">
            <Mensagem tipo={toast.tipo} onFechar={() => fechar(toast.id)}>
              {toast.texto}
            </Mensagem>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}