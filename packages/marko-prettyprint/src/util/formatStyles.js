const format = require("prettier").format;
const redent = require("redent");

module.exports = function(code, printContext) {
    const matches = /^style(?:\.(\S+))?\s*\{\s*([\s\S]*)\s*\}\s*$/.exec(code);
    const parser = matches[1] || 'css';
    const block = matches[2];

    const config = {
        useTabs: printContext.indentString[0] === '\t',
        tabWidth: printContext.indentString.length,
        parser
    };

    code = format(block, config);

    code = `style${parser === "css" ? "" : `.${parser}`} {\n${redent(code, 1, printContext.indentString)}}`;

    return code;
};
