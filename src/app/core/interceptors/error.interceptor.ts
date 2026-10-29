import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expirado o inválido: limpiar sesión y redirigir
        authService.logout();
      } else if (error.status === 403) {
        // Prohibido por falta de permisos: NO cerrar sesión, redirigir a acceso denegado
        router.navigate(['/acceso-denegado']);
      }
      return throwError(() => error);
    })
  );
};
