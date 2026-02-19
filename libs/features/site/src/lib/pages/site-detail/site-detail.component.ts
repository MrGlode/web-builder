import { Component, inject, OnInit, input } from '@angular/core';
import { Router } from '@angular/router';
import { SiteStore } from '@site-factory/domain-site';

@Component({
  selector: 'sf-site-detail',
  standalone: true,
  template: `
    <div class="site-detail">
      <!-- Loading -->
      @if (store.isLoading()) {
        <p>Chargement...</p>
      }

      <!-- Contenu -->
      @if (store.selectedSite(); as site) {
        <div class="site-detail__header">
          <button class="btn btn--secondary" (click)="goBack()">← Retour</button>
          <h2>{{ site.name }}</h2>
          <span
            class="status-badge"
            [class.status-badge--active]="site.status === 'active'"
            [class.status-badge--draft]="site.status === 'draft'"
            [class.status-badge--archived]="site.status === 'archived'"
          >
            {{ site.status }}
          </span>
        </div>

        <div class="site-detail__content">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-item__label">Slug</span>
              <span class="info-item__value mono">/{{ site.slug }}</span>
            </div>
            <div class="info-item">
              <span class="info-item__label">Domaine</span>
              <span class="info-item__value mono">{{ site.domain ?? 'Non défini' }}</span>
            </div>
            <div class="info-item">
              <span class="info-item__label">Tenant</span>
              <span class="info-item__value">{{ site.tenantId }}</span>
            </div>
            <div class="info-item">
              <span class="info-item__label">Thème</span>
              <span class="info-item__value">{{ site.themeId }}</span>
            </div>
            <div class="info-item">
              <span class="info-item__label">Locale</span>
              <span class="info-item__value">{{ site.defaultLocale }}</span>
            </div>
            <div class="info-item">
              <span class="info-item__label">Créé le</span>
              <span class="info-item__value">{{ site.createdAt }}</span>
            </div>
          </div>

          @if (site.description) {
            <div class="info-block">
              <span class="info-item__label">Description</span>
              <p>{{ site.description }}</p>
            </div>
          }
        </div>
      }

      <!-- Erreur -->
      @if (store.hasError()) {
        <div class="error-box">
          <p>{{ store.error() }}</p>
          <button class="btn btn--secondary" (click)="goBack()">Retour</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .site-detail__header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;

      h2 { margin: 0; font-size: 24px; }
    }

    .status-badge {
      font-size: 12px;
      padding: 2px 10px;
      border-radius: 12px;
      font-weight: 500;

      &--active { background: #dcfce7; color: #16a34a; }
      &--draft { background: #fef9c3; color: #ca8a04; }
      &--archived { background: #f1f5f9; color: #64748b; }
    }

    .site-detail__content {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-item__label {
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .info-item__value {
      font-size: 14px;
      color: #1e293b;
    }

    .mono { font-family: monospace; }

    .info-block {
      padding-top: 16px;
      border-top: 1px solid #f1f5f9;

      p { margin: 4px 0 0; font-size: 14px; color: #475569; }
    }

    .error-box {
      padding: 24px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 12px;
      text-align: center;
      color: #dc2626;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;

      &--secondary {
        background: #f1f5f9;
        color: #475569;
        &:hover { background: #e2e8f0; }
      }
    }
  `],
})
export class SiteDetailComponent implements OnInit {
  readonly store = inject(SiteStore);
  private readonly router = inject(Router);

  /** ID injecté depuis la route via withComponentInputBinding() */
  readonly id = input.required<string>();

  ngOnInit(): void {
    this.store.loadSiteById(this.id());
  }

  goBack(): void {
    this.router.navigate(['/sites']);
  }
}