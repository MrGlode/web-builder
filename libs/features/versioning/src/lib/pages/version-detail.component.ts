import { Component, inject, input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  SfPageHeaderComponent,
  SfStatusBadgeComponent,
  SfDataTableComponent,
  SfCellDirective,
  type TableColumn,
} from '@site-factory/shared-ui';
import { VersioningStore } from '@site-factory/domain-versioning';

@Component({
  selector: 'sf-version-detail',
  standalone: true,
  imports: [
    RouterLink,
    SfPageHeaderComponent,
    SfStatusBadgeComponent,
    SfDataTableComponent,
    SfCellDirective,
  ],
  template: `
    <sf-page-header
      [title]="'Version #' + (store.selectedVersion()?.versionNumber ?? '...')"
      [breadcrumbs]="[
        { label: 'Versioning', route: '/versioning' },
        { label: 'Détail' }
      ]"
    >
      <a actions routerLink="/versioning" class="btn btn-secondary">← Retour</a>
    </sf-page-header>

    @if (store.selectedVersion(); as version) {
      <div class="detail-card">
        <div class="detail-row">
          <span class="detail-label">Type d'entité</span>
          <span>{{ version.entityType }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">ID Entité</span>
          <span>{{ version.entityId }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Statut</span>
          <sf-status-badge [status]="version.status" />
        </div>
        <div class="detail-row">
          <span class="detail-label">Résumé</span>
          <span>{{ version.changeSummary ?? '—' }}</span>
        </div>
      </div>

      <h2 class="section-title">Transitions</h2>
      <sf-data-table
        [columns]="transitionColumns"
        [data]="store.transitions()"
        [totalItems]="store.transitions().length"
        emptyMessage="Aucune transition"
      >
        <ng-template sfCell="fromStatus" let-value>
          <sf-status-badge [status]="value" size="sm" />
        </ng-template>
        <ng-template sfCell="toStatus" let-value>
          <sf-status-badge [status]="value" size="sm" />
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
export class VersionDetailComponent implements OnInit {
  readonly id = input.required<string>();
  readonly store = inject(VersioningStore);

  readonly transitionColumns: TableColumn[] = [
    { key: 'fromStatus', label: 'De', width: '140px' },
    { key: 'toStatus', label: 'Vers', width: '140px' },
    { key: 'transitionedBy', label: 'Par' },
    { key: 'comment', label: 'Commentaire' },
  ];

  ngOnInit(): void {
    this.store.loadOne(this.id());
    this.store.loadTransitions(this.id());
  }
}