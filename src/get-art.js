// chalk.magenta.dim

const arts = [
    '><((((\'>',    // fish
    '~~(__^·>',     // mouse
    '♫♪.♫♪',
    'd[ o_0 ]b',
    "|'L'|",
    '(_8^(J)',
    '\\(^-^)/'
]

module.exports = runNumber => arts[runNumber % arts.length]
