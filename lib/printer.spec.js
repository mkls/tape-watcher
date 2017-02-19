'use strict';

var _templateObject = _taggedTemplateLiteral(['\n    A - B\n      ---\n        operator: equal\n        expected:\n          2\n        actual:\n          1\n        at: fixtures\\promise.spec.js:14:11\n      ...'], ['\n    A - B\n      ---\n        operator: equal\n        expected:\n          2\n        actual:\n          1\n        at: fixtures\\\\promise.spec.js:14:11\n      ...']),
    _templateObject2 = _taggedTemplateLiteral(['\n    A - B\n      ---\n        operator: equal\n        diff:\n          21\n        at: undefined\n      ...'], ['\n    A - B\n      ---\n        operator: equal\n        diff:\n          21\n        at: undefined\n      ...']);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var test = require('tape');

var printerFactory = require('./printer');
var logger = {
    value: null,
    log: function log(value) {
        this.value = value;
    }
};

test('printer.failure simple values', function (t) {
    var assert = {
        name: ['A', 'B'],
        operator: 'equal',
        actual: 1,
        expected: 2,
        at: 'fixtures\\promise.spec.js:14:11'
    };

    var expected = normalizePadding(_templateObject);

    var printer = printerFactory(logger, { disableColors: true });
    printer.failure(assert);
    t.deepEqual(logger.value, expected);

    t.end();
});

test('printer.failure diffView', function (t) {
    var assert = {
        name: ['A', 'B'],
        operator: 'equal',
        actual: 1,
        expected: 2
    };

    var expected = normalizePadding(_templateObject2);

    var printer = printerFactory(logger, { disableColors: true, diffView: true });
    printer.failure(assert);
    t.deepEqual(logger.value, expected);

    t.end();
});

function normalizePadding(string) {
    var lines = string[0].split('\n');
    var padLength = /^ +/.exec(lines[1])[0].length - 2;
    return lines.map(function (line) {
        return line.slice(padLength);
    }).join('\n');
}