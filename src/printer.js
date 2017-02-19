const chalk = require('chalk')
const prettyms = require('pretty-ms')
const inspect = require('object-inspect')
const diff = require('diff')

const addPadding = padding => string => {
    return string
        .split('\n')
        .map(line => padding + line)
        .join('\n')
}

const colorLog = color => text => {
    const value = '\n' + addPadding('  ')(text)

    // eslint-disable-next-line no-console
    console.log(color ? chalk[color](value) : value)
}
const red = colorLog('red')
const green = colorLog('green')
const gray = colorLog('gray')
const yellow = colorLog('yellow')

const encodeValue = value => {
    const padder = addPadding('      ')

    if (typeof value === 'string') {
        return padder(value)
    } else {
        return padder(inspect(value))
    }
}

const coloredDiff = (actual, expected) => {
    return diff.diffWords(
        encodeValue(expected),
        encodeValue(actual)
    ).map(item => {
        if (item.added) {
            return chalk.green(item.value)
        } else if (item.removed) {
            return chalk.red(item.value)
        } else {
            return chalk.gray(item.value)
        }
    }).join('')
}

const failure = item => {
    const output = chalk.gray(`${item.name.join(' - ')}
  ---
    operator: ${item.operator}
    expected:
${encodeValue(item.expected)}
    actual:
${encodeValue(item.actual)}
    diff:
`) +

    coloredDiff(item.actual, item.expected) + '\n' +

    chalk.gray(`    at: ${item.at}
  ...`)

    colorLog()(output)
}

const exception = (error, runState) => {
    const location = runState ?
        `at: '${runState.lastTest.join(' - ')}'` :
        ''

    const msg = `Uncaught exception ${location}`
    const details = error.stack ? error.stack : `${error.name}: ${error.message}`

    red(msg)
    gray(details)
}

const timedOut = (testNames, timeout) => {
    yellow(`Watchdog timed out after ${prettyms(timeout)} at: '${testNames.join(' - ')}'`)
}

const runStart = (runNumber, triggerReason, clearConsole = false) => {
    if (clearConsole) {
        process.stdout.write('\033c')
    }
    const time = new Date().toString().slice(16, 24)
    gray(`Run #${runNumber} triggered at ${time}, ${triggerReason}`)
}

const runEnd = (success, failure, time) => {
    const count = success + failure
    const completionMsg = `${count} ${count > 1 ? 'tests' : 'test'} complete`
    const timingMsg = `(${prettyms(time)})`

    if (failure > 0) {
        red(`${completionMsg}, ${failure} failed ${timingMsg}`)
    } else {
        green(`${completionMsg} ${timingMsg}`)
    }
}

module.exports = {
    failure,
    exception,
    timedOut,
    runStart,
    runEnd
}
