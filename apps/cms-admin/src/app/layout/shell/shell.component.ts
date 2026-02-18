import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'sf-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="shell">
      <sf-sidebar />
      <div class="shell__content">
        <sf-header />
        <main class="shell__main">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .shell {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    .shell__content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .shell__main {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      background-color: #f5f7fa;
    }
  `],
})
export class ShellComponent {}