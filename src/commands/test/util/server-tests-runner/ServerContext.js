'use strict';

var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');

class RenderResult {
    constructor(html) {
        this.html = html;
        this._$ = null;
    }

    get $() {
        if (!this._$) {
            this._$ = cheerio.load('<body>' + this.html + '</body>');
        }

        return this._$;
    }
}

class ServerContext {
    constructor(props) {
        Object.assign(this, props);
        this._nextSnapshotId = 0;
        this._name = null;
    }

    set name(val) {
        this._name = val;
        this._nextSnapshotId = 0;
    }

    get name() {
        return this._name;
    }

    render(data) {
        var htmlString;
        if(this.component.renderSync) {
            htmlString = this.component.renderSync(data);
        } else {
            htmlString = this.component.render(data).toString();
        }

        var snapshotId = this._nextSnapshotId++;
        let snapshotFile = this.name.replace(/[^A-Za-z0-9_\-\.]/g, '-') +'.'+snapshotId+'.html';
        let snapshotDir = path.join(this.componentDir, 'test/snapshots');

        if (!fs.existsSync(snapshotDir)) {
            fs.mkdirSync(snapshotDir);
        }

        fs.writeFileSync(path.join(snapshotDir, snapshotFile), htmlString);

        return new RenderResult(htmlString);
    }
}

module.exports = ServerContext;