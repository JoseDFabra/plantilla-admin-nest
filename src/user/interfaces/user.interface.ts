export interface User {
  id: number;
  nombre_completo: string;
  documento: string;
  telefono?: string | null;
  correo?: string | null;
  password: string;
  refreshToken?: string | null;
  id_rol: number;
  rol?: string;
  is_active?:boolean;
}
