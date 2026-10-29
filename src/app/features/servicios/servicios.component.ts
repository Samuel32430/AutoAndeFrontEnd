import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServicioService } from '../../core/services/servicio.service';
import { ServicioRequest, ServicioResponse } from '../../core/models/servicio.model';
import { SiPermisoDirective } from '../../shared/directives/si-permiso.directive';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SiPermisoDirective],
  template: `
    <div class="servicios-page">
      <div class="card">
        <div class="card-header">
          <div>
            <h2>Catálogo de Servicios</h2>
            <p class="subtitle">Gestione la oferta de servicios del taller mecánico</p>
          </div>
          <button (click)="abrirModalNuevo()" class="btn btn-primary" *appSiPermiso="'SERVICIO_ESCRIBIR'">
            <span>➕</span>
            <span>Nuevo Servicio</span>
          </button>
        </div>

        <div class="filtros-bar">
          <input
            type="text"
            [(ngModel)]="busqueda"
            placeholder="Buscar por código o nombre..."
            class="form-control busqueda-input"
          />
        </div>

        @if (errorGeneral()) {
          <div class="alerta alerta-peligro">
            <span>⚠️</span>
            <span>{{ errorGeneral() }}</span>
          </div>
        }

        <div class="tabla-contenedor">
          <table class="tabla">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre del Servicio</th>
                <th>Precio (S/)</th>
                <th>Duración</th>
                <th>Estado</th>
                <th class="acciones-col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (servicio of serviciosFiltrados(); track servicio.id) {
                <tr>
                  <td><strong>{{ servicio.codigo }}</strong></td>
                  <td>{{ servicio.nombre }}</td>
                  <td>S/ {{ servicio.precio | number:'1.2-2' }}</td>
                  <td>{{ servicio.duracionMin }} min</td>
                  <td>
                    <span class="badge" [class.badge-activo]="servicio.activo === 1" [class.badge-inactivo]="servicio.activo !== 1">
                      {{ servicio.activo === 1 ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="acciones-col">
                    <button
                      *appSiPermiso="'SERVICIO_ESCRIBIR'"
                      (click)="abrirModalEditar(servicio)"
                      class="btn btn-secondary btn-sm"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      *appSiPermiso="'SERVICIO_ESCRIBIR'"
                      (click)="toggleEstado(servicio)"
                      class="btn btn-sm"
                      [class.btn-peligro]="servicio.activo === 1"
                      [class.btn-success]="servicio.activo !== 1"
                    >
                      {{ servicio.activo === 1 ? 'Desactivar' : 'Activar' }}
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="text-center py-4">No se encontraron servicios registrados.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Crear/Editar -->
      @if (modalAbierto()) {
        <div class="modal-backdrop">
          <div class="modal-dialog">
            <div class="modal-header">
              <h3>{{ servicioEditandoId ? 'Editar Servicio' : 'Nuevo Servicio' }}</h3>
              <button (click)="cerrarModal()" class="btn-close">✕</button>
            </div>
            <form [formGroup]="form" (ngSubmit)="guardarServicio()">
              <div class="modal-body">
                @if (modalError()) {
                  <div class="alerta alerta-peligro">
                    <span>⚠️</span>
                    <span>{{ modalError() }}</span>
                  </div>
                }

                <div class="form-group">
                  <label class="form-label">Código (RN-01: SRV-000)</label>
                  <input
                    type="text"
                    formControlName="codigo"
                    class="form-control"
                    placeholder="SRV-001"
                    [class.invalido]="(form.get('codigo')?.invalid && form.get('codigo')?.touched) || erroresCampos()['codigo']"
                  />
                  @if (erroresCampos()['codigo']) {
                    <span class="error-texto">{{ erroresCampos()['codigo'] }}</span>
                  } @else if (form.get('codigo')?.invalid && form.get('codigo')?.touched) {
                    <span class="error-texto">Formato requerido: SRV-000</span>
                  }
                </div>

                <div class="form-group">
                  <label class="form-label">Nombre del Servicio</label>
                  <input
                    type="text"
                    formControlName="nombre"
                    class="form-control"
                    placeholder="Ej. Cambio de Aceite Sintético"
                    [class.invalido]="(form.get('nombre')?.invalid && form.get('nombre')?.touched) || erroresCampos()['nombre']"
                  />
                  @if (erroresCampos()['nombre']) {
                    <span class="error-texto">{{ erroresCampos()['nombre'] }}</span>
                  } @else if (form.get('nombre')?.invalid && form.get('nombre')?.touched) {
                    <span class="error-texto">Nombre obligatorio (3 a 80 caracteres)</span>
                  }
                </div>

                <div class="form-group">
                  <label class="form-label">Precio (S/)</label>
                  <input
                    type="number"
                    step="0.01"
                    formControlName="precio"
                    class="form-control"
                    placeholder="0.00"
                    [class.invalido]="(form.get('precio')?.invalid && form.get('precio')?.touched) || erroresCampos()['precio']"
                  />
                  @if (erroresCampos()['precio']) {
                    <span class="error-texto">{{ erroresCampos()['precio'] }}</span>
                  } @else if (form.get('precio')?.invalid && form.get('precio')?.touched) {
                    <span class="error-texto">El precio debe ser mayor que 0</span>
                  }
                </div>

                <div class="form-group">
                  <label class="form-label">Duración Estimada (Minutos)</label>
                  <input
                    type="number"
                    formControlName="duracionMin"
                    class="form-control"
                    placeholder="60"
                    [class.invalido]="(form.get('duracionMin')?.invalid && form.get('duracionMin')?.touched) || erroresCampos()['duracionMin']"
                  />
                  @if (erroresCampos()['duracionMin']) {
                    <span class="error-texto">{{ erroresCampos()['duracionMin'] }}</span>
                  } @else if (form.get('duracionMin')?.invalid && form.get('duracionMin')?.touched) {
                    <span class="error-texto">Duración entre 15 y 480 minutos</span>
                  }
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" (click)="cerrarModal()" class="btn btn-secondary">Cancelar</button>
                <button type="submit" class="btn btn-primary" [disabled]="form.invalid || guardando()">
                  {{ guardando() ? 'Guardando...' : 'Guardar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .subtitle {
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .filtros-bar {
      margin-bottom: 1.25rem;
    }
    .busqueda-input {
      max-width: 350px;
    }
    .acciones-col {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }
    .btn-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: var(--text-muted);
    }
  `]
})
export class ServiciosComponent implements OnInit {
  private servicioService = inject(ServicioService);
  private fb = inject(FormBuilder);

