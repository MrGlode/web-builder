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
import { IamStore } from '@site-factory/domain-iam';

@Component({
  selector: 'sf-user-list',
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
      title="Utilisateurs"
      subtitle="Gestion des accès et permissions"
      [breadcrumbs]="[{ label: 'Accueil', route: '/' }]"
    >
      <a actions routerLink="/iam/audit" class="btn btn-secondary">📋 Audit Log</a>
    </sf-page-header>

    <sf-search-bar (searchChange)="onSearch($event)" />

    <sf-data-table
      [columns]="columns"
      [data]="store.users()"
      [loading]="store.loading()"
      [totalItems]="store.users().length"
      [page]="currentPage()"
      (pageChange)="currentPage.set($event)"
      (rowClick)="onRowClick($event)"
    >
      <ng-template sfCell="isActive" let-value>
        <sf-status-badge
          [status]="value ? 'enabled' : 'disabled'"
          [label]="value ? 'Actif' : 'Désactivé'"
          size="sm"
        />
      </ng-template>
    </sf-data-table>
  `,
})
export class UserListComponent {
  readonly store = inject(IamStore);
  readonly currentPage = signal(1);

  readonly columns: TableColumn[] = [
    { key: 'displayName', label: 'Nom', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'isActive', label: 'Statut', width: '120px' },
  ];

  constructor() {
    this.store.loadUsers();
  }

  onSearch(search: string): void {
    this.store.loadUsers({ search });
  }

  onRowClick(row: Record<string, unknown>): void {
    // TODO: navigate to detail
  }
}