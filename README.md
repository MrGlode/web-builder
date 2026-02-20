# Site Factory CMS — Document d'Architecture

> **Version** : 4.0  
> **Date** : 19 février 2026  
> **Statut** : Phase 1 (Fondations) — quasi complète (22/26 tâches)  
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

| Priorité | Domaine | Description |
|----------|---------|-------------|
| **Tier 1** | D1 — Site Management | CRUD sites, configuration, multi-tenant |
| **Tier 1** | D4 — MFE Registry | Registre de micro-frontends, déploiements |
| **Tier 1** | D5 — IAM & Gouvernance | Auth WSO2, RBAC, audit log |
| **Tier 2** | D2 — Page & Layout Builder | Arborescence pages, layouts, blocs |
| **Tier 2** | D3 — API Connector | Catalogue WSO2 APIM, binding OAS |
| **Tier 3** | D6 — Versioning & Workflow | Snapshots, statuts, diff, rollback |
| **Tier 3** | D7 — Administration | Dashboard, themes, i18n, config globale |

### 2.2 Détail par domaine (MVP vs Cible)

#### D1 — Site Management

| MVP | Cible |
|-----|-------|
| CRUD sites (nom, slug, domaine, thème) | Sites génériques multi-clients vs sites spécifiques |
| Configuration par site (JSONB) | Variantes par tenant (override de config) |
| Arborescence de pages par site | Preview / mode brouillon avec URL temporaire |
| Statuts : brouillon, actif, archivé | Duplication de site (clone complet) |

#### D2 — Page & Layout Builder

| MVP | Cible |
|-----|-------|
| Layouts prédéfinis (zones nommées) | Éditeur visuel de layouts (drag & drop zones) |
| Arborescence de pages (parent/enfant) | Drag & drop des blocs dans les zones |
| Blocs configurables (props JSON Schema) | Preview temps réel (iframe) |
| Assignation d'un layout à une page | Blocs conditionnels (règles d'affichage) |

#### D3 — API Connector (WSO2 APIM)

