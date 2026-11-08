export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
}

export interface PerfilUsuario {
  id?: number | string
  email: string
  ativo: boolean
  criadoEm?: string
  roles: string[]
}
