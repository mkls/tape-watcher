var test = require('tape')

var streamConv = require('./stream-to-asserts')

test('assertMapper', t => {
    var input = {
        'id': 0,
        'ok': false,
        'name': 'assert name',
        'operator': 'equal',
        'actual': 1,
        'expected': 2,
        'error': {
            stack: `Error: should be equal
                at Test.bound [as _assert] (C:\\Workings\\tape-tdd\\node_modules\\tape\\lib\\test.js:66:32)
                at Q.Promise.then.d (C:\\Workings\\tape-tdd\\fixtures\\promise.spec.js:14:11)
                at _fulfilled (C:\\Workings\\tape-tdd\\node_modules\\q\\q.js:834:54)
                at self.promiseDispatch.done (C:\\Workings\\tape-tdd\\node_modules\\q\\q.js:863:30)
                at C:\\Workings\\tape-tdd\\node_modules\\q\\q.js:604:44`
        },
        'file': 'C:\\Workings\\tape-tdd\\fixtures\\promise.spec.js:14:11',
        'at': 'at Q.Promise.then.d (C:\\Workings\\tape-tdd\\fixtures\\promise.spec.js:14:11)',
        'test': 2,
        'type': 'assert'
    }

    var state = {
        testNames: {
            '2': ['A', 'B']
        },
        dirname: 'C:\\Workings\\tape-tdd',
        lastFailedAssertion: null
    }

    var expected = {
        testNames: {
            '2': ['A', 'B']
        },
        dirname: 'C:\\Workings\\tape-tdd',
        lastAssertion: {
            ok: false,
            names: ['A', 'B', 'assert name'],
            operator: 'equal',
            actual: 1,
            expected: 2,
            at: 'fixtures\\promise.spec.js:14:11'
        }
    }

    t.deepEqual(
        streamConv.assertMapper(state, input),
        expected
    )

    t.end()
})

test('nonDefaultAssertionName', t => {
    var getName = streamConv.nonDefaultAssertionName

    t.equal(
        getName('valami', 'unknown operator'),
        'valami'
    )
    t.equal(
        getName('should be falsy', 'notOk'),
        undefined
    )
    t.equal(
        getName('etwas', 'ok'),
        'etwas'
    )
    t.equal(
        getName('should not throw', 'throws'),
        undefined
    )
    t.equal(
        getName('something', 'throws'),
        'something'
    )
    t.end()
})

test('simple case test name aggregation', t => {
    var input = [{
        type: 'test',
        name: 'test 1',
        id: 0
    }, {
        type: 'assert',
        operator: 'ok',
        name: 'etwas',
        test: 0,
    }, {
        type: 'end',
        test: 0
    }, {
        type: 'test',
        operator: 'deepEqual',
        name: 'simple stuff',
        id: 1
    }, {
        type: 'assert',
        operator: 'equal',
        name: 'should be equal',
        test: 1
    }, {
        type: 'end',
        test: 1
    }]

    var expected = [{
        names: ['test 1', 'etwas']
    }, {
        names: ['simple stuff']
    }]

    t.deepEqual(
        streamConv.handleStream(input).mappedAsserts,
        expected
    )

    t.end()
})

test('deep nest, not very readable test case, oh well', t => {
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
        names: ['complex object', 'should be equivalent']
    }, {
        names: ['complex object', 'nested one', 'should be equal']
    }, {
        names: ['complex object', 'nested 3', 'cuccmany']
    }, {
        names: ['complex object', 'nested 3', 'deep nested', 'should be truthy']
    }, {
        names: ['simple stuff', 'named assert']
    }]

    t.deepEqual(
        streamConv.handleStream(input).mappedAsserts,
        expected
    )

    t.end()
})
