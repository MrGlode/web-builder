import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/out-tsc'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            // ============================================
            // FEATURE → peut importer domain, shared, core
            // ============================================
            {
              sourceTag: 'type:feature',
              onlyDependOnLibsWithTags: [
                'type:domain-logic',
                'type:ui',
                'type:models',
                'type:util',
              ],
            },

            // ============================================
            // DOMAIN → peut importer shared, core
            // JAMAIS un autre domain, JAMAIS une feature
            // ============================================
            {
              sourceTag: 'type:domain-logic',
              onlyDependOnLibsWithTags: ['type:models', 'type:util'],
            },

            // ============================================
            // UI (shared/ui, shared/design-system)
            // → peut importer models et utils uniquement
            // ============================================
            {
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: ['type:models', 'type:util'],
            },

            // ============================================
            // CORE → peut importer models et utils
            // JAMAIS domain, JAMAIS feature
            // ============================================
            {
              sourceTag: 'scope:core',
              onlyDependOnLibsWithTags: ['type:models', 'type:util'],
            },

            // ============================================
            // MODELS → peut importer utils uniquement
            // (leaf node)
            // ============================================
            {
              sourceTag: 'type:models',
              onlyDependOnLibsWithTags: ['type:util'],
            },

            // ============================================
            // UTILS → n'importe rien (leaf node absolu)
            // ============================================
            {
              sourceTag: 'type:util',
              onlyDependOnLibsWithTags: [],
            },

            // ============================================
            // DOMAIN ISOLATION
            // Un domaine ne peut pas importer un autre domaine
            // (chaque règle empêche les imports croisés)
            // ============================================
            {
              sourceTag: 'domain:site',
              notDependOnLibsWithTags: [
                'domain:page',
                'domain:api-connector',
                'domain:mfe-registry',
                'domain:iam',
                'domain:versioning',
                'domain:admin',
              ],
            },
            {
              sourceTag: 'domain:page',
              notDependOnLibsWithTags: [
                'domain:site',
                'domain:api-connector',
                'domain:mfe-registry',
                'domain:iam',
                'domain:versioning',
                'domain:admin',
              ],
            },
            {
              sourceTag: 'domain:api-connector',
              notDependOnLibsWithTags: [
                'domain:site',
                'domain:page',
                'domain:mfe-registry',
                'domain:iam',
                'domain:versioning',
                'domain:admin',
              ],
            },
            {
              sourceTag: 'domain:mfe-registry',
              notDependOnLibsWithTags: [
                'domain:site',
                'domain:page',
                'domain:api-connector',
                'domain:iam',
                'domain:versioning',
                'domain:admin',
              ],
            },
            {
              sourceTag: 'domain:iam',
              notDependOnLibsWithTags: [
                'domain:site',
                'domain:page',
                'domain:api-connector',
                'domain:mfe-registry',
                'domain:versioning',
                'domain:admin',
              ],
            },
            {
              sourceTag: 'domain:versioning',
              notDependOnLibsWithTags: [
                'domain:site',
                'domain:page',
                'domain:api-connector',
                'domain:mfe-registry',
                'domain:iam',
                'domain:admin',
              ],
            },
            {
              sourceTag: 'domain:admin',
              notDependOnLibsWithTags: [
                'domain:site',
                'domain:page',
                'domain:api-connector',
                'domain:mfe-registry',
                'domain:iam',
                'domain:versioning',
              ],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    rules: {},
  },
];