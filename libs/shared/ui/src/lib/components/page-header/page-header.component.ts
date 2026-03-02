import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Breadcrumb } from '../../models/ui.model';

@Component({
  selector: 'sf-page-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="sf-page-header">
      @if (breadcrumbs().length > 0) {
        <nav class="sf-page-header__breadcrumbs">
          @for (crumb of breadcrumbs(); track crumb.label; let last = $last) {
            @if (crumb.route && !last) {
              <a class="sf-page-header__crumb" [routerLink]="crumb.route">
                {{ crumb.label }}
              </a>
              <span class="sf-page-header__separator">/</span>
            } @else {
              <span class="sf-page-header__crumb sf-page-header__crumb--current">
                {{ crumb.label }}
              </span>
            }
          }
        </nav>
      }

      <div class="sf-page-header__row">
        <div class="sf-page-header__titles">
          <h1 class="sf-page-header__title">{{ title() }}</h1>
          @if (subtitle()) {
            <p class="sf-page-header__subtitle">{{ subtitle() }}</p>
          }
        </div>
        <div class="sf-page-header__actions">
          <ng-content select="[actions]" />
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; margin-bottom: 24px; }

    .sf-page-header__breadcrumbs {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;
      font-size: 13px;
      color: #94a3b8;
    }

    .sf-page-header__crumb {
      text-decoration: none;
      color: #64748b;
      transition: color 0.15s;
    }

    .sf-page-header__crumb:hover { color: #2563eb; }

    .sf-page-header__crumb--current {
      color: #94a3b8;
      pointer-events: none;
    }

    .sf-page-header__separator { color: #cbd5e1; }

    .sf-page-header__row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
    }

    .sf-page-header__title {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
      line-height: 1.3;
    }

    .sf-page-header__subtitle {
      font-size: 14px;
      color: #64748b;
      margin: 4px 0 0;
    }

    .sf-page-header__actions {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-shrink: 0;
    }
  `],
})
export class SfPageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly breadcrumbs = input<Breadcrumb[]>([]);
}