| MVP | Cible |
|-----|-------|
| Catalogue read-only depuis WSO2 APIM | Binding automatique via OAS (sélection d'opérations) |
| Cache local des métadonnées API | Sandbox d'essai (try-it depuis le CMS) |
| Synchronisation manuelle (bouton refresh) | Synchronisation automatique (webhook/polling) |
| Référence API dans les blocs (JSONB) | Monitoring d'usage API par site |

#### D4 — MFE Registry

| MVP | Cible |
|-----|-------|
| Registre des micro-frontends (nom, remote, module) | Chargement dynamique via Module Federation |
| Versioning des MFE (version courante) | A/B testing (multiple versions actives) |
| Déploiements par environnement (dev, staging, prod) | Rollback automatique |
| URL du `remoteEntry.js` par environnement | Intégrité SRI (Subresource Integrity) |

#### D5 — IAM & Gouvernance

| MVP | Cible |
|-----|-------|
| Intégration WSO2 IS (OIDC/OAuth2) | ABAC : règles contextuelles |
| RBAC : Admin plateforme, Admin site, Éditeur, Lecteur | Workflows de validation multi-niveaux |
| Périmètre par site (accès restreint) | Délégation de droits |
| Audit log (qui, quoi, quand) | SSO cross-sites (CMS → sites générés) |

#### D6 — Versioning & Workflow

| MVP | Cible |
|-----|-------|
| Versioning des configs site/page (snapshot JSON) | Branching (version future sans impacter prod) |
| Statuts : brouillon → soumis → validé → publié | Merge de configurations |
| Historique consultable avec diff | Workflow configurable par site/tenant |
| Rollback vers version précédente | Notifications (email, webhook) |

#### D7 — Administration & Observabilité

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
| **HTTP Client** | `ApiClientService` wrapper | Abstrait `HttpClient`, intègre les options (skipLoading, skipErrorHandling), préfixe `apiBaseUrl`. |
| **Mocking (dev)** | Mock Interceptor | Simule les API en dev. Delay réaliste (600ms). Activé via `environment.features.enableMocks`. |
| **Configuration** | `AppConfig` + `InjectionToken` | Fichiers d'environnement statiques (dev/staging/prod). Contrat typé unique. Migration transparente vers JSON externe. |
| **i18n** | Signal-based `TranslationService` | JSON statique au MVP, migration API transparente. Pas de dépendance `@ngx-translate`. |
| **moduleResolution** | `"bundler"` | Obligatoire pour Angular v21 + NgRx — les packages utilisent le champ `exports` en package.json. |

---

## 4. Architecture en Couches

```
┌─────────────────────────────────────────────────────────┐
│                    SITE FACTORY CMS                      │
├──────────┬──────────┬──────────┬────────────────────────┤
│   Core   │  Domain  │ Features │      Shared            │
├──────────┼──────────┼──────────┼────────────────────────┤
│ Auth ✅  │ Site ✅  │ Site ✅  │ Models ✅ (interfaces) │
│ (WSO2)   │ Page ✅  │ Page Bld │ Utils (helpers)        │
│ HTTP ✅  │ API  ✅  │ API UI   │ UI (dumb components)   │
│ Config ✅│ MFE  ✅  │ MFE UI   │ Design System          │
│ i18n ✅  │ IAM  ✅  │ IAM UI   │ (wrappers Angular)     │
│ Logger ✅│ Vers.✅  │ Vers. UI │                        │
│          │ Admin✅  │ Admin UI │                        │
└──────────┴──────────┴──────────┴────────────────────────┘
                       ✅ = implémenté
```

| Couche | Rôle | Contient | Importe |
|--------|------|----------|---------|
| **Core** | Infrastructure technique partagée | Services, guards, interceptors, providers | core, shared |
| **Domain** | Logique métier pure | Stores (SignalStore), services API, modèles domaine | core, shared |
| **Features** | UI intelligente (pages, containers) | Smart components, routes, pages | domain, core, shared |
| **Shared** | Briques transverses | Modèles, utilitaires, composants dumb, DS | utils (leaf) |

---

## 5. Structure Monorepo Nx

### 5.1 Arborescence

```
site-factory/
├── apps/
│   └── cms-admin/                       ← Application shell
│       └── src/
│           ├── app/
│           │   ├── layout/              ✅ Shell (sidebar + header + content)
│           │   │   ├── shell/
│           │   │   ├── sidebar/
│           │   │   └── header/
│           │   ├── mocks/               ✅ Mock interceptor (dev)
│           │   ├── app.config.ts        ✅ Providers centralisés
│           │   ├── app.routes.ts        ✅ Lazy loading 7 features
│           │   └── app.component.ts
│           ├── environments/            ✅ Configs par env
│           │   ├── environment.ts       ← dev
│           │   ├── environment.staging.ts
│           │   └── environment.prod.ts
│           └── assets/
│               └── i18n/                ✅ Fichiers de traduction
│                   ├── fr.json
│                   └── en.json
│
├── libs/
│   ├── core/                            ← Infrastructure technique
│   │   ├── auth/src/lib/                ✅ IMPLÉMENTÉ
│   │   │   ├── services/                ← AuthService (WSO2 IS OIDC)
│   │   │   ├── guards/                  ← authGuard
│   │   │   ├── interceptors/            ← tokenInterceptor
│   │   │   ├── providers/               ← provideAuth()
│   │   │   └── models/                  ← SfAuthConfig
│   │   │
│   │   ├── http/src/lib/                ✅ IMPLÉMENTÉ
│   │   │   ├── services/                ← ApiClientService (resolveUrl + baseUrl)
│   │   │   ├── interceptors/            ← errorInterceptor, loadingInterceptor
│   │   │   ├── providers/               ← provideHttpCore()
│   │   │   └── models/                  ← ApiResponse, ApiError, HttpRequestOptions
│   │   │
│   │   ├── config/src/lib/              ✅ IMPLÉMENTÉ
│   │   │   ├── models/                  ← AppConfig, EnvironmentName, APP_CONFIG token
│   │   │   └── providers/               ← provideConfig()
│   │   │
│   │   ├── i18n/src/lib/                ✅ IMPLÉMENTÉ
│   │   │   ├── models/                  ← I18nConfig, SupportedLocale, I18N_CONFIG token
│   │   │   ├── services/                ← TranslationService (signal-based)
│   │   │   ├── pipes/                   ← TranslatePipe (standalone, pure)
│   │   │   └── providers/               ← provideI18n()
│   │   │
│   │   └── logger/src/lib/              ✅ IMPLÉMENTÉ
│   │       ├── services/                ← LoggerService
│   │       └── models/                  ← LogLevel, LogEntry
│   │
│   ├── domain/                          ← Logique métier (1 lib / domaine)
│   │   ├── site/src/lib/                ✅ IMPLÉMENTÉ (pattern de référence)
│   │   │   ├── store/                   ← SiteStore (SignalStore + rxMethod)
│   │   │   ├── services/                ← SiteApiService
│   │   │   └── models/                  ← SiteFilters
│   │   │
│   │   ├── page/src/lib/                ✅ IMPLÉMENTÉ
│   │   │   ├── store/                   ← PageStore (tree structure, rootPages, pageTree)
│   │   │   ├── services/                ← PageApiService
│   │   │   └── models/                  ← PageFilters (siteId required)
│   │   │
│   │   ├── api-connector/src/lib/       ✅ IMPLÉMENTÉ
│   │   │   ├── store/                   ← ApiConnectorStore (read-only + syncFromWso2)
│   │   │   ├── services/                ← ApiConnectorService
│   │   │   └── models/                  ← ApiConnectorFilters
│   │   │
│   │   ├── mfe-registry/src/lib/        ✅ IMPLÉMENTÉ
│   │   │   ├── store/                   ← MfeRegistryStore (CRUD + deployments sub-resource)
│   │   │   ├── services/                ← MfeRegistryApiService
│   │   │   └── models/                  ← MfeRegistryFilters
│   │   │
│   │   ├── iam/src/lib/                 ✅ IMPLÉMENTÉ
│   │   │   ├── store/                   ← IamStore (users, roles, assignments) + AuditStore
│   │   │   ├── services/                ← IamApiService, AuditApiService
│   │   │   └── models/                  ← IamFilters, AuditFilters
│   │   │
│   │   ├── versioning/src/lib/          ✅ IMPLÉMENTÉ
│   │   │   ├── store/                   ← VersioningStore (polymorphic + workflow transitions)
│   │   │   ├── services/                ← VersioningApiService
│   │   │   └── models/                  ← VersioningFilters (entityType + entityId required)
│   │   │
│   │   └── admin/src/lib/               ✅ IMPLÉMENTÉ
│   │       ├── store/                   ← AdminStore (themes, translations, globalConfig)
│   │       ├── services/                ← AdminApiService
│   │       └── models/                  ← ThemeFilters, TranslationFilters
│   │
│   ├── features/                        ← UI intelligente (1 lib / domaine)
│   │   ├── site/src/lib/                ✅ IMPLÉMENTÉ (3 écrans fonctionnels)
│   │   │   ├── pages/                   ← SiteListPage, SiteDetailPage, SiteCreatePage
│   │   │   └── routes.ts               ← SITE_ROUTES (lazy)
│   │   │
│   │   ├── page-builder/src/lib/        ⬜ Placeholder
│   │   ├── api-connector/src/lib/       ⬜ Placeholder
│   │   ├── mfe-registry/src/lib/        ⬜ Placeholder
│   │   ├── iam/src/lib/                 ⬜ Placeholder
│   │   ├── versioning/src/lib/          ⬜ Placeholder
│   │   └── admin/src/lib/               ⬜ Placeholder
│   │
│   └── shared/                          ← Briques transverses
│       ├── models/src/lib/              ✅ IMPLÉMENTÉ
│       │   ├── common/                  ← BaseEntity, AuditableEntity, Pagination, Enums
│       │   ├── tenant/                  ← Tenant, CreateTenantPayload
│       │   ├── site/                    ← Site, CreateSitePayload, UpdateSitePayload
│       │   ├── page/                    ← Page, SeoConfig, CreatePagePayload, UpdatePagePayload
│       │   ├── block/                   ← Layout, BlockDefinition, BlockInstance, ApiBinding
│       │   ├── api-reference/           ← ApiReference
│       │   ├── mfe/                     ← MicroFrontend, MfeDeployment, CreateMfePayload
│       │   ├── user/                    ← UserProfile, Role, Permission, AuditLog, UserSiteRole
│       │   ├── versioning/              ← EntityVersion, WorkflowTransition, TransitionPayload
│       │   └── admin/                   ← Theme, Translation, GlobalConfig + payloads
│       ├── utils/src/lib/               ⬜ Vide (structure prête)
│       ├── ui/src/lib/                  ⬜ Vide (structure prête)
│       └── design-system/src/lib/       ⬜ Vide (structure prête)
│
├── eslint.config.mjs                    ← Module boundaries configurées
├── nx.json
├── tsconfig.base.json                   ← moduleResolution: "bundler"
└── package.json
```

### 5.2 Inventaire des libs (24 projets)

| Couche | Lib | Tags Nx | Statut |
|--------|-----|---------|--------|
| **app** | `cms-admin` | `scope:app, type:app` | ✅ Shell fonctionnel |
| **core** | `core-auth` | `scope:core, type:core` | ✅ WSO2 IS OIDC |
| | `core-http` | `scope:core, type:core` | ✅ ApiClient + interceptors |
| | `core-logger` | `scope:core, type:core` | ✅ LoggerService configurable |
| | `core-config` | `scope:core, type:core` | ✅ AppConfig + environments |
| | `core-i18n` | `scope:core, type:core` | ✅ TranslationService signal-based |
| **shared** | `shared-models` | `scope:shared, type:models` | ✅ Tous les modèles |
| | `shared-utils` | `scope:shared, type:util` | ⬜ Structure prête |
| | `shared-ui` | `scope:shared, type:ui` | ⬜ Structure prête |
| | `shared-design-system` | `scope:shared, type:ui` | ⬜ Structure prête |
| **domain** | `domain-site` | `scope:domain, domain:site, type:domain-logic` | ✅ Pattern de référence |
| | `domain-page` | `scope:domain, domain:page, type:domain-logic` | ✅ Tree structure |
| | `domain-api-connector` | `scope:domain, domain:api-connector, type:domain-logic` | ✅ Read-only + sync WSO2 |
| | `domain-mfe-registry` | `scope:domain, domain:mfe-registry, type:domain-logic` | ✅ CRUD + deployments |
| | `domain-iam` | `scope:domain, domain:iam, type:domain-logic` | ✅ Users + roles + audit |
| | `domain-versioning` | `scope:domain, domain:versioning, type:domain-logic` | ✅ Polymorphic + workflow |
| | `domain-admin` | `scope:domain, domain:admin, type:domain-logic` | ✅ Multi-entity |
| **features** | `feature-site` | `scope:feature, domain:site, type:feature` | ✅ 3 pages fonctionnelles |
| | `feature-page-builder` | `scope:feature, domain:page, type:feature` | ⬜ Placeholder |
| | `feature-api-connector` | `scope:feature, domain:api-connector, type:feature` | ⬜ Placeholder |
| | `feature-mfe-registry` | `scope:feature, domain:mfe-registry, type:feature` | ⬜ Placeholder |
| | `feature-iam` | `scope:feature, domain:iam, type:feature` | ⬜ Placeholder |
| | `feature-versioning` | `scope:feature, domain:versioning, type:feature` | ⬜ Placeholder |
| | `feature-admin` | `scope:feature, domain:admin, type:feature` | ⬜ Placeholder |

---

## 6. Module Boundaries

### 6.1 Hiérarchie d'import

```
app → feature → domain → core → shared (models, utils)
                          ↕
                    core ↔ core
```

### 6.2 Tags Nx

Chaque lib possède des tags dans son `project.json` qui permettent à ESLint d'enforcer les règles d'import.

**Tags de type** (hiérarchie) :

| Tag | Peut importer | Ne peut PAS importer |
|-----|---------------|----------------------|
| `type:app` | feature, domain-logic, core, ui, models, util | — |
| `type:feature` | domain-logic, core, ui, models, util | app, feature |
| `type:domain-logic` | core, models, util | app, feature, domain-logic* |
| `type:core` | core, models, util | app, feature, domain-logic |
| `type:ui` | models, util | app, feature, domain-logic, core |
| `type:models` | util | tout sauf util |
| `type:util` | rien (leaf node) | tout |

*\* Un domain ne peut pas importer un autre domain (isolation par tag `domain:xxx`).*

**Tags de domaine** (isolation) :

Chaque domaine a un tag `domain:xxx` avec une règle `notDependOnLibsWithTags` qui empêche les imports croisés entre domaines. Les features et domain-logic du même domaine partagent le même tag (ex: `domain:site` sur `feature-site` et `domain-site`).

### 6.3 Pourquoi `type:core` et pas `type:util` pour les libs core ?

Les libs core (`core-http`, `core-config`, etc.) ont des **dépendances entre elles** (ex: `core-http` importe `APP_CONFIG` depuis `core-config`). Le tag `type:util` est un leaf node absolu (`onlyDependOnLibsWithTags: []`), ce qui interdirait ces imports légitimes. Le tag `type:core` a été introduit spécifiquement pour permettre `core ↔ core`.

### 6.4 Vérification

```bash
# Lint complet (24/24 vert)
npx nx run-many -t lint --skip-nx-cache

# Compilation TypeScript (0 erreurs)
npx tsc -p tsconfig.base.json --noEmit
```

---

## 7. Core — Services d'infrastructure

### 7.1 core/auth — Authentification WSO2 IS

**Rôle** : Intégration OpenID Connect avec WSO2 Identity Server.

| Composant | Fichier | Rôle |
|-----------|---------|------|
| `AuthService` | `services/auth.service.ts` | Wrapper `angular-auth-oidc-client`, login/logout, user info |
| `authGuard` | `guards/auth.guard.ts` | Protège les routes, redirige vers login |
| `tokenInterceptor` | `interceptors/token.interceptor.ts` | Injecte le Bearer token sur les URL sécurisées |
| `provideAuth()` | `providers/provide-auth.ts` | Configure OIDC avec `SfAuthConfig` |

**Usage** :
```typescript
// app.config.ts
...provideAuth({
  issuerUrl: environment.auth.issuerUrl,
  clientId: environment.auth.clientId,
  redirectUri: window.location.origin,
  scopes: environment.auth.scopes,
  securedApiUrls: [...environment.auth.securedApiUrls],
})
```

### 7.2 core/http — Client HTTP

**Rôle** : Abstraction de `HttpClient` avec options métier, préfixage de base URL, et interceptors.

| Composant | Fichier | Rôle |
|-----------|---------|------|
| `ApiClientService` | `services/api-client.service.ts` | `get/post/put/patch/delete` avec `resolveUrl()` |
| `errorInterceptor` | `interceptors/error.interceptor.ts` | Catch global, transformation en `ApiHttpError` |
| `loadingInterceptor` | `interceptors/loading.interceptor.ts` | Gère `LoadingService.isLoading` signal |
| `LoadingService` | `services/loading.service.ts` | Signal `isLoading` pour les spinners |
| `SKIP_LOADING` | `interceptors/loading.interceptor.ts` | `HttpContextToken` pour bypass par requête |
| `SKIP_ERROR_HANDLING` | `interceptors/error.interceptor.ts` | `HttpContextToken` pour bypass par requête |

**Types de réponse** :
```typescript
interface ApiResponse<T> { data: T; }
interface ApiPaginatedResponse<T> { data: T[]; total: number; page: number; pageSize: number; }
```

**URL resolution** : `ApiClientService` préfixe les URLs relatives avec `apiBaseUrl` depuis `APP_CONFIG`. En dev (`apiBaseUrl: ''`), les URLs restent relatives et sont interceptées par le mock. En prod, elles deviennent absolues.

### 7.3 core/config — Configuration applicative

**Rôle** : Point de vérité unique pour les paramètres d'environnement.

| Composant | Fichier | Rôle |
|-----------|---------|------|
| `AppConfig` | `models/app-config.model.ts` | Interface typée (env, auth, apim, features) |
| `APP_CONFIG` | `models/app-config.model.ts` | `InjectionToken<AppConfig>` |
| `provideConfig()` | `providers/provide-config.ts` | Enregistre la config dans l'injection Angular |

**Structure `AppConfig`** :
```typescript
interface AppConfig {
  environment: 'development' | 'staging' | 'production';
  production: boolean;
  apiBaseUrl: string;
  auth: { issuerUrl, clientId, scopes, securedApiUrls };
  apim: { portalUrl };
  features: { enableMocks, enableDebugTools };
}
```

**Fichiers d'environnement** : dans `apps/cms-admin/src/environments/` (pas dans la lib). Chaque app fournit ses propres valeurs, la lib définit le contrat.

**Consommation** : `inject(APP_CONFIG)` partout. Plus de `isDevMode()` éparpillé — tout est piloté par les feature flags.

### 7.4 core/i18n — Internationalisation

**Rôle** : Service de traduction runtime basé sur les signals Angular.

| Composant | Fichier | Rôle |
|-----------|---------|------|
| `TranslationService` | `services/translation.service.ts` | Signal-based, chargement JSON, cache, interpolation |
| `TranslatePipe` | `pipes/translate.pipe.ts` | Pipe standalone pure, réactif via signal |
| `I18N_CONFIG` | `models/i18n-config.model.ts` | Token de configuration (locale par défaut, debug) |
| `provideI18n()` | `providers/provide-i18n.ts` | Provider + `APP_INITIALIZER` |

**Architecture signal** :
- `currentLocale` — signal readonly de la locale active
- `translationSignal` — computed qui change quand la locale ou le dictionnaire change
- Le `TranslatePipe` lit `translationSignal` → Angular v21 détecte le changement automatiquement

**Résolution de clés** :
- Notation pointée : `'site.list.title'` → `{ site: { list: { title: "..." } } }`
- Interpolation : `'common.showing'` + `{ from: 1, to: 10 }` → remplace `{{from}}` et `{{to}}`
- Fallback : clé introuvable → affiche la clé (+ warning en debug)

**MVP vs Cible** :

| MVP | Cible |
|-----|-------|
| JSON statiques (`fr.json`, `en.json`) | Chargement API (`AdminApiService.getTranslations`) |
| 2 locales | N locales dynamiques |
| Chargement au startup | Lazy loading par namespace |
| TranslatePipe | + directive `sfTranslate` pour HTML riche |

**Distinction avec domain/admin** :
- `core/i18n` = infrastructure runtime (lire et afficher des traductions)
- `domain/admin` = CRUD des traductions en base (outil d'administration)

### 7.5 core/logger — Logging applicatif

**Rôle** : Service de logging configurable par environnement.

| Composant | Fichier | Rôle |
|-----------|---------|------|
| `LoggerService` | `services/logger.service.ts` | `debug/info/warn/error`, filtrage par niveau |
| `provideLogger()` | `providers/provide-logger.ts` | Configure le niveau minimum et la sortie |

**Configuration** : `LogLevel.Debug` en dev, `LogLevel.Warn` en prod. Configurable via `provideLogger()`.

---

## 8. Domain — Pattern SignalStore

### 8.1 Pattern de référence (domain/site)

Chaque domain lib suit le même pattern :

```
libs/domain/{name}/src/lib/
├── store/          ← NgRx SignalStore (état + méthodes)
├── services/       ← Service API (appels HTTP via ApiClientService)
└── models/         ← Filters, types spécifiques au domaine
```

**Structure d'un store** :
```typescript
export const SiteStore = signalStore(
  { providedIn: 'root' },
  withState<SiteState>(initialState),
  withComputed(/* computed signals */),
  withMethods(/* rxMethod pour l'async, patchState pour les mutations */)
);
```

**Conventions** :
- `rxMethod<Filters | void>` pour les chargements avec ou sans filtres
- `switchMap` pour annuler les requêtes en cours
- `tapResponse` pour gérer succès/erreur dans le pipe
- `patchState` pour les mutations synchrones
- Filters locaux au domain (pas dans shared-models)

### 8.2 Inventaire des stores

| Domain | Store(s) | Spécificités |
|--------|----------|-------------|
| **site** | `SiteStore` | Pattern de référence. CRUD complet. Computed: `sitesCount`. |
| **page** | `PageStore` | Tree structure. Computed: `pageTree` (hiérarchie), `rootPages`. Scoped par `siteId`. |
| **api-connector** | `ApiConnectorStore` | Read-only (pas de create/update/delete). Méthode `syncFromWso2()` pour rafraîchir le cache. |
| **mfe-registry** | `MfeRegistryStore` | CRUD MFE + sub-resource `deployments`. `loadDeployments(mfeId)`, `createDeployment()`. |
| **iam** | `IamStore` + `AuditStore` | 2 stores séparés. IAM: users, roles, site-role assignments. Audit: read-only log. |
| **versioning** | `VersioningStore` | Polymorphique (`entityType` + `entityId`). Computed: `currentVersion`, `publishedVersion`. Méthode `transition(versionId, payload)` pour workflow. |
| **admin** | `AdminStore` | Multi-entity: themes, translations, globalConfig. 3 groupes de méthodes distincts. Loaders indépendants par entité. |

### 8.3 Services API

Chaque domain a un service API qui encapsule les appels `ApiClientService` :

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

---

## 9. Feature — Pattern écran fonctionnel

### 9.1 Pattern de référence (feature/site)

```
libs/features/site/src/lib/
├── pages/
│   ├── site-list.component.ts       ← Smart component (injecte SiteStore)
│   ├── site-detail.component.ts     ← Smart component (paramètre route :id)
│   └── site-create.component.ts     ← Smart component (formulaire)
└── routes.ts                        ← SITE_ROUTES (lazy loadable)
```

**Routes** :
```typescript
export const SITE_ROUTES: Routes = [
  { path: '', component: SiteListComponent },
  { path: 'new', component: SiteCreateComponent },
  { path: ':id', component: SiteDetailComponent },
];
```

**Lazy loading** dans `app.routes.ts` :
```typescript
{
  path: 'sites',
  loadChildren: () => import('@site-factory/feature-site').then(m => m.SITE_ROUTES),
  canActivate: [authGuard],
}
```

### 9.2 Features restantes (placeholders)

Les 6 features restantes ont un composant shell placeholder avec un message descriptif. Elles sont routées et lazy-loadées mais n'ont pas encore d'écrans fonctionnels.

---

## 10. Modèle de Données

### D1 — Site Management

**Tenant**

| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| `id` | UUID | PK | Identifiant unique |
| `name` | VARCHAR | NOT NULL | Nom affiché |
| `code` | VARCHAR | UNIQUE | Code technique |
| `description` | TEXT | NULL | Description libre |
| `config` | JSONB | NULL | Configuration spécifique |
| `is_active` | BOOLEAN | DEFAULT TRUE | Tenant actif |
| `created_at` | TIMESTAMP | NOT NULL | Date de création |
| `updated_at` | TIMESTAMP | NOT NULL | Dernière modification |

**Site**

| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| `id` | UUID | PK | Identifiant unique |
| `tenant_id` | UUID | FK → Tenant | Tenant propriétaire |
| `name` | VARCHAR | NOT NULL | Nom affiché |
| `slug` | VARCHAR | UNIQUE per tenant | Identifiant URL-friendly |
| `domain` | VARCHAR | UNIQUE, NULL | Domaine custom |
| `description` | TEXT | NULL | Description libre |
| `theme_id` | UUID | FK → Theme | Thème DS |
| `default_locale` | VARCHAR | DEFAULT 'fr' | Locale par défaut |
| `status` | ENUM | NOT NULL | `draft` \| `active` \| `archived` |
| `config` | JSONB | NULL | Configuration spécifique |
| `created_by` | VARCHAR | NOT NULL | `wso2_user_sub` |
| `created_at` | TIMESTAMP | NOT NULL | Date de création |
| `updated_at` | TIMESTAMP | NOT NULL | Dernière modification |
| `deleted_at` | TIMESTAMP | NULL | Soft delete |

#### D2 — Page & Layout Builder

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
| **Tags Nx** | `type:{type}`, `domain:{domaine}` (plus de `scope:` legacy sauf shared) |
| **Prefix composants** | `sf-` (Site Factory) |
| **Barrel exports** | Chaque lib expose son API publique via `index.ts` |
| **Composants** | Standalone, pas de `NgModule` |
| **Interceptors** | Functional (`HttpInterceptorFn`), jamais class-based |
| **State management** | NgRx SignalStore, `rxMethod` pour l'asynchrone |
| **Providers** | `provideXxx()` function pattern |
| **Types exports** | `export type` pour les interfaces (isolatedModules) |
| **Templates** | Angular v21 `@if`, `@for`, `@defer` — pas de `*ngIf`/`*ngFor` |
| **Route params** | `input.required<T>()` via `withComponentInputBinding()` |
| **moduleResolution** | `"bundler"` dans `tsconfig.base.json` (obligatoire Angular v21) |
| **Encoding fichiers** | UTF-8 **sans BOM** — ne pas utiliser `Set-Content -Encoding UTF8` sur JSON |

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
| **core/http ↔ core/logger** | Pas d'import croisé souhaité | `console.error` dans l'interceptor pour le moment. Résolution via LogHandler injectable (cible). |
| **Mock interceptor en prod** | Fausses données servies | Protégé par `environment.features.enableMocks`. Jamais activé en prod. |
| **angular-auth-oidc-client** | Dépendance externe pour l'auth | Lib mature, certifiée OpenID. AuthService wrapper = possibilité de changer sans impact. |
| **BOM encoding (PowerShell)** | `Set-Content -Encoding UTF8` ajoute un BOM → Nx JSON parser crash | Utiliser `[System.IO.File]::WriteAllText()` ou `New-Item` pour les fichiers JSON. |
| **moduleResolution "node"** | Packages Angular v21 et NgRx utilisent `exports` field | Corrigé : `"bundler"` dans `tsconfig.base.json`. Ne pas revenir à `"node"`. |
| **`rxMethod<T \| void>` type narrowing** | TypeScript refuse `void \| Filters` → `Filters \| undefined` | Pattern fixe : `(filters \|\| undefined) as Filters \| undefined`. |

---

## 15. Roadmap Technique

### Phase 1 — Fondations (✅ quasi complète)

- [x] Création du workspace Nx
- [x] Scaffold des 24 libs (4 couches)
- [x] Nettoyage et restructuration interne
- [x] Modèles TypeScript (shared/models) — tous les domaines
- [x] Module boundaries ESLint — **24/24 lint clean**
- [x] Shell applicatif (layout sidebar + header + content)
- [x] Routing avec lazy loading des 7 features
- [x] core/http (ApiClientService, interceptors, LoadingService)
- [x] core/logger (LoggerService, configurable par env)
- [x] core/auth (WSO2 IS OIDC, guards, token interceptor)
- [x] core/config (AppConfig, environments, provideConfig)
- [x] core/i18n (TranslationService signal-based, TranslatePipe, JSON fr/en)
- [x] domain/site — SignalStore pattern de référence
- [x] domain/page — PageStore (tree structure, rootPages)
- [x] domain/api-connector — ApiConnectorStore (read-only + syncFromWso2)
- [x] domain/mfe-registry — MfeRegistryStore (CRUD + deployments)
- [x] domain/iam — IamStore + AuditStore (users, roles, audit)
- [x] domain/versioning — VersioningStore (polymorphic + transitions)
- [x] domain/admin — AdminStore (themes, translations, globalConfig)
- [x] feature/site — 3 écrans fonctionnels (list, detail, create)
- [x] Mock interceptor pour le développement
- [x] Compilation TypeScript vérifiée (0 erreurs, `tsc --noEmit`)
- [ ] Mock interceptor — compléter les endpoints pour les 6 nouveaux domaines
- [ ] Intégration Design System (shared-ui, shared-design-system)
- [ ] Répliquer les features (CRUD screens pour chaque domaine)
- [ ] Mettre à jour les features placeholders vers des écrans réels

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

## Annexe — Changelog

| Version | Date | Changements |
|---------|------|-------------|
| 1.0 | 18/02/2026 | Vision, carte fonctionnelle, modèle de données, scaffold Nx |
| 2.0 | 18/02/2026 | core/http, core/auth, core/logger, domain/site, feature/site, mock interceptor |
| 3.0 | 19/02/2026 | Module boundaries ESLint, shell applicatif, routing lazy loading |
| 4.0 | 19/02/2026 | core/config, core/i18n, 6 domain stores, `type:core` tag, `moduleResolution: "bundler"`, compilation vérifiée |