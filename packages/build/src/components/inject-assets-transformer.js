module.exports = function injectAssets(el, context) {
  el.prependChild(context.createNodeForEl("webpack-assets"));
};
