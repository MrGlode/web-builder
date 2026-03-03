import { Component, inject, signal } from '@angular/core';
import {
  SfPageHeaderComponent,
  SfDataTableComponent,
  SfCellDirective,
  SfStatusBadgeComponent,
  SfSearchBarComponent,
  type TableColumn,
} from '@site-factory/shared-ui';
import { VersioningStore } from '@site-factory/domain-versioning';

@Component({
  selector: 'sf-version-list',
  standalone: true,
  imports: [
    SfPageHeaderComponent,
    SfDataTableComponent,
    SfCellDirective,
    SfStatusBadgeComponent,
    SfSearchBarComponent,
  ],
  template: `
    <sf-page-header
      title="Versioning"
      subtitle="Historique des versions et workflow"
      [breadcrumbs]="[{ label: 'Accueil', route: '/' }]"
    />

    <sf-search-bar placeholder="Filtrer par type d'entité..." (searchChange)="onSearch($event)" />

    <sf-data-table
      [columns]="columns"
      [data]="store.versions()"
      [loading]="store.isLoading()"
      [totalItems]="store.versionCount()"
      [page]="currentPage()"
      (pageChange)="currentPage.set($event)"
      (rowClick)="onRowClick($event)"
    >
      <ng-template sfCell="status" let-value>
        <sf-status-badge [status]="value" />
      </ng-template>
    </sf-data-table>
  `,
})
export class VersionListComponent {
  readonly store = inject(VersioningStore);
  readonly currentPage = signal(1);

  readonly columns: TableColumn[] = [
    { key: 'entityType', label: 'Type', sortable: true, width: '140px' },
    { key: 'entityId', label: 'Entité' },
    { key: 'versionNumber', label: 'N°', width: '80px', align: 'center' },
    { key: 'status', label: 'Statut', sortable: true, width: '140px' },
    { key: 'createdBy', label: 'Auteur' },
  ];

  constructor() {
    // TODO: récupérer entityType/entityId depuis la route ou un contexte de sélection
    this.store.loadVersions({ entityType: '', entityId: '' });
  }

  onSearch(search: string): void {
    // TODO: filtrer par entityType via un sélecteur dédié
  }

  onRowClick(row: Record<string, unknown>): void {
    // TODO: navigate to detail
  }
}