var test = require('tape')

var streamConv = require('./stream-mapper')

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
    var testNames = {
        '2': ['A', 'B']
    }
    var dirname = 'C:\\Workings\\tape-tdd'

    var expected = {
        ok: false,
        name: ['A', 'B', 'assert name'],
        operator: 'equal',
        actual: 1,
        expected: 2,
        at: 'fixtures\\promise.spec.js:14:11'
    }

    t.deepEqual(
        streamConv.assertMapper(dirname, testNames, input),
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

test('test name mapper', t => {
    t.test('initial one', t => {
        var testNames = {}
        var test = {
            id: 0,
            name: 'asdf'
        }

        var expected = {
            '0': ['asdf'],
            'lastTest': ['asdf']
        }

        t.deepEqual(
            streamConv.testNameMapper(test, testNames),
            expected
        )
        t.end()
    })

    t.test('parent test before', t => {
        var testNames = {
            '0': ['asdf'],
            'lastTest': ['asdf']
        }
        var test = {
            id: 1,
            parent: 0,
            name: 'qwer'
        }

        var expected = {
            '0': ['asdf'],
            '1': ['asdf', 'qwer'],
            'lastTest': ['asdf', 'qwer']
        }

        t.deepEqual(
            streamConv.testNameMapper(test, testNames),
            expected
        )
        t.end()
    })
})
