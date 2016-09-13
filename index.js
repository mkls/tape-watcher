var test = require('tape');
var path = require('path');

var testFiles = ['./fixtures/simple.spec']

test.createStream({ objectMode: true }).on('data', function (row) {
    console.log('\ndata')
    console.log(JSON.stringify(row))
});

testFiles.forEach(function (file) {
    require(path.resolve(file));
});


// var tape = require('tape')
// var globby = require('globby')
// var path = require('path')
// var chokidar = require('chokidar')
// var chalk = require('chalk')

// var testFilesGlob = 'fixtures/**/*.spec.js'
// var testFiles = []
// var watchGlob = '.'

// var watcher = chokidar.watch(watchGlob, {
//     ignored: /[\/\\]\.|node_modules/,
//     persistent: true,
//     ignoreInitial: true
// })

// watcher.on('change', runTests)
// watcher.on('add', readAndRunTests)
// watcher.on('unlink', readAndRunTests)

// readAndRunTests();

// function readAndRunTests() {
//     testFiles = globby.sync(testFilesGlob)
//     runTests()
// }

// // runTests();
// function runTests() {
//     clearRequireCash()
//     // tape.createStream().pipe(process.stdout)

//     // tape.createStream({ objectMode: true }).on('data', function (row) {
//     //     console.log(JSON.stringify(row, null, 4))
//     //     console.log(row)
//     // });

//     testFiles.forEach(file => {
//         // console.log(file)
//         require(path.resolve(file))
//     })

//     // this seem redundant
//     // tape.onFinish(() => {
//     //     console.log('tape finished')
//     //     try {
//     //         tape.getHarness().close()
//     //     } catch (e) {
//     //         console.log('close error', e)
//     //     }
//     // })
// }


// // test.getHarness().onFinish(() => {
// //     console.log('finisehd')
// // })

// /*
//  * Delete require cache for any app code (non-modules) and tape itself.
//  * We need to clear out tape so that its state is reset.
//  */
// function clearRequireCash() {
//     Object.keys(require.cache)
//         .forEach(fname => {
//             if (fname.indexOf('node_modules') === -1  ||
//                 fname.indexOf(path.join('node_modules', 'tape')) > -1) {
//                 delete require.cache[fname]
//             }
//         })
// }

// process.on('uncaughtException', function (err) {
//   console.error(chalk.red('uncaughtException', err.stack || err.message || err))
// })