import { Component } from '@angular/core';

@Component({
  selector: 'sf-iam-shell',
  standalone: true,
  template: `
    <div class="feature-shell">
      <h2>Utilisateurs & Permissions</h2>
      <p>Gestion des utilisateurs, rôles et audit.</p>
    </div>
  `,
  styles: [`.feature-shell { padding: 8px 0; } h2 { margin-bottom: 8px; }`],
})
export class IamShellComponent {}