import { Component } from '@angular/core';

@Component({
  selector: 'sf-header',
  standalone: true,
  template: `
    <header class="header">
      <div class="header__left">
        <!-- Breadcrumb viendra ici plus tard -->
      </div>
      <div class="header__right">
        <span class="header__user">Utilisateur</span>
      </div>
    </header>
  `,
  styles: [`
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 56px;
      padding: 0 24px;
      background-color: #ffffff;
      border-bottom: 1px solid #e2e8f0;
    }

    .header__user {
      font-size: 14px;
      color: #475569;
    }
  `],
})
export class HeaderComponent {}