var test = require('tape')

test('dummy test', function (t) {
    t.pass('works')
    t.deepEqual(1, 1)
    t.deepEqual('hat', 'hat', 'check hat is hat')
    t.end() 
})   
