import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from '../services/translation.service';

/**
 * Pipe de traduction standalone.
 *
 * Usage :
 *   {{ 'site.list.title' | translate }}
 *   {{ 'site.list.count' | translate:{ count: 5 } }}
 *
 * Le pipe est pur mais réactif grâce au signal translationSignal
 * du TranslationService. Angular v21 détecte automatiquement
 * les changements de signal dans les pipes purs.
 */
@Pipe({
  name: 'translate',
  standalone: true,
  pure: true,
})
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(TranslationService);

  transform(key: string, params?: Record<string, string | number>): string {
    // Lire le signal pour créer la dépendance réactive
    // Angular recalcule le pipe quand ce signal change
    this.i18n.translationSignal();

    return this.i18n.translate(key, params);
  }
}