var test = require('tape')
// var Q = require('q')

// TODO: find the case when tape would give wrong location detection with promises (this is not it)
test.skip('promise stack trace test', t => {
    t.plan(1)

    Q.Promise((resolve) => {
        setTimeout(
            _ => resolve(42),
            10
        )
    })
    .then(d => {
        t.equal(d, 42)
    })
})
