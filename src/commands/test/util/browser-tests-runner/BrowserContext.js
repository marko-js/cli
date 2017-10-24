'use strict';

var cheerio = require('cheerio');
var raptorRenderer = require('raptor-renderer');
var objectAssign = require('object-assign');

function _getRenderedComponent (wrappedRenderResult) {
  if (!wrappedRenderResult._widget) {
    var renderedResult = wrappedRenderResult._renderResult
        .appendTo(wrappedRenderResult.container);

    var component;
    if (renderedResult.getComponent) {
      // wrappedRenderResult is definitely a v4 component
      component = renderedResult.getComponent();
    } else {
      // pre v4 component
      component = renderedResult.getWidget();
    }

    wrappedRenderResult._widget = component
    wrappedRenderResult.context._mountedWidgets.push(component);
  }

  return wrappedRenderResult._widget;
}

function WrappedRenderResult(renderResult, context) {
    this._renderResult = renderResult;
    this.html = renderResult.html;
    this._$ = null;

    this._widget = null;
    this.context = context;
}

WrappedRenderResult.prototype = {
    get $() {
        if (!this._$) {
            this._$ = cheerio.load('<body>' + this.html + '</body>');
        }

        return this._$;
    },

    get container() {
        return document.getElementById('testsTarget');
    },

    get component() {
        return _getRenderedComponent(this);
    },

    get widget() {
        return _getRenderedComponent(this);
    }
};

function BrowserContext(props) {
    objectAssign(this, props);
    this._nextSnapshotId = 0;
    this._name = null;
    this._mountedWidgets = [];
}

BrowserContext.prototype = {
    set name(val) {
        this._name = val;
        this._nextSnapshotId = 0;
    },

    get name() {
        return this._name;
    },

    render: function(data) {
        var renderResult;
        var component = this.component;

        if (typeof component.renderer === 'function') {
            // component exposes renderer function
            renderResult = raptorRenderer.render(component.renderer, data);
        } else if (component.renderSync) {
            // potentially a v4 or v3 component
            renderResult = component.renderSync(data);
            if (!renderResult.html) {
                // this is a v4 component
                var output = renderResult.getOutput();
                var html;

                if (output.actualize) {
                    var docFragment = output.actualize(document);

                    // generate html from childNodes
                    html = '';
                    if (docFragment.hasChildNodes()) {
                        var children = docFragment.childNodes;
                        for (var i = 0; i < children.length; i++) {
                            html += children[i].outerHTML;
                        }
                    }
                } else {
                    html = output.toString();
                }

                renderResult.html = html;
            }
        } else {
            // assume older version of marko
            renderResult = component.render(data);
        }

        return new WrappedRenderResult(renderResult, this);
    },

    _afterTest: function() {
        this._mountedWidgets.forEach(function(widget) {
            widget.destroy();
        });

        this._mountedWidgets.length = 0;
    }
};

module.exports = BrowserContext;
