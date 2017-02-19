'use strict';

// chalk.magenta.dim

var arts = ['><((((\'>', // fish
'~~(__^·>', // mouse
'♫♪.♫♪', 'd[ o_0 ]b', "|'L'|", '(_8^(J)', '\\(^-^)/'];

module.exports = function (runNumber) {
    return arts[runNumber % arts.length];
};