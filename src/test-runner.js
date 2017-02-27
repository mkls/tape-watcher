const path = require('path')
const globby = require('globby')
const hirestime = require('hirestime')
const printerFactory = require('./printer')

const logger = {
    log(value) {
        // eslint-disable-next-line no-console
        console.log(value)
    }
}

const streamMapper = require('./stream-mapper')

const state = {
    options: {},
    running: false,
    testFileNames: [],
    testFileNamesValid: false,
    runNumber: 0,
    runState: null,
    printer: null
}

module.exports = (options) => {
    state.options = options
    state.printer = printerFactory(logger, options)

    return {
        runTests,
        unvalidateFileList() {
            state.testFileNamesValid = false
        },
        toggleIndentation() {
            state.options.indent = !state.options.indent
            state.printer = printerFactory(logger, state.options)
            runTests('Intentation for object printing turned ' + (state.options.indent ? 'on' : 'off'))
        },
        toggleDiffView() {
            state.options.diffView = !state.options.diffView
            state.printer = printerFactory(logger, state.options)
            runTests('Diff view ' + (state.options.diffView ? 'enabled' : 'disabled'))
        },
        setPrintDepth(value) {
            state.options.objectPrintDepth = Number(value)
            runTests('objectPrintDepth changed to ' + value)
        }
    }
}

process.on('uncaughtException', error => {
    state.printer.exception(error, state.runState)
    cleanUp()
})

function runTests(triggerReason) {
    if (state.running) {
        return
    }
    state.running = true
    state.runNumber += 1

    clearRequireCash()

    const runState = state.runState = {
        success: 0,
        failure: 0,
        timer: hirestime(),
        lastTest: ['parsing test files'],
        testNames: {},
        watchdogTimeoutId: null,
        tape: requireHere('tape')
    }

    if (!state.testFileNamesValid) {
        state.testFileNames = globby.sync(state.options.testFilesGlob)
        state.testFileNamesValid = true
    }

    state.printer.runStart(state.runNumber, triggerReason)

    runState.tape
        .createStream({ objectMode: true })
        .on('data', row => {
            if (row.type === 'test') {
                handleTest(row, runState)
            }
            if (row.type === 'assert') {
                handleAssert(row, runState)
            }
        })
        .on('end', () => {
            state.printer.runEnd(runState.success, runState.failure, runState.timer())
            cleanUp()
        })

    state.testFileNames.forEach(file => require(path.resolve(file)))
}

function handleAssert(item, runState) {
    if (item.ok) {
        runState.success += 1
    } else {
        runState.failure += 1

        const assert = streamMapper.assertMapper(process.cwd(), runState.testNames, item)
        state.printer.failure(assert, state.diffView)
    }
}

function handleTest(item, runState) {
    const testName = streamMapper.getTestName(item, runState.testNames)
    runState.testNames[item.id] = runState.lastTest = testName

    if (runState.watchdogTimeoutId) {
        clearTimeout(runState.watchdogTimeoutId)
    }
    runState.watchdogTimeoutId = setTimeout(
        () => {
            state.printer.timedOut(runState.lastTest, state.options.watchdogTimeout)
            cleanUp()
        },
        state.options.watchdogTimeout
    )
}

function cleanUp() {
    if (state.runState) {
        const runState = state.runState

        const harness = runState.tape.getHarness()
        harness._results.removeAllListeners()
        harness._tests = []

        if (runState.watchdogTimeoutId) {
            clearTimeout(runState.watchdogTimeoutId)
        }

        state.runState = null
    }

    process.removeAllListeners('exit')
    state.running = false
}

/**
 * Requiring package relative to project __dirname
 */
function requireHere(module) {
    return require(path.join(process.cwd(), 'node_modules', module))
}

/*
 * Delete require cache for any app code (non-modules) and tape itself.
 * We need to clear out tape so that its state is reset.
 */
function clearRequireCash() {
    Object.keys(require.cache)
        .forEach(function (fileName) {
            if (fileName.indexOf('node_modules') === -1 ||
                fileName.indexOf(path.join('node_modules', 'tape')) > -1) {

                delete require.cache[fileName]
            }
        })
}
