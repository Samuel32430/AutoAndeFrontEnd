import { Directive, Input, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Directive({
  selector: '[appSiPermiso]',
  standalone: true
})
export class SiPermisoDirective {
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private authService = inject(AuthService);

  private permisoRequerido: string = '';
  private tieneVista = false;

  @Input()
  set appSiPermiso(permiso: string) {
    this.permisoRequerido = permiso;
    this.actualizarVista();
  }

  constructor() {
    effect(() => {
      // Reacciona a cambios en permisos del usuario
      this.authService.permisos();
      this.actualizarVista();
    });
  }

  private actualizarVista(): void {
    const tieneAcceso = this.authService.tienePermiso(this.permisoRequerido);

    if (tieneAcceso && !this.tieneVista) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.tieneVista = true;
    } else if (!tieneAcceso && this.tieneVista) {
      this.viewContainer.clear();
      this.tieneVista = false;
    }
  }
}
