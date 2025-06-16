export interface JwtPayload {
  sub: number;           // ID del usuario
  documento: string;     // Documento con el que inicia sesión
  rol: number;    
}
