import { Component, inject, input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  SfPageHeaderComponent,
  SfStatusBadgeComponent,
  SfDataTableComponent,
  type TableColumn,
} from '@site-factory/shared-ui';
import { IamStore } from '@site-factory/domain-iam';

@Component({
  selector: 'sf-user-detail',
  standalone: true,
  imports: [RouterLink, SfPageHeaderComponent, SfStatusBadgeComponent, SfDataTableComponent],
  template: `
    <sf-page-header
      [title]="store.selectedUser()?.displayName ?? 'Chargement...'"
      [breadcrumbs]="[
        { label: 'Utilisateurs', route: '/iam' },
        { label: store.selectedUser()?.displayName ?? '...' }
      ]"
    >
      <a actions routerLink="/iam" class="btn btn-secondary">← Retour</a>
    </sf-page-header>

    @if (store.selectedUser(); as user) {
      <div class="detail-card">
        <div class="detail-row">
          <span class="detail-label">Email</span>
          <span>{{ user.email }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">WSO2 Sub</span>
          <span>{{ user.wso2Sub }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Statut</span>
          <sf-status-badge
            [status]="user.isActive ? 'enabled' : 'disabled'"
            [label]="user.isActive ? 'Actif' : 'Désactivé'"
          />
        </div>
      </div>

      <h2 class="section-title">Rôles par site</h2>
      <sf-data-table
        [columns]="roleColumns"
        [data]="store.userSiteRoles()"
        [totalItems]="store.userSiteRoles().length"
        emptyMessage="Aucun rôle attribué"
      />
    }
  `,
  styles: [`
    .detail-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 32px; }
    .detail-row { display: flex; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { width: 160px; font-weight: 600; color: #475569; }
    .section-title { font-size: 18px; font-weight: 600; color: #1e293b; margin: 0 0 16px; }
  `],
})
export class UserDetailComponent implements OnInit {
  readonly id = input.required<string>();
  readonly store = inject(IamStore);

  readonly roleColumns: TableColumn[] = [
    { key: 'roleId', label: 'Rôle' },
    { key: 'siteId', label: 'Site' },
    { key: 'grantedBy', label: 'Accordé par' },
  ];

  ngOnInit(): void {
    this.store.loadOne(this.id());
    this.store.loadUserSiteRoles(this.id());
  }
}