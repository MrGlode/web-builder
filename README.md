# Site Factory CMS — Document d'Architecture

> **Version** : 2.0  
> **Date** : 18 février 2026  
> **Statut** : En cours de construction  
> **Stack** : Angular v21 · Nx Monorepo · NgRx SignalStore · SCSS  
> **Socle externe** : WSO2 IS (Auth) · WSO2 APIM 4.6 (API Catalog) · Design System (vanilla JS/SCSS)

---

## Table des matières

1. [Vision Produit](#1-vision-produit)
2. [Carte Fonctionnelle](#2-carte-fonctionnelle)
3. [Décisions Techniques](#3-décisions-techniques)
4. [Architecture en Couches](#4-architecture-en-couches)
5. [Structure Monorepo Nx](#5-structure-monorepo-nx)
6. [Module Boundaries](#6-module-boundaries)
7. [Modèle de Données](#7-modèle-de-données)
8. [Schéma Relationnel Global](#8-schéma-relationnel-global)
9. [Index Recommandés](#9-index-recommandés)
10. [Conventions](#10-conventions)
11. [Risques et Mitigations](#11-risques-et-mitigations)
12. [Roadmap Technique](#12-roadmap-technique)

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
| **Authentification** | WSO2 IS via OIDC/OAuth2 | Infrastructure existante. Pas de duplication. |
| **Catalogue API** | Connecteur WSO2 APIM 4.6 | Read-only + cache. Pas de registre maison. |
| **Micro-Frontends** | Angular Module Federation | Architecture remotes/host pour chargement dynamique de composants. |
| **CSS** | SCSS | Cohérence avec le DS existant. |
| **Versioning données** | Snapshot JSON polymorphique | Une seule table `EntityVersion` pour toutes les entités. Simple, auditable. |

---

## 4. Architecture en Couches

```
┌─────────────────────────────────────────────────────────┐
│                    SITE FACTORY CMS                      │
├──────────┬──────────┬──────────┬────────────────────────┤
│   Core   │  Domain  │ Features │      Shared            │
├──────────┼──────────┼──────────┼────────────────────────┤
│ Auth     │ Site     │ Site UI  │ Models (interfaces)    │
│ (WSO2)   │ Page     │ Page Bld │ Utils (helpers)        │
│ HTTP     │ API Conn │ API UI   │ UI (dumb components)   │
│ Config   │ MFE Reg  │ MFE UI   │ Design System          │
│ i18n     │ IAM      │ IAM UI   │ (wrappers Angular)     │
│ Logger   │ Version. │ Vers. UI │                        │
│          │ Admin    │ Admin UI │                        │
└──────────┴──────────┴──────────┴────────────────────────┘
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
│       │   │   ├── app.ts
│       │   │   ├── app.config.ts
│       │   │   ├── app.routes.ts        ← Lazy loading des features
│       │   │   └── app.scss
│       │   ├── index.html
│       │   ├── main.ts
│       │   └── styles.scss
│       ├── project.json
│       └── tsconfig.json
│
├── libs/
│   ├── core/                            ← Infrastructure technique
│   │   ├── auth/src/lib/
│   │   │   ├── services/                ← AuthService (WSO2 IS)
│   │   │   ├── guards/                  ← AuthGuard, RoleGuard
│   │   │   ├── interceptors/            ← TokenInterceptor
│   │   │   ├── providers/               ← provideAuth()
│   │   │   └── models/                  ← AuthState, TokenPayload
│   │   ├── http/src/lib/
│   │   │   ├── services/                ← ApiClient
│   │   │   ├── interceptors/            ← ErrorInterceptor, LoadingInterceptor
│   │   │   └── models/                  ← ApiResponse<T>
│   │   ├── config/src/lib/
│   │   │   ├── services/                ← ConfigService
│   │   │   └── models/                  ← AppConfig, Environment
│   │   ├── i18n/src/lib/
│   │   │   ├── services/                ← TranslationService
│   │   │   ├── pipes/                   ← TranslatePipe
│   │   │   └── models/                  ← Locale, TranslationMap
│   │   └── logger/src/lib/
│   │       ├── services/                ← LoggerService
│   │       └── models/                  ← LogLevel, LogEntry
│   │
│   ├── domain/                          ← Logique métier (1 lib / domaine)
│   │   ├── site/src/lib/
│   │   │   ├── store/                   ← SiteStore (NgRx SignalStore)
│   │   │   ├── services/                ← SiteApiService
│   │   │   └── models/                  ← (re-exports shared/models/site)
│   │   ├── page/src/lib/                ← idem pattern
│   │   ├── api-connector/src/lib/       ← idem pattern
│   │   ├── mfe-registry/src/lib/        ← idem pattern
│   │   ├── iam/src/lib/                 ← idem pattern
│   │   ├── versioning/src/lib/          ← idem pattern
│   │   └── admin/src/lib/               ← idem pattern
│   │
│   ├── features/                        ← UI intelligente (1 lib / domaine)
│   │   ├── site/src/lib/
│   │   │   ├── pages/                   ← SiteListPage, SiteDetailPage
│   │   │   ├── containers/              ← SiteFormContainer
│   │   │   └── routes.ts               ← export const SITE_ROUTES
│   │   ├── page-builder/src/lib/        ← idem pattern
│   │   ├── api-connector/src/lib/       ← idem pattern
│   │   ├── mfe-registry/src/lib/        ← idem pattern
│   │   ├── iam/src/lib/                 ← idem pattern
│   │   ├── versioning/src/lib/          ← idem pattern
│   │   └── admin/src/lib/               ← idem pattern
│   │
│   └── shared/                          ← Briques transverses
│       ├── models/src/lib/              ← Interfaces, types, enums
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
│       ├── utils/src/lib/
│       │   ├── helpers/                 ← slug(), deepClone()
│       │   ├── validators/              ← JSON Schema validators
│       │   └── mappers/                 ← DTO ↔ Model mappers
│       ├── ui/src/lib/
│       │   ├── components/              ← ConfirmDialog, DataTable
│       │   ├── directives/              ← ClickOutside, AutoFocus
│       │   └── pipes/                   ← DateFormat, Truncate
│       └── design-system/src/lib/
│           ├── components/              ← Wrappers Angular du DS vanilla
│           ├── styles/                  ← SCSS du DS
│           └── tokens/                  ← Design tokens exportés
│
├── eslint.config.mjs                    ← Module boundaries configurées
├── nx.json
├── tsconfig.base.json
└── package.json
```

### 5.2 Inventaire des libs (24 projets)

| Couche | Lib | Tags Nx |
|--------|-----|---------|
| **core** | `core-auth` | `scope:core, type:util` |
| | `core-http` | `scope:core, type:util` |
| | `core-config` | `scope:core, type:util` |
| | `core-i18n` | `scope:core, type:util` |
| | `core-logger` | `scope:core, type:util` |
| **shared** | `shared-models` | `scope:shared, type:models` |
| | `shared-utils` | `scope:shared, type:util` |
| | `shared-ui` | `scope:shared, type:ui` |
| | `shared-design-system` | `scope:shared, type:ui` |
| **domain** | `domain-site` | `scope:domain, domain:site, type:domain-logic` |
| | `domain-page` | `scope:domain, domain:page, type:domain-logic` |
| | `domain-api-connector` | `scope:domain, domain:api-connector, type:domain-logic` |
| | `domain-mfe-registry` | `scope:domain, domain:mfe-registry, type:domain-logic` |
| | `domain-iam` | `scope:domain, domain:iam, type:domain-logic` |
| | `domain-versioning` | `scope:domain, domain:versioning, type:domain-logic` |
| | `domain-admin` | `scope:domain, domain:admin, type:domain-logic` |
| **features** | `feature-site` | `scope:feature, domain:site, type:feature` |
| | `feature-page-builder` | `scope:feature, domain:page, type:feature` |
| | `feature-api-connector` | `scope:feature, domain:api-connector, type:feature` |
| | `feature-mfe-registry` | `scope:feature, domain:mfe-registry, type:feature` |
| | `feature-iam` | `scope:feature, domain:iam, type:feature` |
| | `feature-versioning` | `scope:feature, domain:versioning, type:feature` |
| | `feature-admin` | `scope:feature, domain:admin, type:feature` |

---

## 6. Module Boundaries

### 6.1 Règles d'import

```
┌───────────────────────────────────────────────────────────┐
│                    RÈGLES D'IMPORT                         │
├───────────────────────────────────────────────────────────┤
│                                                            │
│  feature  ──►  domain ✅  shared ✅  core ✅               │
│  domain   ──►  shared ✅  core ✅                          │
│  core     ──►  shared ✅                                   │
│  ui       ──►  models ✅  utils ✅                         │
│  models   ──►  utils ✅                                    │
│  utils    ──►  (rien — leaf absolu)                        │
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
| **feature** | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| **domain** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **core** | ❌ | ❌ | — | ❌ | ✅ | ✅ |
| **ui** | ❌ | ❌ | ❌ | — | ✅ | ✅ |
| **models** | ❌ | ❌ | ❌ | ❌ | — | ✅ |
| **utils** | ❌ | ❌ | ❌ | ❌ | ❌ | — |

### 6.3 Isolation des domaines

Chaque domaine est isolé des autres. Aucun import croisé entre `domain:site` et `domain:page` par exemple. La communication inter-domaine se fait **exclusivement** au niveau feature ou via le shell applicatif.

| Source | Imports interdits |
|---|---|
| `domain:site` | page, api-connector, mfe-registry, iam, versioning, admin |
| `domain:page` | site, api-connector, mfe-registry, iam, versioning, admin |
| `domain:api-connector` | site, page, mfe-registry, iam, versioning, admin |
| `domain:mfe-registry` | site, page, api-connector, iam, versioning, admin |
| `domain:iam` | site, page, api-connector, mfe-registry, versioning, admin |
| `domain:versioning` | site, page, api-connector, mfe-registry, iam, admin |
| `domain:admin` | site, page, api-connector, mfe-registry, iam, versioning |

### 6.4 Enforcement

Les rules sont configurées dans `eslint.config.mjs` via le plugin `@nx/enforce-module-boundaries`. Toute violation est détectée au `lint` et bloque le CI.

---

## 7. Modèle de Données

### 7.1 Principes de conception

| Principe | Détail |
|----------|--------|
| **Multi-tenant natif** | `tenant_id` présent dès le départ sur `Site` |
| **Configuration en JSON typé** | JSONB validé contre JSON Schema |
| **Références WSO2, pas duplication** | `wso2_user_sub`, `wso2_api_id` comme clés de référence |
| **Versioning par snapshot** | Snapshot JSON complet de l'entité à chaque version |
| **Soft delete systématique** | `deleted_at TIMESTAMP NULL` partout |

### 7.2 Entités par domaine

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

Exemple `zones` :
```json
[
  { "key": "header", "label": "En-tête" },
  { "key": "main", "label": "Zone principale" },
  { "key": "sidebar", "label": "Barre latérale" },
  { "key": "footer", "label": "Pied de page" }
]
```

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

Exemple `api_binding` :
```json
{
  "apiRefId": "550e8400-e29b-41d4-a716-446655440000",
  "operationId": "POST /declarations",
  "requestMapping": {
    "bloc_prop_type_sinistre": "$.body.typeSinistre",
    "bloc_prop_date": "$.body.dateSurvenance"
  },
  "responseMapping": {
    "$.data.numero": "bloc_prop_confirmation_id"
  }
}
```

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

## 8. Schéma Relationnel Global

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

## 9. Index Recommandés

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

## 10. Conventions

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
| **Barrel exports** | Chaque lib expose son API publique via `index.ts` |
| **Composants** | Standalone, pas de `NgModule` |

---

## 11. Risques et Mitigations

| Risque | Impact | Mitigation |
|--------|--------|------------|
| **JSONB non contrôlé** | Données incohérentes, bugs front | JSON Schema obligatoire. Validation backend + Angular. |
| **Versioning polymorphique — volume** | Table `EntityVersion` croît vite | Partitionnement par `entity_type`, politique de rétention, archivage. |
| **Couplage WSO2** | Changement d'ID scheme = impact cascade | Champs WSO2 toujours derrière un adapter. |
| **Dénormalisation `Page.path`** | Désynchronisation arborescence/path | Recalcul via trigger DB ou service dédié. |
| **`AuditLog` volumétrie** | Croissance linéaire continue | Partitionnement par date, archivage à froid 12 mois. |
| **Node v24 + Nx** | Compatibilité potentielle (Node 24 est très récent) | Surveiller les issues Nx, fallback sur Node 22 LTS si nécessaire. |
| **DS vanilla JS/SCSS** | Intégration Angular non native | Wrappers Angular dans `shared/design-system`, migration progressive. |

---

## 12. Roadmap Technique

### Phase 1 — Fondations (✅ en cours)

- [x] Création du workspace Nx
- [x] Scaffold des 24 libs (4 couches)
- [x] Nettoyage et restructuration interne
- [x] Modèles TypeScript (shared/models)
- [x] Module boundaries ESLint
- [ ] Stores SignalStore (domain/)
- [ ] Core/auth (WSO2 IS)
- [ ] Routing + shell applicatif
- [ ] Core/http (API client, interceptors)

### Phase 2 — Tier 1 MVP (D1, D4, D5)

- [ ] Site Management (CRUD, config, routes)
- [ ] MFE Registry (registre, chargement dynamique)
- [ ] IAM (auth WSO2, RBAC, audit)
- [ ] Intégration Design System

### Phase 3 — Tier 2 MVP (D2, D3)

- [ ] Page Builder (layouts, blocs, preview)
- [ ] API Connector WSO2 (catalogue, binding)

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

*Document généré dans le cadre du projet Site Factory CMS — Architecture Angular v21 + Nx Monorepo*