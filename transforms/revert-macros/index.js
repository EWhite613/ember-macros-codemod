const { getParser } = require('codemod-cli').jscodeshift;
//const { getOptions } = require('codemod-cli');
const { transformMacro } = require('./macros');
const { cleanupImports } = require('./cleaner');

function findMacros(fileSource, j) {
  let macrosImported = new Set();
  let computedNeeded = false;
  j(fileSource)
    .find(j.ImportDeclaration)
    .filter((path) => {
      if (path.node.source.value === 'ember-macro-helpers/computed')
        computedNeeded = path.node.specifiers[0].local.name;
      
      return (
        path.node.source.value.startsWith('ember-awesome-macros') ||
        path.node.source.value === 'ember-macro-helpers/raw'
      );
    })
    .forEach((path) => {
      path.node.specifiers.map((s) => s.local.name).forEach((i) => macrosImported.add(i));
    });
  return [macrosImported, computedNeeded];
}

module.exports = function transformer(file, api) {
  const j = getParser(api);
  //const options = getOptions();

  const [macrosImported, computedNeeded] = findMacros(file.source, j);
  let source = file.source;
  
  if (!computedNeeded && !macrosImported.size)
    return file.source;
  
  if (computedNeeded) {
    source = j(source)
      .find(j.ObjectProperty, {
        value: {
          type: 'CallExpression',
          callee: {
            name: computedNeeded,
          },
        },
      })
      .forEach((path) => {
        transformMacro(path, j, computedNeeded);
      })
      .toSource();
  }
  
  if (macrosImported.size) {
    source = [...macrosImported].reduce((source, val) => {
      if (val === 'tag') {
        return j(source)
          .find(j.ObjectProperty, {
            value: {
              type: 'TaggedTemplateExpression',
              tag: {
                type: 'Identifier',
                name: val,
              },
            },
          })
          .forEach((path) => {
            transformMacro(path, j);
          })
          .toSource();
      }

      if (val === 'string' || val === 'array' || val === 'math') {
        return j(source)
          .find(j.ObjectProperty, {
            value: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: {
                  name: val,
                },
              },
            },
          })
          .forEach((path) => {
            transformMacro(path, j);
          })
          .toSource();
      }

      return j(source)
        .find(j.ObjectProperty, {
          value: {
            type: 'CallExpression',
            callee: {
              name: val,
            },
          },
        })
        .forEach((path) => {
          transformMacro(path, j);
        })
        .toSource();
    }, source);

    
  }
  
  if (computedNeeded)
    macrosImported.add(computedNeeded);
  return cleanupImports(macrosImported, source, j, computedNeeded);
};
