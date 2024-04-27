import type {ExpressionKind, PatternKind} from 'ast-types/gen/kinds'
import type {ASTNode, JSCodeshift, SpreadElement} from 'jscodeshift'

const END_WITH_EACH_REGEX = /\.@each$/

export function createNewGetter (j: JSCodeshift, variable: PatternKind, propertyPath: string | ASTNode, defaultValueNode?: ExpressionKind) {
  const expressionArgs = [
    j.thisExpression(),
    typeof propertyPath === 'string' ? j.literal(propertyPath) : propertyPath
  ]

  const getOrDefault = defaultValueNode ? 'getWithDefault' : 'get'

  if (defaultValueNode) {
    expressionArgs.push(defaultValueNode)
  }

  return j.variableDeclaration('const', [
    j.variableDeclarator(
      variable,
      j.callExpression(
        j.identifier(getOrDefault), expressionArgs as Array<SpreadElement>
      )
    )
  ])
}

export function flattenDependencies (dependencyPaths: Array<string | ASTNode>) {
  return dependencyPaths.reduce((dependencyPaths, depPath) => {
    return [...dependencyPaths, ..._expandProperties(depPath)]
  }, [])
}

export function getArgumentRawValue (arg: ASTNode) {
  if (arg.type === 'Literal' || arg.type === 'StringLiteral') {
    return arg.value as string
  }

  return undefined
}

function _expandProperties (pathToExpand: string | ASTNode) {
  if (typeof pathToExpand === 'string') {
    let results: Array<string> = []

    _expand(pathToExpand, (r: string) => {
      results.push(r.replace('.[]', '').replace(/\.@each.+/, ''))
    })

    return results
  }

  return [pathToExpand]
}

// Copied from https://github.com/emberjs/ember.js/blob/main/packages/%40ember/-internals/metal/lib/expand_properties.ts#L39
function _expand (pattern: string, callback: (r: string) => void) {

  let start = pattern.indexOf('{')
  if (start < 0) {
    callback(pattern.replace(END_WITH_EACH_REGEX, '.[]'))
  } else {
    _dive('', pattern, start, callback)
  }
}

function _dive (prefix: string, pattern: string, start: number, callback: (r: string) => void) {
  let end = pattern.indexOf('}'),
    i = 0,
    newStart,
    arrayLength
  let tempArr = pattern.substring(start + 1, end).split(',')
  let after = pattern.substring(end + 1)
  prefix = prefix + pattern.substring(0, start)

  arrayLength = tempArr.length
  while (i < arrayLength) {
    newStart = after.indexOf('{')
    if (newStart < 0) {
      callback((prefix + tempArr[i++] + after).replace(END_WITH_EACH_REGEX, '.[]'))
    } else {
      _dive(prefix + tempArr[i++], after, newStart, callback)
    }
  }
}
