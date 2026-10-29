import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OrdenServicioService } from '../../../core/services/orden.service';
import { OrdenServicioResponse } from '../../../core/models/orden.model';
import { SiPermisoDirective } from '../../../shared/directives/si-permiso.directive';

@Component({
  selector: 'app-orden-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SiPermisoDirective],
  template: `
    <div class="orden-list-page">
      <div class="card">
        <div class="card-header">
          <div>
            <h2>Órdenes de Servicio</h2>
            <p class="subtitle">Consulta histórica, seguimiento y anulación de órdenes</p>
          </div>
          <a routerLink="/ordenes/nueva" class="btn btn-primary" *appSiPermiso="'ORDEN_REGISTRAR'">
            <span>➕</span>
            <span>Nueva Orden</span>
          </a>
        </div>

        <!-- Filtros -->
        <div class="filtros-grid">
          <div class="form-group mb-0">
            <label class="form-label">Placa</label>
            <input
              type="text"
              [(ngModel)]="filtroPlaca"
              (keyup.enter)="consultar()"
              placeholder="Ej. ABC-123"
              class="form-control"
              style="text-transform: uppercase"
            />
          </div>

          <div class="form-group mb-0">
            <label class="form-label">Estado</label>
            <select [(ngModel)]="filtroEstado" (change)="consultar()" class="form-select">
              <option value="TODOS">Todos los estados</option>
              <option value="REGISTRADA">REGISTRADA</option>
              <option value="ANULADA">ANULADA</option>
            </select>
          </div>

          <div class="form-group mb-0">
            <label class="form-label">Desde</label>
            <input type="datetime-local" [(ngModel)]="filtroDesde" (change)="consultar()" class="form-control" />
          </div>

          <div class="form-group mb-0">
            <label class="form-label">Hasta</label>
            <input type="datetime-local" [(ngModel)]="filtroHasta" (change)="consultar()" class="form-control" />
          </div>

          <div class="filtro-acciones">
            <button (click)="consultar()" class="btn btn-secondary">🔍 Filtrar</button>
            <button (click)="limpiarFiltros()" class="btn btn-secondary">Limpiar</button>
          </div>
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
                <th>N° Orden</th>
                <th>Fecha y Hora</th>
                <th>Placa</th>
                <th>Cliente</th>
                <th>Kilometraje</th>
                <th>Total (S/)</th>
                <th>Estado</th>
                <th class="acciones-col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (orden of ordenes(); track orden.id) {
                <tr>
                  <td><strong>{{ orden.numero }}</strong></td>
                  <td>{{ orden.fecha | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td><span class="placa-badge">{{ orden.vehiculoPlaca }}</span></td>
                  <td>{{ orden.clienteNombre }}</td>
                  <td>{{ orden.kilometraje | number }} km</td>
                  <td><strong>S/ {{ orden.total | number:'1.2-2' }}</strong></td>
                  <td>
                    <span class="badge" [class.badge-registrada]="orden.estado === 'REGISTRADA'" [class.badge-anulada]="orden.estado === 'ANULADA'">
                      {{ orden.estado }}
                    </span>
                  </td>
                  <td class="acciones-col">
                    <button (click)="verDetalle(orden)" class="btn btn-secondary btn-sm">
                      👁️ Detalle
                    </button>
                    @if (orden.estado === 'REGISTRADA') {
                      <button
                        *appSiPermiso="'ORDEN_ANULAR'"
                        (click)="abrirModalAnular(orden)"
                        class="btn btn-peligro btn-sm"
                      >
                        ❌ Anular
                      </button>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="text-center py-4">No se encontraron órdenes registradas con los filtros seleccionados.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Detalle de la Orden -->
      @if (modalDetalleAbierto() && ordenSeleccionada()) {
        <div class="modal-backdrop">
          <div class="modal-dialog modal-lg">
            <div class="modal-header">
              <h3>Detalle de Orden: {{ ordenSeleccionada()?.numero }}</h3>
              <button (click)="cerrarModalDetalle()" class="btn-close">✕</button>
            </div>
            <div class="modal-body">
              <div class="info-resumen-grid">
                <div><strong>Fecha:</strong> {{ ordenSeleccionada()?.fecha | date:'dd/MM/yyyy HH:mm' }}</div>
                <div><strong>Vehículo:</strong> {{ ordenSeleccionada()?.vehiculoPlaca }}</div>
                <div><strong>Cliente:</strong> {{ ordenSeleccionada()?.clienteNombre }}</div>
                <div><strong>Kilometraje:</strong> {{ ordenSeleccionada()?.kilometraje | number }} km</div>
                <div><strong>Registrado por:</strong> {{ ordenSeleccionada()?.usuarioRegistro }}</div>
                <div>
                  <strong>Estado:</strong>
                  <span class="badge ml-2" [class.badge-registrada]="ordenSeleccionada()?.estado === 'REGISTRADA'" [class.badge-anulada]="ordenSeleccionada()?.estado === 'ANULADA'">
                    {{ ordenSeleccionada()?.estado }}
                  </span>
                </div>
              </div>

              @if (ordenSeleccionada()?.motivoAnulacion) {
                <div class="alerta alerta-peligro mt-3">
                  <strong>Motivo de Anulación:</strong> {{ ordenSeleccionada()?.motivoAnulacion }}
                </div>
              }

              <h4 class="mt-4 mb-2">Servicios Incluidos</h4>
              <div class="tabla-contenedor">
                <table class="tabla">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Descripción</th>
                      <th>Cantidad</th>
                      <th>Precio Unit.</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (d of ordenSeleccionada()?.detalles; track d.id) {
                      <tr>
                        <td>{{ d.servicioCodigo }}</td>
                        <td>{{ d.servicioNombre }}</td>
                        <td>{{ d.cantidad }}</td>
                        <td>S/ {{ d.precioUnitario | number:'1.2-2' }}</td>
                        <td><strong>S/ {{ d.subtotal | number:'1.2-2' }}</strong></td>
                      </tr>
                    }
                  </tbody>
                  <tfoot>
                    <tr>
                      <th colspan="4" class="text-right">TOTAL GENERAL:</th>
                      <th><strong>S/ {{ ordenSeleccionada()?.total | number:'1.2-2' }}</strong></th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            <div class="modal-footer">
              <button (click)="cerrarModalDetalle()" class="btn btn-secondary">Cerrar</button>
            </div>
          </div>
        </div>
      }

      <!-- Modal Anular Orden (RN-05) -->
      @if (modalAnularAbierto() && ordenParaAnular()) {
        <div class="modal-backdrop">
          <div class="modal-dialog">
            <div class="modal-header">
              <h3>Anular Orden: {{ ordenParaAnular()?.numero }}</h3>
              <button (click)="cerrarModalAnular()" class="btn-close">✕</button>
            </div>
            <div class="modal-body">
              <div class="alerta alerta-peligro">
                <span>⚠️</span>
                <span><strong>Regla RN-05:</strong> Solo se permite anular órdenes emitidas en el mismo día calendario. Requiere justificación de 10 a 200 caracteres.</span>
              </div>

              @if (errorAnulacion()) {
                <div class="alerta alerta-peligro">
                  <span>{{ errorAnulacion() }}</span>
                </div>
              }

              <div class="form-group">
                <label class="form-label">Motivo de Anulación (obligatorio, 10-200 caracteres)</label>
                <textarea
                  [(ngModel)]="motivoAnulacion"
                  rows="4"
                  class="form-control"
                  placeholder="Explique detalladamente la razón de anulación de la orden..."
                ></textarea>
                <span class="caracteres-info">{{ motivoAnulacion.length }} / 200 caracteres</span>
              </div>
            </div>
            <div class="modal-footer">
              <button (click)="cerrarModalAnular()" class="btn btn-secondary">Cancelar</button>
              <button
                (click)="confirmarAnulacion()"
                class="btn btn-peligro"
                [disabled]="motivoAnulacion.trim().length < 10 || motivoAnulacion.trim().length > 200 || anulando()"
              >
                {{ anulando() ? 'Anulando...' : 'Confirmar Anulación' }}
              </button>
            </div>
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
    .filtros-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1.2fr 1.2fr auto;
      gap: 1rem;
      align-items: flex-end;
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: #f8fafc;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
    }
    .filtro-acciones {
      display: flex;
      gap: 0.5rem;
    }
    .placa-badge {
      background: #f1f5f9;
      border: 1px solid var(--border-color);
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-sm);
      font-weight: 700;
    }
    .acciones-col {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }
    .info-resumen-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      padding: 1rem;
      background: #f8fafc;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-color);
    }
    .caracteres-info {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
      text-align: right;
    }
    .btn-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: var(--text-muted);
    }
    .mb-0 {
      margin-bottom: 0 !important;
    }
    .mt-3 { margin-top: 0.75rem; }
    .mt-4 { margin-top: 1rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .ml-2 { margin-left: 0.5rem; }
    .text-right { text-align: right; }
    @media (max-width: 900px) {
      .filtros-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
  `]
})
export class OrdenListComponent implements OnInit {
  private ordenService = inject(OrdenServicioService);

