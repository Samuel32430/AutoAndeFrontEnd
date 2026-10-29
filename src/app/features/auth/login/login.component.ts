import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        <div class="login-header">
          <div class="brand-badge">🔧 AutoAndes</div>
          <h2>Iniciar Sesión</h2>
          <p>Sistema de Gestión Integral de Órdenes y Servicios</p>
        </div>

        @if (errorMensaje()) {
          <div class="alerta alerta-peligro">
            <span>⚠️</span>
            <span>{{ errorMensaje() }}</span>
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="iniciarSesion()">
          <div class="form-group">
            <label class="form-label">Usuario</label>
            <input
              type="text"
              formControlName="username"
              class="form-control"
              placeholder="Ej. admin, asesor1, jefe1"
              [class.invalido]="form.get('username')?.invalid && form.get('username')?.touched"
            />
            @if (form.get('username')?.invalid && form.get('username')?.touched) {
              <span class="error-texto">El nombre de usuario es requerido</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label">Contraseña</label>
            <input
              type="password"
              formControlName="password"
              class="form-control"
              placeholder="••••••••"
              [class.invalido]="form.get('password')?.invalid && form.get('password')?.touched"
            />
            @if (form.get('password')?.invalid && form.get('password')?.touched) {
              <span class="error-texto">La contraseña es requerida</span>
            }
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-block"
            [disabled]="form.invalid || cargando()"
          >
            @if (cargando()) {
              <span>Ingresando...</span>
            } @else {
              <span>Ingresar al Sistema</span>
            }
          </button>
        </form>

        <div class="demo-users">
          <span class="demo-title">Acceso rápido para demostración:</span>
          <div class="demo-buttons">
            <button type="button" class="btn btn-secondary btn-sm" (click)="rellenarCredenciales('admin', 'admin123')">
              ADMIN
            </button>
            <button type="button" class="btn btn-secondary btn-sm" (click)="rellenarCredenciales('asesor1', 'asesor123')">
              ASESOR
            </button>
            <button type="button" class="btn btn-secondary btn-sm" (click)="rellenarCredenciales('jefe1', 'jefe123')">
              JEFE TALLER
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
      padding: 1.5rem;
    }
    .login-card {
      background: #ffffff;
      border-radius: var(--radius-lg);
      box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.2), 0 8px 10px -6px rgb(0 0 0 / 0.2);
      padding: 2.5rem;
      width: 100%;
      max-width: 440px;
    }
    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .brand-badge {
      display: inline-block;
      font-size: 1rem;
      font-weight: 700;
      color: var(--primary);
      background: var(--primary-light);
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      margin-bottom: 0.75rem;
    }
    .login-header h2 {
      font-size: 1.5rem;
      margin-bottom: 0.35rem;
    }
    .login-header p {
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .btn-block {
      width: 100%;
      padding: 0.75rem;
      font-size: 0.95rem;
      margin-top: 0.5rem;
    }
    .demo-users {
      margin-top: 2rem;
      padding-top: 1.25rem;
      border-top: 1px dashed var(--border-color);
      text-align: center;
    }
    .demo-title {
      display: block;
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-bottom: 0.5rem;
    }
    .demo-buttons {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  cargando = signal(false);
  errorMensaje = signal<string | null>(null);

  form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  rellenarCredenciales(user: string, pass: string): void {
    this.form.patchValue({ username: user, password: pass });
  }

  iniciarSesion(): void {
    if (this.form.invalid) return;

    this.cargando.set(true);
    this.errorMensaje.set(null);

    const { username, password } = this.form.getRawValue();

    this.authService.login({ username: username!, password: password! }).subscribe({
      next: () => {
        this.cargando.set(false);
        this.router.navigate(['/ordenes']);
      },
      error: (err) => {
        this.cargando.set(false);
        if (err.status === 401 || err.status === 403) {
          this.errorMensaje.set(err.error?.mensaje || 'Credenciales inválidas o usuario inactivo');
        } else {
          this.errorMensaje.set('Error al conectar con el servidor. Verifique que el backend esté activo.');
        }
      }
    });
  }
}
