import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { OrdenServicioService } from '../../../core/services/orden.service';
import { VehiculoService } from '../../../core/services/vehiculo.service';
import { ServicioService } from '../../../core/services/servicio.service';
import { VehiculoResponse } from '../../../core/models/vehiculo.model';
import { ServicioResponse } from '../../../core/models/servicio.model';
import { OrdenServicioRequest } from '../../../core/models/orden.model';

@Component({
  selector: 'app-orden-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="orden-form-page">
      <div class="card">
        <div class="card-header">
          <div>
            <h2>Nueva Orden de Servicio</h2>
            <p class="subtitle">Emisión y registro atómico cabecera-detalle</p>
          </div>
          <a routerLink="/ordenes" class="btn btn-secondary">
            <span>←</span>
            <span>Volver al listado</span>
          </a>
        </div>

        @if (errorGeneral()) {
          <div class="alerta alerta-peligro">
            <span>⚠️</span>
            <span>{{ errorGeneral() }}</span>
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="guardarOrden()">
          <!-- Cabecera -->
          <div class="cabecera-grid">
            <div class="form-group">
              <label class="form-label">Vehículo</label>
              <select
                formControlName="vehiculoId"
                class="form-select"
                [class.invalido]="(form.get('vehiculoId')?.invalid && form.get('vehiculoId')?.touched) || erroresCampos()['vehiculoId']"
              >
                <option [ngValue]="null">-- Seleccione el vehículo --</option>
                @for (v of vehiculos(); track v.id) {
                  <option [ngValue]="v.id">
                    {{ v.placa }} - {{ v.marca }} {{ v.modelo }} (Cliente: {{ v.clienteNombre }})
                  </option>
                }
              </select>
              @if (erroresCampos()['vehiculoId']) {
                <span class="error-texto">{{ erroresCampos()['vehiculoId'] }}</span>
              } @else if (form.get('vehiculoId')?.invalid && form.get('vehiculoId')?.touched) {
                <span class="error-texto">Debe seleccionar un vehículo</span>
              }
            </div>

            <div class="form-group">
              <label class="form-label">Kilometraje Actual (km)</label>
              <input
                type="number"
                formControlName="kilometraje"
                class="form-control"
                placeholder="Ej. 45000"
                [class.invalido]="(form.get('kilometraje')?.invalid && form.get('kilometraje')?.touched) || erroresCampos()['kilometraje']"
              />
              @if (erroresCampos()['kilometraje']) {
                <span class="error-texto">{{ erroresCampos()['kilometraje'] }}</span>
              } @else if (form.get('kilometraje')?.invalid && form.get('kilometraje')?.touched) {
                <span class="error-texto">El kilometraje no puede ser negativo</span>
              }
            </div>
          </div>

          <!-- Detalle de Servicios -->
          <div class="detalles-section">
            <div class="detalles-header">
              <h3>Servicios a Realizar</h3>
              <button type="button" (click)="agregarFilaDetalle()" class="btn btn-secondary btn-sm">
                <span>➕</span>
                <span>Agregar Servicio</span>
              </button>
            </div>

            <div class="tabla-contenedor">
              <table class="tabla">
                <thead>
                  <tr>
                    <th style="width: 45%">Servicio (Activos)</th>
                    <th style="width: 15%">Cantidad (1-5)</th>
                    <th style="width: 15%">Precio Unit.</th>
                    <th style="width: 15%">Subtotal</th>
                    <th style="width: 10%"></th>
                  </tr>
                </thead>
                <tbody formArrayName="detalles">
                  @for (detalleCtrl of detallesArray.controls; track $index; let i = $index) {
                    <tr [formGroupName]="i">
                      <td>
                        <select
                          formControlName="servicioId"
                          class="form-select"
                          (change)="onServicioCambiado(i)"
                          [class.invalido]="detalleCtrl.get('servicioId')?.invalid && detalleCtrl.get('servicioId')?.touched"
                        >
                          <option [ngValue]="null">-- Seleccione servicio --</option>
                          @for (s of serviciosActivos(); track s.id) {
                            <option [ngValue]="s.id">{{ s.codigo }} - {{ s.nombre }} (S/ {{ s.precio | number:'1.2-2' }})</option>
                          }
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          formControlName="cantidad"
                          min="1"
                          max="5"
                          class="form-control"
                          (input)="recalcularFila(i)"
                          [class.invalido]="detalleCtrl.get('cantidad')?.invalid && detalleCtrl.get('cantidad')?.touched"
                        />
                      </td>
                      <td>
                        <span class="precio-readonly">
                          S/ {{ detalleCtrl.get('precioUnitario')?.value | number:'1.2-2' }}
                        </span>
                      </td>
                      <td>
                        <strong>
                          S/ {{ detalleCtrl.get('subtotal')?.value | number:'1.2-2' }}
                        </strong>
                      </td>
                      <td>
                        <button
                          type="button"
                          (click)="eliminarFilaDetalle(i)"
                          class="btn btn-peligro btn-sm"
                          [disabled]="detallesArray.length === 1"
                          title="Eliminar línea"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- Resumen y Total -->
          <div class="resumen-total">
            <div class="total-box">
              <span class="total-label">TOTAL ESTIMADO:</span>
              <span class="total-valor">S/ {{ totalCalculado() | number:'1.2-2' }}</span>
            </div>
          </div>

          <div class="form-actions">
            <button
              type="submit"
              class="btn btn-primary btn-lg"
              [disabled]="form.invalid || guardando() || detallesArray.length === 0"
            >
              {{ guardando() ? 'Registrando Orden...' : '💾 Registrar Orden de Servicio' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .subtitle {
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .cabecera-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .detalles-section {
      margin-top: 1rem;
      margin-bottom: 1.5rem;
    }
    .detalles-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    .detalles-header h3 {
      font-size: 1.1rem;
    }
    .precio-readonly {
      color: var(--secondary);
      font-weight: 500;
    }
    .resumen-total {
      display: flex;
      justify-content: flex-end;
      margin: 1.5rem 0;
    }
    .total-box {
      background: var(--primary-light);
      border: 1px solid #bfdbfe;
      border-radius: var(--radius-md);
      padding: 1rem 2rem;
      text-align: right;
    }
    .total-label {
      display: block;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--primary);
      letter-spacing: 0.05em;
    }
    .total-valor {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--primary);
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
    }
    .btn-lg {
      padding: 0.75rem 2rem;
      font-size: 1rem;
    }
    @media (max-width: 768px) {
      .cabecera-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class OrdenFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private ordenService = inject(OrdenServicioService);
  private vehiculoService = inject(VehiculoService);
  private servicioService = inject(ServicioService);
  private router = inject(Router);

  vehiculos = signal<VehiculoResponse[]>([]);
  serviciosActivos = signal<ServicioResponse[]>([]);
  totalCalculado = signal<number>(0);
  guardando = signal<boolean>(false);
  errorGeneral = signal<string | null>(null);
  erroresCampos = signal<Record<string, string>>({});

  form = this.fb.group({
    vehiculoId: [null as number | null, [Validators.required]],
    kilometraje: [0, [Validators.required, Validators.min(0)]],
    detalles: this.fb.array([])
  });

  get detallesArray(): FormArray {
    return this.form.get('detalles') as FormArray;
  }

  ngOnInit(): void {
    this.cargarDatos();
    this.agregarFilaDetalle();
  }

  cargarDatos(): void {
    this.vehiculoService.listarTodos().subscribe({
      next: (data) => this.vehiculos.set(data),
      error: () => this.errorGeneral.set('Error al cargar la lista de vehículos')
    });

    this.servicioService.listarActivos().subscribe({
      next: (data) => this.serviciosActivos.set(data),
      error: () => this.errorGeneral.set('Error al cargar los servicios activos')
    });
  }

  agregarFilaDetalle(): void {
    const fila = this.fb.group({
      servicioId: [null as number | null, [Validators.required]],
      cantidad: [1, [Validators.required, Validators.min(1), Validators.max(5)]],
      precioUnitario: [0],
      subtotal: [0]
    });

    this.detallesArray.push(fila);
  }

  eliminarFilaDetalle(index: number): void {
    if (this.detallesArray.length > 1) {
      this.detallesArray.removeAt(index);
      this.actualizarTotalGeneral();
    }
  }

  onServicioCambiado(index: number): void {
    const fila = this.detallesArray.at(index) as FormGroup;
    const servicioId = fila.get('servicioId')?.value;
    const servicio = this.serviciosActivos().find(s => s.id === servicioId);

    if (servicio) {
      fila.patchValue({ precioUnitario: servicio.precio });
    } else {
      fila.patchValue({ precioUnitario: 0 });
    }

    this.recalcularFila(index);
  }

  recalcularFila(index: number): void {
    const fila = this.detallesArray.at(index) as FormGroup;
    const cantidad = Number(fila.get('cantidad')?.value) || 0;
    const precio = Number(fila.get('precioUnitario')?.value) || 0;
    const subtotal = cantidad * precio;

    fila.patchValue({ subtotal }, { emitEvent: false });
    this.actualizarTotalGeneral();
  }

  actualizarTotalGeneral(): void {
    let suma = 0;
    for (let i = 0; i < this.detallesArray.length; i++) {
      const fila = this.detallesArray.at(i);
      suma += Number(fila.get('subtotal')?.value) || 0;
    }
    this.totalCalculado.set(suma);
  }

  guardarOrden(): void {
    if (this.form.invalid) return;

    this.guardando.set(true);
    this.errorGeneral.set(null);
    this.erroresCampos.set({});

    // Validar duplicidad de servicios en el cliente antes de enviar
    const serviciosSeleccionados = new Set<number>();
    for (let i = 0; i < this.detallesArray.length; i++) {
      const sId = this.detallesArray.at(i).get('servicioId')?.value;
      if (serviciosSeleccionados.has(sId)) {
        this.guardando.set(false);
        this.errorGeneral.set('No se permite repetir el mismo servicio en más de una línea.');
        return;
      }
      serviciosSeleccionados.add(sId);
    }

    const payload: OrdenServicioRequest = {
      vehiculoId: Number(this.form.value.vehiculoId),
      kilometraje: Number(this.form.value.kilometraje),
      detalles: this.detallesArray.value.map((d: any) => ({
        servicioId: Number(d.servicioId),
        cantidad: Number(d.cantidad)
      }))
    };

    this.ordenService.registrar(payload).subscribe({
      next: () => {
        this.guardando.set(false);
        this.router.navigate(['/ordenes']);
      },
      error: (err) => {
        this.guardando.set(false);
        if (err.status === 400 && err.error?.campos) {
          this.erroresCampos.set(err.error.campos);
        } else {
          this.errorGeneral.set(err.error?.mensaje || 'Error al registrar la orden de servicio');
        }
      }
    });
  }
}
