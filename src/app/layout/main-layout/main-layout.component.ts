import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent],
  template: `
    <div class="layout-container">
      <app-header></app-header>
      <div class="layout-body">
        <app-sidebar></app-sidebar>
        <main class="layout-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .layout-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .layout-body {
      display: flex;
      flex: 1;
    }
    .layout-content {
      flex: 1;
      padding: 2rem;
      background-color: var(--bg-main);
      overflow-y: auto;
    }
    @media (max-width: 768px) {
      .layout-body {
        flex-direction: column;
      }
    }
  `]
})
export class MainLayoutComponent {}
