import { Component } from '@angular/core';

@Component({
  selector: 'sf-page-builder-shell',
  standalone: true,
  template: `
    <div class="feature-shell">
      <h2>Page Builder</h2>
      <p>Assemblage de pages à partir de blocs et composants.</p>
    </div>
  `,
  styles: [`.feature-shell { padding: 8px 0; } h2 { margin-bottom: 8px; }`],
})
export class PageBuilderShellComponent {}