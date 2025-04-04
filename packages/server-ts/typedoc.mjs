export default {
  plugin: ['typedoc-plugin-missing-exports', 'typedoc-plugin-markdown'],

  disableSources: true,
  excludeProtected: true,
  excludeInternal: true,
  excludePrivate: true,
  excludeExternals: true,

  //
  // Formatting `typedoc-plugin-markdown`
  //
  hidePageHeader: true,
  hideBreadcrumbs: true,
  hidePageTitle: true,
  hideGroupHeadings: true,
  indexFormat: 'table',
  parametersFormat: 'table',
  interfacePropertiesFormat: 'table',
  classPropertiesFormat: 'table',
  typeAliasPropertiesFormat: 'table',
  enumMembersFormat: 'table',
  propertyMembersFormat: 'table',
  typeDeclarationFormat: 'table',
  blockTagsPreserveOrder: ['@example'],
  //
  // End formatting `typedoc-plugin-markdown`
  //

  exclude: ['node_modules', 'dist'],

  publicPath: '/server-client-ts/generative',

  entryPoints: ['src/index.ts'],
  outputs: [
    {
      name: 'markdown',
      path: './../../docs/server-client-ts/generative',
    },
  ],
};
