var test = require('tape')

test('complex object', function(t) {
    t.deepEqual(
        {a: 2, b: 23, c: 'asdf'},
        {a: 2, b: 23, c: 23}
    )
    t.end()
})