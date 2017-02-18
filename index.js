const path = require('path')
const globby = require('globby')
const chokidar = require('chokidar')
const hirestime = require('hirestime')

const printer = require('./src/printer')
const streamMapper = require('./src/stream-mapper')

const settings = {
    watchGlob: '.',
    testFilesGlob: 'manua*/deep-eq*.spec.js',
    watchdogTimeout: 300,
    clearConsole: true
}

const state = {
    running: false,
    testFiles: [],
    shouldGetTestFiles: true,
    runNumber: 0,
    runState: null
}

process.on('uncaughtException', error => {
    printer.exception(error, state.runState)
    cleanUp()
})

const watcher = chokidar.watch(
    settings.watchGlob,
    {
        ignored: /[\/\\]\.|node_modules|.git/,
        persistent: true,
        ignoreInitial: true
    }
)

watcher
    .on('change', path => runTests(`${path} changed`))
    .on('add', path => {
        state.shouldGetTestFiles = true
        runTests(`${path} added`)
    })
    .on('unlink', path => {
        state.shouldGetTestFiles = true
        runTests(`${path} removed`)
    })

runTests('Initial run')


function runTests(triggerReason) {
    if (state.running) {
        return
    }
    state.running = true
    state.runNumber += 1

    if (state.shouldGetTestFiles) {
        state.testFiles = globby.sync(settings.testFilesGlob)
        state.shouldGetTestFiles = false
    }

    printer.runStart(state.runNumber, triggerReason, settings.clearConsole)

    clearRequireCash()

    const runState = {
        success: 0,
        failure: 0,
        timer: hirestime(),
        testNames: {
            lastTest: ['parsing test files']
        },
        watchdogTimeoutId: null,
        // eslint-disable-next-line global-require
        tape: require('tape')
    }
    state.runState = runState

    runState.tape
        .createStream({ objectMode: true })
        .on('data', (row) => {
            if (row.type === 'test') {
                runState.testNames = streamMapper.testNameMapper(row, runState.testNames)

                setUpTestWatchdog(runState)
            }
            if (row.type === 'assert') {
                if (row.ok) {
                    runState.success += 1
                } else {
                    runState.failure += 1

                    const assert = streamMapper.assertMapper(__dirname, runState.testNames, row)
                    printer.failure(assert)
                }
            }
        })
        .on('end', () => {
            printer.runEnd(runState.success, runState.failure, runState.timer())
            cleanUp()
        })

    // eslint-disable-next-line global-require
    state.testFiles.forEach(file => require(path.resolve(file)))
}

function setUpTestWatchdog(runState) {
    if (runState.watchdogTimeoutId) {
        clearTimeout(runState.watchdogTimeoutId)
    }
    runState.watchdogTimeoutId = setTimeout(
        () => {
            printer.timedOut(runState.testNames.lastTest, settings.watchdogTimeout)
            cleanUp()
        },
        settings.watchdogTimeout
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

// for debugging many runs after each other
// for (var i = 0; i < 1; i += 1) {
//     setTimeout(function () {
//         runTests();
//     }, i * 500);
// }
