var test = require('tape')

test('dummy test', function (t) {
    t.pass('works')
    t.deepEqual(1, 2)
    t.same('hat', 'hat', 'check hat is hat')
    t.end() 
})   
