import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  SfPageHeaderComponent,
  SfDataTableComponent,
  SfSearchBarComponent,
  type TableColumn,
} from '@site-factory/shared-ui';
import { AuditStore } from '@site-factory/domain-iam';

@Component({
  selector: 'sf-audit-log',
  standalone: true,
  imports: [RouterLink, SfPageHeaderComponent, SfDataTableComponent, SfSearchBarComponent],
  template: `
    <sf-page-header
      title="Journal d'audit"
      subtitle="Historique des actions utilisateurs"
      [breadcrumbs]="[
        { label: 'Utilisateurs', route: '/iam' },
        { label: 'Audit' }
      ]"
    >
      <a actions routerLink="/iam" class="btn btn-secondary">← Retour</a>
    </sf-page-header>

    <sf-search-bar placeholder="Filtrer par action, entité..." (searchChange)="onSearch($event)" />

    <sf-data-table
      [columns]="columns"
      [data]="store.auditLogs()"
      [loading]="store.loading()"
      [totalItems]="store.auditLogs().length"
      [page]="currentPage()"
      (pageChange)="currentPage.set($event)"
      emptyMessage="Aucune entrée d'audit"
    />
  `,
})
export class AuditLogComponent {
  readonly store = inject(AuditStore);
  readonly currentPage = signal(1);

  readonly columns: TableColumn[] = [
    { key: 'action', label: 'Action', sortable: true },
    { key: 'entityType', label: 'Type', width: '120px' },
    { key: 'entityId', label: 'Entité' },
    { key: 'userId', label: 'Utilisateur' },
    { key: 'createdAt', label: 'Date', sortable: true, width: '180px' },
  ];

  constructor() {
    this.store.loadAll();
  }

  onSearch(search: string): void {
    this.store.loadAll({ search });
  }
}