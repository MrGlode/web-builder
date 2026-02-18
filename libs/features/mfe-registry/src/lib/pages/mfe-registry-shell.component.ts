import { Component } from '@angular/core';

@Component({
  selector: 'sf-mfe-registry-shell',
  standalone: true,
  template: `
    <div class="feature-shell">
      <h2>MFE Registry</h2>
      <p>Registre des micro-frontends et déploiements.</p>
    </div>
  `,
  styles: [`.feature-shell { padding: 8px 0; } h2 { margin-bottom: 8px; }`],
})
export class MfeRegistryShellComponent {}