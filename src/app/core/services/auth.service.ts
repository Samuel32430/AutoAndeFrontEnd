import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, UsuarioInfo } from '../models/auth.model';

const TOKEN_KEY = 'autoandes_token';
const USER_KEY = 'autoandes_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly _usuarioActual = signal<UsuarioInfo | null>(this.obtenerUsuarioAlmacenado());
  private readonly _token = signal<string | null>(sessionStorage.getItem(TOKEN_KEY));

  readonly usuarioActual = this._usuarioActual.asReadonly();
  readonly token = this._token.asReadonly();
  readonly estaAutenticado = computed(() => !!this._token());
  readonly permisos = computed(() => this._usuarioActual()?.permisos ?? []);

  login(credenciales: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credenciales).pipe(
      tap(resp => {
        sessionStorage.setItem(TOKEN_KEY, resp.token);
        const userInfo: UsuarioInfo = {
          username: resp.username,
          nombreCompleto: resp.nombreCompleto,
          rol: resp.rol,
          permisos: resp.permisos
        };
        sessionStorage.setItem(USER_KEY, JSON.stringify(userInfo));

        this._token.set(resp.token);
        this._usuarioActual.set(userInfo);
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._usuarioActual.set(null);
    this.router.navigate(['/login']);
  }

  tienePermiso(permisoRequerido: string): boolean {
    const list = this.permisos();
    return list.includes(permisoRequerido) || list.includes('ADMIN');
  }

  tieneAlgunPermiso(permisosRequeridos: string[]): boolean {
    if (!permisosRequeridos || permisosRequeridos.length === 0) return true;
    return permisosRequeridos.some(p => this.tienePermiso(p));
  }

  private obtenerUsuarioAlmacenado(): UsuarioInfo | null {
    const data = sessionStorage.getItem(USER_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data) as UsuarioInfo;
    } catch {
      return null;
    }
  }
}
