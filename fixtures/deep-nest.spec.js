var test = require('tape')

test('complex object', function (t) {
    t.deepEqual(
        {a: 1, b: {c: 2}},
        {a: 1, b: {c: 3}}
    )

    t.test('nested one', function (t) {
        t.equal(1, 2)
        t.end()
    })

    t.test('nested 3', function (t) {
        t.same('a', 'b', 'cuccmany')

        t.test('deep nested', function (t) {
            t.ok()
            t.end()
        })
        t.end()
    })

    t.end()
})
