var helpers = require('./helpers')
var format = helpers.formatValue

var defaultAssertionNames = {
    deepEqual: 'should be equivalent'
}

module.exports = function (name, assert) {
    if (assert.name !== defaultAssertionNames[assert.operator]) {
        name += ' - ' + assert.name;
    }

    return `  ${name}
    operator: ${assert.operator}
    expected:
${format(assert.expected)}
    actual:
${format(assert.actual)}
    at:
      ${assert.file}`
}
