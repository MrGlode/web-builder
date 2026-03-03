import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  SfPageHeaderComponent,
  SfDataTableComponent,
  SfCellDirective,
  SfStatusBadgeComponent,
  SfSearchBarComponent,
  type TableColumn,
  type SortEvent,
} from '@site-factory/shared-ui';
import { PageStore } from '@site-factory/domain-page';

@Component({
  selector: 'sf-page-list',
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
      title="Pages"
      subtitle="Arborescence des pages par site"
      [breadcrumbs]="[{ label: 'Accueil', route: '/' }]"
    >
      <a actions routerLink="new" class="btn btn-primary">+ Nouvelle page</a>
    </sf-page-header>

    <sf-search-bar (searchChange)="onSearch($event)" />

    <sf-data-table
      [columns]="columns"
      [data]="pageStore.pages()"
      [loading]="pageStore.isLoading()"
      [totalItems]="pageStore.pageCount()"
      [page]="currentPage()"
      (pageChange)="currentPage.set($event)"
      (sortChange)="onSort($event)"
      (rowClick)="onRowClick($event)"
    >
      <ng-template sfCell="status" let-value>
        <sf-status-badge [status]="value" />
      </ng-template>
    </sf-data-table>
  `,
})
export class PageListComponent {
  readonly pageStore = inject(PageStore);
  readonly currentPage = signal(1);

  readonly columns: TableColumn[] = [
    { key: 'title', label: 'Titre', sortable: true },
    { key: 'slug', label: 'Slug', sortable: true },
    { key: 'path', label: 'Path', sortable: true },
    { key: 'status', label: 'Statut', sortable: true, width: '120px' },
  ];

  constructor() {
    // TODO: récupérer le siteId depuis la route ou un sélecteur de site
    this.pageStore.loadPages({ siteId: '' });
  }

  onSearch(search: string): void {
    this.pageStore.loadPages({ siteId: this.pageStore.selectedSiteId() ?? '', search });
  }

  onSort(event: SortEvent): void {
    // TODO: implémenter le tri côté store ou API
  }

  onRowClick(row: Record<string, unknown>): void {
    // TODO: navigate to detail
  }
}