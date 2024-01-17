const { getParser } = require('codemod-cli').jscodeshift;

/**
 * TODO:
 * Determine if want to use get instead of getProperties
 * Handle arg defaults
 * Handle destructuring args (rever-macros seems to have this, can take from there)
 * Handle typescript typings on args
 * Handle class based decorators version(? do we have any usages like this?). Think it's mainly classic
 */

module.exports = function transformer(file, api) {
  const j = getParser(api);
  //const options = getOptions();

  const root = j(file.source);

  replaceEmberComputedImport(root, j);
  return root.toSource();
};

function replaceEmberComputedImport(root, j) {
  // Find the import declaration for 'ember-macro-helpers/computed'
  const computedImport = root.find(j.ImportDeclaration, {
    source: { value: 'ember-macro-helpers/computed' },
  });

  if (computedImport.size() > 0) {
    const computedVariableName = computedImport.find(j.Identifier).get().value.name; // This is most likely 'computed'
    // Remove the old import
    computedImport.remove();

    // Find the import declaration for '@ember/object'
    const emberObjectImport = root.find(j.ImportDeclaration, {
      source: { value: '@ember/object' },
    });

    if (emberObjectImport.size() > 0) {
      // If '@ember/object' is already being imported, add 'computed' to the import specifiers
      emberObjectImport
        .get('specifiers')
        .push(j.importSpecifier(j.identifier('computed')), j.importSpecifier(j.identifier('get')));
    } else {
      // If '@ember/object' is not already being imported, add a new import declaration
      j(root.find(j.ImportDeclaration).at(0).get()).insertAfter(
        j.importDeclaration(
          [j.importSpecifier(j.identifier('computed')), j.importSpecifier(j.identifier('get'))],
          j.literal('@ember/object')
        )
      );
    }

    updateMacroComputedUsageToEmberComputed(root, j, { computedVariableName });
  }
}

function updateMacroComputedUsageToEmberComputed(root, j, { computedVariableName }) {
  // Find computed properties
  root
    .find(j.CallExpression, {
      callee: { name: computedVariableName },
    })
    .forEach((path) => {
      const callExpression = path.value;
      const callbackFunc = callExpression.arguments[path.value.arguments.length - 1];

      if (callbackFunc.type === 'FunctionExpression') {
        const otherArguments = path.value.arguments.slice(0, -1);
        const existingParams = callbackFunc.params;
        // Remove the existing parameters
        callbackFunc.params = [];

        const argumentsToMoveAndGet = flattenDependencies(
          otherArguments.map((arg) => getArgumentRawValue(arg))
        );

        const newGetters = existingParams.map((identifier, index) => {
          return j.variableDeclaration('const', [
            j.variableDeclarator(
              j.identifier(identifier),
              j.callExpression(j.identifier('get'), [
                j.thisExpression(),
                j.literal(argumentsToMoveAndGet[index]),
              ])
            ),
          ]);
        });

        callbackFunc.body.body.unshift(...newGetters);
      }
    });
}

function flattenDependencies(dependencyPaths) {
  // TODO: FIXME: to flatten
  return dependencyPaths;
}

function getArgumentRawValue(arg) {
  if (arg.type === 'StringLiteral') {
    return arg.value;
  }
}
