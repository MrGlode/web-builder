import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  SfPageHeaderComponent,
  SfDataTableComponent,
  SfCellDirective,
  SfStatusBadgeComponent,
  SfSearchBarComponent,
  type TableColumn,
} from '@site-factory/shared-ui';
import { MfeRegistryStore } from '@site-factory/domain-mfe-registry';

@Component({
  selector: 'sf-mfe-list',
  standalone: true,
  imports: [
    RouterLink,
    SfPageHeaderComponent,
    SfDataTableComponent,
    SfCellDirective,
    SfStatusBadgeComponent,
    SfSearchBarComponent,
  ],
  template: `
    <sf-page-header
      title="Micro-Frontends"
      subtitle="Registre des composants distants"
      [breadcrumbs]="[{ label: 'Accueil', route: '/' }]"
    >
      <a actions routerLink="new" class="btn btn-primary">+ Nouveau MFE</a>
    </sf-page-header>

    <sf-search-bar (searchChange)="onSearch($event)" />

    <sf-data-table
      [columns]="columns"
      [data]="store.mfes()"
      [loading]="store.loading()"
      [totalItems]="store.mfes().length"
      [page]="currentPage()"
      (pageChange)="currentPage.set($event)"
      (rowClick)="onRowClick($event)"
    >
      <ng-template sfCell="isActive" let-value>
        <sf-status-badge
          [status]="value ? 'enabled' : 'disabled'"
          [label]="value ? 'Actif' : 'Inactif'"
          size="sm"
        />
      </ng-template>
    </sf-data-table>
  `,
})
export class MfeListComponent {
  readonly store = inject(MfeRegistryStore);
  readonly currentPage = signal(1);

  readonly columns: TableColumn[] = [
    { key: 'name', label: 'Nom', sortable: true },
    { key: 'code', label: 'Code', sortable: true },
    { key: 'remoteName', label: 'Remote' },
    { key: 'currentVersion', label: 'Version', width: '100px' },
    { key: 'isActive', label: 'Statut', width: '120px' },
  ];

  constructor() {
    this.store.loadAll();
  }

  onSearch(search: string): void {
    this.store.loadAll({ search });
  }

  onRowClick(row: Record<string, unknown>): void {
    // TODO: navigate to detail
  }
}