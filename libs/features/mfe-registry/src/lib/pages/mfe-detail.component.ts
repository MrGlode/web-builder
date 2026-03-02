import { Component, inject, input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  SfPageHeaderComponent,
  SfDataTableComponent,
  SfCellDirective,
  SfStatusBadgeComponent,
  type TableColumn,
} from '@site-factory/shared-ui';
import { MfeRegistryStore } from '@site-factory/domain-mfe-registry';

@Component({
  selector: 'sf-mfe-detail',
  standalone: true,
  imports: [
    RouterLink,
    SfPageHeaderComponent,
    SfDataTableComponent,
    SfCellDirective,
    SfStatusBadgeComponent,
  ],
  template: `
    <sf-page-header
      [title]="store.selectedMfe()?.name ?? 'Chargement...'"
      [breadcrumbs]="[
        { label: 'Micro-Frontends', route: '/mfe-registry' },
        { label: store.selectedMfe()?.name ?? '...' }
      ]"
    >
      <a actions routerLink="/mfe-registry" class="btn btn-secondary">← Retour</a>
    </sf-page-header>

    @if (store.selectedMfe(); as mfe) {
      <div class="detail-card">
        <div class="detail-row">
          <span class="detail-label">Code</span>
          <span>{{ mfe.code }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Remote</span>
          <span>{{ mfe.remoteName }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Module exposé</span>
          <span>{{ mfe.exposedModule }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Version</span>
          <span>{{ mfe.currentVersion }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Statut</span>
          <sf-status-badge
            [status]="mfe.isActive ? 'enabled' : 'disabled'"
            [label]="mfe.isActive ? 'Actif' : 'Inactif'"
          />
        </div>
      </div>

      <h2 class="section-title">Déploiements</h2>
      <sf-data-table
        [columns]="deploymentColumns"
        [data]="store.deployments()"
        [loading]="store.deploymentsLoading()"
        [totalItems]="store.deployments().length"
        emptyMessage="Aucun déploiement"
      >
        <ng-template sfCell="isActive" let-value>
          <sf-status-badge
            [status]="value ? 'enabled' : 'disabled'"
            [label]="value ? 'Actif' : 'Inactif'"
            size="sm"
          />
        </ng-template>
      </sf-data-table>
    }
  `,
  styles: [`
    .detail-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 32px; }
    .detail-row { display: flex; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { width: 160px; font-weight: 600; color: #475569; }
    .section-title { font-size: 18px; font-weight: 600; color: #1e293b; margin: 0 0 16px; }
  `],
})
export class MfeDetailComponent implements OnInit {
  readonly id = input.required<string>();
  readonly store = inject(MfeRegistryStore);

  readonly deploymentColumns: TableColumn[] = [
    { key: 'version', label: 'Version', sortable: true },
    { key: 'environment', label: 'Environnement', width: '140px' },
    { key: 'remoteUrl', label: 'URL Remote' },
    { key: 'isActive', label: 'Actif', width: '100px' },
  ];

  ngOnInit(): void {
    this.store.loadOne(this.id());
    this.store.loadDeployments(this.id());
  }
}