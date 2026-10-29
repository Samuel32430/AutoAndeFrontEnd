import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VehiculoRequest, VehiculoResponse } from '../models/vehiculo.model';

@Injectable({
  providedIn: 'root'
})
export class VehiculoService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/vehiculos`;

  listarTodos(clienteId?: number): Observable<VehiculoResponse[]> {
    let params = new HttpParams();
    if (clienteId) {
      params = params.set('clienteId', clienteId.toString());
    }
    return this.http.get<VehiculoResponse[]>(this.baseUrl, { params });
  }

  obtenerPorId(id: number): Observable<VehiculoResponse> {
    return this.http.get<VehiculoResponse>(`${this.baseUrl}/${id}`);
  }

  crear(vehiculo: VehiculoRequest): Observable<VehiculoResponse> {
    return this.http.post<VehiculoResponse>(this.baseUrl, vehiculo);
  }

  actualizar(id: number, vehiculo: VehiculoRequest): Observable<VehiculoResponse> {
    return this.http.put<VehiculoResponse>(`${this.baseUrl}/${id}`, vehiculo);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
