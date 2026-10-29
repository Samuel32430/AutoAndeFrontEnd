import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { VehiculoService } from '../../core/services/vehiculo.service';
import { ClienteService } from '../../core/services/cliente.service';
import { VehiculoRequest, VehiculoResponse } from '../../core/models/vehiculo.model';
import { ClienteResponse } from '../../core/models/cliente.model';
import { SiPermisoDirective } from '../../shared/directives/si-permiso.directive';

@Component({
  selector: 'app-vehiculos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SiPermisoDirective],
  template: `
    <div class="vehiculos-page">
      <div class="card">
        <div class="card-header">
          <div>
            <h2>Gestión de Vehículos</h2>
            <p class="subtitle">Registro de unidades vehiculares y vinculación con clientes</p>
          </div>
          <button (click)="abrirModalNuevo()" class="btn btn-primary" *appSiPermiso="'VEHICULO_ESCRIBIR'">
            <span>➕</span>
            <span>Nuevo Vehículo</span>
          </button>
        </div>

        <div class="filtros-bar">
          <input
            type="text"
            [(ngModel)]="busqueda"
            placeholder="Buscar por placa, modelo o propietario..."
            class="form-control busqueda-input"
          />
        </div>

        @if (mensajeAlerta()) {
          <div class="alerta" [class.alerta-peligro]="esError()" [class.alerta-success]="!esError()">
            <span>{{ esError() ? '⚠️' : '✅' }}</span>
            <span>{{ mensajeAlerta() }}</span>
          </div>
        }

        <div class="tabla-contenedor">
          <table class="tabla">
            <thead>
              <tr>
                <th>Placa</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Año</th>
                <th>Propietario (Cliente)</th>
                <th class="acciones-col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (v of vehiculosFiltrados(); track v.id) {
                <tr>
                  <td><span class="placa-badge">{{ v.placa }}</span></td>
                  <td>{{ v.marca }}</td>
                  <td>{{ v.modelo }}</td>
                  <td>{{ v.anio }}</td>
                  <td><strong>{{ v.clienteNombre }}</strong></td>
                  <td class="acciones-col">
                    <button
                      *appSiPermiso="'VEHICULO_ESCRIBIR'"
                      (click)="abrirModalEditar(v)"
                      class="btn btn-secondary btn-sm"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      *appSiPermiso="'VEHICULO_ESCRIBIR'"
                      (click)="eliminarVehiculo(v)"
                      class="btn btn-peligro btn-sm"
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="text-center py-4">No se encontraron vehículos registrados.</td>
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
              <h3>{{ vehiculoEditandoId ? 'Editar Vehículo' : 'Registrar Nuevo Vehículo' }}</h3>
              <button (click)="cerrarModal()" class="btn-close">✕</button>
            </div>
            <form [formGroup]="form" (ngSubmit)="guardarVehiculo()">
              <div class="modal-body">
                @if (modalError()) {
                  <div class="alerta alerta-peligro">
                    <span>⚠️</span>
                    <span>{{ modalError() }}</span>
                  </div>
                }

                <div class="form-group">
                  <label class="form-label">Placa (RN-02: ABC-123)</label>
                  <input
                    type="text"
                    formControlName="placa"
                    class="form-control"
                    placeholder="ABC-123"
                    style="text-transform: uppercase"
                    [class.invalido]="(form.get('placa')?.invalid && form.get('placa')?.touched) || erroresCampos()['placa']"
                  />
                  @if (erroresCampos()['placa']) {
                    <span class="error-texto">{{ erroresCampos()['placa'] }}</span>
                  } @else if (form.get('placa')?.invalid && form.get('placa')?.touched) {
                    <span class="error-texto">Formato de placa requerido: ABC-123</span>
                  }
                </div>

                <div class="form-group">
                  <label class="form-label">Marca</label>
                  <input
                    type="text"
                    formControlName="marca"
                    class="form-control"
                    placeholder="Ej. Toyota, Hyundai, Kia"
                    [class.invalido]="(form.get('marca')?.invalid && form.get('marca')?.touched) || erroresCampos()['marca']"
                  />
                  @if (erroresCampos()['marca']) {
                    <span class="error-texto">{{ erroresCampos()['marca'] }}</span>
                  } @else if (form.get('marca')?.invalid && form.get('marca')?.touched) {
                    <span class="error-texto">La marca es requerida</span>
                  }
                </div>

                <div class="form-group">
                  <label class="form-label">Modelo</label>
                  <input
                    type="text"
                    formControlName="modelo"
                    class="form-control"
                    placeholder="Ej. Corolla, Sportage"
                    [class.invalido]="(form.get('modelo')?.invalid && form.get('modelo')?.touched) || erroresCampos()['modelo']"
                  />
                  @if (erroresCampos()['modelo']) {
                    <span class="error-texto">{{ erroresCampos()['modelo'] }}</span>
                  } @else if (form.get('modelo')?.invalid && form.get('modelo')?.touched) {
                    <span class="error-texto">El modelo es requerido</span>
                  }
                </div>

                <div class="form-group">
                  <label class="form-label">Año de Fabricación</label>
                  <input
                    type="number"
                    formControlName="anio"
                    class="form-control"
                    placeholder="2022"
                    [class.invalido]="(form.get('anio')?.invalid && form.get('anio')?.touched) || erroresCampos()['anio']"
                  />
                  @if (erroresCampos()['anio']) {
                    <span class="error-texto">{{ erroresCampos()['anio'] }}</span>
                  } @else if (form.get('anio')?.invalid && form.get('anio')?.touched) {
                    <span class="error-texto">Año válido entre 1990 y 2027</span>
                  }
                </div>

                <div class="form-group">
                  <label class="form-label">Propietario / Cliente</label>
                  <select
                    formControlName="clienteId"
                    class="form-select"
                    [class.invalido]="(form.get('clienteId')?.invalid && form.get('clienteId')?.touched) || erroresCampos()['clienteId']"
                  >
                    <option [ngValue]="null">-- Seleccione el cliente --</option>
                    @for (c of clientes(); track c.id) {
                      <option [ngValue]="c.id">{{ c.nombres }} (Doc: {{ c.documento }})</option>
                    }
                  </select>
                  @if (erroresCampos()['clienteId']) {
                    <span class="error-texto">{{ erroresCampos()['clienteId'] }}</span>
                  } @else if (form.get('clienteId')?.invalid && form.get('clienteId')?.touched) {
                    <span class="error-texto">Debe seleccionar un cliente</span>
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
      max-width: 380px;
    }
    .placa-badge {
      background: #f1f5f9;
      border: 1px solid var(--border-color);
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-sm);
      font-weight: 700;
      letter-spacing: 0.05em;
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
export class VehiculosComponent implements OnInit {
  private vehiculoService = inject(VehiculoService);
  private clienteService = inject(ClienteService);
  private fb = inject(FormBuilder);

  vehiculos = signal<VehiculoResponse[]>([]);
  clientes = signal<ClienteResponse[]>([]);
  busqueda = '';
  modalAbierto = signal(false);
  vehiculoEditandoId: number | null = null;
  guardando = signal(false);
  mensajeAlerta = signal<string | null>(null);
  esError = signal(false);
  modalError = signal<string | null>(null);
  erroresCampos = signal<Record<string, string>>({});

  form = this.fb.group({
    placa: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}-\d{3}$/)]],
    marca: ['', [Validators.required, Validators.maxLength(40)]],
    modelo: ['', [Validators.required, Validators.maxLength(40)]],
    anio: [2022, [Validators.required, Validators.min(1990), Validators.max(2027)]],
    clienteId: [null as number | null, [Validators.required]]
  });

  ngOnInit(): void {
    this.cargarVehiculos();
    this.cargarClientes();
  }

  cargarVehiculos(): void {
    this.vehiculoService.listarTodos().subscribe({
      next: (data) => this.vehiculos.set(data),
      error: (err) => this.mostrarMensaje(err.error?.mensaje || 'Error al cargar vehículos', true)
    });
  }

  cargarClientes(): void {
    this.clienteService.listarTodos().subscribe({
      next: (data) => this.clientes.set(data),
      error: () => {}
    });
  }

  vehiculosFiltrados(): VehiculoResponse[] {
    const q = this.busqueda.toLowerCase().trim();
    if (!q) return this.vehiculos();
    return this.vehiculos().filter(v =>
      v.placa.toLowerCase().includes(q) ||
      v.modelo.toLowerCase().includes(q) ||
      v.marca.toLowerCase().includes(q) ||
      v.clienteNombre.toLowerCase().includes(q)
    );
  }

  abrirModalNuevo(): void {
    this.vehiculoEditandoId = null;
    this.form.reset({ anio: 2022, clienteId: null });
    this.modalError.set(null);
    this.erroresCampos.set({});
    this.modalAbierto.set(true);
  }

  abrirModalEditar(v: VehiculoResponse): void {
    this.vehiculoEditandoId = v.id;
    this.form.patchValue({
      placa: v.placa,
      marca: v.marca,
      modelo: v.modelo,
      anio: v.anio,
      clienteId: v.clienteId
    });
    this.modalError.set(null);
    this.erroresCampos.set({});
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
  }

  guardarVehiculo(): void {
    if (this.form.invalid) return;

    this.guardando.set(true);
    this.modalError.set(null);
    this.erroresCampos.set({});

    const req: VehiculoRequest = {
      placa: this.form.value.placa!.toUpperCase().trim(),
      marca: this.form.value.marca!.trim(),
      modelo: this.form.value.modelo!.trim(),
      anio: Number(this.form.value.anio),
      clienteId: Number(this.form.value.clienteId)
    };

    const peticion = this.vehiculoEditandoId
      ? this.vehiculoService.actualizar(this.vehiculoEditandoId, req)
      : this.vehiculoService.crear(req);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModal();
        this.mostrarMensaje('Vehículo guardado exitosamente', false);
        this.cargarVehiculos();
      },
      error: (err) => {
        this.guardando.set(false);
        if (err.status === 400 && err.error?.campos) {
          this.erroresCampos.set(err.error.campos);
        } else {
          this.modalError.set(err.error?.mensaje || 'Error al guardar el vehículo');
        }
      }
    });
  }

  eliminarVehiculo(v: VehiculoResponse): void {
    if (!confirm(`¿Está seguro de eliminar el vehículo ${v.placa}?`)) return;

    this.vehiculoService.eliminar(v.id).subscribe({
      next: () => {
        this.mostrarMensaje(`Vehículo ${v.placa} eliminado con éxito`, false);
        this.cargarVehiculos();
      },
      error: (err) => {
        this.mostrarMensaje(err.error?.mensaje || 'No se pudo eliminar el vehículo', true);
      }
    });
  }

  private mostrarMensaje(msg: string, esErr: boolean): void {
    this.mensajeAlerta.set(msg);
    this.esError.set(esErr);
    setTimeout(() => this.mensajeAlerta.set(null), 5000);
  }
}
