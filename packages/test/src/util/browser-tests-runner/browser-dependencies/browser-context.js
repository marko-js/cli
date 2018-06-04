const cheerio = require("cheerio");
const raptorRenderer = require("raptor-renderer");
const { hasOwnProperty } = Object;

class BrowserContext {
  constructor(props) {
    for (const key in props) {
      if (hasOwnProperty.call(props, key)) {
        this[key] = props[key];
      }
    }

    this._name = null;
    this._nextSnapshotId = 0;
    this._mountedWidgets = [];
  }

  set name(val) {
    this._name = val;
    this._nextSnapshotId = 0;
  }

  get name() {
    return this._name;
  }

  render(data) {
    let renderResult;
    const { component } = this;

    if (typeof component.renderer === "function") {
      // component exposes renderer function
      renderResult = raptorRenderer.render(component.renderer, data);
    } else if (component.renderSync) {
      // potentially a v4 or v3 component.
      renderResult = component.renderSync(data);
    } else {
      // assume older version of marko
      renderResult = component.render(data);
    }

    return new WrappedRenderResult(renderResult, this);
  }

  _afterTest() {
    this._mountedWidgets.forEach(function(widget) {
      widget.destroy();
    });

    this._mountedWidgets.length = 0;
  }
}

class WrappedRenderResult {
  constructor(renderResult, context) {
    this._renderResult = renderResult;
    this.html = renderResult.toString();
    this._$ = null;
    this._widget = null;
    this.context = context;
  }

  get $() {
    if (!this._$) {
      this._$ = cheerio.load("<body>" + this.html + "</body>");
    }

    return this._$;
  }

  get container() {
    return document.getElementById("testsTarget");
  }

  get component() {
    return this._getRenderedComponent();
  }

  get widget() {
    return this._getRenderedComponent();
  }

  _getRenderedComponent() {
    if (!this._widget) {
      const renderedResult = this._renderResult.appendTo(this.container);
      const component = renderedResult[
        renderedResult.getComponent ? "getComponent" : "getWidget"
      ]();
      this._widget = component;
      this.context._mountedWidgets.push(component);
    }

    return this._widget;
  }
}

module.exports = BrowserContext;
