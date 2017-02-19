'use strict';

var prettyms = require('pretty-ms');
var inspect = require('object-inspect');
var diff = require('diff');
var chalkMain = require('chalk');

var addPadding = function addPadding(padding) {
    return function (string) {
        return string.split('\n').map(function (line) {
            return padding + line;
        }).join('\n');
    };
};

/**
 * Options usd here:
 *   clearConsole = true: clears the console at the start of new runs
 *   disableColors = false: turns off chalk
 *   objectPrintDepth = 5: passed down to object-inspect
 *   backgroundDiffColors = false: print diffs with the background colored (shows whitespace diff)
 *
 *   TODOs
 *   indentValues = false: print objects indented
 */
module.exports = function (logger) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    // chalk.enabled = !options.disableColors   // could be more effiecent, but annoying when developing
    var chalk = new chalkMain.constructor({ enabled: !options.disableColors });

    var log = function log(color, text) {
        var value = '\n' + addPadding('  ')(text);
        logger.log(color ? chalk[color](value) : value);
    };

    var encodeValue = function encodeValue(value) {
        var padder = addPadding('      ');

        if (typeof value === 'string') {
            return padder(value);
        } else {
            return padder(inspect(value, { depth: options.objectPrintDepth || 5 }));
        }
    };

    var coloredDiff = function coloredDiff(actual, expected) {
        var addedColor = options.backgroundDiffColors ? chalk.bgGreen : chalk.green;
        var removedColor = options.backgroundDiffColors ? chalk.bgRed : chalk.red;

        return diff.diffWordsWithSpace(encodeValue(expected), encodeValue(actual)).map(function (item) {
            if (item.added) {
                return addedColor(item.value);
            } else if (item.removed) {
                return removedColor(item.value);
            } else {
                return chalk.gray(item.value);
            }
        }).join('');
    };

    var diffPart = function diffPart(item) {
        return [chalk.gray('    diff:'), coloredDiff(item.actual, item.expected)].join('\n');
    };

    var actualAndExpected = function actualAndExpected(item) {
        return chalk.gray(['    expected:', encodeValue(item.expected), '    actual:', encodeValue(item.actual)].join('\n'));
    };

    return {
        failure: function failure(item) {
            var middle = options.diffView ? diffPart : actualAndExpected;

            var output = [chalk.gray(item.name.join(' - ')), chalk.gray('  ---'), chalk.gray('    operator: ' + item.operator), middle(item), chalk.gray('    at: ' + item.at), chalk.gray('  ...')].join('\n');

            log(null, output);
        },
        exception: function exception(error, runState) {
            var location = runState ? 'at: \'' + runState.lastTest.join(' - ') + '\'' : '';

            var msg = 'Uncaught exception ' + location;
            var details = error.stack ? error.stack : error.name + ': ' + error.message;

            log('red', msg);
            log('gray', details);
        },
        timedOut: function timedOut(testNames, timeout) {
            log('yellow', 'Watchdog timed out after ' + prettyms(timeout) + ' at: \'' + testNames.join(' - ') + '\'');
        },
        runStart: function runStart(runNumber, triggerReason) {
            if (options.clearConsole) {
                process.stdout.write('\x1Bc');
                // process.stdout.write('\033c')    // babel does not compile this, the douch
            }
            var time = new Date().toString().slice(16, 24);
            log('gray', 'Run #' + runNumber + ' triggered at ' + time + ', ' + triggerReason);
        },
        runEnd: function runEnd(success, failure, time) {
            var count = success + failure;
            var completionMsg = count + ' ' + (count > 1 ? 'tests' : 'test') + ' complete';
            var timingMsg = '(' + prettyms(time) + ')';

            if (failure > 0) {
                log('red', completionMsg + ', ' + failure + ' failed ' + timingMsg);
            } else {
                log('green', completionMsg + ' ' + timingMsg);
            }
        }
    };
};