module.exports = function (assertion) {
    const name = '(no names yet)'
    const assertionName = getAssertionName(assertion.operator, assertion.name)

    return [
        name + assertionName,
        '  ---',
        '    operator: ' + assertion.operator,
        '    expected:',
        '      ' + assertion.expected,
        '    actual:',
        '      ' + assertion.actual,
        '    at: ' + assertion.at,
        '  ...'
    ].join('\n')
}

function getAssertionName(operator, name) {
    const defaultAssertionNames = {
        deepEqual: 'should be equivalent'
    }

    return defaultAssertionNames[operator] === name
        ? ''
        : ' - ' + name
}
