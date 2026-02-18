import { Component } from '@angular/core';

@Component({
  selector: 'sf-api-connector-shell',
  standalone: true,
  template: `
    <div class="feature-shell">
      <h2>API Connector</h2>
      <p>Catalogue des API WSO2 APIM et configuration des bindings.</p>
    </div>
  `,
  styles: [`.feature-shell { padding: 8px 0; } h2 { margin-bottom: 8px; }`],
})
export class ApiConnectorShellComponent {}