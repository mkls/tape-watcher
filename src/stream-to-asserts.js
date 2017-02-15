module.exports = function (input) {
    return input.reduce(function (accu, item) {
        if (item.type === 'test') {
            if (typeof item.parent === 'number') {
                accu.testNames[item.id] = accu.testNames[item.parent].concat(item.name)
            } else {
                accu.testNames[item.id] = [item.name]
            }
        } else if (item.type === 'assert') {
            accu.mappedAsserts.push({
                names: accu.testNames[item.test],
                assertionName: item.name
            })
        }
        return accu
    }, {
        testNames: [],
        mappedAsserts: []
    })
}

/**
 * If no assertion name is set, tape sets a default one.
 * I find it irrelevant, so I'd rather just have undefined in this cases
 */
var defaultAssertionNamesForOperators = {
    'ok': 'should be truthy',
    'notOk': 'should be falsy',
    'equal': 'should be equal',
    'notEqual': 'should not be equal',
    'deepEqual': 'should be equivalent',
    'deepLooseEqual': 'should be equivalent',
    'notDeepEqual': 'should not be equivalent',
    'notDeepLooseEqual': 'should be equivalent',
    'throws': ['should throw', 'should not throw']
}

/**
 * I would like to map the object stream to a stream of object like this for each assert
 */
var expectedMappedAssertion = {
    names: ['A', 'B', 'assertion name if not default'],
    at: 'new at detection with relative path',
    actual: {},
    expected: {},
    operator: 'deepEqual',
    ok: false
}
