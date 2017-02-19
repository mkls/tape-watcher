'use strict';

var test = require('tape');

var getFailureLocation = require('./get-failure-location');

test('gets the line from the file where the failing assertion is', function (t) {
    var stack = 'Error: should be equal\n        at Test.assert [as _assert] (C:\\Workings\\tape-tdd\\node_modules\\tape\\lib\\test.js:217:54)\n        at Test.bound [as _assert] (C:\\Workings\\tape-tdd\\node_modules\\tape\\lib\\test.js:66:32)\n        at Test.equal.Test.equals.Test.strictEquals (C:\\Workings\\tape-tdd\\node_modules\\tape\\lib\\test.js:352:10)\n        at Test.bound [as equal] (C:\\Workings\\tape-tdd\\node_modules\\tape\\lib\\test.js:66:32)\n        at Test.<anonymous> (C:\\Workings\\tape-tdd\\src\\get-failure-location.spec.js:6:7)\n        at Test.bound [as _cb] (C:\\Workings\\tape-tdd\\node_modules\\tape\\lib\\test.js:66:32)\n        at Test.run (C:\\Workings\\tape-tdd\\node_modules\\tape\\lib\\test.js:85:10)\n        at Test.bound [as run] (C:\\Workings\\tape-tdd\\node_modules\\tape\\lib\\test.js:66:32)\n        at Immediate.next (C:\\Workings\\tape-tdd\\node_modules\\tape\\lib\\results.js:71:15)\n        at runCallback (timers.js:649:20)\n    ';
    var dirname = 'C:\\Workings\\tape-tdd';

    var expected = 'src\\get-failure-location.spec.js:6:7';

    t.deepEqual(getFailureLocation(dirname, stack), expected);
    t.end();
});

test('undefined as stack', function (t) {
    t.deepEqual(getFailureLocation('sadf', undefined), undefined);
    t.end();
});