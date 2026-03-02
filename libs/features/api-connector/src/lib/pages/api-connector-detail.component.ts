import { Component, inject, input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  SfPageHeaderComponent,
  SfStatusBadgeComponent,
} from '@site-factory/shared-ui';
import { ApiConnectorStore } from '@site-factory/domain-api-connector';

@Component({
  selector: 'sf-api-connector-detail',
  standalone: true,
  imports: [RouterLink, SfPageHeaderComponent, SfStatusBadgeComponent],
  template: `
    <sf-page-header
      [title]="store.selectedConnector()?.name ?? 'Chargement...'"
      [breadcrumbs]="[
        { label: 'Connecteurs API', route: '/api-connectors' },
        { label: store.selectedConnector()?.name ?? '...' }
      ]"
    >
      <a actions routerLink="/api-connectors" class="btn btn-secondary">← Retour</a>
    </sf-page-header>

    @if (store.selectedConnector(); as api) {
      <div class="detail-card">
        <div class="detail-row">
          <span class="detail-label">Version</span>
          <span>{{ api.version }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Context Path</span>
          <span>{{ api.contextPath }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Disponibilité</span>
          <sf-status-badge
            [status]="api.isAvailable ? 'enabled' : 'disabled'"
            [label]="api.isAvailable ? 'Disponible' : 'Indisponible'"
          />
        </div>
        <div class="detail-row">
          <span class="detail-label">Description</span>
          <span>{{ api.description ?? '—' }}</span>
        </div>
      </div>
    }
  `,
  styles: [`
    .detail-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; }
    .detail-row { display: flex; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { width: 160px; font-weight: 600; color: #475569; }
  `],
})
export class ApiConnectorDetailComponent implements OnInit {
  readonly id = input.required<string>();
  readonly store = inject(ApiConnectorStore);

  ngOnInit(): void {
    this.store.loadOne(this.id());
  }
}