import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SfPageHeaderComponent } from '@site-factory/shared-ui';

@Component({
  selector: 'sf-admin-dashboard',
  standalone: true,
  imports: [RouterLink, SfPageHeaderComponent],
  template: `
    <sf-page-header
      title="Administration"
      subtitle="Configuration de la plateforme"
      [breadcrumbs]="[{ label: 'Accueil', route: '/' }]"
    />

    <div class="admin-grid">
      <a routerLink="themes" class="admin-card">
        <span class="admin-card__icon">🎨</span>
        <span class="admin-card__title">Thèmes</span>
        <span class="admin-card__desc">Design tokens et personnalisation visuelle</span>
      </a>
      <a routerLink="translations" class="admin-card">
        <span class="admin-card__icon">🌍</span>
        <span class="admin-card__title">Traductions</span>
        <span class="admin-card__desc">Labels et messages de l'interface</span>
      </a>
      <a routerLink="config" class="admin-card">
        <span class="admin-card__icon">⚙️</span>
        <span class="admin-card__title">Configuration</span>
        <span class="admin-card__desc">Paramètres globaux de la plateforme</span>
      </a>
    </div>
  `,
  styles: [`
    .admin-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }
    .admin-card {
      display: flex; flex-direction: column; gap: 8px;
      padding: 24px; background: #fff; border: 1px solid #e2e8f0;
      border-radius: 8px; text-decoration: none; color: inherit;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .admin-card:hover { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08); }
    .admin-card__icon { font-size: 28px; }
    .admin-card__title { font-size: 16px; font-weight: 600; color: #1e293b; }
    .admin-card__desc { font-size: 13px; color: #64748b; }
  `],
})
export class AdminDashboardComponent {}