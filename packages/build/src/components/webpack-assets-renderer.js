const assetsLookup = global.BUILD_ASSETS || {};

module.exports = function(input, out) {
  if (!out.global.assetsRendered) {
    const target = input.prepend ? out.stream : out;
    const assets = assetsLookup[out.global.assetsKey];
    if (assets) {
      if (assets.js)
        target.write(
          `<script async src=${JSON.stringify(assets.js)}></script>`
        );
      if (assets.css)
        target.write(
          `<link rel="stylesheet" href=${JSON.stringify(assets.css)}>`
        );
    }
    out.global.assetsRendered = true;
  }
};
