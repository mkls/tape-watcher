const prettyms = require('pretty-ms')
const inspect = require('object-inspect')
const diff = require('diff')
const chalkMain = require('chalk')

const addPadding = padding => string => {
    return string
        .split('\n')
        .map(line => padding + line)
        .join('\n')
}

/**
 * Options usd here:
 *   clearConsole = true: clears the console at the start of new runs
 *   disableColors = false: turns off chalk
 *   objectPrintDepth = 5: passed down to object-inspect
 *   backgroundDiffColors = false: print diffs with the background colored (shows whitespace diff)
 *
 *   TODOs
 *   indentValues = false: print objects indented
 */
module.exports = (logger, options = {}) => {
    // chalk.enabled = !options.disableColors   // could be more effiecent, but annoying when developing
    const chalk = new chalkMain.constructor({enabled: !options.disableColors})

    const log = (color, text) => {
        const value = '\n' + addPadding('  ')(text)
        logger.log(color ? chalk[color](value) : value)
    }

    const encodeValue = value => {
        const padder = addPadding('      ')

        if (typeof value === 'string') {
            return padder(value)
        } else {
            return padder(inspect(value, {depth: options.objectPrintDepth || 5}))
        }
    }

    const coloredDiff = (actual, expected) => {
        const addedColor = options.backgroundDiffColors ? chalk.bgGreen : chalk.green
        const removedColor = options.backgroundDiffColors ? chalk.bgRed : chalk.red

        return diff.diffWordsWithSpace(
            encodeValue(expected),
            encodeValue(actual)
        ).map(item => {
            if (item.added) {
                return addedColor(item.value)
            } else if (item.removed) {
                return removedColor(item.value)
            } else {
                return chalk.gray(item.value)
            }
        }).join('')
    }

    const diffPart = item => {
        return [
            chalk.gray('    diff:'),
            coloredDiff(item.actual, item.expected)
        ].join('\n')
    }

    const actualAndExpected = item => {
        return chalk.gray([
            '    expected:',
            encodeValue(item.expected),
            '    actual:',
            encodeValue(item.actual)
        ].join('\n'))
    }

    return {
        failure(item) {
            const middle = options.diffView ? diffPart : actualAndExpected

            const output = [
                chalk.gray(item.name.join(' - ')),
                chalk.gray('  ---'),
                chalk.gray('    operator: ' + item.operator),
                middle(item),
                chalk.gray('    at: ' + item.at),
                chalk.gray('  ...')
            ].join('\n')

            log(null, output)
        },

        exception(error, runState) {
            const location = runState ?
                `at: '${runState.lastTest.join(' - ')}'` :
                ''

            const msg = `Uncaught exception ${location}`
            const details = error.stack ? error.stack : `${error.name}: ${error.message}`

            log('red', msg)
            log('gray', details)
        },

        timedOut(testNames, timeout) {
            log('yellow', `Watchdog timed out after ${prettyms(timeout)} at: '${testNames.join(' - ')}'`)
        },

        runStart(runNumber, triggerReason) {
            if (options.clearConsole) {
                process.stdout.write('\x1Bc')
                // process.stdout.write('\033c')    // babel does not compile this, the douch
            }
            const time = new Date().toString().slice(16, 24)
            log('gray', `Run #${runNumber} triggered at ${time}, ${triggerReason}`)
        },

        runEnd(success, failure, time) {
            const count = success + failure
            const completionMsg = `${count} ${count > 1 ? 'tests' : 'test'} complete`
            const timingMsg = `(${prettyms(time)})`

            if (failure > 0) {
                log('red', `${completionMsg}, ${failure} failed ${timingMsg}`)
            } else {
                log('green', `${completionMsg} ${timingMsg}`)
            }
        },
    }
}
