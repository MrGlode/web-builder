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
      [loading]="store.loading()"
      [totalItems]="store.versions().length"
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
    this.store.loadAll({ entityType: '', entityId: '' });
  }

  onSearch(search: string): void {
    // TODO: filter by entityType
  }

  onRowClick(row: Record<string, unknown>): void {
    // TODO: navigate to detail
  }
}