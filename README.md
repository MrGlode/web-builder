# Site Factory CMS — Document d'Architecture

> **Version** : 3.0  
> **Date** : 19 février 2026  
> **Statut** : En cours de construction — Phase 1 (Fondations) en cours  
> **Stack** : Angular v21 · Nx Monorepo · NgRx SignalStore · SCSS  
> **Socle externe** : WSO2 IS (Auth OIDC) · WSO2 APIM 4.6 (API Catalog) · Design System (vanilla JS/SCSS)

---

## Table des matières

1. [Vision Produit](#1-vision-produit)
2. [Carte Fonctionnelle](#2-carte-fonctionnelle)
3. [Décisions Techniques](#3-décisions-techniques)
4. [Architecture en Couches](#4-architecture-en-couches)
5. [Structure Monorepo Nx](#5-structure-monorepo-nx)
6. [Module Boundaries](#6-module-boundaries)
7. [Core — Services d'infrastructure](#7-core--services-dinfrastructure)
8. [Domain — Pattern SignalStore](#8-domain--pattern-signalstore)
9. [Feature — Pattern écran fonctionnel](#9-feature--pattern-écran-fonctionnel)
10. [Modèle de Données](#10-modèle-de-données)
11. [Schéma Relationnel Global](#11-schéma-relationnel-global)
12. [Index Recommandés](#12-index-recommandés)
13. [Conventions](#13-conventions)
14. [Risques et Mitigations](#14-risques-et-mitigations)
15. [Roadmap Technique](#15-roadmap-technique)

---

## 1. Vision Produit

### Ce qu'on construit

**Site Factory CMS** est une **plateforme interne** (Site Factory) permettant à des équipes — développeurs et responsables applicatifs — de **créer, configurer, assembler et maintenir** des applications web (gestion, déclaration de sinistres, etc.) à destination de clients multiples.

### Ce qu'on ne construit PAS

Un CMS éditorial type WordPress. Le contenu est **piloté par des API d'expérience** (BFF) via WSO2 APIM, pas saisi dans un éditeur WYSIWYG. Le CMS orchestre la **structure**, la **configuration** et l'**assemblage** — pas la rédaction de contenu.

### Positionnement

| Caractéristique | Choix |
|---|---|
| Type | Headless (API-first) — Site Factory |
| Usage | Interne (équipes de développement et responsables applicatifs) |
| Contenu | Piloté par API d'expérience (BFF), pas par saisie éditoriale |
| Multi-tenant | Oui — sites génériques multi-clients + sites spécifiques |
| Audience | Développeurs + responsables d'applications |

### Analogie

Plus proche d'un **Backstage.io** (portail développeur) croisé avec un **page builder headless** qu'un Strapi ou WordPress.

---

## 2. Carte Fonctionnelle

### 2.1 Domaines

Le CMS est structuré en **7 domaines fonctionnels**, priorisés en 3 tiers.

```
┌─────────────────────────────────────────────────────┐
│                 SITE FACTORY CMS                     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  TIER 1 — FONDATIONS (sans ça, rien ne fonctionne)  │
│  ┌─────────────────────────────────────────────┐     │
│  │ D1  Site Management                         │     │
│  │ D4  Micro-Frontend Registry                 │     │
│  │ D5  IAM & Gouvernance (WSO2 IS)             │     │
│  └─────────────────────────────────────────────┘     │
│                                                      │
│  TIER 2 — VALEUR MÉTIER (ce que les users voient)   │
│  ┌─────────────────────────────────────────────┐     │
│  │ D2  Page & Layout Builder                   │     │
│  │ D3  API Connector (WSO2 APIM)               │     │
│  └─────────────────────────────────────────────┘     │
│                                                      │
│  TIER 3 — QUALITÉ & CONTRÔLE (fast-follow)          │
│  ┌─────────────────────────────────────────────┐     │
│  │ D6  Versioning & Workflow                   │     │
│  │ D7  Administration & Observabilité          │     │
│  └─────────────────────────────────────────────┘     │
│                                                      │
│  SOCLE EXTERNE                                       │
│  ┌─────────────────────────────────────────────┐     │
│  │ WSO2 IS (Auth) │ WSO2 APIM 4.6 (API)       │     │
│  │ Design System (JS/SCSS) │ Module Federation │     │
│  └─────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────┘
```

### 2.2 Détail par Domaine — MVP vs Cible

#### D1 — Site Management

> Créer, configurer et piloter le cycle de vie des sites/applications.

| MVP | Cible |
|-----|-------|
| Catalogue des sites (CRUD, métadonnées, statut) | Clonage de site (template → nouveau client) |
| Configuration par site : nom, domaine, tenant, thème DS, langue | Comparaison entre sites (diff de config) |
| Association site ↔ tenant | Environnements par site (dev / staging / prod) |
| Arborescence de pages par site (structure en arbre) | Gestion du cycle de vie complet (brouillon → archivé) |
| Définition des routes par page | |

#### D2 — Page & Layout Builder

> Assembler des pages à partir de blocs/composants du Design System et de micro-frontends.

| MVP | Cible |
|-----|-------|
| Définition d'une page : layout (zones), blocs assignés | Éditeur visuel drag & drop |
| Catalogue de blocs disponibles (DS + MFE) | Variantes par tenant (même page, blocs différents) |
| Configuration par bloc : props, binding vers API source | Conditional rendering (bloc X si condition Y) |
| Aperçu de la page assemblée (preview) | Templates de pages réutilisables inter-sites |

#### D3 — API Connector (WSO2 APIM)

> Connecteur read-only vers WSO2 APIM 4.6. Le CMS consomme le catalogue, il ne le gère pas.

| MVP | Cible |
|-----|-------|
| Connecteur WSO2 APIM (Developer Portal REST API) | Auto-complétion du mapping champs OAS ↔ props bloc |
| Catalogue browsable dans le CMS (nom, version, tags) | Validation de compatibilité (diff OAS entre versions) |
| Association bloc ↔ API + opération | Cache local avec sync périodique |
| Résolution du contrat OAS/Swagger | Health status des API dans le dashboard |
| Configuration des endpoints par environnement | |

**Décision architecturale** : le CMS ne reconstruit pas un registre d'API maison. Il consomme les API REST d'administration de WSO2 APIM 4.6 (Publisher API, Developer Portal API). La table `ApiReference` est une **table de cache**, pas une source of truth.

#### D4 — Micro-Frontend Registry

> Gérer les composants/remotes Angular (Module Federation) comme des assets plateforme.

| MVP | Cible |
|-----|-------|
| Registre des MFE (remote name, URL, version, module exposé) | Déploiement indépendant par MFE |
| Association MFE ↔ bloc du page builder | Fallback en cas d'indisponibilité d'un remote |
| Chargement dynamique des remotes dans le shell | Sandbox / preview MFE isolé |
| Versionning (quelle version sur quel site) | Gestion des dépendances partagées (shared libs DS) |

#### D5 — IAM & Gouvernance

> Authentification WSO2 IS, permissions fines, audit.

| MVP | Cible |
|-----|-------|
| Intégration WSO2 IS (OIDC/OAuth2) | ABAC : règles contextuelles |
| RBAC : Admin plateforme, Admin site, Éditeur, Lecteur | Workflows de validation multi-niveaux |
| Périmètre par site (accès restreint) | Délégation de droits |
| Audit log (qui, quoi, quand) | SSO cross-sites (CMS → sites générés) |

#### D6 — Versioning & Workflow

> Historiser et contrôler les changements de configuration.

| MVP | Cible |
|-----|-------|
| Versioning des configs site/page (snapshot JSON) | Branching (version future sans impacter prod) |
| Statuts : brouillon → soumis → validé → publié | Merge de configurations |
| Historique consultable avec diff | Workflow configurable par site/tenant |
| Rollback vers version précédente | Notifications (email, webhook) |

#### D7 — Administration & Observabilité

> Dashboard, configuration globale, i18n, SEO, analytics.

| MVP | Cible |
|-----|-------|
| Dashboard : vue d'ensemble sites, statuts, dernières modifs | Analytics intégrées (usage, pages vues, erreurs) |
| Configuration globale : thèmes DS, langues, paramètres | Health check des sites déployés |
| i18n : labels/traductions plateforme et par site | Backup / restauration complète |
| SEO : meta, slugs, sitemap par site | Gestion du cache (invalidation) |

---

## 3. Décisions Techniques

| Sujet | Décision | Justification |
|---|---|---|
| **Monorepo** | Nx | Cache de build, module boundaries, affected commands. Indispensable pour 7 domaines + libs partagées. |
| **State Management** | NgRx SignalStore | Sweet spot entre structure (features, computed, methods) et légèreté. Natif signals Angular v21. Pas le boilerplate du Store classique. |
| **Design System** | Lib interne + wrappers Angular | DS existant en vanilla JS/SCSS. Wrapper Angular dans `shared/design-system`, migration progressive. |
| **Authentification** | WSO2 IS via OIDC (Authorization Code + PKCE) | Infrastructure existante. Lib `angular-auth-oidc-client`. |
| **Catalogue API** | Connecteur WSO2 APIM 4.6 | Read-only + cache. Pas de registre maison. |
| **Micro-Frontends** | Angular Module Federation | Architecture remotes/host pour chargement dynamique de composants. |
| **CSS** | SCSS | Cohérence avec le DS existant. |
| **Versioning données** | Snapshot JSON polymorphique | Une seule table `EntityVersion` pour toutes les entités. Simple, auditable. |
| **Interceptors** | Functional (Angular v21) | Plus de classes. `HttpInterceptorFn` + `HttpContextToken` pour le contrôle par requête. |
| **HTTP Client** | `ApiClientService` wrapper | Abstrait `HttpClient`, intègre les options (skipLoading, skipErrorHandling). |
| **Mocking (dev)** | Mock Interceptor | Simule les API en dev. Delay réaliste (600ms). Activé via `isDevMode()`. |

---

## 4. Architecture en Couches

```
┌─────────────────────────────────────────────────────────┐
│                    SITE FACTORY CMS                      │
├──────────┬──────────┬──────────┬────────────────────────┤
│   Core   │  Domain  │ Features │      Shared            │
├──────────┼──────────┼──────────┼────────────────────────┤
│ Auth ✅  │ Site ✅  │ Site ✅  │ Models ✅ (interfaces) │
│ (WSO2)   │ Page     │ Page Bld │ Utils (helpers)        │
│ HTTP ✅  │ API Conn │ API UI   │ UI (dumb components)   │
│ Config   │ MFE Reg  │ MFE UI   │ Design System          │
│ i18n     │ IAM      │ IAM UI   │ (wrappers Angular)     │
│ Logger ✅│ Version. │ Vers. UI │                        │
│          │ Admin    │ Admin UI │                        │
└──────────┴──────────┴──────────┴────────────────────────┘
                       ✅ = implémenté
```

| Couche | Rôle | Contient | Importe |
|--------|------|----------|---------|
| **Core** | Infrastructure technique partagée | Services, guards, interceptors, providers | shared |
| **Domain** | Logique métier pure | Stores (SignalStore), services API, modèles domaine | shared |
| **Features** | UI intelligente (pages, containers) | Smart components, routes, pages | domain, shared, core |
| **Shared** | Briques transverses | Modèles, utilitaires, composants dumb, DS | utils (leaf) |

---

## 5. Structure Monorepo Nx

### 5.1 Vue d'ensemble

```
site-factory/
├── apps/
│   └── cms-admin/                       ← Application shell Angular
│       ├── src/
│       │   ├── app/
│       │   │   ├── app.ts               ← AppComponent (sf-root)
│       │   │   ├── app.config.ts        ← Providers (HTTP, Auth, Logger)
│       │   │   ├── app.routes.ts        ← Lazy loading des 7 features
│       │   │   ├── layout/
│       │   │   │   ├── shell/           ← ShellComponent (sidebar + header + outlet)
│       │   │   │   ├── sidebar/         ← SidebarComponent (navigation)
│       │   │   │   └── header/          ← HeaderComponent (breadcrumb, user)
│       │   │   └── mocks/              ← Mock interceptors (dev only)
│       │   │       ├── site.mock.ts     ← Données mockées
│       │   │       └── mock.interceptor.ts
│       │   ├── index.html
│       │   ├── main.ts
│       │   └── styles.scss
│       ├── project.json                 ← tags: scope:app, type:app, prefix: sf
│       └── tsconfig.json
│
├── libs/
│   ├── core/                            ← Infrastructure technique
│   │   ├── auth/src/lib/                ✅ IMPLÉMENTÉ
│   │   │   ├── models/                  ← AuthState, AuthUser, SfAuthConfig
│   │   │   ├── services/               ← AuthService (WSO2 IS wrapper)
│   │   │   ├── guards/                 ← authGuard, roleGuard
│   │   │   ├── interceptors/           ← tokenInterceptor
│   │   │   └── providers/              ← provideAuth()
│   │   ├── http/src/lib/                ✅ IMPLÉMENTÉ
│   │   │   ├── models/                  ← ApiResponse<T>, ApiHttpError, HttpRequestOptions
│   │   │   ├── services/               ← ApiClientService, LoadingService
│   │   │   ├── interceptors/           ← errorInterceptor, loadingInterceptor
│   │   │   └── providers/              ← provideHttpCore()
│   │   ├── logger/src/lib/              ✅ IMPLÉMENTÉ
│   │   │   ├── models/                  ← LogLevel, LogEntry, LoggerConfig
│   │   │   ├── services/               ← LoggerService
│   │   │   └── providers/              ← provideLogger()
│   │   ├── config/src/lib/              ⬜ À CONSTRUIRE
│   │   └── i18n/src/lib/               ⬜ À CONSTRUIRE
│   │
│   ├── domain/                          ← Logique métier (1 lib / domaine)
│   │   ├── site/src/lib/                ✅ IMPLÉMENTÉ (pattern de référence)
│   │   │   ├── models/                  ← SiteState, SiteFilters
│   │   │   ├── services/               ← SiteApiService
│   │   │   └── store/                  ← SiteStore (NgRx SignalStore)
│   │   ├── page/src/lib/               ⬜ À RÉPLIQUER
│   │   ├── api-connector/src/lib/      ⬜ À RÉPLIQUER
│   │   ├── mfe-registry/src/lib/       ⬜ À RÉPLIQUER
│   │   ├── iam/src/lib/                ⬜ À RÉPLIQUER
│   │   ├── versioning/src/lib/         ⬜ À RÉPLIQUER
│   │   └── admin/src/lib/              ⬜ À RÉPLIQUER
│   │
│   ├── features/                        ← UI intelligente (1 lib / domaine)
│   │   ├── site/src/lib/                ✅ IMPLÉMENTÉ (pattern de référence)
│   │   │   ├── pages/
│   │   │   │   ├── site-list/          ← SiteListComponent (grille, recherche)
│   │   │   │   ├── site-detail/        ← SiteDetailComponent (fiche site)
│   │   │   │   └── site-create/        ← SiteCreateComponent (formulaire)
│   │   │   └── routes.ts              ← SITE_ROUTES (list, new, :id)
│   │   ├── page-builder/src/lib/       ⬜ Placeholder
│   │   ├── api-connector/src/lib/      ⬜ Placeholder
│   │   ├── mfe-registry/src/lib/       ⬜ Placeholder
│   │   ├── iam/src/lib/                ⬜ Placeholder
│   │   ├── versioning/src/lib/         ⬜ Placeholder
│   │   └── admin/src/lib/              ⬜ Placeholder
│   │
│   └── shared/                          ← Briques transverses
│       ├── models/src/lib/              ✅ IMPLÉMENTÉ
│       │   ├── common/                  ← BaseEntity, Pagination, Enums
│       │   ├── tenant/                  ← Tenant
│       │   ├── site/                    ← Site, CreateSitePayload
│       │   ├── page/                    ← Page, SeoConfig
│       │   ├── block/                   ← Layout, BlockDefinition, BlockInstance
│       │   ├── api-reference/           ← ApiReference, ApiBinding
│       │   ├── mfe/                     ← MicroFrontend, MfeDeployment
│       │   ├── user/                    ← UserProfile, Role, Permission, AuditLog
│       │   ├── versioning/              ← EntityVersion, WorkflowTransition
│       │   └── admin/                   ← Theme, Translation, GlobalConfig
│       ├── utils/src/lib/               ⬜ Vide (structure prête)
│       ├── ui/src/lib/                  ⬜ Vide (structure prête)
│       └── design-system/src/lib/       ⬜ Vide (structure prête)
│
├── eslint.config.mjs                    ← Module boundaries configurées
├── nx.json
├── tsconfig.base.json
└── package.json
```

### 5.2 Inventaire des libs (24 projets)

| Couche | Lib | Tags Nx | Statut |
|--------|-----|---------|--------|
| **app** | `cms-admin` | `scope:app, type:app` | ✅ Shell fonctionnel |
| **core** | `core-auth` | `scope:core` | ✅ WSO2 IS OIDC |
| | `core-http` | `scope:core` | ✅ ApiClient + interceptors |
| | `core-logger` | `scope:core` | ✅ LoggerService configurable |
| | `core-config` | `scope:core` | ⬜ À construire |
| | `core-i18n` | `scope:core` | ⬜ À construire |
| **shared** | `shared-models` | `scope:shared, type:models` | ✅ Tous les modèles |
| | `shared-utils` | `scope:shared, type:util` | ⬜ Structure prête |
| | `shared-ui` | `scope:shared, type:ui` | ⬜ Structure prête |
| | `shared-design-system` | `scope:shared, type:ui` | ⬜ Structure prête |
| **domain** | `domain-site` | `scope:domain, domain:site, type:domain-logic` | ✅ Pattern de référence |
| | `domain-page` | `scope:domain, domain:page, type:domain-logic` | ⬜ À répliquer |
| | `domain-api-connector` | `scope:domain, domain:api-connector, type:domain-logic` | ⬜ À répliquer |
| | `domain-mfe-registry` | `scope:domain, domain:mfe-registry, type:domain-logic` | ⬜ À répliquer |
| | `domain-iam` | `scope:domain, domain:iam, type:domain-logic` | ⬜ À répliquer |
| | `domain-versioning` | `scope:domain, domain:versioning, type:domain-logic` | ⬜ À répliquer |
| | `domain-admin` | `scope:domain, domain:admin, type:domain-logic` | ⬜ À répliquer |
| **features** | `feature-site` | `scope:feature, domain:site, type:feature` | ✅ 3 pages fonctionnelles |
| | `feature-page-builder` | `scope:feature, domain:page, type:feature` | ⬜ Placeholder |
| | `feature-api-connector` | `scope:feature, domain:api-connector, type:feature` | ⬜ Placeholder |
| | `feature-mfe-registry` | `scope:feature, domain:mfe-registry, type:feature` | ⬜ Placeholder |
| | `feature-iam` | `scope:feature, domain:iam, type:feature` | ⬜ Placeholder |
| | `feature-versioning` | `scope:feature, domain:versioning, type:feature` | ⬜ Placeholder |
| | `feature-admin` | `scope:feature, domain:admin, type:feature` | ⬜ Placeholder |

---

## 6. Module Boundaries

### 6.1 Règles d'import

```
┌───────────────────────────────────────────────────────────┐
│                    RÈGLES D'IMPORT                         │
├───────────────────────────────────────────────────────────┤
│                                                            │
│  app     ──►  feature ✅  domain ✅  ui ✅  models ✅  utils ✅  │
│  feature ──►  domain ✅  shared ✅  core ✅               │
│  domain  ──►  shared ✅  core ✅                          │
│  core    ──►  shared ✅                                   │
│  ui      ──►  models ✅  utils ✅                         │
│  models  ──►  utils ✅                                    │
│  utils   ──►  (rien — leaf absolu)                        │
│                                                            │
│  INTERDIT :                                                │
│  ✗ domain → feature                                        │
│  ✗ domain → autre domain (isolation stricte)               │
│  ✗ core → feature                                          │
│  ✗ core → domain                                           │
│  ✗ shared/models → core, domain, feature                   │
│  ✗ shared/utils → quoi que ce soit                         │
│                                                            │
└───────────────────────────────────────────────────────────┘
```

### 6.2 Matrice d'import

| Source ↓ / Target → | feature | domain | core | ui | models | utils |
|---|---|---|---|---|---|---|
| **app** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **feature** | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| **domain** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **core** | ❌ | ❌ | — | ❌ | ✅ | ✅ |
| **ui** | ❌ | ❌ | ❌ | — | ✅ | ✅ |
| **models** | ❌ | ❌ | ❌ | ❌ | — | ✅ |
| **utils** | ❌ | ❌ | ❌ | ❌ | ❌ | — |

### 6.3 Isolation des domaines

Chaque domaine est isolé des autres. Aucun import croisé entre `domain:site` et `domain:page`. La communication inter-domaine se fait **exclusivement** au niveau feature ou via le shell applicatif.

### 6.4 Enforcement

Configuré dans `eslint.config.mjs` via `@nx/enforce-module-boundaries`. Toute violation est détectée au `lint` et bloque le CI. **24/24 projets lint clean** ✅.

---

## 7. Core — Services d'infrastructure

### 7.1 core/http

**Rôle** : Client HTTP générique typé, gestion globale des erreurs et du loading.

```
core/http/
├── models/
│   ├── api-response.model.ts        ← ApiResponse<T>, ApiPaginatedResponse<T>
│   ├── api-error.model.ts           ← ApiError, ApiHttpError (classe avec helpers)
│   └── http-request-options.model.ts ← HttpRequestOptions (skipLoading, skipErrorHandling)
├── services/
│   ├── api-client.service.ts        ← GET, POST, PUT, PATCH, DELETE typés
│   └── loading.service.ts           ← Signal-based loading tracker
├── interceptors/
│   ├── error.interceptor.ts         ← Parse les erreurs, crée ApiHttpError
│   └── loading.interceptor.ts       ← Start/stop LoadingService automatiquement
└── providers/
    └── provide-http-core.ts         ← provideHttpCore() — configure tout
```

**API publique** :

```typescript
// Utilisation dans un service domain
const api = inject(ApiClientService);

// Requête standard (loading + error handling auto)
api.get<Site[]>('/api/sites');

// Skip le loading (requêtes background)
api.get<Site[]>('/api/sites', { skipLoading: true });

// Skip l'error handling (gestion manuelle)
api.post<Site>('/api/sites', payload, { skipErrorHandling: true });
```

**Pattern interceptor** : Angular v21 functional interceptors avec `HttpContextToken` pour contrôle par requête.

### 7.2 core/logger

**Rôle** : Logging structuré, configurable par environnement.

```
core/logger/
├── models/
│   ├── log-level.model.ts           ← enum LogLevel (Debug, Info, Warn, Error, Off)
│   ├── log-entry.model.ts           ← LogEntry (level, message, context, data, timestamp)
│   └── logger-config.model.ts       ← LoggerConfig, LOGGER_CONFIG injection token
├── services/
│   └── logger.service.ts            ← LoggerService (signal-based buffer, console output)
└── providers/
    └── provide-logger.ts            ← provideLogger({ minLevel, enableConsole })
```

**API publique** :

```typescript
const logger = inject(LoggerService);

logger.debug('Site chargé', 'SiteStore', { id: '123' });
logger.info('Navigation vers Sites', 'Router');
logger.warn('Token expire bientôt', 'AuthService');
logger.error('Échec API', 'SiteApiService', error);

// Buffer consultable (pour debug UI ou reporting)
logger.recentLogs(); // Signal<LogEntry[]> — dernières 100 entrées
```

**Configuration** :

```typescript
// Dev — tout afficher
provideLogger({ minLevel: LogLevel.Debug, enableConsole: true })

// Prod — warn+ seulement, console off
provideLogger({ minLevel: LogLevel.Warn, enableConsole: false })
```

### 7.3 core/auth

**Rôle** : Authentification WSO2 IS via OIDC (Authorization Code + PKCE).

```
core/auth/
├── models/
│   ├── auth-state.model.ts          ← AuthState, INITIAL_AUTH_STATE
│   ├── auth-user.model.ts           ← AuthUser (sub, email, displayName, roles, permissions)
│   └── auth-config.model.ts         ← SfAuthConfig, SF_AUTH_CONFIG token
├── services/
│   └── auth.service.ts              ← AuthService (signal-based, wraps angular-auth-oidc-client)
├── guards/
│   ├── auth.guard.ts                ← authGuard (redirige vers login si non authentifié)
│   └── role.guard.ts                ← roleGuard (vérifie permissions/rôles via route data)
├── interceptors/
│   └── token.interceptor.ts         ← Injecte Bearer token sur les API sécurisées
└── providers/
    └── provide-auth.ts              ← provideAuth(config) — configure OIDC + auto-init
```

**API publique** :

```typescript
const auth = inject(AuthService);

// Signals
auth.isAuthenticated();  // Signal<boolean>
auth.currentUser();      // Signal<AuthUser | null>
auth.accessToken();      // Signal<string | null>
auth.userSub();          // Signal<string | null>
auth.isLoading();        // Signal<boolean>

// Actions
auth.login();            // Redirect vers WSO2 IS
auth.logout();           // Déconnexion
auth.refreshToken();     // Force refresh

// Vérification permissions
auth.hasPermission('site:write');  // boolean
auth.hasRole('platform_admin');    // boolean
```

**Guards** :

```typescript
// Protection simple (authentifié ?)
{ path: 'sites', canActivate: [authGuard], ... }

// Protection par rôle/permission
{
  path: 'admin',
  canActivate: [roleGuard],
  data: { permissions: ['config:write'], roles: ['platform_admin'] },
  ...
}
```

**Configuration** :

```typescript
...provideAuth({
  issuerUrl: 'https://is.company.com/oauth2/token',
  clientId: 'site-factory-cms',
  redirectUri: window.location.origin,
  postLogoutRedirectUri: window.location.origin,
  scopes: 'openid profile email',
  securedApiUrls: ['https://api.company.com'],
})
```

**Dépendance externe** : `angular-auth-oidc-client` (lib OIDC certifiée).

### 7.4 Intégration dans app.config.ts

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes, withComponentInputBinding()),

    // HTTP — mock interceptor en dev, puis loading + error
    provideHttpClient(
      withInterceptors([
        ...(isDevMode() ? [mockApiInterceptor] : []),
        loadingInterceptor,
        errorInterceptor,
      ])
    ),

    // Logger
    provideLogger({
      minLevel: isDevMode() ? LogLevel.Debug : LogLevel.Warn,
      enableConsole: isDevMode(),
    }),

    // Auth WSO2 IS
    ...provideAuth({ ... }),
  ],
};
```

---

## 8. Domain — Pattern SignalStore

### 8.1 Pattern de référence : domain/site

Chaque domaine suit le même pattern à 3 couches :

```
domain/{name}/
├── models/
│   ├── {name}-state.model.ts    ← State interface + INITIAL_STATE
│   └── {name}-filters.model.ts  ← Filtres spécifiques au domaine
├── services/
│   └── {name}-api.service.ts    ← Appels HTTP via ApiClientService
└── store/
    └── {name}.store.ts          ← NgRx SignalStore
```

### 8.2 Structure du Store

```typescript
export const SiteStore = signalStore(
  { providedIn: 'root' },

  // State — état initial
  withState<SiteState>(INITIAL_SITE_STATE),

  // Computed — dérivés réactifs
  withComputed(state => ({
    totalPages: computed(() => Math.ceil(state.total() / state.pageSize())),
    hasSites: computed(() => state.sites().length > 0),
    hasError: computed(() => state.error() !== null),
    siteCount: computed(() => state.sites().length),
  })),

  // Methods — actions (rxMethod pour l'asynchrone, fonctions pour le synchrone)
  withMethods((store, siteApi = inject(SiteApiService)) => ({
    loadSites: rxMethod<SiteFilters | void>(...),
    loadSiteById: rxMethod<string>(...),
    createSite: rxMethod<{ payload; onSuccess? }>(...),
    updateSite: rxMethod<{ id; payload; onSuccess? }>(...),
    deleteSite: rxMethod<{ id; onSuccess? }>(...),
    selectSite(site: Site | null): void { ... },
    clearError(): void { ... },
    reset(): void { ... },
  })),
);
```

### 8.3 Conventions rxMethod

Chaque `rxMethod` asynchrone suit le même pattern :

```
tap → patchState({ isLoading: true, error: null })
switchMap → apiService.method().pipe(
  tap → patchState({ data, isLoading: false })
  catchError → patchState({ isLoading: false, error })
)
```

Callbacks optionnels (`onSuccess`) pour la navigation post-action.

### 8.4 Service API

```typescript
@Injectable({ providedIn: 'root' })
export class SiteApiService {
  private readonly api = inject(ApiClientService);
  private readonly baseUrl = '/api/sites';

  getAll(filters?: SiteFilters): Observable<ApiPaginatedResponse<Site>> { ... }
  getById(id: string): Observable<ApiResponse<Site>> { ... }
  create(payload: CreateSitePayload): Observable<ApiResponse<Site>> { ... }
  update(id: string, payload: UpdateSitePayload): Observable<ApiResponse<Site>> { ... }
  delete(id: string): Observable<ApiResponse<void>> { ... }
}
```

Convention : le service API ne contient aucune logique métier, seulement la transformation requête/réponse.

---

## 9. Feature — Pattern écran fonctionnel

### 9.1 Pattern de référence : feature-site

```
features/site/
├── pages/
│   ├── site-list/
│   │   └── site-list.component.ts       ← Grille de sites, recherche, suppression
│   ├── site-detail/
│   │   └── site-detail.component.ts     ← Fiche détaillée d'un site
│   └── site-create/
│       └── site-create.component.ts     ← Formulaire de création
├── routes.ts                            ← SITE_ROUTES
└── index.ts                             ← export { SITE_ROUTES }
```

### 9.2 Routes

```typescript
export const SITE_ROUTES: Routes = [
  { path: '',    loadComponent: () => import('./pages/site-list/...') },
  { path: 'new', loadComponent: () => import('./pages/site-create/...') },
  { path: ':id', loadComponent: () => import('./pages/site-detail/...') },
];
```

Convention : `loadComponent` avec lazy import, jamais d'import statique des pages.

### 9.3 Consommation du Store dans un composant

```typescript
@Component({ ... })
export class SiteListComponent implements OnInit {
  readonly store = inject(SiteStore);

  ngOnInit() {
    this.store.loadSites();
  }
}
```

```html
@if (store.isLoading()) { <loader /> }
@for (site of store.sites(); track site.id) { <card /> }
@if (store.hasError()) { <error /> }
```

Convention : les composants feature sont des **smart components** — ils injectent le store, appellent ses méthodes, et lient leurs templates aux signals du store. Aucune logique métier dans le composant.

### 9.4 Input depuis la route

Angular v21 + `withComponentInputBinding()` permet d'injecter les paramètres de route comme inputs :

```typescript
readonly id = input.required<string>();  // ← injecté depuis :id dans la route

ngOnInit() {
  this.store.loadSiteById(this.id());
}
```

---

## 10. Modèle de Données

### 10.1 Principes de conception

| Principe | Détail |
|----------|--------|
| **Multi-tenant natif** | `tenant_id` présent dès le départ sur `Site` |
| **Configuration en JSON typé** | JSONB validé contre JSON Schema |
| **Références WSO2, pas duplication** | `wso2_user_sub`, `wso2_api_id` comme clés de référence |
| **Versioning par snapshot** | Snapshot JSON complet de l'entité à chaque version |
| **Soft delete systématique** | `deleted_at TIMESTAMP NULL` partout |

### 10.2 Entités par domaine

#### D1 — Site Management

**Tenant**

| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| `id` | UUID | PK | Identifiant unique |
| `name` | VARCHAR | NOT NULL | Nom affiché |
| `code` | VARCHAR | UNIQUE | Identifiant court (`axa-fr`) |
| `description` | TEXT | NULL | Description libre |
| `config` | JSONB | NULL | Configuration spécifique |
| `is_active` | BOOLEAN | DEFAULT TRUE | Actif ou désactivé |
| `created_at` | TIMESTAMP | NOT NULL | Date de création |
| `updated_at` | TIMESTAMP | NOT NULL | Dernière modification |
| `deleted_at` | TIMESTAMP | NULL | Soft delete |

**Site**

| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| `id` | UUID | PK | Identifiant unique |
| `tenant_id` | UUID | FK → Tenant | Tenant propriétaire |
| `name` | VARCHAR | NOT NULL | Nom affiché |
| `slug` | VARCHAR | UNIQUE | Identifiant URL |
| `domain` | VARCHAR | NULL | Domaine cible déployé |
| `description` | TEXT | NULL | Description libre |
| `theme_id` | UUID | FK → Theme | Thème Design System |
| `default_locale` | VARCHAR | DEFAULT `fr` | Langue par défaut |
| `status` | ENUM | NOT NULL | `draft` \| `active` \| `archived` |
| `config` | JSONB | NULL | Configuration spécifique |
| `created_by` | VARCHAR | NOT NULL | `wso2_user_sub` |
| `created_at` | TIMESTAMP | NOT NULL | Date de création |
| `updated_at` | TIMESTAMP | NOT NULL | Dernière modification |
| `deleted_at` | TIMESTAMP | NULL | Soft delete |

**Page**

| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| `id` | UUID | PK | Identifiant unique |
| `site_id` | UUID | FK → Site | Site parent |
| `parent_id` | UUID | FK → Page, NULL | Page parente (arborescence) |
| `layout_id` | UUID | FK → Layout | Layout utilisé |
| `title` | VARCHAR | NOT NULL | Titre de la page |
| `slug` | VARCHAR | NOT NULL | Segment d'URL |
| `path` | VARCHAR | COMPUTED | Chemin complet calculé |
| `position` | INT | DEFAULT 0 | Ordre dans le parent |
| `status` | ENUM | NOT NULL | `draft` \| `published` \| `archived` |
| `seo_config` | JSONB | NULL | Meta SEO |
| `config` | JSONB | NULL | Configuration spécifique |
| `created_by` | VARCHAR | NOT NULL | `wso2_user_sub` |
| `created_at` | TIMESTAMP | NOT NULL | Date de création |
| `updated_at` | TIMESTAMP | NOT NULL | Dernière modification |
| `deleted_at` | TIMESTAMP | NULL | Soft delete |

Contrainte unique : `(site_id, path)`

#### D2 — Page & Layout Builder

**Layout**

| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| `id` | UUID | PK | Identifiant unique |
| `name` | VARCHAR | NOT NULL | Nom affiché |
| `description` | TEXT | NULL | Description libre |
| `zones` | JSONB | NOT NULL | Définition des zones |
| `is_system` | BOOLEAN | DEFAULT FALSE | Layout non supprimable |
| `created_at` | TIMESTAMP | NOT NULL | Date de création |
| `updated_at` | TIMESTAMP | NOT NULL | Dernière modification |

**BlockDefinition**

| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| `id` | UUID | PK | Identifiant unique |
| `name` | VARCHAR | NOT NULL | Nom affiché |
| `code` | VARCHAR | UNIQUE | Code technique |
| `description` | TEXT | NULL | Description libre |
| `category` | VARCHAR | NOT NULL | Catégorie |
| `source_type` | ENUM | NOT NULL | `ds_component` \| `micro_frontend` |
| `mfe_id` | UUID | FK → MFE, NULL | Référence MFE |
| `props_schema` | JSONB | NOT NULL | JSON Schema des props |
| `default_props` | JSONB | NULL | Valeurs par défaut |
| `thumbnail_url` | VARCHAR | NULL | Vignette |
| `is_active` | BOOLEAN | DEFAULT TRUE | Actif dans le catalogue |
| `created_at` | TIMESTAMP | NOT NULL | Date de création |
| `updated_at` | TIMESTAMP | NOT NULL | Dernière modification |

**BlockInstance**

| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| `id` | UUID | PK | Identifiant unique |
| `page_id` | UUID | FK → Page | Page contenante |
| `block_def_id` | UUID | FK → BlockDefinition | Type de bloc |
| `zone_key` | VARCHAR | NOT NULL | Zone du layout |
| `position` | INT | DEFAULT 0 | Ordre dans la zone |
| `props` | JSONB | NOT NULL | Valeurs des props |
| `api_binding` | JSONB | NULL | Liaison API d'expérience |
| `visibility` | JSONB | NULL | Règles d'affichage (cible) |
| `created_at` | TIMESTAMP | NOT NULL | Date de création |
| `updated_at` | TIMESTAMP | NOT NULL | Dernière modification |

#### D3 — API Connector (WSO2 APIM)

**ApiReference** (cache local)

| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| `id` | UUID | PK | Identifiant unique |
| `wso2_api_id` | VARCHAR | UNIQUE | ID dans WSO2 APIM |
| `name` | VARCHAR | NOT NULL | Nom de l'API |
| `version` | VARCHAR | NOT NULL | Version |
| `context_path` | VARCHAR | NOT NULL | Chemin de contexte |
| `description` | TEXT | NULL | Description depuis WSO2 |
| `tags` | VARCHAR[] | NULL | Tags métier |
| `oas_schema` | JSONB | NULL | Contrat OpenAPI en cache |
| `environments` | JSONB | NOT NULL | URLs par environnement |
| `last_synced_at` | TIMESTAMP | NOT NULL | Dernière synchronisation |
| `is_available` | BOOLEAN | DEFAULT TRUE | Disponibilité |
| `created_at` | TIMESTAMP | NOT NULL | Date de création |
| `updated_at` | TIMESTAMP | NOT NULL | Dernière modification |

#### D4 — Micro-Frontend Registry

**MicroFrontend**

| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| `id` | UUID | PK | Identifiant unique |
| `name` | VARCHAR | NOT NULL | Nom affiché |
| `code` | VARCHAR | UNIQUE | Code technique |
| `description` | TEXT | NULL | Description libre |
| `remote_name` | VARCHAR | NOT NULL | Nom Module Federation |
| `exposed_module` | VARCHAR | NOT NULL | Module exposé |
| `current_version` | VARCHAR | NOT NULL | Version courante |
| `is_active` | BOOLEAN | DEFAULT TRUE | Actif |
| `created_at` | TIMESTAMP | NOT NULL | Date de création |
| `updated_at` | TIMESTAMP | NOT NULL | Dernière modification |

**MfeDeployment**

| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| `id` | UUID | PK | Identifiant unique |
| `mfe_id` | UUID | FK → MFE | MFE parent |
| `version` | VARCHAR | NOT NULL | Version déployée |
| `remote_url` | VARCHAR | NOT NULL | URL du `remoteEntry.js` |
| `environment` | ENUM | NOT NULL | `dev` \| `staging` \| `prod` |
| `integrity_hash` | VARCHAR | NULL | Hash SRI (cible) |
| `deployed_at` | TIMESTAMP | NOT NULL | Date de déploiement |
| `deployed_by` | VARCHAR | NOT NULL | `wso2_user_sub` |
| `is_active` | BOOLEAN | DEFAULT TRUE | Déploiement actif |

#### D5 — IAM & Gouvernance

**UserProfile**

| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| `id` | UUID | PK | Identifiant unique |
| `wso2_sub` | VARCHAR | UNIQUE | Subject ID OIDC |
| `email` | VARCHAR | NOT NULL | Email |
| `display_name` | VARCHAR | NOT NULL | Nom affiché |
| `last_login_at` | TIMESTAMP | NULL | Dernière connexion |
| `is_active` | BOOLEAN | DEFAULT TRUE | Compte actif |
| `created_at` | TIMESTAMP | NOT NULL | Date de création |
| `updated_at` | TIMESTAMP | NOT NULL | Dernière modification |

**Role**

| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| `id` | UUID | PK | Identifiant unique |
| `name` | VARCHAR | UNIQUE | Identifiant du rôle |
| `description` | TEXT | NULL | Description |
| `permissions` | VARCHAR[] | NOT NULL | Liste des permissions |
| `is_system` | BOOLEAN | DEFAULT FALSE | Rôle non supprimable |
| `created_at` | TIMESTAMP | NOT NULL | Date de création |

Rôles systèmes MVP : `platform_admin`, `site_admin`, `site_editor`, `site_viewer`

**UserSiteRole**

| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| `id` | UUID | PK | Identifiant unique |
| `user_id` | UUID | FK → UserProfile | Utilisateur |
| `site_id` | UUID | FK → Site, NULL | Site cible (NULL = global) |
| `role_id` | UUID | FK → Role | Rôle attribué |
| `granted_by` | UUID | FK → UserProfile | Qui a accordé |
| `created_at` | TIMESTAMP | NOT NULL | Date d'attribution |

Contrainte unique : `(user_id, site_id, role_id)`

**AuditLog** (append-only)

| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| `id` | UUID | PK | Identifiant unique |
| `user_id` | UUID | FK → UserProfile | Auteur |
| `action` | VARCHAR | NOT NULL | Action effectuée |
| `entity_type` | VARCHAR | NOT NULL | Type d'entité |
| `entity_id` | UUID | NOT NULL | ID de l'entité |
| `site_id` | UUID | NULL | Site (filtrage) |
| `payload` | JSONB | NULL | Détail du changement |
| `ip_address` | VARCHAR | NULL | Adresse IP |
| `created_at` | TIMESTAMP | NOT NULL | Horodatage |

#### D6 — Versioning & Workflow

**EntityVersion** (polymorphique)

| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| `id` | UUID | PK | Identifiant unique |
| `entity_type` | VARCHAR | NOT NULL | Type d'entité |
| `entity_id` | UUID | NOT NULL | ID de l'entité versionnée |
| `version_number` | INT | NOT NULL | Numéro auto-incrémenté |
| `status` | ENUM | NOT NULL | `draft` \| `submitted` \| `approved` \| `published` \| `rejected` |
| `snapshot` | JSONB | NOT NULL | État complet de l'entité |
| `change_summary` | TEXT | NULL | Description du changement |
| `created_by` | UUID | FK → UserProfile | Auteur |
| `created_at` | TIMESTAMP | NOT NULL | Date de création |

Contrainte unique : `(entity_type, entity_id, version_number)`

**WorkflowTransition**

| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| `id` | UUID | PK | Identifiant unique |
| `version_id` | UUID | FK → EntityVersion | Version concernée |
| `from_status` | ENUM | NOT NULL | Statut de départ |
| `to_status` | ENUM | NOT NULL | Statut d'arrivée |
| `transitioned_by` | UUID | FK → UserProfile | Auteur |
| `comment` | TEXT | NULL | Commentaire |
| `created_at` | TIMESTAMP | NOT NULL | Horodatage |

#### D7 — Administration

**Theme**

| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| `id` | UUID | PK | Identifiant unique |
| `name` | VARCHAR | NOT NULL | Nom affiché |
| `code` | VARCHAR | UNIQUE | Code technique |
| `ds_tokens` | JSONB | NOT NULL | Design tokens |
| `is_default` | BOOLEAN | DEFAULT FALSE | Thème par défaut |
| `created_at` | TIMESTAMP | NOT NULL | Date de création |
| `updated_at` | TIMESTAMP | NOT NULL | Dernière modification |

**Translation**

| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| `id` | UUID | PK | Identifiant unique |
| `locale` | VARCHAR | NOT NULL | Langue |
| `namespace` | VARCHAR | NOT NULL | Périmètre |
| `key` | VARCHAR | NOT NULL | Clé de traduction |
| `value` | TEXT | NOT NULL | Valeur traduite |
| `created_at` | TIMESTAMP | NOT NULL | Date de création |
| `updated_at` | TIMESTAMP | NOT NULL | Dernière modification |

Contrainte unique : `(locale, namespace, key)`

**GlobalConfig**

| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| `id` | UUID | PK | Identifiant unique |
| `key` | VARCHAR | UNIQUE | Clé de configuration |
| `value` | JSONB | NOT NULL | Valeur |
| `description` | TEXT | NULL | Description |
| `updated_by` | UUID | FK → UserProfile | Dernier modificateur |
| `updated_at` | TIMESTAMP | NOT NULL | Dernière modification |

---

## 11. Schéma Relationnel Global

```
Tenant ──1:N──► Site ──1:N──► Page ──1:N──► BlockInstance
                  │              │              │
                  │              │              ├──► BlockDefinition
                  │              │              │         │
                  │              │              │         └──► MicroFrontend ──1:N──► MfeDeployment
                  │              │              │
                  │              │              └──► ApiReference (via api_binding JSONB)
                  │              │
                  │              └──► Layout
                  │
                  ├──► Theme
                  │
                  └──► UserSiteRole ──► UserProfile
                                        ──► Role

EntityVersion ──► (toute entité via entity_type + entity_id)
     │
     └──1:N──► WorkflowTransition

AuditLog ──► UserProfile (auteur)
         ──► toute entité (entity_type + entity_id)

Translation ──► scoping par namespace (global ou site)
GlobalConfig ──► clé/valeur plateforme
```

---

## 12. Index Recommandés

| Table | Index | Justification |
|-------|-------|---------------|
| `Site` | `(tenant_id, status)` | Lister les sites actifs d'un tenant |
| `Page` | `(site_id, path)` UNIQUE | Résolution de route |
| `Page` | `(site_id, parent_id, position)` | Arborescence ordonnée |
| `BlockInstance` | `(page_id, zone_key, position)` | Rendu ordonné des blocs |
| `ApiReference` | `(wso2_api_id)` UNIQUE | Lookup par ID WSO2 |
| `MfeDeployment` | `(mfe_id, environment, is_active)` | Résolution du remote actif |
| `UserSiteRole` | `(user_id, site_id)` | Vérification des permissions |
| `EntityVersion` | `(entity_type, entity_id, version_number)` | Historique d'une entité |
| `AuditLog` | `(entity_type, entity_id)` | Audit d'une entité |
| `AuditLog` | `(user_id, created_at)` | Audit par utilisateur |
| `Translation` | `(locale, namespace)` | Chargement des traductions |

---

## 13. Conventions

| Convention | Règle |
|------------|-------|
| **Identifiants** | UUID v4 partout |
| **Horodatage** | UTC, format ISO 8601 |
| **Soft delete** | `deleted_at TIMESTAMP NULL` — jamais de `DELETE` physique |
| **JSONB** | Toujours validé contre un JSON Schema |
| **Références WSO2** | Préfixe `wso2_` pour identifier les champs externes |
| **Enums** | Stockés en `VARCHAR` avec contrainte `CHECK` côté DB |
| **Nommage tables** | `snake_case`, singulier |
| **Nommage colonnes** | `snake_case` |
| **Nommage libs Nx** | `{couche}-{domaine}` (ex: `domain-site`, `feature-admin`) |
| **Tags Nx** | `scope:{couche}`, `type:{type}`, `domain:{domaine}` |
| **Prefix composants** | `sf-` (Site Factory) |
| **Barrel exports** | Chaque lib expose son API publique via `index.ts` |
| **Composants** | Standalone, pas de `NgModule` |
| **Interceptors** | Functional (`HttpInterceptorFn`), jamais class-based |
| **State management** | NgRx SignalStore, `rxMethod` pour l'asynchrone |
| **Providers** | `provideXxx()` function pattern |
| **Types exports** | `export type` pour les interfaces (isolatedModules) |
| **Templates** | Angular v21 `@if`, `@for`, `@defer` — pas de `*ngIf`/`*ngFor` |
| **Route params** | `input.required<T>()` via `withComponentInputBinding()` |

---

## 14. Risques et Mitigations

| Risque | Impact | Mitigation |
|--------|--------|------------|
| **JSONB non contrôlé** | Données incohérentes, bugs front | JSON Schema obligatoire. Validation backend + Angular. |
| **Versioning polymorphique — volume** | Table `EntityVersion` croît vite | Partitionnement par `entity_type`, politique de rétention, archivage. |
| **Couplage WSO2** | Changement d'ID scheme = impact cascade | Champs WSO2 toujours derrière un adapter. |
| **Dénormalisation `Page.path`** | Désynchronisation arborescence/path | Recalcul via trigger DB ou service dédié. |
| **`AuditLog` volumétrie** | Croissance linéaire continue | Partitionnement par date, archivage à froid 12 mois. |
| **Node v24 + Nx** | Compatibilité (Node 24 est très récent) | Surveiller les issues Nx, fallback sur Node 22 LTS si nécessaire. |
| **DS vanilla JS/SCSS** | Intégration Angular non native | Wrappers Angular dans `shared/design-system`, migration progressive. |
| **core/http ↔ core/logger** | Les deux sont scope:core, pas d'import croisé | `console.error` dans l'interceptor pour le moment. Résolution via LogHandler injectable (documenté). |
| **Mock interceptor en prod** | Fausses données servies | Protégé par `isDevMode()` dans app.config.ts. Jamais bundlé en prod. |
| **angular-auth-oidc-client** | Dépendance externe pour l'auth | Lib mature, certifiée OpenID. AuthService wrapper = possibilité de changer sans impact. |

---

## 15. Roadmap Technique

### Phase 1 — Fondations (✅ en cours)

- [x] Création du workspace Nx
- [x] Scaffold des 24 libs (4 couches)
- [x] Nettoyage et restructuration interne
- [x] Modèles TypeScript (shared/models)
- [x] Module boundaries ESLint — **24/24 lint clean**
- [x] Shell applicatif (layout sidebar + header + content)
- [x] Routing avec lazy loading des 7 features
- [x] core/http (ApiClientService, interceptors, LoadingService)
- [x] core/logger (LoggerService, configurable par env)
- [x] core/auth (WSO2 IS OIDC, guards, token interceptor)
- [x] domain/site — SignalStore pattern de référence
- [x] feature/site — Premier écran fonctionnel (list, detail, create)
- [x] Mock interceptor pour le développement
- [ ] core/config (environnements, base URL)
- [ ] core/i18n (traductions)
- [ ] Répliquer le pattern store pour les 6 autres domaines
- [ ] Intégration Design System

### Phase 2 — Tier 1 MVP (D1, D4, D5)

- [ ] Site Management complet (CRUD, config, arborescence pages)
- [ ] MFE Registry (registre, chargement dynamique Module Federation)
- [ ] IAM (auth WSO2 live, RBAC, audit)
- [ ] Backend API réel (remplacer mocks)

### Phase 3 — Tier 2 MVP (D2, D3)

- [ ] Page Builder (layouts, blocs, preview)
- [ ] API Connector WSO2 APIM (catalogue, binding OAS)

### Phase 4 — Tier 3 MVP (D6, D7)

- [ ] Versioning (snapshots, statuts, diff, rollback)
- [ ] Administration (dashboard, i18n, SEO, config)

### Phase 5 — Cible

- [ ] Drag & drop page builder
- [ ] Variantes par tenant
- [ ] ABAC
- [ ] Branching de configurations
- [ ] Analytics intégrées
- [ ] Backup/restauration

---

## Annexe — Dépendances

| Package | Version | Rôle |
|---------|---------|------|
| `@angular/core` | v21 | Framework |
| `@nx/angular` | latest | Monorepo tooling |
| `@ngrx/signals` | latest | State management (SignalStore) |
| `angular-auth-oidc-client` | latest | OIDC/OAuth2 |
| `@angular-architects/module-federation` | latest | MFE |
| `zone.js` | latest | Zone.js (Angular change detection) |
| `rxjs` | latest | Reactive programming |

---

*Document généré dans le cadre du projet Site Factory CMS — Architecture Angular v21 + Nx Monorepo*  
*Sessions de travail : 18-19 février 2026*