'use strict';

var cheerio = require('cheerio');
var raptorRenderer = require('raptor-renderer');
var objectAssign = require('object-assign');


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

    get widget() {
        if (!this._widget) {
            this._widget = this._renderResult.appendTo(document.getElementById('testsTarget')).getWidget();
            this.context._mountedWidgets.push(this._widget);
        }

        return this._widget;
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

        if(component.renderSync) {
            var renderer = function(input, out) {
                component.renderSync(input);
            };

            renderResult = raptorRenderer.render(renderer, data);
        } else {
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