import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReporteService } from '../../../core/services/reporte.service';
import { IngresoPorServicio } from '../../../core/models/reporte.model';

@Component({
  selector: 'app-reporte-ingresos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reporte-page">
      <div class="card">
        <div class="card-header">
          <div>
            <h2>Reporte de Ingresos por Servicio</h2>
            <p class="subtitle">Consulta analítica agregada (excluye órdenes anuladas)</p>
          </div>
          <button (click)="imprimir()" class="btn btn-secondary no-imprimir">
            <span>🖨️</span>
            <span>Imprimir Reporte</span>
          </button>
        </div>

        <!-- Filtros de Fecha -->
        <div class="filtros-bar no-imprimir">
          <div class="filtros-grid">
            <div class="form-group mb-0">
              <label class="form-label">Fecha Desde</label>
              <input type="datetime-local" [(ngModel)]="filtroDesde" (change)="cargarReporte()" class="form-control" />
            </div>
            <div class="form-group mb-0">
              <label class="form-label">Fecha Hasta</label>
              <input type="datetime-local" [(ngModel)]="filtroHasta" (change)="cargarReporte()" class="form-control" />
            </div>
            <div class="filtro-btn">
              <button (click)="cargarReporte()" class="btn btn-primary">📊 Actualizar</button>
              <button (click)="limpiarFiltros()" class="btn btn-secondary">Limpiar</button>
            </div>
          </div>
        </div>

        @if (errorMensaje()) {
          <div class="alerta alerta-peligro">
            <span>⚠️</span>
            <span>{{ errorMensaje() }}</span>
          </div>
        }

        <!-- Cards de Resumen -->
        <div class="kpi-grid">
          <div class="kpi-card">
            <span class="kpi-label">INGRESOS TOTALES</span>
            <span class="kpi-valor text-primary">S/ {{ granTotal() | number:'1.2-2' }}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">TOTAL SERVICIOS BRINDADOS</span>
            <span class="kpi-valor text-success">{{ cantidadTotal() }} atenciones</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">SERVICIOS RENTABILIZADOS</span>
            <span class="kpi-valor">{{ datos().length }} líneas</span>
          </div>
        </div>

        <!-- Tabla de Datos -->
        <div class="tabla-contenedor">
          <table class="tabla">
            <thead>
              <tr>
                <th>Código</th>
                <th>Servicio</th>
                <th class="text-center">Atenciones Totales</th>
                <th class="text-right">Total Ingresos Generados (S/)</th>
              </tr>
            </thead>
            <tbody>
              @for (item of datos(); track item.servicioCodigo) {
                <tr>
                  <td><strong>{{ item.servicioCodigo }}</strong></td>
                  <td>{{ item.servicioNombre }}</td>
                  <td class="text-center">{{ item.cantidadTotal }}</td>
                  <td class="text-right font-weight-bold">
                    S/ {{ item.totalIngresos | number:'1.2-2' }}
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="4" class="text-center py-4">No se registran ingresos en el rango seleccionado.</td>
                </tr>
              }
            </tbody>
            <tfoot>
              <tr>
                <th colspan="2" class="text-right">TOTAL GENERAL:</th>
                <th class="text-center">{{ cantidadTotal() }}</th>
                <th class="text-right">S/ {{ granTotal() | number:'1.2-2' }}</th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .subtitle {
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .filtros-bar {
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: #f8fafc;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
    }
    .filtros-grid {
      display: flex;
      gap: 1rem;
      align-items: flex-end;
    }
    .filtro-btn {
      display: flex;
      gap: 0.5rem;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .kpi-card {
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 1.25rem;
      box-shadow: var(--shadow-sm);
    }
    .kpi-label {
      display: block;
      font-size: 0.725rem;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 0.05em;
      margin-bottom: 0.25rem;
    }
    .kpi-valor {
      font-size: 1.5rem;
      font-weight: 800;
    }
    .text-primary { color: var(--primary); }
    .text-success { color: var(--success); }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-weight-bold { font-weight: 700; }
    .mb-0 { margin-bottom: 0 !important; }
    @media (max-width: 768px) {
      .kpi-grid {
        grid-template-columns: 1fr;
      }
      .filtros-grid {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `]
})
export class ReporteIngresosComponent implements OnInit {
  private reporteService = inject(ReporteService);

  datos = signal<IngresoPorServicio[]>([]);
  filtroDesde = '';
  filtroHasta = '';
  errorMensaje = signal<string | null>(null);

  granTotal = computed(() => {
    return this.datos().reduce((acc, curr) => acc + (Number(curr.totalIngresos) || 0), 0);
  });

  cantidadTotal = computed(() => {
    return this.datos().reduce((acc, curr) => acc + (Number(curr.cantidadTotal) || 0), 0);
  });

  ngOnInit(): void {
    this.cargarReporte();
  }

  cargarReporte(): void {
    this.reporteService.obtenerIngresosPorServicio(this.filtroDesde, this.filtroHasta).subscribe({
      next: (data) => this.datos.set(data),
      error: (err) => this.errorMensaje.set(err.error?.mensaje || 'Error al cargar el reporte de ingresos')
    });
  }

  limpiarFiltros(): void {
    this.filtroDesde = '';
    this.filtroHasta = '';
    this.cargarReporte();
  }

  imprimir(): void {
    window.print();
  }
}
