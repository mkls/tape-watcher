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