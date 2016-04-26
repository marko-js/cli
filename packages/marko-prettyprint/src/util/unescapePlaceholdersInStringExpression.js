'use strict';

module.exports = function unescapePlaceholdersInStringExpression(string) {
    return string.replace(/([\\]{2,4})?\$[!]?{/g, function(match) {
        if (match.startsWith('\\\\\\\\')) {
            return match.substring(2);
        } else if (match.startsWith('\\\\')) {
            return match.substring(1);
        }

        return match;
    });
};