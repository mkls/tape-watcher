'use strict';

var failureLocation = require('./get-failure-location');

module.exports = {
    nonDefaultAssertionName: nonDefaultAssertionName,
    assertMapper: assertMapper,
    getTestName: getTestName
};

function assertMapper(dirname, testNames, assertion) {
    var assertionName = nonDefaultAssertionName(assertion.name, assertion.operator);
    var testName = testNames[assertion.test];
    var name = assertionName ? testName.concat(assertionName) : testName;

    var at = failureLocation(dirname, assertion.error.stack);

    return {
        ok: assertion.ok,
        name: name,
        operator: assertion.operator,
        actual: assertion.actual,
        expected: assertion.expected,
        at: at
    };
}

function getTestName(test, testNames) {
    return typeof test.parent === 'number' ? testNames[test.parent].concat(test.name) : [test.name];
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
    };

    var matchingName = defaultNames[operator];

    if (matchingName && matchingName.indexOf(assertionName) > -1) {
        return undefined;
    } else {
        return assertionName;
    }
}