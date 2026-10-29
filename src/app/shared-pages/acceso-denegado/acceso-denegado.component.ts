import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-acceso-denegado',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-page">
      <div class="card error-card">
        <div class="error-icon">🚫</div>
        <h1>403 - Acceso Denegado</h1>
        <p>No tienes los permisos requeridos para acceder a esta sección del sistema AutoAndes.</p>
        <div class="error-actions">
          <button (click)="irAInicio()" class="btn btn-primary">Volver al Inicio</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .error-page {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 60vh;
    }
    .error-card {
      max-width: 450px;
      text-align: center;
      padding: 3rem 2rem;
    }
    .error-icon {
      font-size: 3.5rem;
      margin-bottom: 1rem;
    }
    h1 {
      font-size: 1.5rem;
      color: var(--danger);
      margin-bottom: 0.75rem;
    }
    p {
      color: var(--text-muted);
      font-size: 0.9rem;
      margin-bottom: 1.5rem;
    }
  `]
})
export class AccesoDenegadoComponent {
  private router = inject(Router);

  irAInicio(): void {
    this.router.navigate(['/']);
  }
}
