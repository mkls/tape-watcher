const path = require('path')
const globby = require('globby')
const hirestime = require('hirestime')

const printer = require('./printer')
const streamMapper = require('./stream-mapper')

const state = {
    running: false,
    testFileNames: [],
    testFileNamesValid: false,
    runNumber: 0,
    runState: null
}

module.exports = (settings) => {
    state.settings = settings

    return {
        runTests,
        unvalidateFileList
    }
}

process.on('uncaughtException', error => {
    printer.exception(error, state.runState)
    cleanUp()
})

function unvalidateFileList() {
    state.testFileNamesValid = false
}

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
        tape: require('tape')
    }

    if (!state.testFileNamesValid) {
        state.testFileNames = globby.sync(state.settings.testFilesGlob)
        state.testFileNamesValid = true
    }

    printer.runStart(state.runNumber, triggerReason, state.settings.clearConsole)

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
            printer.runEnd(runState.success, runState.failure, runState.timer())
            cleanUp()
        })

    state.testFileNames.forEach(file => require(path.resolve(file)))
}

function handleAssert(item, runState) {
    if (item.ok) {
        runState.success += 1
    } else {
        runState.failure += 1

        const assert = streamMapper.assertMapper(__dirname, runState.testNames, item)
        printer.failure(assert)
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
            printer.timedOut(runState.lastTest, state.settings.watchdogTimeout)
            cleanUp()
        },
        state.settings.watchdogTimeout
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
