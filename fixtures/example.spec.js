var test = require('tape')

test('comparing complex objects', t => {
    var actual = {
        errors: ['Etwas went kaputt'],
        warnings: ['Nich marchieren'],
        value: {
            interMitter: 23,
            lubenSchugen: [{
                pair: true,
                hosenLade: 'XL'
            }, {
                pair: false,
                hosenLade: 'S'
            }],
            spatizieren: 'ja'
        }
    }

    var expected = {
        errors: ['Etwas went kaputt'],
        warnings: ['Nich marchieren'],
        value: {
            interMitter: 23,
            lubenSchugen: [{
                pair: true,
                hosenLade: 'XL'
            }, {
                pair: false,
                hosenLade: 'S'
            }],
            spatizieren: 'ja'
        }
    }

    t.deepEqual(actual, expected)
    t.end()
})
