const resolveFrom = require("resolve-from");

module.exports = function srcAttributes(el, context) {
  if (tagAttrs[el.tagName])
    el.attributes.forEach(attr => {
      if (!tagAttrs[el.tagName + ":" + attr.name]) return;

      var walker = context.createWalker({
        enter: node => {
          let nodeHandler = nodeHandlers[node.type];

          if (!nodeHandler) return walker.skip();
          if (nodeHandler === true) return;

          return nodeHandler(node, walker, context);
        }
      });

      attr.value = walker.walk(attr.value);
    });
};

const attrTags = {
  src: [
    "audio",
    "embed",
    "iframe",
    "img",
    "input",
    "script",
    "source",
    "track",
    "video"
  ],
  href: ["a", "area", "link"],
  data: ["object"],
  poster: ["video"],
  srcset: ["img"], //something else needs to happen here
  background: ["body"]
};

const tagAttrs = Object.keys(attrTags).reduce((tagAttrs, attrName) => {
  attrTags[attrName].forEach(tagName => {
    tagAttrs[tagName] = true;
    tagAttrs[tagName + ":" + attrName] = true;
  });
  return tagAttrs;
}, {});

const nodeHandlers = {
  ArrayExpression: true,
  ObjectExpression: true,
  Property: true,
  LogicalExpression: true,
  ConditionalExpression: (node, walker) => {
    node.consequent = walker.walk(node.consequent);
    node.alternate = walker.walk(node.alternate);
    walker.skip();
  },
  Literal: (node, walker, context) => {
    const modulePath = getRelativeModulePath(node.value, context.dirname);
    if (modulePath) {
      const importedSrcValue = addSrcImport(context, modulePath);
      walker.replace(importedSrcValue);
    }
  }
};

const protocolPattern = /^[a-z]{2,}:/i;

function getRelativeModulePath(path, dirname) {
  if (!path) return false;
  if (typeof path !== "string") return false;
  if (protocolPattern.test(path)) return false;
  return (
    resolveFrom.silent(dirname, path) ||
    resolveFrom.silent(dirname, "./" + path)
  );
}

function addSrcImport(context, path) {
  context.assetCount = context.assetCount || 0;
  const varName = `__src_asset_${context.assetCount++}__`;
  const tagString = `import ${varName} from ${JSON.stringify(path)}`;
  const importTag = context.createNodeForEl("import");

  importTag.tagString = tagString;

  context.root.prependChild(importTag);

  return context.builder.identifier(varName);
}
