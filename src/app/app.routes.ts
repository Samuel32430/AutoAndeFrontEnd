import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { invitadoGuard } from './core/guards/invitado.guard';
import { permisoGuard } from './core/guards/permiso.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [invitadoGuard]
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'ordenes'
      },
      {
        path: 'ordenes',
        loadComponent: () => import('./features/ordenes/orden-list/orden-list.component').then(m => m.OrdenListComponent),
        canActivate: [permisoGuard],
        data: { permiso: 'ORDEN_LEER' }
      },
      {
        path: 'ordenes/nueva',
        loadComponent: () => import('./features/ordenes/orden-form/orden-form.component').then(m => m.OrdenFormComponent),
        canActivate: [permisoGuard],
        data: { permiso: 'ORDEN_REGISTRAR' }
      },
      {
        path: 'servicios',
        loadComponent: () => import('./features/servicios/servicios.component').then(m => m.ServiciosComponent),
        canActivate: [permisoGuard],
        data: { permiso: 'SERVICIO_LEER' }
      },
      {
        path: 'vehiculos',
        loadComponent: () => import('./features/vehiculos/vehiculos.component').then(m => m.VehiculosComponent),
        canActivate: [permisoGuard],
        data: { permiso: 'VEHICULO_LEER' }
      },
      {
        path: 'reportes/ingresos',
        loadComponent: () => import('./features/reportes/reporte-ingresos/reporte-ingresos.component').then(m => m.ReporteIngresosComponent),
        canActivate: [permisoGuard],
        data: { permiso: 'REPORTE_VER' }
      }
    ]
  },
  {
    path: 'acceso-denegado',
    loadComponent: () => import('./shared-pages/acceso-denegado/acceso-denegado.component').then(m => m.AccesoDenegadoComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./shared-pages/no-encontrado/no-encontrado.component').then(m => m.NoEncontradoComponent)
  }
];
