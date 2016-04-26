'use strict';

module.exports = function hasLineBreaks(str) {
    return /\n/.test(str);
};