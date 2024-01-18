function expandProperties(pathToExpand) {
  let results = [];
  _expandProperties(pathToExpand, (r) => {
    results.push(r.replace('.[]', '').replace(/\.@each.+/, ''));
  });

  return results;
}

function assert() {}
const END_WITH_EACH_REGEX = /\.@each$/;
// Copied from https://github.com/emberjs/ember.js/blob/main/packages/%40ember/-internals/metal/lib/expand_properties.ts#L39
function _expandProperties(pattern, callback) {
  assert(
    `A computed property key must be a string, you passed ${typeof pattern} ${pattern}`,
    typeof pattern === 'string'
  );
  assert(
    'Brace expanded properties cannot contain spaces, e.g. "user.{firstName, lastName}" should be "user.{firstName,lastName}"',
    pattern.indexOf(' ') === -1
  );
  // regex to look for double open, double close, or unclosed braces
  assert(
    `Brace expanded properties have to be balanced and cannot be nested, pattern: ${pattern}`,
    pattern.match(/\{[^}{]*\{|\}[^}{]*\}|\{[^}]*$/g) === null
  );

  let start = pattern.indexOf('{');
  if (start < 0) {
    callback(pattern.replace(END_WITH_EACH_REGEX, '.[]'));
  } else {
    dive('', pattern, start, callback);
  }
}

function dive(prefix, pattern, start, callback) {
  let end = pattern.indexOf('}'),
    i = 0,
    newStart,
    arrayLength;
  let tempArr = pattern.substring(start + 1, end).split(',');
  let after = pattern.substring(end + 1);
  prefix = prefix + pattern.substring(0, start);

  arrayLength = tempArr.length;
  while (i < arrayLength) {
    newStart = after.indexOf('{');
    if (newStart < 0) {
      callback((prefix + tempArr[i++] + after).replace(END_WITH_EACH_REGEX, '.[]'));
    } else {
      dive(prefix + tempArr[i++], after, newStart, callback);
    }
  }
}

module.exports = {
  expandProperties,
};
