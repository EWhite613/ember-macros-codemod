const { getParser } = require('codemod-cli').jscodeshift;

module.exports = function transformer(file, api) {
  const j = getParser(api);
  //const options = getOptions();

  const root = j(file.source);

  replaceEmberComputedImport(root, j);
  return root.toSource();
};

function replaceEmberComputedImport(root, j) {
  // Find the import declaration for 'ember-macro-helpers/computed'
  debugger;
  const computedImport = root.find(j.ImportDeclaration, {
    source: { value: 'ember-macro-helpers/computed' },
  });

  if (computedImport.size() > 0) {
    // Remove the old import
    computedImport.remove();

    // Find the import declaration for '@ember/object'
    const emberObjectImport = root.find(j.ImportDeclaration, {
      source: { value: '@ember/object' },
    });

    if (emberObjectImport.size() > 0) {
      // If '@ember/object' is already being imported, add 'computed' to the import specifiers
      emberObjectImport.get('specifiers').push(j.importSpecifier(j.identifier('computed')));
    } else {
      // If '@ember/object' is not already being imported, add a new import declaration
      j(root.find(j.ImportDeclaration).at(0).get()).insertBefore(
        j.importDeclaration(
          [j.importSpecifier(j.identifier('computed'))],
          j.literal('@ember/object')
        )
      );
    }
  }
}
