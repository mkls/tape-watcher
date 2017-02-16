var failureLocation = require('./get-failure-location')

module.exports = {
    nonDefaultAssertionName,
    handleStream,
    assertMapper
}

function assertMapper(state, assertion) {
    var assertionName = nonDefaultAssertionName(assertion.name, assertion.operator)
    var testNames = state.testNames[assertion.test]
    var names = assertionName ? testNames.concat(assertionName) : testNames

    var at = failureLocation(state.dirname, assertion.error.stack)

    return {
        testNames: state.testNames,
        dirname: state.dirname,
        lastAssertion: {
            ok: assertion.ok,
            names,
            operator: assertion.operator,
            actual: assertion.actual,
            expected: assertion.expected,
            at
        }
    }
}

function handleStream(input) {
    return input.reduce(function (accu, item) {
        if (item.type === 'test') {
            if (typeof item.parent === 'number') {
                accu.testNames[item.id] = accu.testNames[item.parent].concat(item.name)
            } else {
                accu.testNames[item.id] = [item.name]
            }
        } else if (item.type === 'assert') {
            var testNames = accu.testNames[item.test]
            var assertionName = nonDefaultAssertionName(item.name, item.operator)

            accu.mappedAsserts.push({
                names: assertionName ? testNames.concat(assertionName) : testNames
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
function nonDefaultAssertionName(assertionName, operator) {
    var defaultNames = {
        'ok': ['should be truthy'],
        'notOk': ['should be falsy'],
        'equal': ['should be equal'],
        'notEqual': ['should not be equal'],
        'deepEqual': ['should be equivalent'],
        'deepLooseEqual': ['should be equivalent'],
        'notDeepEqual': ['should not be equivalent'],
        'notDeepLooseEqual': ['should be equivalent'],
        'throws': ['should throw', 'should not throw']
    }

    var matchingName = defaultNames[operator]

    if (matchingName && matchingName.indexOf(assertionName) > -1) {
        return undefined
    } else {
        return assertionName
    }
}

/**
 * I would like to map the object stream to a stream of object like this for each assert
 */

