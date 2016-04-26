'use strict';

module.exports = function getBodyText(el) {
    var children = el.body.items;
    var text = '';
    for (var i=0; i<children.length; i++) {
        let child = children[i];
        if (child.type !== 'Text') {
            return null;
        }
        text += child.argument.value;
    }
    return text;
};