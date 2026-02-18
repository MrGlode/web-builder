import { Component } from '@angular/core';

@Component({
  selector: 'sf-versioning-shell',
  standalone: true,
  template: `
    <div class="feature-shell">
      <h2>Versioning & Workflow</h2>
      <p>Historique des versions et workflows de validation.</p>
    </div>
  `,
  styles: [`.feature-shell { padding: 8px 0; } h2 { margin-bottom: 8px; }`],
})
export class VersioningShellComponent {}