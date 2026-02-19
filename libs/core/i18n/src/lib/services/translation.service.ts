import { Injectable, inject, signal, computed } from '@angular/core';
import { I18N_CONFIG, SupportedLocale } from '../models/i18n-config.model';

/**
 * Dictionnaire de traductions : structure JSON nestée.
 * Ex: { "site": { "list": { "title": "Gestion des sites" } } }
 */
type TranslationDictionary = Record<string, unknown>;

/**
 * Service de traduction signal-based.
 *
 * Charge les fichiers JSON de traduction et résout les clés
 * avec notation pointée (ex: 'site.list.title').
 *
 * Réactif : le changement de locale via setLocale() déclenche
 * automatiquement la mise à jour de tous les pipes et composants.
 */
@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly config = inject(I18N_CONFIG);

  /** Cache des dictionnaires chargés par locale */
  private readonly cache = new Map<SupportedLocale, TranslationDictionary>();

  /** Locale courante (signal réactif) */
  private readonly _currentLocale = signal<SupportedLocale>(this.config.defaultLocale);

  /** Compteur de version — incrémenté à chaque chargement pour forcer le recalcul du pipe */
  private readonly _version = signal(0);

  /** Dictionnaire actif (signal réactif) */
  private readonly _dictionary = signal<TranslationDictionary>({});

  // ─── Public API (signaux en lecture seule) ──────

  /** Locale courante */
  readonly currentLocale = this._currentLocale.asReadonly();

  /** Locales disponibles */
  readonly availableLocales = this.config.availableLocales;

  /** Signal combiné pour invalider le pipe (locale + version) */
  readonly translationSignal = computed(() => ({
    locale: this._currentLocale(),
    version: this._version(),
  }));

  // ─── Initialisation ─────────────────────────────

  /**
   * Charge la locale par défaut au démarrage.
   * Appelé dans provideI18n() via APP_INITIALIZER.
   */
  async init(): Promise<void> {
    await this.loadLocale(this.config.defaultLocale);
  }

  // ─── Changement de locale ───────────────────────

  /**
   * Change la locale courante et charge le dictionnaire si nécessaire.
   */
  async setLocale(locale: SupportedLocale): Promise<void> {
    if (!this.config.availableLocales.includes(locale)) {
      console.warn(`[i18n] Locale "${locale}" non supportée. Disponibles : ${this.config.availableLocales.join(', ')}`);
      return;
    }

    await this.loadLocale(locale);
    this._currentLocale.set(locale);
  }

  // ─── Résolution de clé ──────────────────────────

  /**
   * Traduit une clé avec notation pointée.
   *
   * @param key   Clé de traduction (ex: 'site.list.title')
   * @param params  Paramètres de substitution optionnels (ex: { count: 5 })
   * @returns Texte traduit, ou la clé elle-même si non trouvée
   */
  translate(key: string, params?: Record<string, string | number>): string {
    const dictionary = this._dictionary();
    const value = this.resolveKey(dictionary, key);

    if (value === undefined) {
      if (this.config.debugMissing) {
        console.warn(`[i18n] Clé manquante : "${key}" (locale: ${this._currentLocale()})`);
      }
      return key;
    }

    if (typeof value !== 'string') {
      if (this.config.debugMissing) {
        console.warn(`[i18n] Clé "${key}" ne pointe pas vers une chaîne (locale: ${this._currentLocale()})`);
      }
      return key;
    }

    return params ? this.interpolate(value, params) : value;
  }

  /**
   * Raccourci fonctionnel : alias de translate().
   */
  t(key: string, params?: Record<string, string | number>): string {
    return this.translate(key, params);
  }

  // ─── Chargement ─────────────────────────────────

  /**
   * Charge un fichier JSON de traduction et le met en cache.
   */
  private async loadLocale(locale: SupportedLocale): Promise<void> {
    if (this.cache.has(locale)) {
      this._dictionary.set(this.cache.get(locale)!);
      this._version.update(v => v + 1);
      return;
    }

    const url = `${this.config.translationBasePath}/${locale}.json`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`[i18n] Impossible de charger ${url} (HTTP ${response.status})`);
        return;
      }

      const dictionary: TranslationDictionary = await response.json();
      this.cache.set(locale, dictionary);
      this._dictionary.set(dictionary);
      this._version.update(v => v + 1);
    } catch (error) {
      console.error(`[i18n] Erreur de chargement ${url}:`, error);
    }
  }

  // ─── Helpers ────────────────────────────────────

  /**
   * Résout une clé pointée dans un objet nested.
   * Ex: resolveKey({ site: { list: { title: 'Abc' } } }, 'site.list.title') → 'Abc'
   */
  private resolveKey(obj: TranslationDictionary, key: string): unknown {
    return key.split('.').reduce<unknown>(
      (current, segment) =>
        current !== null && current !== undefined && typeof current === 'object'
          ? (current as Record<string, unknown>)[segment]
          : undefined,
      obj
    );
  }

  /**
   * Remplace les placeholders {{param}} par les valeurs fournies.
   */
  private interpolate(text: string, params: Record<string, string | number>): string {
    return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, paramKey) => {
      const value = params[paramKey];
      return value !== undefined ? String(value) : `{{${paramKey}}}`;
    });
  }
}