function addEmberGetImport(fileSource, j) {
  const root = j(fileSource);
  const imports = root.find(j.ImportDeclaration);
  const emberObjectImport = imports.filter((path) => {
    return path.node.source.value === '@ember/object';
  });

  if (emberObjectImport.length) {
    emberObjectImport.forEach((path) => {
      let emberGet = path.node.specifiers.find((specifier) => {
        return specifier.local && specifier.local.name === 'get';
      });
      if (!emberGet) {
        path.node.specifiers.push(j.importSpecifier(j.identifier('get')));
      }
      let emberComputed = path.node.specifiers.find((specifier) => {
        return specifier.local && specifier.local.name === 'computed';
      });
      if (!emberComputed) {
        path.node.specifiers.push(j.importSpecifier(j.identifier('computed')));
      }
    });
  } else {
    const emberGetObjectStatement = "import { computed, get } from '@ember/object';";
    if (imports.length) {
      j(imports.at(0).get()).insertBefore(emberGetObjectStatement); // before the imports
    } else {
      root.get().node.program.body.unshift(emberGetObjectStatement); // begining of file
    }
  }
  return root.toSource();
}

function cleanupMacrosImports(macrosImported, fileSource, j, computedAlias) {
  let root = j(fileSource);

  macrosImported.forEach((val) => {
    let calls = [];

    if (val === 'tag') {
      calls = root.find(j.ObjectProperty, {
        value: {
          type: 'TaggedTemplateExpression',
          tag: {
            type: 'Identifier',
            name: val,
          },
        },
      });
    } else if (val == 'array' || val == 'string' || val == 'math') {
      calls = root.find(j.CallExpression, {
        callee: {
          type: 'MemberExpression',
          object: {
            name: val,
          },
        },
      });
    } else if (val != computedAlias) {
      calls = root.find(j.CallExpression, {
        callee: {
          name: val,
        },
      });
    }

    if (calls.length === 0) {
      if (val != computedAlias) {
      root
        .find(j.ImportSpecifier, {
          local: {
            name: val,
          },
        })
        .remove();
      root
        .find(j.ImportDefaultSpecifier, {
          local: {
            name: val,
          },
        })
        .remove();
      }
      
      root
        .find(j.ImportDeclaration)
        .filter((path) => {
          return (
            (path.node.source.value.startsWith('ember-awesome-macros') ||
              path.node.source.value === 'ember-macro-helpers/computed' ||
              path.node.source.value === 'ember-macro-helpers/raw') &&
            (path.node.specifiers.length === 0 || val == computedAlias)
          );
        })
        .remove();
    }
  });

  return root.toSource();
}

function cleanupImports(macrosImported, fileSource, j, computedAlias) {
  return cleanupMacrosImports(macrosImported, addEmberGetImport(fileSource, j), j, computedAlias);
}

module.exports = {
  cleanupImports,
};
