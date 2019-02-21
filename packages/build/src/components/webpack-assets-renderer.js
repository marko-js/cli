const assets = (global.BUILD_ASSETS && global.BUILD_ASSETS.main) || {};
const scriptTag =
  assets.js && `<script async src=${JSON.stringify(assets.js)}></script>`;
const cssLinkTag =
  assets.css && `<link rel="stylesheet" href=${JSON.stringify(assets.css)}>`;

module.exports = function(input, out) {
  if (!out.global.assetsRendered) {
    const target = input.prepend ? out.stream : out;
    if (scriptTag) target.write(scriptTag);
    if (cssLinkTag) target.write(cssLinkTag);
    out.global.assetsRendered = true;
  }
};
