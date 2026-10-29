import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const permisoGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const permisoRequerido = route.data['permiso'] as string | undefined;
  const permisosRequeridos = route.data['permisos'] as string[] | undefined;

  if (permisoRequerido && !authService.tienePermiso(permisoRequerido)) {
    router.navigate(['/acceso-denegado']);
    return false;
  }

  if (permisosRequeridos && !authService.tieneAlgunPermiso(permisosRequeridos)) {
    router.navigate(['/acceso-denegado']);
    return false;
  }

  return true;
};
