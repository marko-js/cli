const postcssPresetEnv = require("postcss-preset-env");

module.exports = ({ options: { browsers } }) => {
  return {
    plugins: [postcssPresetEnv({ browsers })]
  };
};
