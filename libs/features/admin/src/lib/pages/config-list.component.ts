import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  SfPageHeaderComponent,
  SfDataTableComponent,
  type TableColumn,
} from '@site-factory/shared-ui';
import { AdminStore } from '@site-factory/domain-admin';

@Component({
  selector: 'sf-config-list',
  standalone: true,
  imports: [RouterLink, SfPageHeaderComponent, SfDataTableComponent],
  template: `
    <sf-page-header
      title="Configuration globale"
      subtitle="Paramètres clé/valeur de la plateforme"
      [breadcrumbs]="[
        { label: 'Administration', route: '/admin' },
        { label: 'Configuration' }
      ]"
    >
      <a actions routerLink="/admin" class="btn btn-secondary">← Retour</a>
    </sf-page-header>

    <sf-data-table
      [columns]="columns"
      [data]="store.globalConfigs()"
      [loading]="store.configLoading()"
      [totalItems]="store.globalConfigs().length"
      emptyMessage="Aucune configuration"
    />
  `,
})
export class ConfigListComponent {
  readonly store = inject(AdminStore);

  readonly columns: TableColumn[] = [
    { key: 'key', label: 'Clé', sortable: true },
    { key: 'value', label: 'Valeur' },
    { key: 'description', label: 'Description' },
    { key: 'updatedBy', label: 'Modifié par', width: '140px' },
  ];

  constructor() {
    this.store.loadGlobalConfigs();
  }
}