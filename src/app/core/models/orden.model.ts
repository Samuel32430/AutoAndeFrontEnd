export interface DetalleOrdenRequest {
  servicioId: number;
  cantidad: number;
}

export interface OrdenServicioRequest {
  vehiculoId: number;
  kilometraje: number;
  detalles: DetalleOrdenRequest[];
}

export interface DetalleOrdenResponse {
  id: number;
  servicioId: number;
  servicioCodigo: string;
  servicioNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface OrdenServicioResponse {
  id: number;
  numero: string;
  fecha: string;
  vehiculoId: number;
  vehiculoPlaca: string;
  clienteNombre: string;
  kilometraje: number;
  estado: 'REGISTRADA' | 'ANULADA';
  total: number;
  usuarioRegistro: string;
  motivoAnulacion?: string;
  detalles: DetalleOrdenResponse[];
}

export interface AnularOrdenRequest {
  motivo: string;
}
