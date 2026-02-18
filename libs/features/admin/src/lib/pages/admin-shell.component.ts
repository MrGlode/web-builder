import { Component } from '@angular/core';

@Component({
  selector: 'sf-admin-shell',
  standalone: true,
  template: `
    <div class="feature-shell">
      <h2>Dashboard</h2>
      <p>Administration et vue d'ensemble de la plateforme.</p>
    </div>
  `,
  styles: [`.feature-shell { padding: 8px 0; } h2 { margin-bottom: 8px; }`],
})
export class AdminShellComponent {}