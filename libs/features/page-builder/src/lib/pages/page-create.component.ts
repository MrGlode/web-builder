import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SfPageHeaderComponent } from '@site-factory/shared-ui';

@Component({
  selector: 'sf-page-create',
  standalone: true,
  imports: [RouterLink, SfPageHeaderComponent],
  template: `
    <sf-page-header
      title="Nouvelle page"
      [breadcrumbs]="[
        { label: 'Pages', route: '/pages' },
        { label: 'Nouvelle page' }
      ]"
    >
      <a actions routerLink="/pages" class="btn btn-secondary">← Annuler</a>
    </sf-page-header>

    <div class="form-placeholder">
      <p>Formulaire de création de page — à implémenter Phase 2</p>
    </div>
  `,
  styles: [`
    .form-placeholder {
      background: #fff; border: 1px solid #e2e8f0; border-radius: 8px;
      padding: 48px; text-align: center; color: #94a3b8;
    }
  `],
})
export class PageCreateComponent {}