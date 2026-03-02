import { Component, inject, signal } from '@angular/core';
import {
  SfPageHeaderComponent,
  SfDataTableComponent,
  SfCellDirective,
  SfStatusBadgeComponent,
  SfSearchBarComponent,
  type TableColumn,
} from '@site-factory/shared-ui';
import { ApiConnectorStore } from '@site-factory/domain-api-connector';

@Component({
  selector: 'sf-api-connector-list',
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
      title="Connecteurs API"
      subtitle="Catalogue des API WSO2 APIM"
      [breadcrumbs]="[{ label: 'Accueil', route: '/' }]"
    >
      <button actions class="btn btn-primary" (click)="onSync()">⟳ Synchroniser WSO2</button>
    </sf-page-header>

    <sf-search-bar (searchChange)="onSearch($event)" />

    <sf-data-table
      [columns]="columns"
      [data]="store.connectors()"
      [loading]="store.loading()"
      [totalItems]="store.connectors().length"
      [page]="currentPage()"
      (pageChange)="currentPage.set($event)"
      (rowClick)="onRowClick($event)"
    >
      <ng-template sfCell="isAvailable" let-value>
        <sf-status-badge
          [status]="value ? 'enabled' : 'disabled'"
          [label]="value ? 'Disponible' : 'Indisponible'"
          size="sm"
        />
      </ng-template>
    </sf-data-table>
  `,
})
export class ApiConnectorListComponent {
  readonly store = inject(ApiConnectorStore);
  readonly currentPage = signal(1);

  readonly columns: TableColumn[] = [
    { key: 'name', label: 'Nom', sortable: true },
    { key: 'version', label: 'Version', width: '100px' },
    { key: 'contextPath', label: 'Context Path' },
    { key: 'isAvailable', label: 'Statut', width: '140px' },
  ];

  constructor() {
    this.store.loadAll();
  }

  onSearch(search: string): void {
    this.store.loadAll({ search });
  }

  onSync(): void {
    this.store.syncFromWso2();
  }

  onRowClick(row: Record<string, unknown>): void {
    // TODO: navigate to detail
  }
}