import { Component } from '@angular/core';

@Component({
  selector: 'sf-site-shell',
  standalone: true,
  template: `
    <div class="feature-shell">
      <h2>Sites</h2>
      <p>Gestion des sites et applications.</p>
    </div>
  `,
  styles: [`.feature-shell { padding: 8px 0; } h2 { margin-bottom: 8px; }`],
})
export class SiteShellComponent {}