const test = require('tape')

const printerFactory = require('./printer')
const logger = {
    value: null,
    log(value) {
        this.value = value
    }
}


test('printer.failure simple values', t => {
    var assert = {
        name: ['A', 'B'],
        operator: 'equal',
        actual: 1,
        expected: 2,
        at: 'fixtures\\promise.spec.js:14:11'
    }

    var expected = normalizePadding`
    A - B
      ---
        at: fixtures\\promise.spec.js:14:11
        operator: equal
        expected:
          2
        actual:
          1
      ...`

    const printer = printerFactory(logger, {disableColors: true})
    printer.failure(assert)
    t.deepEqual(logger.value, expected)

    t.end()
})

test('printer.failure diffView', t => {
    var assert = {
        name: ['A', 'B'],
        operator: 'equal',
        actual: 1,
        expected: 2
    }

    var expected = normalizePadding`
    A - B
      ---
        at: undefined
        operator: equal
        diff:
          21
      ...`

    const printer = printerFactory(logger, {disableColors: true, diffView: true})
    printer.failure(assert)
    t.deepEqual(logger.value, expected)

    t.end()
})

test('printer.failure indented view', t => {
    var assert = {
        name: ['A', 'B'],
        operator: 'equal',
        actual: {a: 1, b: 2},
        expected: {a: 1, b: 'hap'}
    }

    var expected = normalizePadding`
    A - B
      ---
        at: undefined
        operator: equal
        expected:
          {
            a: 1,
            b: 'hap'
          }
        actual:
          {
            a: 1,
            b: 2
          }
      ...`

    const printer = printerFactory(logger, {disableColors: true, indent: true})
    printer.failure(assert)
    t.deepEqual(logger.value, expected)

    t.end()
})

test('printer.failure object has inspect method defined', t => {
    var assert = {
        name: ['A', 'B'],
        operator: 'equal',
        actual: {
            inspect() {
                return {
                    a: 1,
                    b: 2
                }
            }
        },
        expected: {a: 1, b: 'hap'}
    }

    var expected = normalizePadding`
    A - B
      ---
        at: undefined
        operator: equal
        expected:
          {
            a: 1,
            b: 'hap'
          }
        actual:
          {
            a: 1,
            b: 2
          }
      ...`

    const printer = printerFactory(logger, {disableColors: true, indent: true})
    printer.failure(assert)
    t.deepEqual(logger.value, expected)

    t.end()
})

function normalizePadding(string) {
    const lines = string[0].split('\n')
    const padLength = /^ +/.exec(lines[1])[0].length - 2
    return lines
        .map(line => line.slice(padLength))
        .join('\n')
}
