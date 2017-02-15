var test = require('tape')

var streamConv = require('./stream-to-asserts')

test('simple case', function (t) {
    var input = [{
        'type': 'test',
        'name': 'test 1',
        'id': 0
    }, {
        'type': 'assert',
        'name': 'etwas',
        'test': 0,
    }, {
        'type': 'end',
        'test': 0
    }, {
        'type': 'test',
        'name': 'simple stuff',
        'id': 1
    }, {
        'type': 'assert',
        'name': 'should be equal',
        'test': 1
    }, {
        'type': 'end',
        'test': 1
    }]

    var expected = [{
        names: ['test 1'],
        assertionName: 'etwas'
    }, {
        names: ['simple stuff'],
        assertionName: 'should be equal'
    }]

    t.deepEqual(
        streamConv(input).mappedAsserts,
        expected
    )

    t.end()
})

test('deep nest, not very readable test case, oh well', function (t) {
    var input = [
        {
            'type': 'test',
            'name': 'complex object',
            'id': 0
        },
        {
            'name': 'should be equivalent',
            'test': 0,
            'type': 'assert'
        },
        {
            'type': 'test',
            'name': 'nested one',
            'id': 2,
            'parent': 0
        },
        {
            'name': 'should be equal',
            'test': 2,
            'type': 'assert'
        },
        {
            'type': 'end',
            'test': 2
        },
        {
            'type': 'test',
            'name': 'nested 3',
            'id': 3,
            'parent': 0
        },
        {
            'name': 'cuccmany',
            'test': 3,
            'type': 'assert'
        },
        {
            'type': 'test',
            'name': 'deep nested',
            'id': 4,
            'parent': 3
        },
        {
            'name': 'should be truthy',
            'test': 4,
            'type': 'assert'
        },
        {
            'type': 'end',
            'test': 4
        },
        {
            'type': 'end',
            'test': 3
        },
        {
            'type': 'end',
            'test': 0
        },
        {
            'type': 'test',
            'name': 'simple stuff',
            'id': 1
        },
        {
            'name': 'named assert',
            'test': 1,
            'type': 'assert'
        },
        {
            'type': 'end',
            'test': 1
        }
    ]

    var expected = [{
        names: ['complex object'],
        assertionName: 'should be equivalent'
    }, {
        names: ['complex object', 'nested one'],
        assertionName: 'should be equal'
    }, {
        names: ['complex object', 'nested 3'],
        assertionName: 'cuccmany'
    }, {
        names: ['complex object', 'nested 3', 'deep nested'],
        assertionName: 'should be truthy'
    }, {
        names: ['simple stuff'],
        assertionName: 'named assert'
    }]

    t.deepEqual(
        streamConv(input).mappedAsserts,
        expected
    )

    t.end()
})
