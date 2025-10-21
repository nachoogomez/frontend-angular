export interface FacturaItem {
  id?: string;
  descripcion: string;
  cantidad: number;
  precio: number;
  facturaId?: string;
}

export interface Factura {
  id: string;
  numero: number;
  fecha: Date | string;
  cliente: string;
  total: number;
  items: FacturaItem[];
  createdAt?: Date | string;
  usuario?: {
    id: number;
    email: string;
    nombre?: string;
    apellido?: string;
  };
}

export interface CreateFacturaDto {
  numero: number;
  fecha: Date | string;
  cliente?: string;
  usuarioId?: number; // ID del usuario/cliente al que se le asigna la factura
  total: number;
  items: FacturaItemDto[];
}

export interface FacturaItemDto {
  descripcion: string;
  cantidad: number;
  precio: number;
}

export interface FacturaResponse {
  id: string;
  numero: number;
  fecha: string;
  cliente: string;
  total: number;
  items: FacturaItem[];
  usuario?: any;
  message?: string;
}
