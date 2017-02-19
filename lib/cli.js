#!/usr/bin/env node
'use strict';

var chokidar = require('chokidar');
var minimist = require('minimist');

var args = minimist(process.argv.slice(2));

var options = {
    watchGlob: '.',
    testFilesGlob: args._[0] || 'src/*.spec.js',
    watchdogTimeout: 300,

    // printer options
    clearConsole: true,
    diffView: false,
    objectPrintDepth: 5,
    backgroundDiffColors: false,
    disableColors: false
};

var testRunner = require('./test-runner')(options);

/**
 * Setting up watcher
 */
var watcher = chokidar.watch(options.watchGlob, {
    ignored: /[\/\\]\.|node_modules|.git/,
    persistent: true,
    ignoreInitial: true
});

watcher.on('change', function (path) {
    return testRunner.runTests(path + ' changed');
}).on('add', function (path) {
    testRunner.unvalidateFileList();
    testRunner.runTests(path + ' added');
}).on('unlink', function (path) {
    testRunner.unvalidateFileList();
    testRunner.runTests(path + ' removed');
});

/**
 * Initial run
 */
testRunner.runTests('Initial run');

/**
 * Handling keystroke commands (http://stackoverflow.com/a/12506613)
 */
// TODO: test how could I read a single keystroke, without waiting for enter
// process.stdin.setRawMode(true)
// process.stdin.resume()
// process.stdin.setEncoding('utf8')

process.stdin.on('data', function (chunk) {
    var key = chunk.toString('utf8').trim();

    if (key === '\x03' || key === 'q') {
        process.exit();
    }
    if (key === 'r') {
        testRunner.runTests('Manual trigger');
    }
    if (key === 'd') {
        testRunner.toggleDiffView();
    }
    if (key.match(/[1-9]/)) {
        testRunner.setPrintDepth(key);
    }
});