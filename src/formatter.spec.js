var test = require('tape')

var formatter = require('./formatter')

test('formatting a single failing assertion', function (t) {
  var name = 'this should do things'
  var assertion = {
    type: 'assert',
    operator: 'deepEqual',
    name: 'should be equivalent',
    file: 'some/place/over/the/rainbow',
    actual: 5,
    expected: 4
  }

  var expected = `  this should do things
    operator: deepEqual
    expected:
      4
    actual:
      5
    at:
      some/place/over/the/rainbow`

  t.deepEqual(formatter(name, assertion), expected)
  t.end()
})

test('assertion has a non default name', function (t) {
  var name = 'this should do things'
  var assertion = {
    type: 'assert',
    operator: 'deepEqual',
    name: 'testing trivial stuff',
    file: 'some/place/over/the/rainbow',
    actual: 5,
    expected: 4
  }

  var expected = `  this should do things - testing trivial stuff
    operator: deepEqual
    expected:
      4
    actual:
      5
    at:
      some/place/over/the/rainbow`

  t.deepEqual(formatter(name, assertion), expected)
  t.end()
})

// TODO
// test('formats object values to be printed', function (t) {
//   var name = 'this should do things'
//   var assertion = {
//     type: 'assert',
//     operator: 'deepEqual',
//     name: 'testing trivial stuff',
//     file: 'some/place/over/the/rainbow',
//     actual: 5,
//     expected: 4
//   }

//   var expected = `  this should do things - testing trivial stuff
//     operator: deepEqual
//     expected:
//       4
//     actual:
//       5
//     at:
//       some/place/over/the/rainbow`

//   t.deepEqual(formatter(name, assertion), expected)
//   t.end()
// })

