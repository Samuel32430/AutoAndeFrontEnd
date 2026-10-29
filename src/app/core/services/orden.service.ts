import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AnularOrdenRequest, OrdenServicioRequest, OrdenServicioResponse } from '../models/orden.model';

@Injectable({
  providedIn: 'root'
})
export class OrdenServicioService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/ordenes`;

  buscar(placa?: string, estado?: string, desde?: string, hasta?: string): Observable<OrdenServicioResponse[]> {
    let params = new HttpParams();
    if (placa && placa.trim()) params = params.set('placa', placa.trim());
    if (estado && estado !== 'TODOS') params = params.set('estado', estado);
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);

    return this.http.get<OrdenServicioResponse[]>(this.baseUrl, { params });
  }

  obtenerPorId(id: number): Observable<OrdenServicioResponse> {
    return this.http.get<OrdenServicioResponse>(`${this.baseUrl}/${id}`);
  }

  registrar(orden: OrdenServicioRequest): Observable<OrdenServicioResponse> {
    return this.http.post<OrdenServicioResponse>(this.baseUrl, orden);
  }

  anular(id: number, motivo: AnularOrdenRequest): Observable<OrdenServicioResponse> {
    return this.http.patch<OrdenServicioResponse>(`${this.baseUrl}/${id}/anular`, motivo);
  }
}