  ordenes = signal<OrdenServicioResponse[]>([]);
  filtroPlaca = '';
  filtroEstado = 'TODOS';
  filtroDesde = '';
  filtroHasta = '';

  modalDetalleAbierto = signal(false);
  ordenSeleccionada = signal<OrdenServicioResponse | null>(null);

  modalAnularAbierto = signal(false);
  ordenParaAnular = signal<OrdenServicioResponse | null>(null);
  motivoAnulacion = '';
  anulando = signal(false);
  errorAnulacion = signal<string | null>(null);

  mensajeAlerta = signal<string | null>(null);
  esError = signal(false);

  ngOnInit(): void {
    this.consultar();
  }

  consultar(): void {
    this.ordenService.buscar(this.filtroPlaca, this.filtroEstado, this.filtroDesde, this.filtroHasta).subscribe({
      next: (data) => this.ordenes.set(data),
      error: (err) => this.mostrarMensaje(err.error?.mensaje || 'Error al consultar órdenes', true)
    });
  }

  limpiarFiltros(): void {
    this.filtroPlaca = '';
    this.filtroEstado = 'TODOS';
    this.filtroDesde = '';
    this.filtroHasta = '';
    this.consultar();
  }

  verDetalle(orden: OrdenServicioResponse): void {
    this.ordenSeleccionada.set(orden);
    this.modalDetalleAbierto.set(true);
  }

