const chokidar = require('chokidar')

const settings = {
    watchGlob: '.',
    // testFilesGlob: 'manua*/deep-eq*.spec.js',
    testFilesGlob: 'src/*.spec.js',
    watchdogTimeout: 300,
    clearConsole: true
}

const testRunner = require('./src/test-runner')(settings)

const watcher = chokidar.watch(
    settings.watchGlob,
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
})


// for debugging many runs after each other
// for (var i = 0; i < 1; i += 1) {
//     setTimeout(function () {
//         testRunner.runTests();
//     }, i * 500);
// }
