#!/usr/bin/env node

const chokidar = require('chokidar')
const minimist = require('minimist')

const args = minimist(process.argv.slice(2))

const options = {
    watchGlob: '.',
    testFilesGlob: args._[0] || '**/*.spec.js',
    watchdogTimeout: 300,

    // printer options
    clearConsole: false,
    diffView: false,
    objectPrintDepth: 5,
    backgroundDiffColors: false,
    disableColors: false
}

const testRunner = require('./src/test-runner')(options)

/**
 * Setting up watcher
 */
const watcher = chokidar.watch(
    options.watchGlob,
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
process.stdin.setRawMode(true)
process.stdin.resume()
process.stdin.setEncoding('utf8')

process.stdin.on('data', key => {
    if (key === '\u0003' || key === 'q') {
        process.exit()
    }
    if (key === 'r') {
        testRunner.runTests('Manual trigger')
    }
    if (key === 'd') {
        testRunner.toggleDiffView()
    }
    if (key.match(/[1-9]/)) {
        testRunner.setPrintDepth(key)
    }
})
