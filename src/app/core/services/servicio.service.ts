import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ServicioRequest, ServicioResponse } from '../models/servicio.model';

@Injectable({
  providedIn: 'root'
})
export class ServicioService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/servicios`;

  listarTodos(): Observable<ServicioResponse[]> {
    return this.http.get<ServicioResponse[]>(this.baseUrl);
  }

  listarActivos(): Observable<ServicioResponse[]> {
    return this.http.get<ServicioResponse[]>(`${this.baseUrl}/activos`);
  }

  obtenerPorId(id: number): Observable<ServicioResponse> {
    return this.http.get<ServicioResponse>(`${this.baseUrl}/${id}`);
  }

  crear(servicio: ServicioRequest): Observable<ServicioResponse> {
    return this.http.post<ServicioResponse>(this.baseUrl, servicio);
  }

  actualizar(id: number, servicio: ServicioRequest): Observable<ServicioResponse> {
    return this.http.put<ServicioResponse>(`${this.baseUrl}/${id}`, servicio);
  }

  cambiarEstado(id: number): Observable<ServicioResponse> {
    return this.http.patch<ServicioResponse>(`${this.baseUrl}/${id}/estado`, {});
  }
}
