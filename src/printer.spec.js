const test = require('tape')

const logger = {
    value: null,
    log(value) {
        this.value = value
    }
}

const printer = require('./printer')(logger, {disableColors: true})

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
        operator: equal
        expected:
          2
        actual:
          1
        at: fixtures\\promise.spec.js:14:11
      ...`

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
        operator: equal
        diff:
          21
        at: undefined
      ...`

    printer.failure(assert, true)
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
