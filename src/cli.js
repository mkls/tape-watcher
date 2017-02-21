#!/usr/bin/env node

const chokidar = require('chokidar')
const minimist = require('minimist')

const args = minimist(process.argv.slice(2))

const options = {
    watch: '.',
    testFilesGlob: args._[0] || 'src/*.spec.js',
    watchdogTimeout: 300,

    // printer options
    clearConsole: true,
    disableColors: false,
    inverseDiffColors: false,
    objectPrintDepth: 5,
    indent: false,
    diffView: false
}

const testRunner = require('./test-runner')(options)

/**
 * Setting up watcher
 */
const watcher = chokidar.watch(
    options.watch,
    {
        ignored: /[\/\\]\.|node_modules|.git/,
        persistent: true,
        ignoreInitial: true
    }
)

watcher
    .on('change', path => testRunner.runTests(`${path} changed`))
    .on('add', path => {
        testRunner.unvalidateFileList()
        testRunner.runTests(`${path} added`)
    })
    .on('unlink', path => {
        testRunner.unvalidateFileList()
        testRunner.runTests(`${path} removed`)
    })

/**
 * Initial run
 */
testRunner.runTests('Initial run')

/**
 * Handling keystroke commands (http://stackoverflow.com/a/12506613)
 */
// TODO: test how could I read a single keystroke, without waiting for enter
// process.stdin.setRawMode(true)
// process.stdin.resume()
// process.stdin.setEncoding('utf8')

process.stdin.on('data', chunk => {
    const key = chunk.toString('utf8').trim()

    if (key === '\u0003' || key === 'q') {
        process.exit()
    }
    if (key === 'r') {
        testRunner.runTests('Manual trigger')
    }
    if (key === 'i') {
        testRunner.toggleIndentation()
    }
    if (key === 'd') {
        testRunner.toggleDiffView()
    }
    if (key.match(/[1-9]/)) {
        testRunner.setPrintDepth(key)
    }
})
