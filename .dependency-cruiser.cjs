/** Module boundary rules of the modular monolith. All rules only warn for now; see docs/specs/module-layout/design.md, section 7. */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      comment: 'No cycle between files. Cycles between modules are removed by the ticket of each module.',
      severity: 'warn',
      from: {},
      to: { circular: true }
    },
    {
      name: 'cross-module-import',
      comment:
        'A module imports another module only through its public.ts (not created yet, so every cross-module import is listed).',
      severity: 'warn',
      from: { path: '^src/modules/([^/]+)/' },
      to: {
        path: '^src/modules/([^/]+)/',
        pathNot: ['^src/modules/$1/', '^src/modules/[^/]+/public\\.ts$']
      }
    },
    {
      name: 'core-config-not-to-modules',
      comment: 'core/ and config/ hold no business code, so they do not import a module.',
      severity: 'warn',
      from: { path: '^src/(core|config)/' },
      to: { path: '^src/modules/' }
    },
    {
      name: 'modules-not-to-main',
      comment: 'Only main/ composes the modules; a module never imports main/.',
      severity: 'warn',
      from: { path: '^src/modules/' },
      to: { path: '^src/main/' }
    }
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'tsconfig.json' },
    tsPreCompilationDeps: false,
    exclude: { path: '\\.d\\.ts$' }
  }
}
