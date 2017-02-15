var path = require('path')
var globby = require('globby')
var chokidar = require('chokidar')
var chalk = require('chalk')
var prettyms = require('pretty-ms')
var hirestime = require('hirestime')
var inspect = require('object-inspect')

var failurePrinter = require('./src/failure-printer')

const settings = {
    watchGlob: '.',
    testFilesGlob: 'src/*.spec.js',
    watchdogTimeout: 1000
}

var state = {
    running: false,
    reRunAfterFinish: false,
    reReadTestFiles: false
}

var runNumber = 0

process.on('uncaughtException', function (err) {
    console.log(chalk.red('Uncaught exception: \n', err.stack || err.message || err))
})

console.log(chalk.gray('\n  Starting up... '))
var testFiles = globby.sync(settings.testFilesGlob)

var watcher = chokidar.watch(settings.watchGlob, {
    ignored: /[\/\\]\.|node_modules/,
    persistent: true,
    ignoreInitial: true
})

watcher.on('change', runTests)
watcher.on('add', readAndRunTests)
watcher.on('unlink', readAndRunTests)

readAndRunTests()

function readAndRunTests() {
    testFiles = globby.sync(settings.testFilesGlob)
    runTests()
}

function runTests() {
    if (state.running) {
        state.reRunAfterFinish = true
        return
    }
    state.running = true

    var timer = hirestime()

    runNumber += 1
    var time = new Date().toString().slice(16, 24)
    console.log(chalk.gray('\n  New run triggered... (#' + runNumber + ', ' + time + ')'))

    var stats = {
        success: 0,
        failure: 0,
        timer: hirestime()
    }

    clearRequireCash()
    // eslint-disable-next-line global-require
    var tape = require('tape')

    var watchdogTimeoutId = setTimeout(function () {
        console.log(chalk.yellow('  Watchdog: test timed out after ' + prettyms(settings.watchdogTimeout)))
        cleanUp(tape)
    }, settings.watchdogTimeout)

    tape
        .createStream({ objectMode: true })
        .on('data', function (row) {
            if (row.type === 'assert') {
                if (row.ok) {
                    stats.success += 1
                } else {
                    stats.failure += 1

                    var failureReport = {
                        name: row.name,
                        operator: row.operator,
                        expected: inspect(row.expected),
                        actual: inspect(row.actual),
                        at: getRelativePath(__dirname, row.file)
                    }

                    var formatted = failurePrinter(failureReport)

                    var padded = formatted.split('\n')
                        .map(function (row) {
                            return '  ' + row
                        })
                        .join('\n')
                    console.log(chalk.gray('\n' + padded))

                    // https://www.npmjs.com/package/ansidiff
                }
            }
        })
        .on('end', function () {
            printEndStats(stats)
            clearTimeout(watchdogTimeoutId)
            cleanUp(tape)
        })

    testFiles.forEach(function (file) {
        // eslint-disable-next-line global-require
        require(path.resolve(file))
    })
}

function cleanUp(tape) {

    // cleaning some stuff up, so we don't get memory leak warning
    var harness = tape.getHarness()
    harness._results.removeAllListeners()
    harness._tests = []

    process.removeAllListeners('exit')

    state.running = false
    if (state.reRunAfterFinish) {
        state.reRunAfterFinish = false

        // runTests(); // this might be not that important
    }
}

/**
 * Prints end message
 */
function printEndStats(stats) {
    var time = prettyms(stats.timer())

    console.log('')
    if (!stats.failure) {
        var successMessage = '  Run ' + stats.success + ' tests successfully in ' + time
        console.log(chalk.green(successMessage))
    } else {
        var failureMessage = '  ' + stats.failure + ' tests failed, ' + stats.success +
            ' successfull in ' + time
        console.log(chalk.red(failureMessage))
    }
}

/**
 * Gets the relative path from full path returned in row data
 */
function getRelativePath(basePath, path) {
    var startIndex = path.indexOf(basePath) + basePath.length + 1
    return path.slice(startIndex)
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

/**
 * Partial staff for later and for debugging
 */

// in case we want to write datastream to file
// .on('end', function () {
//     console.log('eNDDUOLO', dataStream);

//     var fs = require('fs');
//     fs.writeFileSync('./src/tdd/deep-nest.json', JSON.stringify(dataStream, null, 4));
// });

// YES, I can do improved line number detection
// if (row.error) {
//     console.log(row.error.stack)
// }

// for debugging many runs after each other
// for (var i = 0; i < 1; i += 1) {
//     setTimeout(function () {
//         runTests();
//     }, i * 500);
// }
