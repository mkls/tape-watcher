var test = require('tape')

var helpers = require('./helpers')

test('formatValue', t => {
  t.equal(
    helpers.formatValue(true),
    '      true',
    'boolean value'
  )

  t.equal(
    helpers.formatValue('taap'),
    '      taap',
    'string value'
  )

  t.equal(
    helpers.formatValue(34),
    '      34',
    'number value'
  )

  t.equal(
    helpers.formatValue({
      a: 34, 
      b: 'hap', 
      c: [1, 2]
    }),
`      {
        "a": 34,
        "b": "hap",
        "c": [
          1,
          2
        ]
      }`,
    'object value'
  )

  t.end()
})
