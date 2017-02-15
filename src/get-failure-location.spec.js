var test = require('tape')

var getFailureLocation = require('./get-failure-location')

test('gets the line from the file where the failing assertion is', function (t) {
    var stack = `Error: should be equal
        at Test.assert [as _assert] (C:\\Workings\\tape-tdd\\node_modules\\tape\\lib\\test.js:217:54)
        at Test.bound [as _assert] (C:\\Workings\\tape-tdd\\node_modules\\tape\\lib\\test.js:66:32)
        at Test.equal.Test.equals.Test.isEqual.Test.is.Test.strictEqual.Test.strictEquals (C:\\Workings\\tape-tdd\\node_modules\\tape\\lib\\test.js:352:10)
        at Test.bound [as equal] (C:\\Workings\\tape-tdd\\node_modules\\tape\\lib\\test.js:66:32)
        at Test.<anonymous> (C:\\Workings\\tape-tdd\\src\\get-failure-location.spec.js:6:7)
        at Test.bound [as _cb] (C:\\Workings\\tape-tdd\\node_modules\\tape\\lib\\test.js:66:32)
        at Test.run (C:\\Workings\\tape-tdd\\node_modules\\tape\\lib\\test.js:85:10)
        at Test.bound [as run] (C:\\Workings\\tape-tdd\\node_modules\\tape\\lib\\test.js:66:32)
        at Immediate.next (C:\\Workings\\tape-tdd\\node_modules\\tape\\lib\\results.js:71:15)
        at runCallback (timers.js:649:20)
    `
    var dirname = 'C:\\Workings\\tape-tdd'

    var expected = 'src\\get-failure-location.spec.js:6:7'

    t.deepEqual(
        getFailureLocation(dirname, stack),
        expected
    )
    t.end()
})

test('undefined as stack', t => {
    t.deepEqual(
        getFailureLocation('sadf', undefined),
        undefined
    )
    t.end()
})
