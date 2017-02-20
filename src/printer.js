const prettyms = require('pretty-ms')
const inspect = require('../dependencies/object-inspect-fork')
const diff = require('diff')
// const chalk = require('chalk')
const chalkMain = require('chalk')

const addPadding = padding => string => {
    return string
        .split('\n')
        .map(line => padding + line)
        .join('\n')
}

/**
 * Options used here:
 *   clearConsole: clears the console at the start of new runs
 *   disableColors: turns off chalk
 *   subtleDiffColors: print diffs with colored letters instead of colored background (does not show whitespace diff)
 *   objectPrintDepth: passed down to object-inspect
 *   indent: print objects indented
 *   diffView: prints the colored diff of actual and expected instead of the two values separately
 */
module.exports = (logger, options = {}) => {
    // chalk.enabled = !options.disableColors   // more effiecent, but annoying when developing
    const chalk = new chalkMain.constructor({enabled: !options.disableColors})  // god when testing

    const log = (color, text) => {
        const value = '\n' + addPadding('  ')(text)
        logger.log(color ? chalk[color](value) : value)
    }

    const encodeValue = value => {
        const padder = addPadding('      ')

        if (typeof value === 'string') {
            return padder(value)
        } else {
            return padder(inspect(value, {
                depth: options.objectPrintDepth || 5,
                indent: options.indent ? '  ' : undefined
            }))
        }
    }

    const coloredDiff = (actual, expected) => {
        const addedColor = options.subtleDiffColors ? chalk.green : chalk.bgGreen
        const removedColor = options.subtleDiffColors ? chalk.red : chalk.bgRed

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

            const top = [
                item.name.join(' - '),
                '  ---',
                '    at: ' + item.at,
                '    operator: ' + item.operator,
            ].join('\n')

            const output = [
                chalk.gray(top),
                middle(item),
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
