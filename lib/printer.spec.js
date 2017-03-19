'use strict';

var _templateObject = _taggedTemplateLiteral(['\n    A - B\n      ---\n        at: fixtures\\promise.spec.js:14:11\n        operator: equal\n        expected:\n          2\n        actual:\n          1\n      ...'], ['\n    A - B\n      ---\n        at: fixtures\\\\promise.spec.js:14:11\n        operator: equal\n        expected:\n          2\n        actual:\n          1\n      ...']),
    _templateObject2 = _taggedTemplateLiteral(['\n    A - B\n      ---\n        at: undefined\n        operator: equal\n        diff:\n          21\n      ...'], ['\n    A - B\n      ---\n        at: undefined\n        operator: equal\n        diff:\n          21\n      ...']),
    _templateObject3 = _taggedTemplateLiteral(['\n    A - B\n      ---\n        at: undefined\n        operator: equal\n        expected:\n          {\n            a: 1,\n            b: \'hap\'\n          }\n        actual:\n          {\n            a: 1,\n            b: 2\n          }\n      ...'], ['\n    A - B\n      ---\n        at: undefined\n        operator: equal\n        expected:\n          {\n            a: 1,\n            b: \'hap\'\n          }\n        actual:\n          {\n            a: 1,\n            b: 2\n          }\n      ...']);

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

test('printer.failure indented view', function (t) {
    var assert = {
        name: ['A', 'B'],
        operator: 'equal',
        actual: { a: 1, b: 2 },
        expected: { a: 1, b: 'hap' }
    };

    var expected = normalizePadding(_templateObject3);

    var printer = printerFactory(logger, { disableColors: true, indent: true });
    printer.failure(assert);
    t.deepEqual(logger.value, expected);

    t.end();
});

test('printer.failure object has inspect method defined', function (t) {
    var assert = {
        name: ['A', 'B'],
        operator: 'equal',
        actual: {
            inspect: function inspect() {
                return {
                    a: 1,
                    b: 2
                };
            }
        },
        expected: { a: 1, b: 'hap' }
    };

    var expected = normalizePadding(_templateObject3);

    var printer = printerFactory(logger, { disableColors: true, indent: true });
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