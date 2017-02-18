const chalk = require('chalk')
const prettyms = require('pretty-ms')
const inspect = require('object-inspect')

const addPadding = padding => string => {
    return string
        .split('\n')
        .map(line => padding + line)
        .join('\n')
}

const colorLog = color => text => {
    // eslint-disable-next-line no-console
    console.log(chalk[color]('\n' + addPadding('  ')(text)))
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

const failure = item => {
    const output = `${item.name.join(' - ')}
  ---
    operator: ${item.operator}
    expected:
${encodeValue(item.expected)}
    actual:
${encodeValue(item.actual)}
    at: ${item.at}
  ...`

    gray(output)
}

const exception = (error, runState) => {
    const location = runState ?
        `at: '${runState.testNames.lastTest.join(' - ')}'` :
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
