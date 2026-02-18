import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'sf-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="sidebar">
      <div class="sidebar__brand">
        <h1 class="sidebar__title">Site Factory</h1>
      </div>
      <ul class="sidebar__nav">
        @for (item of navItems; track item.path) {
          <li>
            <a class="sidebar__link"
               [routerLink]="item.path"
               routerLinkActive="sidebar__link--active">
              <span class="sidebar__icon">{{ item.icon }}</span>
              <span class="sidebar__label">{{ item.label }}</span>
            </a>
          </li>
        }
      </ul>
    </nav>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      min-width: 260px;
      height: 100vh;
      background-color: #1e293b;
      color: #e2e8f0;
      display: flex;
      flex-direction: column;
    }

    .sidebar__brand {
      padding: 20px 24px;
      border-bottom: 1px solid #334155;
    }

    .sidebar__title {
      font-size: 20px;
      font-weight: 700;
      margin: 0;
      color: #ffffff;
    }

    .sidebar__nav {
      list-style: none;
      padding: 12px 0;
      margin: 0;
      flex: 1;
    }

    .sidebar__link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 24px;
      color: #94a3b8;
      text-decoration: none;
      font-size: 14px;
      transition: all 0.15s ease;
    }

    .sidebar__link:hover {
      color: #e2e8f0;
      background-color: #334155;
    }

    .sidebar__link--active {
      color: #ffffff;
      background-color: #3b82f6;
    }

    .sidebar__icon {
      font-size: 18px;
      width: 24px;
      text-align: center;
    }
  `],
})
export class SidebarComponent {
  readonly navItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Sites', path: '/sites', icon: '🌐' },
    { label: 'Page Builder', path: '/page-builder', icon: '📄' },
    { label: 'API Connector', path: '/api-connector', icon: '🔌' },
    { label: 'MFE Registry', path: '/mfe-registry', icon: '🧩' },
    { label: 'Utilisateurs', path: '/iam', icon: '👤' },
    { label: 'Versioning', path: '/versioning', icon: '📋' },
  ];
}