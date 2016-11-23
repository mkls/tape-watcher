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
      ${assert.expected}
    actual:
      ${assert.actual}
    at:
      ${assert.file}`
}
