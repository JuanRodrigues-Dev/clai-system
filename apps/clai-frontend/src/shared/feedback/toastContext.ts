import { createContext } from 'react'
 
export type TipoMensagem = 'sucesso' | 'erro'
 
export interface ToastContextValue {
  mostrarSucesso: (texto: string) => void
  mostrarErro: (texto: string) => void
}
 
export const ToastContext = createContext<ToastContextValue | null>(null)