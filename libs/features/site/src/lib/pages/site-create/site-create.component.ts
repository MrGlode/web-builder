import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SiteStore } from '@site-factory/domain-site';
import type { CreateSitePayload } from '@site-factory/shared-models';

@Component({
  selector: 'sf-site-create',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="site-create">
      <div class="site-create__header">
        <button class="btn btn--secondary" (click)="goBack()">← Retour</button>
        <h2>Nouveau site</h2>
      </div>

      <form class="site-form" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label class="form-label" for="name">Nom du site *</label>
          <input
            id="name"
            class="form-input"
            type="text"
            [(ngModel)]="form.name"
            name="name"
            placeholder="Ex: Déclaration Sinistres Auto"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="slug">Slug *</label>
          <input
            id="slug"
            class="form-input mono"
            type="text"
            [(ngModel)]="form.slug"
            name="slug"
            placeholder="Ex: declaration-sinistres-auto"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="tenantId">Tenant ID *</label>
          <input
            id="tenantId"
            class="form-input"
            type="text"
            [(ngModel)]="form.tenantId"
            name="tenantId"
            placeholder="Ex: tenant-axa-fr"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="themeId">Thème *</label>
          <input
            id="themeId"
            class="form-input"
            type="text"
            [(ngModel)]="form.themeId"
            name="themeId"
            placeholder="Ex: theme-axa"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="domain">Domaine</label>
          <input
            id="domain"
            class="form-input mono"
            type="text"
            [(ngModel)]="form.domain"
            name="domain"
            placeholder="Ex: sinistres.axa.fr"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="description">Description</label>
          <textarea
            id="description"
            class="form-input form-textarea"
            [(ngModel)]="form.description"
            name="description"
            placeholder="Description du site..."
            rows="3"
          ></textarea>
        </div>

        @if (store.hasError()) {
          <div class="form-error">
            {{ store.error() }}
          </div>
        }

        <div class="form-actions">
          <button class="btn btn--secondary" type="button" (click)="goBack()">
            Annuler
          </button>
          <button
            class="btn btn--primary"
            type="submit"
            [disabled]="store.isLoading() || !isValid()"
          >
            @if (store.isLoading()) {
              Création...
            } @else {
              Créer le site
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .site-create__header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;

      h2 { margin: 0; font-size: 24px; }
    }

    .site-form {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
      max-width: 600px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-label {
      display: block;
      margin-bottom: 6px;
      font-size: 13px;
      font-weight: 600;
      color: #374151;
    }

    .form-input {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.15s;

      &:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
    }

    .form-textarea { resize: vertical; }

    .mono { font-family: monospace; }

    .form-error {
      padding: 12px;
      margin-bottom: 16px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      color: #dc2626;
      font-size: 13px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 16px;
      border-top: 1px solid #f1f5f9;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;

      &--primary {
        background: #3b82f6;
        color: white;
        &:hover { background: #2563eb; }
        &:disabled { opacity: 0.5; cursor: not-allowed; }
      }

      &--secondary {
        background: #f1f5f9;
        color: #475569;
        &:hover { background: #e2e8f0; }
      }
    }
  `],
})
export class SiteCreateComponent {
  readonly store = inject(SiteStore);
  private readonly router = inject(Router);

  form: CreateSitePayload = {
    tenantId: '',
    name: '',
    slug: '',
    themeId: '',
    domain: '',
    description: '',
  };

  isValid(): boolean {
    return !!(this.form.name && this.form.slug && this.form.tenantId && this.form.themeId);
  }

  onSubmit(): void {
    if (!this.isValid()) return;

    this.store.createSite({
      payload: this.form,
      onSuccess: () => this.router.navigate(['/sites']),
    });
  }

  goBack(): void {
    this.router.navigate(['/sites']);
  }
}