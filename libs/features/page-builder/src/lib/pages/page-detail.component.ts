import { Component, inject, input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  SfPageHeaderComponent,
  SfStatusBadgeComponent,
} from '@site-factory/shared-ui';
import { PageStore } from '@site-factory/domain-page';

@Component({
  selector: 'sf-page-detail',
  standalone: true,
  imports: [RouterLink, SfPageHeaderComponent, SfStatusBadgeComponent],
  template: `
    <sf-page-header
      [title]="pageStore.selectedPage()?.title ?? 'Chargement...'"
      [breadcrumbs]="[
        { label: 'Pages', route: '/pages' },
        { label: pageStore.selectedPage()?.title ?? '...' }
      ]"
    >
      <a actions routerLink="/pages" class="btn btn-secondary">← Retour</a>
    </sf-page-header>

    @if (pageStore.selectedPage(); as page) {
      <div class="detail-card">
        <div class="detail-row">
          <span class="detail-label">Slug</span>
          <span>{{ page.slug }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Chemin</span>
          <span>{{ page.path }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Statut</span>
          <sf-status-badge [status]="page.status" />
        </div>
        <div class="detail-row">
          <span class="detail-label">Position</span>
          <span>{{ page.position }}</span>
        </div>
      </div>
    }
  `,
  styles: [`
    .detail-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; }
    .detail-row { display: flex; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { width: 160px; font-weight: 600; color: #475569; }
  `],
})
export class PageDetailComponent implements OnInit {
  readonly id = input.required<string>();
  readonly pageStore = inject(PageStore);

  ngOnInit(): void {
    // loadPageById attend { siteId, pageId } — on récupère le siteId depuis le store
    this.pageStore.loadPageById({
      siteId: this.pageStore.selectedSiteId(),
      pageId: this.id(),
    });
  }
}