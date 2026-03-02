import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  SfPageHeaderComponent,
  SfDataTableComponent,
  SfSearchBarComponent,
  type TableColumn,
} from '@site-factory/shared-ui';
import { AdminStore } from '@site-factory/domain-admin';

@Component({
  selector: 'sf-translation-list',
  standalone: true,
  imports: [RouterLink, SfPageHeaderComponent, SfDataTableComponent, SfSearchBarComponent],
  template: `
    <sf-page-header
      title="Traductions"
      subtitle="Labels et messages de la plateforme"
      [breadcrumbs]="[
        { label: 'Administration', route: '/admin' },
        { label: 'Traductions' }
      ]"
    >
      <a actions routerLink="/admin" class="btn btn-secondary">← Retour</a>
    </sf-page-header>

    <sf-search-bar placeholder="Filtrer par clé ou namespace..." (searchChange)="onSearch($event)" />

    <sf-data-table
      [columns]="columns"
      [data]="store.translations()"
      [loading]="store.translationsLoading()"
      [totalItems]="store.translations().length"
      [page]="currentPage()"
      (pageChange)="currentPage.set($event)"
    />
  `,
})
export class TranslationListComponent {
  readonly store = inject(AdminStore);
  readonly currentPage = signal(1);

  readonly columns: TableColumn[] = [
    { key: 'locale', label: 'Locale', width: '80px' },
    { key: 'namespace', label: 'Namespace', width: '140px' },
    { key: 'key', label: 'Clé', sortable: true },
    { key: 'value', label: 'Valeur' },
  ];

  constructor() {
    this.store.loadTranslations();
  }

  onSearch(search: string): void {
    this.store.loadTranslations({ search });
  }
}