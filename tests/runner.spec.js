var test = require('tape');

var runner = require('./runner');

test('single run', function (t) {
    t.plan(1);

    runner.setCallback(function (result, state) {
        t.deepEquals(
            state,
            {
                running: false,
                files: ['file1'],
                nextRunScheduled: false,
                nextRunFiles: null
            }
        )
    });
    runner.runTests(['file1']);
});

test('two run triggered quickly following', function (t) {
    t.plan(2);

    var callbackCount = 0;

    runner.setCallback(function (result, state) {
        if (callbackCount == 0) {
            console.log(state)
            t.deepEquals(
                state,
                {
                    running: false,
                    files: ['file1'],
                    nextRunScheduled: false,
                    nextRunFiles: null
                }
            );
            callbackCount++;
        } else if (callbackCount == 1) {
            console.log(state)
            t.deepEquals(
                state,
                {
                    running: false,
                    files: ['file1'],
                    nextRunScheduled: false,
                    nextRunFiles: null
                }
            );
        }
    });

    runner.runTests(['file1']);
    runner.runTests();
});