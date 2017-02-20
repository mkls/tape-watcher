'use strict';

var path = require('path');
var globby = require('globby');
var hirestime = require('hirestime');
var printerFactory = require('./printer');

var logger = {
    log: function log(value) {
        // eslint-disable-next-line no-console
        console.log(value);
    }
};

var streamMapper = require('./stream-mapper');

var state = {
    options: {},
    running: false,
    testFileNames: [],
    testFileNamesValid: false,
    runNumber: 0,
    runState: null,
    printer: null
};

module.exports = function (options) {
    state.options = options;
    state.printer = printerFactory(logger, options);

    return {
        runTests: runTests,
        unvalidateFileList: function unvalidateFileList() {
            state.testFileNamesValid = false;
        },
        toggleIndentation: function toggleIndentation() {
            state.options.indent = !state.options.indent;
            state.printer = printerFactory(logger, state.options);
            runTests('Intentation for object prinint turned ' + (state.options.indent ? 'on' : 'off'));
        },
        toggleDiffView: function toggleDiffView() {
            state.options.diffView = !state.options.diffView;
            state.printer = printerFactory(logger, state.options);
            runTests('Diff view ' + (state.options.diffView ? 'enabled' : 'disabled'));
        },
        setPrintDepth: function setPrintDepth(value) {
            state.options.objectPrintDepth = Number(value);
            runTests('objectPrintDepth changed to ' + value);
        }
    };
};

process.on('uncaughtException', function (error) {
    state.printer.exception(error, state.runState);
    cleanUp();
});

function runTests(triggerReason) {
    if (state.running) {
        return;
    }
    state.running = true;
    state.runNumber += 1;

    clearRequireCash();

    var runState = state.runState = {
        success: 0,
        failure: 0,
        timer: hirestime(),
        lastTest: ['parsing test files'],
        testNames: {},
        watchdogTimeoutId: null,
        tape: requireHere('tape')
    };

    if (!state.testFileNamesValid) {
        state.testFileNames = globby.sync(state.options.testFilesGlob);
        state.testFileNamesValid = true;
    }

    state.printer.runStart(state.runNumber, triggerReason);

    runState.tape.createStream({ objectMode: true }).on('data', function (row) {
        if (row.type === 'test') {
            handleTest(row, runState);
        }
        if (row.type === 'assert') {
            handleAssert(row, runState);
        }
    }).on('end', function () {
        state.printer.runEnd(runState.success, runState.failure, runState.timer());
        cleanUp();
    });

    state.testFileNames.forEach(function (file) {
        return require(path.resolve(file));
    });
}

function handleAssert(item, runState) {
    if (item.ok) {
        runState.success += 1;
    } else {
        runState.failure += 1;

        var assert = streamMapper.assertMapper(process.cwd(), runState.testNames, item);
        state.printer.failure(assert, state.diffView);
    }
}

function handleTest(item, runState) {
    var testName = streamMapper.getTestName(item, runState.testNames);
    runState.testNames[item.id] = runState.lastTest = testName;

    if (runState.watchdogTimeoutId) {
        clearTimeout(runState.watchdogTimeoutId);
    }
    runState.watchdogTimeoutId = setTimeout(function () {
        state.printer.timedOut(runState.lastTest, state.options.watchdogTimeout);
        cleanUp();
    }, state.options.watchdogTimeout);
}

function cleanUp() {
    if (state.runState) {
        var runState = state.runState;

        var harness = runState.tape.getHarness();
        harness._results.removeAllListeners();
        harness._tests = [];

        if (runState.watchdogTimeoutId) {
            clearTimeout(runState.watchdogTimeoutId);
        }

        state.runState = null;
    }

    process.removeAllListeners('exit');
    state.running = false;
}

/**
 * Requiring package relative to project __dirname
 */
function requireHere(module) {
    return require(path.join(process.cwd(), 'node_modules', module));
}

/*
 * Delete require cache for any app code (non-modules) and tape itself.
 * We need to clear out tape so that its state is reset.
 */
function clearRequireCash() {
    Object.keys(require.cache).forEach(function (fileName) {
        if (fileName.indexOf('node_modules') === -1 || fileName.indexOf(path.join('node_modules', 'tape')) > -1) {

            delete require.cache[fileName];
        }
    });
}