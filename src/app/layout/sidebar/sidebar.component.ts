import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SiPermisoDirective } from '../../shared/directives/si-permiso.directive';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, SiPermisoDirective],
  template: `
    <aside class="app-sidebar">
      <nav class="sidebar-nav">
        <div class="nav-section-title">OPERACIONES</div>
        
        <a routerLink="/ordenes" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="nav-item" *appSiPermiso="'ORDEN_LEER'">
          <span class="nav-icon">📋</span>
          <span>Consultar Órdenes</span>
        </a>

        <a routerLink="/ordenes/nueva" routerLinkActive="active" class="nav-item" *appSiPermiso="'ORDEN_REGISTRAR'">
          <span class="nav-icon">➕</span>
          <span>Nueva Orden</span>
        </a>

        <div class="nav-section-title">GESTIÓN</div>

        <a routerLink="/servicios" routerLinkActive="active" class="nav-item" *appSiPermiso="'SERVICIO_LEER'">
          <span class="nav-icon">⚙️</span>
          <span>Servicios</span>
        </a>

        <a routerLink="/vehiculos" routerLinkActive="active" class="nav-item" *appSiPermiso="'VEHICULO_LEER'">
          <span class="nav-icon">🚗</span>
          <span>Vehículos</span>
        </a>

        <div class="nav-section-title" *appSiPermiso="'REPORTE_VER'">REPORTES</div>

        <a routerLink="/reportes/ingresos" routerLinkActive="active" class="nav-item" *appSiPermiso="'REPORTE_VER'">
          <span class="nav-icon">📊</span>
          <span>Ingresos por Servicio</span>
        </a>
      </nav>
    </aside>
  `,
  styles: [`
    .app-sidebar {
      width: 250px;
      background: #ffffff;
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      padding: 1.5rem 0.75rem;
      min-height: calc(100vh - 64px);
    }
    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .nav-section-title {
      font-size: 0.675rem;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 0.05em;
      padding: 1rem 0.75rem 0.5rem;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 0.85rem;
      border-radius: var(--radius-sm);
      color: var(--secondary);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    .nav-item:hover {
      background: #f1f5f9;
      color: var(--primary);
    }
    .nav-item.active {
      background: var(--primary-light);
      color: var(--primary);
      font-weight: 600;
    }
    .nav-icon {
      font-size: 1.1rem;
    }
  `]
})
export class SidebarComponent {
  authService = inject(AuthService);
}
