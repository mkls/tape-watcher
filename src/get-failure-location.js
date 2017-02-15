module.exports = function (dirname, stack) {
    if (typeof stack !== 'string') {
        return undefined
    }

    var nonNodeModuleLines = stack
        .split('\n')
        .map(row => row.match(/(?:\/|[a-zA-Z]:\\)[^:\s]+:(?:\d+)(?::\d+)?/))
        .filter(location => location && location[0].indexOf('node_modules') === -1)

    if (nonNodeModuleLines.length >= 1) {
        var location = nonNodeModuleLines[0][0]

        return location.indexOf(dirname) > -1 ?
            location.slice(dirname.length + 1) :
            location
    }
    return undefined
}
