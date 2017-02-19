# tape-watcher
Run tape tests after every modification

## Usage
```
// from command line:
tape-watcher 'src/**.spec.js'

// add it to package json scripts:
"tdd": "tape-watcher src/**.spec.js"
```

## Keystroke commands (something is wrong, commented out for now)
* `r`: manually trigger the re-run of all the tests (not needed if watch is working well)
* `1 to 9`: set objectPrintDepth
* `q`: quit, exit process (same as hitting ctrl + c)
