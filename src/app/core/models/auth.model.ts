export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  username: string;
  nombreCompleto: string;
  rol: string;
  permisos: string[];
}

export interface UsuarioInfo {
  id?: number;
  username: string;
  nombreCompleto: string;
  rol: string;
  activo?: boolean;
  permisos: string[];
}
