var test = require('tape')

test('complex object', function(t) {
    t.deepEqual(
        {a: 2, b: 23, c: {t: 'asdf'}},
        {a: 2, b: 23, c: {t: {a: {a: 2, b: 23, c: {t: {a: {a: 2, b: 23, c: {t: {a: 54}}}}}}}}}
    )
    t.end()
})