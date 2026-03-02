import { Component, computed, input } from '@angular/core';

/**
 * Mapping statut → couleur.
 * Extensible : tout statut inconnu sera gris.
 */
const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  // SiteStatus / PageStatus
  draft:      { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
  active:     { bg: '#dcfce7', text: '#166534', dot: '#22c55e' },
  published:  { bg: '#dcfce7', text: '#166534', dot: '#22c55e' },
  archived:   { bg: '#f1f5f9', text: '#475569', dot: '#94a3b8' },

  // VersionStatus
  submitted:  { bg: '#dbeafe', text: '#1e40af', dot: '#3b82f6' },
  approved:   { bg: '#e0e7ff', text: '#3730a3', dot: '#6366f1' },
  rejected:   { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },

  // Generic
  enabled:    { bg: '#dcfce7', text: '#166534', dot: '#22c55e' },
  disabled:   { bg: '#f1f5f9', text: '#475569', dot: '#94a3b8' },
};

const DEFAULT_COLOR = { bg: '#f1f5f9', text: '#475569', dot: '#94a3b8' };

@Component({
  selector: 'sf-status-badge',
  standalone: true,
  template: `
    <span
      class="sf-badge"
      [class.sf-badge--sm]="size() === 'sm'"
      [style.background]="colors().bg"
      [style.color]="colors().text"
    >
      <span class="sf-badge__dot" [style.background]="colors().dot"></span>
      {{ displayLabel() }}
    </span>
  `,
  styles: [`
    :host { display: inline-flex; }

    .sf-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.02em;
      white-space: nowrap;
      line-height: 1.4;
    }

    .sf-badge--sm {
      padding: 2px 8px;
      font-size: 11px;
      gap: 4px;
    }

    .sf-badge__dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
    }
  `],
})
export class SfStatusBadgeComponent {
  readonly status = input.required<string>();
  readonly label = input<string>();
  readonly size = input<'sm' | 'md'>('md');

  readonly colors = computed(() =>
    STATUS_COLORS[this.status().toLowerCase()] ?? DEFAULT_COLOR
  );

  readonly displayLabel = computed(() =>
    this.label() ?? this.status().charAt(0).toUpperCase() + this.status().slice(1)
  );
}