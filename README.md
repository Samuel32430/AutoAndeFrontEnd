# AutoAndes Web — SPA Angular

Frontend Single Page Application (SPA) seguro desarrollado en Angular con componentes Standalone y Signals para el Examen Parcial II de Lenguaje de Programación II (Ciclo IV, Semestre 2026-2) en la Universidad Peruana Unión (UPeU).

---

## 🚀 Tecnologías
- **Angular 22** (Componentes Standalone, Signals y Directivas Estructurales)
- **TypeScript 5.x / 6.x**
- **Reactive Forms** (`FormGroup`, `FormArray`, `Validators`)
- **RxJS**
- **CSS3 Moderno** (Diseño responsivo, temas automotrices e impresión)

---

## 🛠️ Instrucciones de Ejecución

### 1. Requisitos Previos
- Node.js (v20 o superior recomendado).
- Angular CLI instalado globalmente o mediante `npm run ng`.
- AutoAndes Backend corriendo en `http://localhost:8080`.

### 2. Levantar la Aplicación
Desde la raíz del proyecto `AutoAndeFrontEnd`:
```bash
npm start
# O alternativamente:
# npx ng serve
```
La aplicación estará disponible inmediatamente en:
👉 [http://localhost:4200](http://localhost:4200)

---

## 👥 Usuarios de Prueba (Anexo 10)

| Usuario | Contraseña | Rol | Accesos en la SPA |
| :--- | :--- | :--- | :--- |
| **admin** | `Auto2026*` | `ADMIN` | Acceso completo a todos los módulos |
| **asesor** | `Auto2026*` | `ASESOR` | Consulta de órdenes, emisión de nueva orden y gestión de vehículos |
| **jefe** | `Auto2026*` | `JEFE_TALLER` | Catálogo de servicios, anulación de órdenes y reporte de ingresos |
| **inactivo** | `Auto2026*` | `ASESOR` | Cuenta suspendida (muestra alerta de credenciales inválidas) |

*Nota: La pantalla de Login incluye botones de acceso rápido para pruebas inmediatas.*

---

## 🏛️ Arquitectura Modular (Angular Standalone)
```
src/app/
├── core/
│   ├── auth/         # Modelos de autenticación
│   ├── guards/       # authGuard, invitadoGuard, permisoGuard
│   ├── interceptors/ # authInterceptor (Bearer), errorInterceptor (401/403)
│   ├── models/       # Interfaces DTO (Cliente, Servicio, Vehículo, Orden, Reporte)
│   └── services/     # Servicios HTTP reactivos con Signals
├── shared/
│   └── directives/   # *appSiPermiso (renderizado condicional por rol/permiso)
├── layout/
│   ├── header/       # Perfil del usuario autenticado y botón de cierre de sesión
│   ├── sidebar/      # Navegación reactiva según permisos RBAC
│   └── main-layout/  # Contenedor principal con router-outlet
├── features/
│   ├── auth/login/   # Login independiente fuera del layout
│   ├── servicios/    # Catálogo, cambio de estado (soft-delete) y modal reactivo
│   ├── vehiculos/    # Listado, dropdown de clientes y validaciones (ABC-123)
│   ├── ordenes/      # Formulario reactivo FormArray cabecera-detalle y consulta
│   └── reportes/     # Reporte analítico de ingresos (JPQL) y vista de impresión
└── shared-pages/
    ├── acceso-denegado/ # Página 403 (preserva la sesión activa)
    └── no-encontrado/   # Página 404
```
