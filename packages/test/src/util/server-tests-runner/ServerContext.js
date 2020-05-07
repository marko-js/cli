"use strict";

var fs = require("fs");
var path = require("path");
var cheerio = require("cheerio");
var complain = require("complain");

class RenderResult {
  constructor(html) {
    this.html = html;
    this._$ = null;
  }

  get $() {
    if (!this._$) {
      this._$ = cheerio.load("<body>" + this.html + "</body>");
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

  get component() {
    return require(this.renderer);
  }

  render(data) {
    var htmlString;
    complain(
      "render has been deprecated.  Prefer to render components using @marko/testing-library"
    );
    if (this.component.renderSync) {
      htmlString = this.component.renderSync(data);
    } else {
      htmlString = this.component.render(data).toString();
    }

    createSnapshot(
      this.name,
      this._nextSnapshotId++,
      this.componentDir,
      htmlString
    );
    return new RenderResult(htmlString);
  }

  renderAsync(data) {
    complain(
      "renderAsync has been deprecated.  Prefer to render components using @marko/testing-library"
    );
    return new Promise((resolve, reject) =>
      this.component.render(data, (err, result) =>
        err ? reject(err) : resolve(result)
      )
    ).then(result => {
      var htmlString = String(result);
      createSnapshot(
        this.name,
        this._nextSnapshotId++,
        this.componentDir,
        htmlString
      );
      return new RenderResult(htmlString);
    });
  }
}

function createSnapshot(name, id, componentDir, html) {
  const snapshotFile =
    name.replace(/[^A-Za-z0-9_\-.]/g, "-") + "." + id + ".html";
  const testDir = path.join(componentDir, "test");
  const snapshotDir = path.join(componentDir, "test/snapshots");

  // Snapshots should always be placed in /test/snapshots even if the test file is located
  // at the component level
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir);
  }

  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir);
  }

  fs.writeFileSync(path.join(snapshotDir, snapshotFile), html);
}

module.exports = ServerContext;
