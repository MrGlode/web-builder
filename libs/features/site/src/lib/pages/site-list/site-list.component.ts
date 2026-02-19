import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SiteStore } from '@site-factory/domain-site';

@Component({
  selector: 'sf-site-list',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="site-list">
      <div class="site-list__header">
        <h2>Sites</h2>
        <button class="btn btn--primary" (click)="goToCreate()">
          + Nouveau site
        </button>
      </div>

      <!-- Barre de recherche -->
      <div class="site-list__filters">
        <input
          type="text"
          class="input"
          placeholder="Rechercher un site..."
          [ngModel]="searchTerm"
          (ngModelChange)="onSearch($event)"
        />
      </div>

      <!-- Loading -->
      @if (store.isLoading()) {
        <div class="site-list__loading">
          <p>Chargement des sites...</p>
        </div>
      }

      <!-- Erreur -->
      @if (store.hasError()) {
        <div class="site-list__error">
          <p>{{ store.error() }}</p>
          <button class="btn btn--secondary" (click)="store.clearError()">
            Fermer
          </button>
        </div>
      }

      <!-- Liste -->
      @if (!store.isLoading() && store.hasSites()) {
        <div class="site-list__grid">
          @for (site of store.sites(); track site.id) {
            <div class="site-card" (click)="goToDetail(site.id)">
              <div class="site-card__header">
                <h3 class="site-card__name">{{ site.name }}</h3>
                <span
                  class="site-card__status"
                  [class.site-card__status--active]="site.status === 'active'"
                  [class.site-card__status--draft]="site.status === 'draft'"
                  [class.site-card__status--archived]="site.status === 'archived'"
                >
                  {{ site.status }}
                </span>
              </div>
              <p class="site-card__description">{{ site.description }}</p>
              <div class="site-card__meta">
                <span class="site-card__slug">/{{ site.slug }}</span>
                @if (site.domain) {
                  <span class="site-card__domain">{{ site.domain }}</span>
                }
              </div>
              <div class="site-card__footer">
                <span class="site-card__tenant">{{ site.tenantId }}</span>
                <button
                  class="btn btn--danger btn--small"
                  (click)="onDelete($event, site.id)"
                >
                  Supprimer
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- Vide -->
      @if (!store.isLoading() && !store.hasSites() && !store.hasError()) {
        <div class="site-list__empty">
          <p>Aucun site trouvé.</p>
          <button class="btn btn--primary" (click)="goToCreate()">
            Créer votre premier site
          </button>
        </div>
      }

      <!-- Footer -->
      @if (store.hasSites()) {
        <div class="site-list__footer">
          <span>{{ store.siteCount() }} site(s) sur {{ store.total() }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .site-list__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      h2 { margin: 0; font-size: 24px; color: #1e293b; }
    }

    .site-list__filters {
      margin-bottom: 20px;
    }

    .input {
      width: 100%;
      max-width: 400px;
      padding: 10px 16px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.15s;

      &:focus { border-color: #3b82f6; }
    }

    .site-list__loading,
    .site-list__empty {
      text-align: center;
      padding: 48px 0;
      color: #64748b;
    }

    .site-list__error {
      padding: 16px;
      margin-bottom: 20px;
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      color: #dc2626;
      display: flex;
      justify-content: space-between;
      align-items: center;

      p { margin: 0; }
    }

    .site-list__grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 16px;
    }

    .site-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.15s;

      &:hover {
        border-color: #3b82f6;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
      }
    }

    .site-card__header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .site-card__name {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }

    .site-card__status {
      font-size: 12px;
      padding: 2px 10px;
      border-radius: 12px;
      font-weight: 500;

      &--active { background: #dcfce7; color: #16a34a; }
      &--draft { background: #fef9c3; color: #ca8a04; }
      &--archived { background: #f1f5f9; color: #64748b; }
    }

    .site-card__description {
      font-size: 13px;
      color: #64748b;
      margin: 0 0 12px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .site-card__meta {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
      font-size: 12px;
      color: #94a3b8;
    }

    .site-card__slug {
      font-family: monospace;
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .site-card__domain {
      font-family: monospace;
      background: #eff6ff;
      padding: 2px 6px;
      border-radius: 4px;
      color: #3b82f6;
    }

    .site-card__footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid #f1f5f9;
    }

    .site-card__tenant {
      font-size: 12px;
      color: #94a3b8;
    }

    .site-list__footer {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      font-size: 13px;
      color: #64748b;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;

      &--primary {
        background: #3b82f6;
        color: white;
        &:hover { background: #2563eb; }
      }

      &--secondary {
        background: #f1f5f9;
        color: #475569;
        &:hover { background: #e2e8f0; }
      }

      &--danger {
        background: #fef2f2;
        color: #dc2626;
        &:hover { background: #fecaca; }
      }

      &--small {
        padding: 4px 12px;
        font-size: 12px;
      }
    }
  `],
})
export class SiteListComponent implements OnInit {
  readonly store = inject(SiteStore);
  private readonly router = inject(Router);

  searchTerm = '';

  ngOnInit(): void {
    this.store.loadSites();
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.store.loadSites(term ? { search: term } : undefined);
  }

  goToCreate(): void {
    this.router.navigate(['/sites', 'new']);
  }

  goToDetail(id: string): void {
    this.router.navigate(['/sites', id]);
  }

  onDelete(event: Event, id: string): void {
    event.stopPropagation();
    if (confirm('Supprimer ce site ?')) {
      this.store.deleteSite({ id });
    }
  }
}