  servicios = signal<ServicioResponse[]>([]);
  busqueda = '';
  modalAbierto = signal(false);
  servicioEditandoId: number | null = null;
  guardando = signal(false);
  errorGeneral = signal<string | null>(null);
  modalError = signal<string | null>(null);
  erroresCampos = signal<Record<string, string>>({});

  form = this.fb.group({
    codigo: ['', [Validators.required, Validators.pattern(/^SRV-\d{3}$/)]],
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    precio: [0, [Validators.required, Validators.min(0.01)]],
    duracionMin: [60, [Validators.required, Validators.min(15), Validators.max(480)]]
  });

  ngOnInit(): void {
    this.cargarServicios();
  }

  cargarServicios(): void {
    this.servicioService.listarTodos().subscribe({
      next: (data) => this.servicios.set(data),
      error: (err) => this.errorGeneral.set(err.error?.mensaje || 'Error al cargar los servicios')
    });
  }

  serviciosFiltrados(): ServicioResponse[] {
    const q = this.busqueda.toLowerCase().trim();
    if (!q) return this.servicios();
    return this.servicios().filter(s =>
      s.codigo.toLowerCase().includes(q) || s.nombre.toLowerCase().includes(q)
    );
  }

  abrirModalNuevo(): void {
    this.servicioEditandoId = null;
    this.form.reset({ precio: 0, duracionMin: 60 });
    this.modalError.set(null);
    this.erroresCampos.set({});
    this.modalAbierto.set(true);
  }

  abrirModalEditar(servicio: ServicioResponse): void {
    this.servicioEditandoId = servicio.id;
    this.form.patchValue({
      codigo: servicio.codigo,
      nombre: servicio.nombre,
      precio: servicio.precio,
      duracionMin: servicio.duracionMin
    });
    this.modalError.set(null);
    this.erroresCampos.set({});
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
  }

  guardarServicio(): void {
    if (this.form.invalid) return;

    this.guardando.set(true);
    this.modalError.set(null);
    this.erroresCampos.set({});

    const req: ServicioRequest = {
      codigo: this.form.value.codigo!,
      nombre: this.form.value.nombre!,
      precio: Number(this.form.value.precio),
      duracionMin: Number(this.form.value.duracionMin)
    };

    const peticion = this.servicioEditandoId
      ? this.servicioService.actualizar(this.servicioEditandoId, req)
      : this.servicioService.crear(req);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModal();
        this.cargarServicios();
      },
      error: (err) => {
        this.guardando.set(false);
        if (err.status === 400 && err.error?.campos) {
          this.erroresCampos.set(err.error.campos);
        } else {
          this.modalError.set(err.error?.mensaje || 'Error al guardar el servicio');
        }
      }
    });
  }

  toggleEstado(servicio: ServicioResponse): void {
    this.servicioService.cambiarEstado(servicio.id).subscribe({
      next: (actualizado) => {
        this.servicios.update(lista =>
          lista.map(s => s.id === actualizado.id ? actualizado : s)
        );
      },
      error: (err) => this.errorGeneral.set(err.error?.mensaje || 'Error al actualizar el estado')
    });
  }
}
