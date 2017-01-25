const test = require('tape')

var failurePrinter = require('./failure-printer')

test('formatting a single failing assertion', function (t) {
    var assertion = {
        name: 'should be equivalent',
        operator: 'deepEqual',
        expected: 4,
        actual: 5,
        at: 'some/place/over/the/rainbow'
    }

    var expected = [
        '(no names yet)',
        '  ---',
        '    operator: deepEqual',
        '    expected:',
        '      4',
        '    actual:',
        '      5',
        '    at: some/place/over/the/rainbow',
        '  ...'
    ].join('\n')

    t.deepEqual(
        failurePrinter(assertion),
        expected
    )
    t.end()
})

test('assertion has a non default name', function (t) {
    var assertion = {
        operator: 'deepEqual',
        name: 'testing trivial stuff',
        expected: 4,
        actual: 5,
        at: 'some/place/over/the/rainbow'
    }

    var expected = [
        '(no names yet) - testing trivial stuff',
        '  ---',
        '    operator: deepEqual',
        '    expected:',
        '      4',
        '    actual:',
        '      5',
        '    at: some/place/over/the/rainbow',
        '  ...'
    ].join('\n')

    t.deepEqual(
        failurePrinter(assertion),
        expected
    )
    t.end()
})