  cerrarModalDetalle(): void {
    this.modalDetalleAbierto.set(false);
    this.ordenSeleccionada.set(null);
  }

  abrirModalAnular(orden: OrdenServicioResponse): void {
    this.ordenParaAnular.set(orden);
    this.motivoAnulacion = '';
    this.errorAnulacion.set(null);
    this.modalAnularAbierto.set(true);
  }

  cerrarModalAnular(): void {
    this.modalAnularAbierto.set(false);
    this.ordenParaAnular.set(null);
  }

  confirmarAnulacion(): void {
    const orden = this.ordenParaAnular();
    if (!orden) return;

    this.anulando.set(true);
    this.errorAnulacion.set(null);

    this.ordenService.anular(orden.id, { motivo: this.motivoAnulacion.trim() }).subscribe({
      next: (actualizada) => {
        this.anulando.set(false);
        this.cerrarModalAnular();
        this.mostrarMensaje(`Orden ${actualizada.numero} anulada exitosamente`, false);
        this.consultar();
      },
      error: (err) => {
        this.anulando.set(false);
        this.errorAnulacion.set(err.error?.mensaje || 'No se pudo anular la orden de servicio');
      }
    });
  }

  private mostrarMensaje(msg: string, esErr: boolean): void {
    this.mensajeAlerta.set(msg);
    this.esError.set(esErr);
    setTimeout(() => this.mensajeAlerta.set(null), 5000);
  }
}
