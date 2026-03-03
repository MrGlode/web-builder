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
import { AdminStore } from '@site-factory/domain-admin';

@Component({
  selector: 'sf-theme-list',
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
      title="Thèmes"
      subtitle="Gestion des thèmes Design System"
      [breadcrumbs]="[
        { label: 'Administration', route: '/admin' },
        { label: 'Thèmes' }
      ]"
    >
      <a actions routerLink="/admin" class="btn btn-secondary">← Retour</a>
    </sf-page-header>

    <sf-search-bar (searchChange)="onSearch($event)" />

    <sf-data-table
      [columns]="columns"
      [data]="store.themes()"
      [loading]="store.isLoading()"
      [totalItems]="store.themes().length"
      [page]="currentPage()"
      (pageChange)="currentPage.set($event)"
    >
      <ng-template sfCell="isDefault" let-value>
        <sf-status-badge
          [status]="value ? 'enabled' : 'disabled'"
          [label]="value ? 'Par défaut' : '—'"
          size="sm"
        />
      </ng-template>
    </sf-data-table>
  `,
})
export class ThemeListComponent {
  readonly store = inject(AdminStore);
  readonly currentPage = signal(1);

  readonly columns: TableColumn[] = [
    { key: 'name', label: 'Nom', sortable: true },
    { key: 'code', label: 'Code', sortable: true },
    { key: 'isDefault', label: 'Défaut', width: '120px' },
  ];

  constructor() {
    this.store.loadThemes();
  }

  onSearch(search: string): void {
    this.store.loadThemes({ search });
  }
}