# tape-watcher
Reruns [tape] tests when files change, has an interactive terminal and prints a pretty 
output.

If you have any question, comments or suggestions please don't hesitate to contact me.

[tape]: https://www.npmjs.com/package/tape

## Features
* 


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

* `d`: toggle showing 
* `i`: toggle printing actual and expected with and indentation
* `1 to 9`: set objectPrintDepth
* `r`: manually trigger the re-run of all the tests (not needed if watch is working well)
* `q`: quit, exit process (same as hitting ctrl + c)

##Install

```
npm i tape-watcher --save-dev
```