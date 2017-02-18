// http://stackoverflow.com/a/12506613

// without this, we would only get streams once enter is pressed
process.stdin.setRawMode(true)

// resume process.stdin in the parent process (node app won't quit all by itself
// unless an error or process.exit() happens)
process.stdin.resume()

// i don't want binary, do you?
process.stdin.setEncoding('utf8')

// on any data into process.stdin
process.stdin.on('data', function (key) {
    // ctrl-c ( end of text )
    if (key === '\u0003') {
        process.exit()
    }

    // write the key to stdout all normal like
    process.stdout.write(key)
})
