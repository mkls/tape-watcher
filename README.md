# tape-watcher
Inspired by [tape-watch], since that was the fastest solution I could find to
run [tape] tests in watch mode, but I got annoyed by the memory leak warnings it was throwing
and also thought I could make the experience a bit more fun.

[tape]: https://www.npmjs.com/package/tape
[tape-watch]: https://www.npmjs.com/package/tape-watch

![example](images/example2.gif)

## Features
* Runs tape tests after modifications, while keeping the require cache for 
  node_module files, saving on startup time
* Only reports details for failing tests
* Prints a meaningful stack trace for runtime exceptions
* A watchdog lets you know if you forgot about t.end(), the process doesn't just hangs up 
  waiting for it
* Provides an interactive terminal that lets you set how you want to see your result during 
  runtime

## Usage
From command line if installed globally:
```
tape-watcher 'src/**.spec.js'
```

Or install locally as a dev dependency and add it to package json scripts:
```
"tdd": "tape-watcher src/**.spec.js"
```

## Commands during run: 
Type in the letters while the watch mode is active and press enter. 
A new run will be triggered with the changed option taking effect.

* `d`: toggle showing actual and expected or their colored diff
* `i`: toggle printing values with or without and indentation
* `1 to 9`: set objectPrintDepth for printing
* `r`: manually trigger the re-run of all the tests (not needed if watch is working well)
* `q`: quit, exit process (same as hitting ctrl + c)

## Install 

```
npm i tape-watcher --save-dev
```