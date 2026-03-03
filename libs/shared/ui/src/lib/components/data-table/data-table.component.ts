import {
  Component,
  TemplateRef,
  computed,
  contentChildren,
  input,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import type { TableColumn, SortEvent } from '../../models/ui.model';
import { SfCellDirective } from './cell.directive';

@Component({
  selector: 'sf-data-table',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    <!-- Table -->
    <div class="sf-table-wrapper">
      <table class="sf-table">
        <thead>
          <tr>
            @for (col of columns(); track col.key) {
              <th
                [class.sf-table__th--sortable]="col.sortable"
                [class.sf-table__th--active]="sortColumn() === col.key"
                [style.width]="col.width ?? 'auto'"
                [style.text-align]="col.align ?? 'left'"
                (click)="col.sortable ? onSort(col.key) : null"
              >
                <span class="sf-table__th-content">
                  {{ col.label }}
                  @if (col.sortable) {
                    <span class="sf-table__sort-icon">
                      @if (sortColumn() === col.key) {
                        {{ sortDirection() === 'asc' ? '▲' : '▼' }}
                      } @else {
                        ⇅
                      }
                    </span>
                  }
                </span>
              </th>
            }
          </tr>
        </thead>

        <tbody>
          @if (loading()) {
            @for (i of skeletonRows; track i) {
              <tr class="sf-table__row sf-table__row--skeleton">
                @for (col of columns(); track col.key) {
                  <td><div class="sf-table__skeleton-cell"></div></td>
                }
              </tr>
            }
          } @else {
            @for (row of data(); track $index) {
              <tr
                class="sf-table__row sf-table__row--data"
                (click)="rowClick.emit(row)"
              >
                @for (col of columns(); track col.key) {
                  <td [style.text-align]="col.align ?? 'left'">
                    @if (templateMap().get(col.key); as tmpl) {
                      <ng-container
                        [ngTemplateOutlet]="tmpl"
                        [ngTemplateOutletContext]="{
                          $implicit: getCellValue(row, col.key),
                          row: row
                        }"
                      />
                    } @else {
                      {{ getCellValue(row, col.key) }}
                    }
                  </td>
                }
              </tr>
            } @empty {
              <tr class="sf-table__row sf-table__row--empty">
                <td [attr.colspan]="columns().length">
                  <div class="sf-table__empty">
                    <span class="sf-table__empty-icon">{{ emptyIcon() }}</span>
                    <span class="sf-table__empty-text">{{ emptyMessage() }}</span>
                  </div>
                </td>
              </tr>
            }
          }
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    @if (!loading() && totalItems() > 0) {
      <div class="sf-table__pagination">
        <span class="sf-table__pagination-info">
          {{ paginationStart() }}–{{ paginationEnd() }} sur {{ totalItems() }}
        </span>
        <div class="sf-table__pagination-controls">
          <button
            class="sf-table__pagination-btn"
            [disabled]="page() <= 1"
            (click)="onPageChange(page() - 1)"
          >
            ‹
          </button>

          @for (p of visiblePages(); track p) {
            <button
              class="sf-table__pagination-btn"
              [class.sf-table__pagination-btn--active]="p === page()"
              (click)="onPageChange(p)"
            >
              {{ p }}
            </button>
          }

          <button
            class="sf-table__pagination-btn"
            [disabled]="page() >= totalPages()"
            (click)="onPageChange(page() + 1)"
          >
            ›
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }

    .sf-table-wrapper {
      overflow-x: auto;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }

    .sf-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    .sf-table thead {
      background: #f8fafc;
      border-bottom: 2px solid #e2e8f0;
    }

    .sf-table th {
      padding: 12px 16px;
      font-weight: 600;
      color: #475569;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 0.05em;
      white-space: nowrap;
      user-select: none;
    }

    .sf-table__th--sortable { cursor: pointer; }
    .sf-table__th--sortable:hover { color: #1e293b; }
    .sf-table__th--active { color: #2563eb; }

    .sf-table__th-content {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .sf-table__sort-icon {
      font-size: 10px;
      opacity: 0.5;
    }

    .sf-table__th--active .sf-table__sort-icon { opacity: 1; }

    .sf-table td {
      padding: 12px 16px;
      color: #334155;
      border-bottom: 1px solid #f1f5f9;
    }

    .sf-table__row--data { cursor: pointer; transition: background 0.15s; }
    .sf-table__row--data:hover { background: #f8fafc; }
    .sf-table__row--data:last-child td { border-bottom: none; }

    /* Skeleton */
    .sf-table__row--skeleton td { padding: 16px; }
    .sf-table__skeleton-cell {
      height: 16px;
      background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* Empty */
    .sf-table__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 48px 16px;
      color: #94a3b8;
    }

    .sf-table__empty-icon { font-size: 32px; }
    .sf-table__empty-text { font-size: 14px; }

    /* Pagination */
    .sf-table__pagination {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      font-size: 13px;
      color: #64748b;
    }

    .sf-table__pagination-controls {
      display: flex;
      gap: 4px;
    }

    .sf-table__pagination-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 32px;
      height: 32px;
      padding: 0 8px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      background: #fff;
      color: #475569;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.15s;
    }

    .sf-table__pagination-btn:hover:not(:disabled) {
      background: #f1f5f9;
      border-color: #cbd5e1;
    }

    .sf-table__pagination-btn--active {
      background: #2563eb;
      border-color: #2563eb;
      color: #fff;
    }

    .sf-table__pagination-btn--active:hover:not(:disabled) {
      background: #1d4ed8;
    }

    .sf-table__pagination-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  `],
})
export class SfDataTableComponent {
  // --- Inputs ---
  readonly columns = input.required<TableColumn[]>();
  readonly data = input.required<any[]>();
  readonly loading = input(false);
  readonly totalItems = input(0);
  readonly page = input(1);
  readonly pageSize = input(10);
  readonly emptyMessage = input('Aucun résultat');
  readonly emptyIcon = input('📋');

  // --- Outputs ---
  readonly pageChange = output<number>();
  readonly sortChange = output<SortEvent>();
  readonly rowClick = output<Record<string, unknown>>();

  // --- Internal state ---
  readonly sortColumn = signal<string | null>(null);
  readonly sortDirection = signal<'asc' | 'desc'>('asc');

  // --- Content children (custom cell templates) ---
  private readonly cellTemplates = contentChildren(SfCellDirective);

  readonly templateMap = computed(() => {
    const map = new Map<string, TemplateRef<unknown>>();
    for (const tpl of this.cellTemplates()) {
      map.set(tpl.sfCell(), tpl.templateRef);
    }
    return map;
  });

  // --- Computed ---
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalItems() / this.pageSize()))
  );

  readonly paginationStart = computed(() =>
    Math.min((this.page() - 1) * this.pageSize() + 1, this.totalItems())
  );

  readonly paginationEnd = computed(() =>
    Math.min(this.page() * this.pageSize(), this.totalItems())
  );

  readonly visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.page();
    const pages: number[] = [];

    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  });

  // Skeleton rows for loading state
  readonly skeletonRows = Array.from({ length: 5 }, (_, i) => i);

  // --- Methods ---
  getCellValue(row: Record<string, unknown>, key: string): unknown {
    return key.split('.').reduce((obj: unknown, k) => 
      (obj as Record<string, unknown>)?.[k], row as unknown
    );
  }

  onSort(column: string): void {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
    this.sortChange.emit({
      column: this.sortColumn() ?? '',
      direction: this.sortDirection(),
    });
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.pageChange.emit(page);
    }
  }
}