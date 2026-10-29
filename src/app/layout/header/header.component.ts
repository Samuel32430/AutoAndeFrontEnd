import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="app-header">
      <div class="header-left">
        <div class="brand">
          <span class="brand-icon">🔧</span>
          <span class="brand-title">AutoAndes</span>
          <span class="brand-subtitle">Taller Mecánico</span>
        </div>
      </div>
      <div class="header-right">
        @if (authService.usuarioActual(); as usuario) {
          <div class="user-profile">
            <div class="user-avatar">
              {{ usuario.nombreCompleto.charAt(0).toUpperCase() }}
            </div>
            <div class="user-details">
              <span class="user-name">{{ usuario.nombreCompleto }}</span>
              <span class="user-role badge badge-info">{{ usuario.rol }}</span>
            </div>
            <button (click)="logout()" class="btn btn-secondary btn-sm" title="Cerrar sesión">
              <span>Cerrar sesión</span>
              <span class="logout-icon">🚪</span>
            </button>
          </div>
        }
      </div>
    </header>
  `,
  styles: [`
    .app-header {
      height: 64px;
      background: #ffffff;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: var(--shadow-sm);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .brand-icon {
      font-size: 1.5rem;
    }
    .brand-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--primary);
    }
    .brand-subtitle {
      font-size: 0.75rem;
      color: var(--text-muted);
      border-left: 1px solid var(--border-color);
      padding-left: 0.5rem;
      font-weight: 500;
    }
    .user-profile {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--primary-light);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.9rem;
    }
    .user-details {
      display: flex;
      flex-direction: column;
      text-align: right;
    }
    .user-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-main);
    }
    .user-role {
      font-size: 0.675rem;
      align-self: flex-end;
    }
  `]
})
export class HeaderComponent {
  authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
